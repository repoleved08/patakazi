import { useJobService } from '../../services/job.service'

/**
 * GET /api/jobs/:id — a single listing, addressed by id or slug.
 *
 * Public when published; drafts fall back to owner-only visibility. The param
 * is deliberately permissive so the same route serves readable public URLs and
 * the dashboard, which works in ids.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing job id' })

  const job = await useJobService(event).getForViewer(event, id)
  setHeader(event, 'cache-control', job.status === 'published' ? 'public, max-age=60, s-maxage=300' : 'private, no-store')
  return job
})
