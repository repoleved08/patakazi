import { useJobService } from '../services/job.service'
import { excerpt } from '#shared/utils/format'

/**
 * GET /api/search
 *
 * A deliberately small, agent-friendly search endpoint: a single `q` plus a
 * handful of optional filters, returning compact JSON with a short natural
 * language summary. This is what we recommend to AI agents over the full
 * paginated `/api/jobs`, because the response stays inside a typical context
 * window.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const term = typeof query.q === 'string' ? query.q.trim() : ''
  const limit = Math.min(Number(query.limit) || 10, 25)

  const result = await useJobService(event).listPublic({
    q: term || undefined,
    location: typeof query.location === 'string' ? query.location : undefined,
    workplaceType: typeof query.workplaceType === 'string'
      ? [query.workplaceType] as never
      : undefined,
    sort: 'relevance',
    page: 1,
    perPage: limit
  })

  const jobs = result.data

  return {
    query: term,
    total: result.total,
    returned: jobs.length,
    // A one-line answer agents can quote directly.
    summary: jobs.length === 0
      ? `No open roles matched "${term}".`
      : `Found ${result.total} open role${result.total === 1 ? '' : 's'} matching "${term}". `
        + `Top match: ${jobs[0]!.title} at ${jobs[0]!.company.name}.`,
    results: jobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company.name,
      location: job.location,
      workplaceType: job.workplaceType,
      employmentType: job.employmentType,
      salary: job.salary.visible && job.salary.max > 0
        ? { min: job.salary.min, max: job.salary.max, currency: job.salary.currency, period: job.salary.period }
        : null,
      skills: job.skills,
      url: `/jobs/${job.slug}`,
      summary: excerpt(job.description, 200)
    }))
  }
})
