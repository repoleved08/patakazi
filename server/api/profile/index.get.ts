import { useCandidateService } from '../../services/candidate.service'

/** GET /api/profile — the signed-in candidate's profile, or null. */
export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'private, no-store')
  return useCandidateService(event).getProfile(event)
})
