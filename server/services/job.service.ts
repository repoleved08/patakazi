import type { H3Event } from 'h3'
import type { CreateJobInput, JobQueryInput, UpdateJobInput } from '#shared/schemas'
import type { Job, JobStats, JobSummary, Paginated } from '#shared/types/api'
import type { JobStatus } from '#shared/types/job'
import type { CompanyRow, JobRow } from '#shared/types/models'
import type { TablesInsert, TablesUpdate } from '#shared/types/database.types'
import { annualFloor } from '#shared/utils/salary'
import { slugify } from '#shared/utils/format'
import { toJob } from '../mappers/row-mappers'
import { CompanyRepository, JobRepository } from '../repositories'
import { useSupabaseServer } from '../utils/supabase'
import { requireAuth, requireCompanyAccess, requireJobAccess, resolveAuthContext } from './authorization.service'

/**
 * Job domain logic.
 *
 * Owns visibility rules, slug generation, and the mapping from validated input
 * to Postgres rows. Repositories underneath stay dumb; HTTP handlers on top stay
 * thin.
 *
 * Search is *not* handled here: the `search_jobs` trigger in the migration keeps
 * a weighted `search_vector` up to date, so there is no denormalised text column
 * to keep in sync here.
 */

/** A job is publicly visible only while published and unexpired. */
export function isPubliclyVisible(row: JobRow, now = new Date()): boolean {
  if (row.status !== 'published') return false
  if (!row.expires_at) return true
  const expiry = new Date(row.expires_at)
  return Number.isNaN(expiry.getTime()) ? true : expiry > now
}

/** Append a short random suffix so two identical titles can coexist. */
function uniqueSlug(title: string, existing: Set<string>): string {
  const base = slugify(title) || 'job'
  if (!existing.has(base)) return base
  return `${base}-${globalThis.crypto.randomUUID().slice(0, 8)}`
}

export class JobService {
  constructor(
    private readonly jobs: JobRepository,
    private readonly companies: CompanyRepository
  ) {}

