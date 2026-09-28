import { useCompanyService } from '../../services/company.service'

/**
 * GET /api/companies/:id
 *
 * Takes a slug, not the uuid, so company URLs stay readable and shareable. The
 * file is named `[id].get.ts` because Nitro derives one param name per path from
 * the file name, and the PATCH/DELETE handlers in this directory already claim
 * the segment as `id`. Naming this one `slug` made Nitro register the segment
 * under whichever file it saw first, and the handler then read an undefined
 * param and 400'd.
 *
 * Both keys are read as a guard, so this endpoint keeps working if the param
 * name is ever renamed.
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'id') ?? getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing company slug' })

  const company = await useCompanyService(event).getBySlug(slug)
  if (!company) throw createError({ statusCode: 404, statusMessage: 'Company not found' })

  setHeader(event, 'cache-control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
  return company
})
