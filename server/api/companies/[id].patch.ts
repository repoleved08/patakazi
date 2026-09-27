import { updateCompanySchema } from '#shared/schemas'
import { useCompanyService } from '../../services/company.service'

/**
 * PATCH /api/companies/:id — edit a company profile.
 *
 * Addressed by id rather than slug so a rename does not invalidate the link the
 * employer is holding. Ownership is enforced in the service.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing company id' })

  const parsed = updateCompanySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'The company could not be updated',
      data: parsed.error.flatten()
    })
  }

  return useCompanyService(event).update(event, id, parsed.data)
})
