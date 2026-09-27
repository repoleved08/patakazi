import type { H3Event } from 'h3'
import { requireAuth, resolveAuthContext, useSupabaseServer, TABLES } from '../utils/supabase'

/**
 * Authorization.
 *
 * Ownership is the boundary here, and it is checked in exactly one place per
 * decision. The service-role client bypasses RLS, so these checks are the only
 * thing standing between a forged request and someone else's company.
 *
 * Model: a company has exactly one owner (`companies.owner_id`). Supporting
 * multiple members would mean a `company_members` join table and widening
 * `owns_company()` in the migration; the single-owner rule was kept because
 * nothing in the product needs it yet.
 */

export type { AuthContext } from '../utils/supabase'
export { requireAuth, resolveAuthContext } from '../utils/supabase'

/**
 * Whether the signed-in user may write for a company.
 *
 * A company with no owner is not manageable by anyone: claiming is an explicit
 * create, not an implicit takeover, otherwise anyone could seize an unclaimed
 * listing by guessing its id.
 */
export async function canManageCompany(event: H3Event, companyId: string, userId: string): Promise<boolean> {
  const supabase = useSupabaseServer(event)
  const { data, error } = await supabase
    .from(TABLES.companies)
    .select('owner_id')
    .eq('id', companyId)
    .maybeSingle()

  if (error) return false
  return data?.owner_id === userId
}

/** Throw 403 unless the signed-in user manages the company. */
export async function requireCompanyAccess(event: H3Event, companyId: string) {
  const context = await requireAuth(await resolveAuthContext(event))
  if (!await canManageCompany(event, companyId, context.userId)) {
    throw createError({ statusCode: 403, statusMessage: 'You do not manage this company' })
  }
  return context
}

/**
 * Throw 403 unless the caller posted the job or manages its company.
 *
 * `created_by` alone is not enough: a company owner needs to edit or close every
 * listing for their company, including ones posted before they claimed it.
 */
export async function requireJobAccess(event: H3Event, job: { created_by: string | null, company_id: string }) {
  const context = await requireAuth(await resolveAuthContext(event))
  if (job.created_by === context.userId) return context
  if (await canManageCompany(event, job.company_id, context.userId)) return context

  throw createError({ statusCode: 403, statusMessage: 'You do not manage this listing' })
}
