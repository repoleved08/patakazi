import { updateProfileSchema } from '#shared/schemas'
import { useApplicationService } from '../../services/application.service'

/** PUT /api/profile — create or replace the signed-in candidate's profile. */
export default defineEventHandler(async (event) => {
  const parsed = updateProfileSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'The profile could not be saved',
      data: parsed.error.flatten()
    })
  }

  return useApplicationService(event).upsertProfile(event, parsed.data)
})
