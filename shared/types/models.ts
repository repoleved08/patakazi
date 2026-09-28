import type {
  ApplicationStatus,
  CompanySize,
  EmploymentType,
  JobStatus,
  SalaryPeriod,
  SeniorityLevel,
  UserRole,
  WorkplaceType
} from './job'

/**
 * Postgres row shapes, as returned by PostgREST.
 *
 * These are the storage contract: snake_case columns, and the three metadata
 * fields Postgres gives every table. `server/mappers/row-mappers.ts` is the
 * only place that turns these into the camelCase DTOs the client sees, so a
 * column rename here never reaches the UI.
 */

export interface BaseRow {
  id: string
  created_at: string
  updated_at: string
}

export interface CompanyRow extends BaseRow {
  name: string
  slug: string
  website: string
  description: string
  industry: string
  size: CompanySize | ''
  founded: number
  location: string
  services: string
  working_hours: string
  logo_id: string
  /** auth.users id of the account that claimed this company. */
  owner_id: string | null
  verified: boolean
}

export interface JobRow extends BaseRow {
  title: string
  slug: string
  description: string
  company_id: string
  /** Denormalised so a job card renders without a second round trip. */
  company_name: string
  company_slug: string
  company_logo_id: string
  location: string
  workplace_type: WorkplaceType
  employment_type: EmploymentType
  seniority: SeniorityLevel | ''
  salary_min: number
  salary_max: number
  salary_currency: string
  salary_period: SalaryPeriod
  salary_visible: boolean
  skills: string[]
  tags: string[]
  apply_url: string
  apply_email: string
  status: JobStatus
  published_at: string | null
  expires_at: string | null
  views: number
  featured: boolean
  created_by: string | null
}

export interface ApplicationRow extends BaseRow {
  job_id: string
  applicant_id: string | null
  full_name: string
  email: string
  resume_id: string
  cover_note: string
  status: ApplicationStatus
}

export interface SavedJobRow extends BaseRow {
  user_id: string
  job_id: string
}

export interface ProfileRow extends BaseRow {
  user_id: string
  full_name: string
  headline: string
  summary: string
  location: string
  skills: string[]
  resume_id: string
  portfolio_url: string
  linkedin_url: string
  open_to_work: boolean
  /** Access level, mirrored from `auth.users.user_metadata.role`. */
  role: UserRole
  is_active: boolean
}
