import { useCompanyService } from '../../services/company.service'

/** Dynamic sitemap source for company profile pages. */
export default defineSitemapEventHandler(async (event) => {
  const { data } = await useCompanyService(event).list({ page: 1, perPage: 50 })

  return data.map(company => ({
    loc: `/companies/${company.slug}`,
    changefreq: 'weekly' as const,
    priority: 0.6
  }))
})
