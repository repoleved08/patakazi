import type { Company, CompanySummary, Job, JobSummary, Salary } from '#shared/types/api'
import type { ApplicationRow, CompanyRow, JobRow, ProfileRow } from '#shared/types/models'

/**
 * Row -> DTO mapping.
 *
 * This is the only module that knows Postgres columns are snake_case and the
 * public API is camelCase. Keeping the translation in one place means a column
 * rename is a one-file change and the client contract stays stable.
 */

/**
 * Postgres returns `null` for a NULL column, where the old storage layer
 * returned `''` or omitted the key. Every read therefore goes through a
 * fallback, and `publishedAt` specifically falls back to `created_at` so a
 * published job always has a timestamp to sort and display by.
 */
const str = (value: string | null | undefined, fallback = ''): string => value ?? fallback
const num = (value: number | null | undefined, fallback = 0): number => value ?? fallback
const bool = (value: boolean | null | undefined): boolean => value === true
const arr = (value: string[] | null | undefined): string[] => value ?? []

export function toSalary(row: JobRow): Salary {
  return {
    min: num(row.salary_min),
    max: num(row.salary_max),
    currency: str(row.salary_currency, 'USD'),
    period: row.salary_period ?? 'year',
    visible: bool(row.salary_visible)
  }
}

export function toCompanySummary(row: CompanyRow): CompanySummary {
  return {
    id: row.id,
    name: str(row.name),
    slug: str(row.slug),
    logoId: str(row.logo_id),
    website: str(row.website),
    location: str(row.location),
    verified: bool(row.verified)
  }
}

export function toCompany(row: CompanyRow, openRoles = 0): Company {
  return {
    ...toCompanySummary(row),
    description: str(row.description),
    industry: str(row.industry),
    size: row.size ?? '',
    founded: num(row.founded),
    services: str(row.services),
    workingHours: str(row.working_hours),
    openRoles
  }
}

export function toJobSummary(row: JobRow): JobSummary {
  return {
    id: row.id,
    title: str(row.title),
    slug: str(row.slug),
    company: {
      id: str(row.company_id),
      name: str(row.company_name),
      slug: str(row.company_slug),
      logoId: str(row.company_logo_id),
      website: '',
      location: '',
      verified: false
    },
    location: str(row.location),
    workplaceType: row.workplace_type,
    employmentType: row.employment_type,
    seniority: row.seniority ?? '',
    salary: toSalary(row),
    skills: arr(row.skills),
    publishedAt: str(row.published_at, row.created_at),
    featured: bool(row.featured)
  }
}

export function toJob(row: JobRow): Job {
  return {
    ...toJobSummary(row),
    description: str(row.description),
    tags: arr(row.tags),
    applyUrl: str(row.apply_url),
    applyEmail: str(row.apply_email),
    status: row.status,
    expiresAt: str(row.expires_at),
    views: num(row.views),
    createdBy: str(row.created_by),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export function toApplication(row: ApplicationRow) {
  return {
    id: row.id,
    jobId: str(row.job_id),
    fullName: str(row.full_name),
    email: str(row.email),
    coverNote: str(row.cover_note),
    status: row.status,
    createdAt: row.created_at
  }
}

export function toProfile(row: ProfileRow) {
  return {
    id: row.id,
    fullName: str(row.full_name),
    headline: str(row.headline),
    summary: str(row.summary),
    location: str(row.location),
    skills: arr(row.skills),
    portfolioUrl: str(row.portfolio_url),
    linkedinUrl: str(row.linkedin_url),
    openToWork: bool(row.open_to_work)
  }
}
