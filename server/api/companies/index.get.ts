import { z } from 'zod'
import { useCompanyService } from '../../services/company.service'

const companyQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(24),
  q: z.string().trim().max(120).optional()
})

/** GET /api/companies */
export default defineEventHandler(async (event) => {
  const parsed = companyQuerySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid company filters' })
  }

  const result = await useCompanyService(event).list(parsed.data)
  setHeader(event, 'cache-control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
  return result
})