  /** Public listing, filtered and paginated. Expired jobs are excluded. */
  async listPublic<T extends 'full' | 'summary' = 'full'>(
    query: JobQueryInput & { fields?: T }
  ): Promise<Paginated<T extends 'summary' ? JobSummary : Job>> {
    const perPage = query.perPage
    const page = query.page

    const { rows, total } = await this.jobs.list({
      statuses: normaliseList(query.status) ?? ['published'],
      workplaceTypes: normaliseList(query.workplaceType),
      employmentTypes: normaliseList(query.employmentType),
      seniority: normaliseList(query.seniority),
      companyIds: query.companyId ? [query.companyId] : undefined,
      skills: normaliseList(query.skills),
      search: query.q,
      location: query.location,
      salaryFloor: query.salaryMin !== undefined ? annualFloor({ min: query.salaryMin, period: 'year' }) : undefined,
      excludeExpired: true,
      orderAsc: query.sort === 'relevance',
      limit: perPage,
      offset: (page - 1) * perPage
    })

    // The query already excludes expired rows, so `total` is trustworthy and the
    // only remaining filter is a defensive one for rows mutated mid-request.
    const visible = rows.filter(row => isPubliclyVisible(row))

    return {
      data: (query.fields === 'summary'
        ? visible.map(row => toJobSummary(toJob(row)))
        : visible.map(toJob)) as Paginated<T extends 'summary' ? JobSummary : Job>['data'],
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage))
    }
  }

  /** Public lookup by id or slug. Returns null when not publicly visible. */
  async findPublic(idOrSlug: string): Promise<Job | null> {
    const row = (await this.jobs.getById(idOrSlug)) ?? (await this.jobs.getBySlug(idOrSlug))
    if (!row || !isPubliclyVisible(row)) return null
    return this.withCompany(toJob(row))
  }

  async getPublicBySlug(slug: string): Promise<Job | null> {
    return this.findPublic(slug)
  }

  /**
   * Resolve the single-listing route.
   *
   * Public pages address listings by slug for readable URLs, while the
   * employer dashboard addresses them by id. Both funnel through here: try the
   * public path first, then fall back to owner-only visibility for drafts.
   */
  async getForViewer(event: H3Event, idOrSlug: string): Promise<Job> {
    const publicJob = await this.findPublic(idOrSlug)
    if (publicJob) return publicJob
    return this.getByIdForUser(event, idOrSlug)
  }

  async getByIdForUser(event: H3Event, idOrSlug: string): Promise<Job> {
    const row = (await this.jobs.getById(idOrSlug)) ?? (await this.jobs.getBySlug(idOrSlug))
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Job not found' })

    if (isPubliclyVisible(row)) return this.withCompany(toJob(row))

    // Not public, so only someone who posted it or owns its company may see it.
    // A 404 rather than a 403: whether a draft exists is not public information.
    try {
      await requireJobAccess(event, row)
    } catch {
      throw createError({ statusCode: 404, statusMessage: 'Job not found' })
    }
    return this.withCompany(toJob(row))
  }

  /**
   * Complete the company snapshot on a listing.
   *
   * `toJobSummary` denormalises the company name and logo onto the job row, but
   * deliberately not the website or the verified flag — those would go stale on
   * every job when an employer edits its profile. A snapshot that already
   * carries a website came from the companies table, so it needs no work.
   */
  private async withCompany(job: Job): Promise<Job> {
    if (job.company.website) return job

    const company = await this.companies.getById(job.company.id)
    if (company) job.company = toCompanySnapshot(company)
    return job
  }

  async stats(): Promise<JobStats> {
    const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString()
    const [total, remote, lastWeek, withSalary, companies] = await Promise.all([
      this.jobs.countAll(['published']),
      this.jobs.countByWorkplaceTypes(['published'], ['remote', 'hybrid']),
      this.jobs.countPublishedSince(weekAgo),
      this.jobs.countSalaryVisible(['published']),
      this.companies.count()
    ])

    return { total, remote, lastWeek, withSalary, companies }
  }

  // --- Employer writes ----------------------------------------------------

  async create(event: H3Event, input: CreateJobInput): Promise<Job> {
    await requireCompanyAccess(event, input.companyId)
    const company = await this.companies.getById(input.companyId)
    if (!company) throw createError({ statusCode: 404, statusMessage: 'Company not found' })

    const context = await requireAuth(await resolveAuthContext(event))
    const existing = new Set((await this.jobs.list({ companyIds: [company.id], limit: 50 })).rows.map(row => row.slug))

    const payload: TablesInsert<'jobs'> = {
      title: input.title,
      slug: uniqueSlug(input.title, existing),
      description: input.description,
      company_id: company.id,
      company_name: company.name,
      company_slug: company.slug,
      company_logo_id: company.logo_id,
      location: input.location,
      workplace_type: input.workplaceType,
      employment_type: input.employmentType,
      seniority: input.seniority,
      salary_min: input.salary.min,
      salary_max: input.salary.max,
      salary_currency: input.salary.currency,
      salary_period: input.salary.period,
      salary_visible: input.salary.visible && input.salary.max > 0,
      skills: input.skills,
      tags: input.tags,
      apply_url: input.applyUrl,
      apply_email: input.applyEmail,
      status: 'draft',
      // Left null until published; the listing is a draft until an employer says so.
      published_at: null,
      expires_at: input.expiresAt ?? null,
      views: 0,
      featured: input.featured,
      created_by: context.userId
    }

    return toJob(await this.jobs.create(payload))
  }

  async update(event: H3Event, id: string, input: UpdateJobInput): Promise<Job> {
    const existing = await this.jobs.getById(id)
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Job not found' })

    await requireJobAccess(event, existing)

    // Fields are mapped one by one rather than spread: the DTO is camelCase and
    // the row is snake_case, so `...input` would send keys Postgres does not
    // have and silently drop the columns that do match. Only the keys the
    // caller actually sent are included, so a partial edit leaves the rest
    // untouched.
    const patch: TablesUpdate<'jobs'> = {}
    assignDefined(patch, 'title', input.title)
    assignDefined(patch, 'location', input.location)
    assignDefined(patch, 'workplace_type', input.workplaceType)
    assignDefined(patch, 'employment_type', input.employmentType)
    assignDefined(patch, 'seniority', input.seniority)
    assignDefined(patch, 'skills', input.skills)
    assignDefined(patch, 'tags', input.tags)
    assignDefined(patch, 'apply_url', input.applyUrl)
    assignDefined(patch, 'apply_email', input.applyEmail)
    assignDefined(patch, 'expires_at', input.expiresAt ?? null)
    assignDefined(patch, 'featured', input.featured)

    if (input.salary) {
      patch.salary_min = input.salary.min
      patch.salary_max = input.salary.max
      patch.salary_currency = input.salary.currency
      patch.salary_period = input.salary.period
      // A salary is only worth showing when there is an upper bound to show;
      // an open-ended posting otherwise renders as "Competitive".
      patch.salary_visible = input.salary.visible && input.salary.max > 0
    }

    // Moving the job to a different company is the one edit that can change the
    // denormalised company fields, and the caller must still own the new one.
    if (input.companyId !== undefined && input.companyId !== existing.company_id) {
      const company = await this.companies.getById(input.companyId)
      if (!company) throw createError({ statusCode: 404, statusMessage: 'Company not found' })
      await requireCompanyAccess(event, company.id)

      patch.company_id = company.id
      patch.company_name = company.name
      patch.company_slug = company.slug
      patch.company_logo_id = company.logo_id
    }

    // Status transitions are handled by setStatus via the dedicated endpoints,
    // so that a partial edit can never accidentally publish a draft.
    return toJob(await this.jobs.update(id, patch))
  }

  /** Status transitions bypass the update schema, which requires a full job. */
  private async setStatus(event: H3Event, id: string, status: JobStatus): Promise<Job> {
    const existing = await this.jobs.getById(id)
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Job not found' })

    await requireJobAccess(event, existing)

    const patch: Partial<JobRow> = { status }
    // Only stamp the first publish, so re-publishing a closed job keeps its
    // original date and does not jump back to the top of the "newest" sort.
    if (status === 'published' && !existing.published_at) {
      patch.published_at = new Date().toISOString()
    }

    return toJob(await this.jobs.update(id, patch))
  }

  async publish(event: H3Event, id: string): Promise<Job> {
    return this.setStatus(event, id, 'published')
  }

  async close(event: H3Event, id: string): Promise<Job> {
    return this.setStatus(event, id, 'closed')
  }

  async remove(event: H3Event, id: string): Promise<void> {
    const existing = await this.jobs.getById(id)
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Job not found' })

    await requireJobAccess(event, existing)
    await this.jobs.delete(id)
  }

  /**
   * Record a page view.
   *
   * Called from a `POST` rather than from the page fetch so that SSR
   * prefetches, link prefetches and crawlers do not inflate the counter.
   */
  async recordView(idOrSlug: string): Promise<void> {
    const row = isUuid(idOrSlug)
      ? await this.jobs.getById(idOrSlug)
      : await this.jobs.getBySlug(idOrSlug)
    if (row) await this.jobs.incrementViews(row.id)
  }

  async listForCompany(companyId: string): Promise<JobRow[]> {
    return (await this.jobs.list({ companyIds: [companyId], limit: 50 })).rows
  }

  async countOpenForCompany(companyId: string): Promise<number> {
    const { total } = await this.jobs.list({ companyIds: [companyId], statuses: ['published'], limit: 1 })
    return total
  }

  async getCompany(id: string): Promise<CompanyRow | null> {
    return this.companies.getById(id)
  }
}

