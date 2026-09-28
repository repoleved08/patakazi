import { definePublicGet } from '../../utils/publicCache'
import { useJobService } from '../../services/job.service'

/**
 * GET /api/jobs/stats
 *
 * Powers the landing-page counters. Kept separate from the list endpoint so it
 * can be cached independently and never paginated.
 */
export default definePublicGet('api-job-stats', event => useJobService(event).stats(), { maxAge: 300 })
