import { useApplicationService } from '../../services/application.service'

/** GET /api/saved-jobs — the signed-in user's saved listings. */
export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'private, no-store')
  return useApplicationService(event).listSaved(event)
})
