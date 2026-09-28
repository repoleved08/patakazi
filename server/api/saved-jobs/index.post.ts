import { useCandidateService } from '../../services/candidate.service'

/** POST /api/saved-jobs — save a listing. Body: { jobId }. */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ jobId?: string }>(event)
  if (!body?.jobId) throw createError({ statusCode: 400, statusMessage: 'Missing jobId' })

  setResponseStatus(event, 201)
  return useCandidateService(event).save(event, body.jobId)
})
