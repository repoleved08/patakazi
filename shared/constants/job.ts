export const WORKPLACE_TYPES = ['remote', 'hybrid', 'onsite'] as const
export type WorkplaceType = typeof WORKPLACE_TYPES[number]

export const EMPLOYMENT_TYPES = [
  'full_time',
  'part_time',
  'contract',
  'internship',
  'temporary',
  'volunteer'
] as const
export type EmploymentType = typeof EMPLOYMENT_TYPES[number]

export const SENIORITY_LEVELS = [
  'internship',
  'junior',
  'mid',
  'senior',
  'staff',
  'principal',
  'lead',
  'director'
] as const
export type SeniorityLevel = typeof SENIORITY_LEVELS[number]

export const JOB_STATUSES = [
  'draft',
  'pending_review',
  'published',
  'closed',
  'rejected'
] as const
export type JobStatus = typeof JOB_STATUSES[number]

export const APPLICATION_STATUSES = [
  'submitted',
  'reviewing',
  'interview',
  'offer',
  'hired',
  'rejected',
  'withdrawn'
] as const
export type ApplicationStatus = typeof APPLICATION_STATUSES[number]

export const SALARY_PERIODS = ['year', 'month', 'hour'] as const
export type SalaryPeriod = typeof SALARY_PERIODS[number]

export const COMPANY_SIZES = [
  'just_me',
  '2_10',
  '11_50',
  '51_200',
  '201_500',
  '501_1000',
  '1001_5000',
  '5000_plus'
] as const
export type CompanySize = typeof COMPANY_SIZES[number]

export const JOB_SORT_FIELDS = ['relevance', 'newest', 'salary'] as const
export type JobSortField = typeof JOB_SORT_FIELDS[number]

/**
 * Platform access levels. `admin` is global (moderation, manual entry);
 * `employer` is the company-owner role the ownership checks use.
 */
export const USER_ROLES = ['employer', 'admin'] as const
export type UserRole = typeof USER_ROLES[number]
