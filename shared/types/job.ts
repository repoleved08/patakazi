/**
 * The job domain's enum-like vocabulary.
 *
 * Values are declared in `shared/constants/job.ts` (runtime arrays) and the
 * union types are re-exported here so consumers can import types and constants
 * from one place. Keeping the `as const` arrays next to their types means a
 * new value can never drift out of sync with its type.
 */

export {
  APPLICATION_STATUSES,
  COMPANY_SIZES,
  EMPLOYMENT_TYPES,
  JOB_SORT_FIELDS,
  JOB_STATUSES,
  SALARY_PERIODS,
  SENIORITY_LEVELS,
  WORKPLACE_TYPES
} from '../constants/job'

export type {
  ApplicationStatus,
  CompanySize,
  EmploymentType,
  JobSortField,
  JobStatus,
  SalaryPeriod,
  SeniorityLevel,
  UserRole,
  WorkplaceType
} from '../constants/job'
