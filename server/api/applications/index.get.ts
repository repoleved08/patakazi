import { useApplicationService } from '../../services/application.service'

/** GET /api/applications?jobId= — employers only. */
export default defineEventHandler(async (event) => {
  const jobId = getQuery(event).jobId
  if (typeof jobId !== 'string' || !jobId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing jobId' })
  }

  return useApplicationService(event).listForJob(event, jobId)
})
