import { jobQuerySchema } from '#shared/schemas'
import { useJobService } from '../../services/job.service'

/**
 * GET /api/jobs
 *
 * Public, cached job search. Exposed to AI agents via nuxt-ai-ready's MCP
 * search, so the shape here is part of the public contract.
 */
export default defineEventHandler(async (event) => {
  const parsed = jobQuerySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid job filters',
      data: parsed.error.flatten()
    })
  }

  const result = await useJobService(event).listPublic(parsed.data)

  setHeader(event, 'cache-control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
  return result
})
