import { useCompanyService } from '../../services/company.service'

/**
 * DELETE /api/companies/:id — remove a company profile.
 *
 * Jobs are left in place but become unreachable, so this is destructive and
 * intentionally not exposed in the UI; it exists for cleanup and tests.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing company id' })

  await useCompanyService(event).remove(event, id)

  setResponseStatus(event, 204)
  return null
})
