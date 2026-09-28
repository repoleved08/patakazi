import type { H3Event } from 'h3'
import type { CreateCompanyInput, UpdateCompanyInput } from '#shared/schemas'
import type { Company, Paginated } from '#shared/types/api'
import type { CompanyRow } from '#shared/types/models'
import type { TablesUpdate } from '#shared/types/database.types'
import { slugify } from '#shared/utils/format'
import { toCompany } from '../mappers/row-mappers'
import { CompanyRepository, JobRepository } from '../repositories'
import { useSupabaseServer } from '../utils/supabase'
import { requireAuth, requireCompanyAccess, resolveAuthContext } from './authorization.service'

/**
 * Company domain logic.
 *
 * A company has exactly one owner. There are no team memberships to merge in
 * here, which is what makes `listMine` a single indexed lookup.
 */
export class CompanyService {
  constructor(
    private readonly companies: CompanyRepository,
    private readonly jobs: JobRepository
  ) {}

  async list(params: { page?: number, perPage?: number, search?: string } = {}): Promise<Paginated<Company>> {
    const perPage = params.perPage ?? 24
    const page = params.page ?? 1

    const { rows, total } = await this.companies.list({
      search: params.search,
      limit: perPage,
      offset: (page - 1) * perPage
    })

    const openRoleCounts = await this.openRoleCounts(rows.map(row => row.id))

    return {
      data: rows.map(row => toCompany(row, openRoleCounts.get(row.id) ?? 0)),
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage))
    }
  }

  async getBySlug(slug: string): Promise<(Company & { openRoles: number }) | null> {
    const row = await this.companies.getBySlug(slug)
    if (!row) return null

    const { total } = await this.jobs.list({ companyIds: [row.id], statuses: ['published'], limit: 1 })
    return toCompany(row, total)
  }

  /** Companies the signed-in user owns, for the dashboard. */
  async listMine(event: H3Event): Promise<Company[]> {
    const context = await requireAuth(await resolveAuthContext(event))
    const owned = await this.companies.getManyByOwner(context.userId)
    return owned.map(row => toCompany(row))
  }

  async create(event: H3Event, input: CreateCompanyInput): Promise<Company> {
    const context = await requireAuth(await resolveAuthContext(event))

    // Slugs are the public URL, so they must be unique. The unique index is the
    // real guarantee; this read just avoids a 409 for the common case of a
    // repeated name.
    const existing = await this.companies.list({ search: input.name, limit: 50 })
    const taken = new Set(existing.rows.map(row => row.slug))
    const base = slugify(input.name) || 'company'
    const slug = taken.has(base) ? `${base}-${globalThis.crypto.randomUUID().slice(0, 8)}` : base

    const row = await this.companies.create({
      name: input.name,
      slug,
      website: input.website,
      description: input.description,
      industry: input.industry,
      size: input.size,
      founded: input.founded,
      location: input.location,
      services: input.services,
      working_hours: input.workingHours,
      logo_id: '',
      owner_id: context.userId,
      verified: false
    })

    return toCompany(row)
  }

  /**
   * Apply a validated edit.
   *
   * The input is camelCase (it is the public API shape) and the row is
   * snake_case, so the mapping is spelled out here rather than spread. Only
   * fields actually present in the payload are written, so a partial edit does
   * not blank out the columns it did not mention.
   */
  async update(event: H3Event, id: string, input: UpdateCompanyInput): Promise<Company> {
    await requireCompanyAccess(event, id)

    const patch: TablesUpdate<'companies'> = {}
    if (input.name !== undefined) patch.name = input.name
    if (input.website !== undefined) patch.website = input.website
    if (input.description !== undefined) patch.description = input.description
    if (input.industry !== undefined) patch.industry = input.industry
    if (input.size !== undefined) patch.size = input.size as CompanyRow['size']
    if (input.founded !== undefined) patch.founded = input.founded
    if (input.location !== undefined) patch.location = input.location
    if (input.services !== undefined) patch.services = input.services
    if (input.workingHours !== undefined) patch.working_hours = input.workingHours

    return toCompany(await this.companies.update(id, patch))
  }

  async remove(event: H3Event, id: string): Promise<void> {
    await requireCompanyAccess(event, id)
    // Jobs cascade with the company via the foreign key, so this is destructive
    // for their listings too.
    await this.companies.delete(id)
  }

  private async openRoleCounts(companyIds: string[]): Promise<Map<string, number>> {
    if (companyIds.length === 0) return new Map()
    const { rows } = await this.jobs.list({ companyIds, statuses: ['published'], limit: 100 })
    const counts = new Map<string, number>()
    for (const row of rows) {
      counts.set(row.company_id, (counts.get(row.company_id) ?? 0) + 1)
    }
    return counts
  }
}

export function useCompanyService(event: H3Event): CompanyService {
  const supabase = useSupabaseServer(event)
  return new CompanyService(new CompanyRepository(supabase), new JobRepository(supabase))
}
