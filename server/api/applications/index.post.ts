import { createApplicationSchema } from '#shared/schemas'
import { useApplicationService } from '../../services/application.service'

/** POST /api/applications — public. Anyone may apply to a published job. */
export default defineEventHandler(async (event) => {
  const parsed = createApplicationSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'The application could not be submitted',
      data: parsed.error.flatten()
    })
  }

  const application = await useApplicationService(event).submit(event, parsed.data)
  setResponseStatus(event, 201)
  return application
})
