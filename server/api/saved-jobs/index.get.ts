import { useCandidateService } from '../../services/candidate.service'

/** GET /api/saved-jobs — the signed-in user's saved listings. */
export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'private, no-store')
  return useCandidateService(event).listSaved(event)
})
