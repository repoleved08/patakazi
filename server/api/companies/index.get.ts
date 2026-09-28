import { z } from 'zod'
import { definePublicGet } from '../../utils/publicCache'
import { useCompanyService } from '../../services/company.service'

const companyQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(24),
  q: z.string().trim().max(120).optional()
})

/**
 * GET /api/companies
 *
 * Cached per page and search term. `index.post.ts` shares this path, so the
 * cache lives on the handler rather than in a route rule.
 */
export default definePublicGet('api-companies', async (event) => {
  const parsed = companyQuerySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid company filters' })
  }

  return useCompanyService(event).list(parsed.data)
}, { maxAge: 600 })
