import { useCompanyService } from '../../services/company.service'

/**
 * GET /api/companies/mine
 *
 * Companies the signed-in user owns or belongs to. Must be declared before
 * `/api/companies/:slug` resolves, since Nitro prefers static segments.
 */
export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'private, no-store')
  return useCompanyService(event).listMine(event)
})
