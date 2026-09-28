/**
 * Request validation.
 *
 * Note on zod: this file must use the API common to zod 3 and zod 4, so
 * `z.string().url()` rather than the v4 top-level `z.url()`. Two majors are
 * present in the tree — v4.6.5 at the root, and v3.25.76 pulled in by
 * drizzle-orm under nuxt-ai-ready — and the Nitro server bundle resolved this
 * module against v3. Under v3 the v4 helpers are undefined, and every request
 * that parsed a schema failed with `z.url is not a function` while dev, which
 * resolves the root copy, kept working.
 */
import { z } from 'zod'
import {
  APPLICATION_STATUSES,
  COMPANY_SIZES,
  EMPLOYMENT_TYPES,
  JOB_SORT_FIELDS,
  JOB_STATUSES,
  SALARY_PERIODS,
  SENIORITY_LEVELS,
  WORKPLACE_TYPES
} from '../constants/job'

/** Accepts a repeated or comma-separated query param and normalises to a string[]. */
const csvArray = <T extends readonly [string, ...string[]]>(values: T) =>
  csvList().pipe(z.array(z.enum(values)).optional())

/** Same normalisation, but for free-form strings that are not a closed enum. */
const csvList = () =>
  z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined
      const list = Array.isArray(value) ? value : value.split(',')
      return list.map(item => item.trim()).filter(Boolean)
    })

export const jobQuerySchema = z.object({
  q: z.string().trim().min(1).max(200).optional(),
  companyId: z.string().trim().optional(),
  location: z.string().trim().max(120).optional(),
  services: z.string().trim().max(5000).default('').optional(),
  workingHours: z.string().trim().max(500).default('').optional(),
  workplaceType: csvArray(WORKPLACE_TYPES),
  employmentType: csvArray(EMPLOYMENT_TYPES),
  seniority: csvArray(SENIORITY_LEVELS),
  skills: csvList().pipe(z.array(z.string().min(1).max(40)).max(30).optional()),
  salaryMin: z.coerce.number().int().nonnegative().optional(),
  currency: z.string().trim().length(3).toUpperCase().optional(),
  status: csvArray(JOB_STATUSES),
  sort: z.enum(JOB_SORT_FIELDS).default('newest'),
  // `summary` drops the fields a listing card never renders — the description
  // body, the employer's application address, the view counter. On a page of 20
  // roles the descriptions alone are ~70 KB, and they are serialised into the
  // SSR payload whether or not the browser draws them. Absent means `full`, so
  // the published shape of this endpoint does not change for existing callers.
  fields: z.enum(['full', 'summary']).optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(20)
})

export type JobQueryInput = z.infer<typeof jobQuerySchema>

const salaryShape = z.object({
  min: z.number().int().nonnegative(),
  max: z.number().int().nonnegative(),
  currency: z.string().length(3).default('USD'),
  period: z.enum(SALARY_PERIODS).default('year'),
  visible: z.boolean().default(true)
}).refine(v => v.max === 0 || v.max >= v.min, {
  message: 'Salary max must be greater than or equal to min',
  path: ['max']
})

/**
 * Fields of a job posting.
 *
 * Kept as a separate, unrefined object because Zod 4 refuses `.partial()` on an
 * object that carries refinements — and we need a partial variant for PATCH.
 * Cross-field rules are attached to each schema below rather than to the shape.
 */
const createJobShape = z.object({
  title: z.string().trim().min(3).max(120),
  companyId: z.string().trim().min(1),
  description: z.string().trim().min(50).max(50_000),
  location: z.string().trim().max(120).default(''),
  workplaceType: z.enum(WORKPLACE_TYPES),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  seniority: z.enum(SENIORITY_LEVELS).or(z.literal('')).default(''),
  salary: salaryShape.default({ min: 0, max: 0, currency: 'USD', period: 'year', visible: true }),
  skills: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  tags: z.array(z.string().trim().min(1).max(40)).max(15).default([]),
  applyUrl: z.union([z.string().url(), z.literal('')]).default(''),
  applyEmail: z.union([z.string().email(), z.literal('')]).default(''),
  expiresAt: z.string().datetime().optional(),
  featured: z.boolean().default(false)
})

export const createJobSchema = createJobShape.refine(
  v => v.applyUrl !== '' || v.applyEmail !== '',
  { message: 'Provide an apply URL or an apply email', path: ['applyUrl'] }
)

export type CreateJobInput = z.infer<typeof createJobSchema>

export const updateJobSchema = createJobShape
  .partial()
  .refine(v => Object.keys(v).length > 0, { message: 'No fields to update' })
  // Only enforced when the caller actually touches the apply fields, so an edit
  // of an unrelated field cannot fail on a listing that predates the rule.
  .refine(
    v => (v.applyUrl === undefined && v.applyEmail === undefined)
      || Boolean(v.applyUrl)
      || Boolean(v.applyEmail),
    { message: 'Provide an apply URL or an apply email', path: ['applyUrl'] }
  )

export type UpdateJobInput = z.infer<typeof updateJobSchema>

export const createCompanySchema = z.object({
  name: z.string().trim().min(2).max(120),
  website: z.union([z.string().url(), z.literal('')]).default(''),
  description: z.string().trim().max(10_000).default(''),
  industry: z.string().trim().max(80).default(''),
  size: z.enum(COMPANY_SIZES).or(z.literal('')).default(''),
  founded: z.coerce.number().int().min(1800).max(2100).or(z.literal(0)).default(0),
  location: z.string().trim().max(120).default(''),
  services: z.string().trim().max(5000).default(''),
  workingHours: z.string().trim().max(500).default('')
})

export type CreateCompanyInput = z.infer<typeof createCompanySchema>

const updateCompanyShape = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  website: z.union([z.string().url(), z.literal('')]).optional(),
  description: z.string().trim().max(10_000).optional(),
  industry: z.string().trim().max(80).optional(),
  size: z.enum(COMPANY_SIZES).or(z.literal('')).optional(),
  founded: z.coerce.number().int().min(1800).max(2100).or(z.literal(0)).optional(),
  location: z.string().trim().max(120).optional(),
  services: z.string().trim().max(5000).default('').optional(),
  workingHours: z.string().trim().max(500).default('').optional()
})

export const updateCompanySchema = updateCompanyShape.refine(
  v => Object.keys(v).length > 0,
  { message: 'No fields to update' }
)

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>

export const createApplicationSchema = z.object({
  jobId: z.string().trim().min(1),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().email(),
  coverNote: z.string().trim().max(5_000).default(''),
  resumeId: z.string().trim().default('')
})

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>

export const updateApplicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES)
})

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  headline: z.string().trim().max(160).optional(),
  summary: z.string().trim().max(5_000).optional(),
  location: z.string().trim().max(120).optional(),
  skills: z.array(z.string().trim().min(1).max(40)).max(40).optional(),
  // A storage object key in the private `resumes` bucket, set by the upload
  // flow rather than typed by hand.
  resumeId: z.string().trim().max(300).optional(),
  portfolioUrl: z.union([z.string().url(), z.literal('')]).optional(),
  linkedinUrl: z.union([z.string().url(), z.literal('')]).optional(),
  openToWork: z.boolean().optional()
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