/** Company fields a job card needs, without a second query per listing. */
function toCompanySnapshot(company: CompanyRow) {
  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    logoId: company.logo_id,
    website: company.website,
    location: company.location,
    verified: company.verified
  }
}

/** Job ids are UUIDs; anything else on the route is a slug. */
/**
 * Copy a value onto the row only when the caller sent it.
 *
 * The distinction that matters: `undefined` means "leave this column alone",
 * while `null` is a deliberate value and must be written. That is why callers
 * pass `input.expiresAt ?? null` rather than `input.expiresAt` — clearing a date
 * has to reach the database.
 */
type JobPatch = TablesUpdate<'jobs'>

function assignDefined<K extends keyof JobPatch>(row: JobPatch, key: K, value: JobPatch[K] | undefined) {
  if (value !== undefined) row[key] = value
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

/**
 * Strips a listing down to the fields a card or an index line renders.
 *
 * The dropped fields are the expensive ones: the description is employer
 * markdown of a few kilobytes, and it is the bulk of a 20-row response. The
 * description is still reachable on the listing's own route, and `fields=full`
 * keeps returning it here.
 */
function toJobSummary(job: Job): JobSummary {
  return {
    id: job.id,
    title: job.title,
    slug: job.slug,
    company: job.company,
    location: job.location,
    workplaceType: job.workplaceType,
    employmentType: job.employmentType,
    seniority: job.seniority,
    salary: job.salary,
    skills: job.skills,
    publishedAt: job.publishedAt,
    featured: job.featured
  }
}

function normaliseList<T>(value: T[] | T | undefined): string[] | undefined {
  if (value === undefined) return undefined
  const list = Array.isArray(value) ? value : [value]
  return list.length ? (list as string[]) : undefined
}

/** Composition root: the one place repositories and the service are wired. */
export function useJobService(event: H3Event): JobService {
  const supabase = useSupabaseServer(event)
  return new JobService(new JobRepository(supabase), new CompanyRepository(supabase))
}
