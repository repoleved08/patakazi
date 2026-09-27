import { useJobService } from '../../../services/job.service'

/** POST /api/jobs/:id/close — stop accepting applications. */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing job id' })
  return useJobService(event).close(event, id)
})
