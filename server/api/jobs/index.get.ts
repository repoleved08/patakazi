import { jobQuerySchema } from '#shared/schemas'
import { definePublicGet } from '../../utils/publicCache'
import { useJobService } from '../../services/job.service'

/**
 * GET /api/jobs
 *
 * Public job search, cached per filter combination. The shape here is part of
 * the public contract: the MCP `search_jobs` tool, `/llms-jobs.txt` and the
 * agent skill all read through it.
 *
 * Caching is attached to this handler rather than set as a route rule, because
 * `index.post.ts` sits on the same path and a route rule would have answered it
 * with the cached list. See `definePublicGet`.
 */
export default definePublicGet('api-jobs', async (event) => {
  const parsed = jobQuerySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid job filters',
      data: parsed.error.flatten()
    })
  }

  return useJobService(event).listPublic(parsed.data)
}, { maxAge: 300 })
