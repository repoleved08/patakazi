import { useCompanyService } from '../../services/company.service'

/** GET /api/companies/:slug */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing company slug' })

  const company = await useCompanyService(event).getBySlug(slug)
  if (!company) throw createError({ statusCode: 404, statusMessage: 'Company not found' })

  setHeader(event, 'cache-control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
  return company
})
