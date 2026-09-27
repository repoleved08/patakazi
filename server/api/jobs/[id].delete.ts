import { useJobService } from '../../services/job.service'

/** DELETE /api/jobs/:id — owner or employer only. */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing job id' })

  await useJobService(event).remove(event, id)
  setResponseStatus(event, 204)
  return null
})
