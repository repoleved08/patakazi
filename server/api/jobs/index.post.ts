import { createJobSchema } from '#shared/schemas'
import { useJobService } from '../../services/job.service'

/** POST /api/jobs — create a listing. Employers only. */
export default defineEventHandler(async (event) => {
  const parsed = createJobSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'The listing could not be saved',
      data: parsed.error.flatten()
    })
  }

  const job = await useJobService(event).create(event, parsed.data)
  setResponseStatus(event, 201)
  return job
})
