import { createCompanySchema } from '#shared/schemas'
import { requireAdmin } from '../../services/authorization.service'
import { useCompanyService } from '../../services/company.service'

/**
 * POST /api/companies — create a company profile.
 *
 * Admin only, for the same reason as job creation: employers cannot self-claim
 * a profile, because an unclaimed company is not claimable by whoever finds it
 * first.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const parsed = createCompanySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'The company could not be created',
      data: parsed.error.flatten()
    })
  }

  const company = await useCompanyService(event).create(event, parsed.data)
  setResponseStatus(event, 201)
  return company
})
