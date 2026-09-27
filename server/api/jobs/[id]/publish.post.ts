import { useJobService } from '../../../services/job.service'

/** POST /api/jobs/:id/publish — draft to published. */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing job id' })
  return useJobService(event).publish(event, id)
})
