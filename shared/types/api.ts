import type {
  ApplicationStatus,
  CompanySize,
  EmploymentType,
  JobSortField,
  SalaryPeriod,
  SeniorityLevel,
  WorkplaceType
} from './job'

/**
 * Public DTOs.
 *
 * These are the shapes the API returns. They are deliberately decoupled from
 * the Appwrite row types so that storage concerns (row metadata, denormalised
 * fields, permission strings) never leak into the UI contract.
 */

export interface CompanySummary {
  id: string
  name: string
  slug: string
  logoId: string
  website: string
  location: string
  verified: boolean
}

export interface Company extends CompanySummary {
  description: string
  industry: string
  size: CompanySize | ''
  founded: number
  openRoles: number
  services?: string
  workingHours?: string
}

export interface Salary {
  min: number
  max: number
  currency: string
  period: SalaryPeriod
  visible: boolean
}

export interface JobSummary {
  id: string
  title: string
  slug: string
  company: CompanySummary
  location: string
  workplaceType: WorkplaceType
  employmentType: EmploymentType
  seniority: SeniorityLevel | ''
  salary: Salary
  skills: string[]
  publishedAt: string
  featured: boolean
}

export interface Job extends JobSummary {
  description: string
  tags: string[]
  applyUrl: string
  applyEmail: string
  status: JobStatus
  expiresAt: string
  views: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Application {
  id: string
  jobId: string
  fullName: string
  email: string
  coverNote: string
  status: ApplicationStatus
  createdAt: string
}

export interface SavedJob {
  jobId: string
  savedAt: string
}

export interface CandidateProfile {
  id: string
  fullName: string
  headline: string
  summary: string
  location: string
  skills: string[]
  portfolioUrl: string
  linkedinUrl: string
  openToWork: boolean
}

/** Query parameters accepted by `GET /api/jobs`. */
export interface JobQuery {
  q?: string
  companyId?: string
  location?: string
  workplaceType?: WorkplaceType | WorkplaceType[]
  employmentType?: EmploymentType | EmploymentType[]
  seniority?: SeniorityLevel | SeniorityLevel[]
  skills?: string | string[]
  salaryMin?: number
  currency?: string
  status?: JobStatus | JobStatus[]
  sort?: JobSortField
  /** `summary` omits the description and employer contact fields. See jobQuerySchema. */
  fields?: 'full' | 'summary'
  page?: number
  perPage?: number
}

/**
 * The subset of `JobQuery` the search UI owns, and the single shape used by
 * both `JobSearchBar` and the page that owns the URL query.
 *
 * The API accepts lists for multi-select filtering; the UI is deliberately
 * single-valued so one control maps to one query parameter.
 */
export interface JobSearchFilters {
  q?: string
  location?: string
  workplaceType?: WorkplaceType
  employmentType?: EmploymentType
  sort?: JobSortField
  salaryMin?: number
}

/** Every paginated list endpoint returns this envelope. */
export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

/** Aggregate counts for the jobs landing page. */
export interface JobStats {
  total: number
  remote: number
  lastWeek: number
  withSalary: number
  companies: number
}
