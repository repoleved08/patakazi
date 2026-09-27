import { updateJobSchema } from '#shared/schemas'
import { useJobService } from '../../services/job.service'

/** PATCH /api/jobs/:id — partial update. Owner or employer only. */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing job id' })

  const parsed = updateJobSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'The listing could not be updated',
      data: parsed.error.flatten()
    })
  }

  return useJobService(event).update(event, id, parsed.data)
})
