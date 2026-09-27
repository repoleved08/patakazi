import { useApplicationService } from '../../services/application.service'

/** DELETE /api/saved-jobs/:jobId */
export default defineEventHandler(async (event) => {
  const jobId = getRouterParam(event, 'jobId')
  if (!jobId) throw createError({ statusCode: 400, statusMessage: 'Missing jobId' })

  await useApplicationService(event).unsave(event, jobId)
  setResponseStatus(event, 204)
  return null
})
