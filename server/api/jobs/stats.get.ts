import { useJobService } from '../../services/job.service'

/**
 * GET /api/jobs/stats
 *
 * Powers the landing-page counters. Kept separate from the list endpoint so it
 * can be cached independently and never paginated.
 */
export default defineEventHandler(async (event) => {
  const stats = await useJobService(event).stats()
  setHeader(event, 'cache-control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
  return stats
})
