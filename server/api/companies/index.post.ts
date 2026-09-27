import { createCompanySchema } from '#shared/schemas'
import { useCompanyService } from '../../services/company.service'

/** POST /api/companies — claim or create a company profile. */
export default defineEventHandler(async (event) => {
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
