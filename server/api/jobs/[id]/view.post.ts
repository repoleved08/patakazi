import { useJobService } from '../../../services/job.service'

/**
 * POST /api/jobs/:id/view — increment the view counter for a listing.
 *
 * Separate from the page fetch on purpose: a `POST` is never issued by the SSR
 * renderer, a link prefetcher, or a crawler, so the counter reflects real
 * visits rather than every time the route was resolved.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing job id' })

  await useJobService(event).recordView(id)

  setHeader(event, 'cache-control', 'no-store')
  return { ok: true }
})
