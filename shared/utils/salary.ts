import type { Salary } from '../types/api'

/** Months assumed per hour-based rate, used only to make ranges comparable. */
const HOURS_PER_MONTH = 160
const MONTHS_PER_YEAR = 12

/**
 * Normalise a salary to an annual figure so that min/max filters and sorting
 * compare like with like.
 */
export function annualise(salary: Pick<Salary, 'min' | 'period'>): number {
  const { min, period } = salary
  if (period === 'year') return min
  if (period === 'month') return min * MONTHS_PER_YEAR
  return min * HOURS_PER_MONTH * MONTHS_PER_YEAR
}

/** Lower bound of a range as an annual figure, used for `salaryMin` filtering. */
export function annualFloor(salary: Pick<Salary, 'min' | 'period'>): number {
  return annualise(salary)
}

/** True when the listing has a usable, non-zero salary range. */
export function hasSalaryRange(salary: Pick<Salary, 'min' | 'max'>): boolean {
  return salary.max > 0 && salary.min > 0
}

/**
 * Render a salary as a human string, collapsing to a single figure when the
 * range has no spread. Returns null when the listing hides salary.
 */
export function formatSalary(
  salary: Salary,
  locale = 'en',
  options: { compact?: boolean, currencyDisplay?: 'symbol' | 'code' } = {}
): string | null {
  if (!salary.visible || !hasSalaryRange(salary)) return null

  const { min, max, currency, period } = salary
  const fmt = (value: number) => new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: options.currencyDisplay ?? 'symbol',
    notation: options.compact ? 'compact' : 'standard',
    maximumFractionDigits: period === 'hour' ? 2 : 0
  }).format(value)

  const suffix = period === 'month' ? '/mo' : period === 'hour' ? '/hr' : '/yr'
  const body = min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`
  return `${body}${suffix}`
}
