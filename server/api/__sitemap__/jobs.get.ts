import { useJobService } from '../../services/job.service'

/**
 * Dynamic sitemap source for published jobs.
 *
 * `nuxt-ai-ready` also indexes these routes for llms.txt and MCP, so the
 * sitemap doubles as the canonical list of what exists.
 */
export default defineSitemapEventHandler(async (event) => {
  const { data } = await useJobService(event).listPublic({ page: 1, perPage: 50, sort: 'newest', fields: 'full' })

  return data.map(job => ({
    loc: `/jobs/${job.slug}`,
    lastmod: job.updatedAt,
    changefreq: 'daily' as const,
    priority: job.featured ? 0.9 : 0.7
  }))
})
