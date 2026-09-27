import type { ApplicationStatus, EmploymentType, SeniorityLevel, WorkplaceType } from '../types/job'

const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
  temporary: 'Temporary',
  volunteer: 'Volunteer'
}

const WORKPLACE_LABELS: Record<WorkplaceType, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site'
}

const SENIORITY_LABELS: Record<SeniorityLevel, string> = {
  internship: 'Internship',
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior',
  staff: 'Staff',
  principal: 'Principal',
  lead: 'Lead',
  director: 'Director'
}

const COMPANY_SIZE_LABELS: Record<string, string> = {
  'just_me': 'Just me',
  '2_10': '2–10',
  '11_50': '11–50',
  '51_200': '51–200',
  '201_500': '201–500',
  '501_1000': '501–1,000',
  '1001_5000': '1,001–5,000',
  '5000_plus': '5,000+'
}

const JOB_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
  closed: 'Closed'
}

const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: 'Submitted',
  reviewing: 'Reviewing',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn'
}

export const labelForEmploymentType = (value: EmploymentType): string => EMPLOYMENT_LABELS[value]
export const labelForWorkplaceType = (value: WorkplaceType): string => WORKPLACE_LABELS[value]
export const labelForSeniority = (value: SeniorityLevel): string => SENIORITY_LABELS[value]
export const labelForCompanySize = (value: string): string => COMPANY_SIZE_LABELS[value] ?? value
export const labelForJobStatus = (value: string): string => JOB_STATUS_LABELS[value] ?? value
export const labelForApplicationStatus = (value: ApplicationStatus): string => APPLICATION_STATUS_LABELS[value]

/** Short, human relative age, e.g. "3d ago". Empty string for unparseable input. */
export function timeAgo(iso: string, now = new Date()): string {
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return ''

  const seconds = Math.round((now.getTime() - then.getTime()) / 1000)
  if (seconds < 0) return 'just now'

  // Cumulative divisors, largest unit last.
  const units: Array<[divisor: number, unit: Intl.RelativeTimeFormatUnit]> = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.348, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year']
  ]

  let value = seconds
  for (const [divisor, unit] of units) {
    if (Math.abs(value) < divisor) {
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-Math.round(value), unit)
    }
    value /= divisor
  }
  return ''
}

/** `acme-labs` -> `Acme Labs`, for rendering slugs as display names. */
export function humaniseSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** Stable, collision-resistant slug for job titles and company names. */
export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Truncate on a word boundary and append an ellipsis. */
export function excerpt(value: string, length = 180): string {
  const collapsed = value.replace(/\s+/g, ' ').trim()
  if (collapsed.length <= length) return collapsed
  const cut = collapsed.slice(0, length)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > length * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}
