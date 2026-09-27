import type { SupabaseClient } from '@supabase/supabase-js'
import type { CompanyRow, JobRow } from '#shared/types/models'
import type { Database, TablesInsert, TablesUpdate } from '#shared/types/database.types'
import { TABLES } from '../utils/supabase'

/**
 * Data access for jobs and companies.
 *
 * Repositories translate between PostgREST's query builder and our own types,
 * and nothing else. No business rules, no DTO mapping, no HTTP concerns. The
 * service layer puts those on top.
 *
 * Two behaviours worth knowing:
 *
 *  - Every read asks for an exact `count`, because pagination needs the true
 *    total. It is returned in the same round trip, so this costs no extra query.
 *  - The client is the service-role one, so RLS does not apply. Filtering here
 *    is for correctness and performance, never for security; that is the
 *    services' job.
 */

export interface ListJobsParams {
  ids?: string[]
  companyIds?: string[]
  statuses?: string[]
  workplaceTypes?: string[]
  employmentTypes?: string[]
  seniority?: string[]
  search?: string
  location?: string
  skills?: string[]
  salaryFloor?: number
  /** Drop rows whose `expires_at` is set and in the past. */
  excludeExpired?: boolean
  limit?: number
  offset?: number
  orderAsc?: boolean
}

/**
 * The service-role client, and the PostgREST builder derived from it.
 *
 * `PostgrestFilterBuilder` takes eight type parameters that change shape
 * between SDK versions, so it is derived from our own client rather than
 * written out. Deriving from the *typed* client is what makes the column names
 * checked at the call sites below and the result rows come back as `JobRow`
 * instead of `unknown`.
 */
type TypedClient = SupabaseClient<Database>
type PostgrestBuilder = ReturnType<ReturnType<TypedClient['from']>['select']>

/**
 * Translate list params into PostgREST filters.
 *
 * `countByStatus` etc. re-use this with `limit: 0` so a count and a page of
 * rows can never drift apart as the filter definitions change.
 */
function applyJobFilters(query: PostgrestBuilder, params: ListJobsParams): PostgrestBuilder {
  let filtered = query

  if (params.ids?.length) filtered = filtered.in('id', params.ids)
  if (params.companyIds?.length) filtered = filtered.in('company_id', params.companyIds)
  if (params.statuses?.length) filtered = filtered.in('status', params.statuses)
  if (params.workplaceTypes?.length) filtered = filtered.in('workplace_type', params.workplaceTypes)
  if (params.employmentTypes?.length) filtered = filtered.in('employment_type', params.employmentTypes)
  if (params.seniority?.length) filtered = filtered.in('seniority', params.seniority)

  // Every requested skill must be present. Chaining `.contains` ANDs the
  // conditions, and the GIN index on `skills` serves each one.
  for (const skill of params.skills ?? []) {
    filtered = filtered.contains('skills', [skill])
  }

  if (params.search) {
    // `websearch` understands quoted phrases and `-exclusions`, which is what
    // makes this usable from an agent as well as a human.
    filtered = filtered.textSearch('search_vector', params.search, { type: 'websearch' })
  }

  if (params.location) {
    // Postgres has no full-text index on `location`, and a location is a place
    // name ("Berlin") rather than prose, so a case-insensitive match is both
    // cheaper and closer to what someone typing a city expects.
    filtered = filtered.ilike('location', `%${params.location}%`)
  }

  if (params.salaryFloor !== undefined) {
    filtered = filtered.gte('salary_max', params.salaryFloor)
  }

  if (params.excludeExpired) {
    // Expiry is a second predicate on top of status, so it belongs in the query
    // and not in JS: filtering after the fact would inflate `total` with rows
    // that were never returned.
    filtered = filtered.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
  }

  return filtered
}

export class JobRepository {
  constructor(private readonly supabase: TypedClient) {}

  async list(params: ListJobsParams = {}): Promise<{ rows: JobRow[], total: number }> {
    const limit = params.limit ?? 20
    const offset = params.offset ?? 0

    const base = this.supabase.from(TABLES.jobs).select('*', { count: 'exact' })
    const filtered = applyJobFilters(base, params)
      // Drafts have no `published_at`, so they sort to one end by the nulls
      // rule; `created_at` is the stable tiebreak within that.
      .order('published_at', { ascending: params.orderAsc === true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + Math.max(limit, 0) - 1)

    const { data, error, count } = await filtered
    throwIfError(error)
    return { rows: data ?? [], total: count ?? 0 }
  }

  /** Same filters and ordering, for the MCP and agent surfaces. */
  async listForMcp(params: ListJobsParams = {}): Promise<{ rows: JobRow[], total: number }> {
    return this.list({ ...params, limit: params.limit ?? 25, offset: params.offset ?? 0 })
  }

  async getById(id: string): Promise<JobRow | null> {
    const { data, error } = await this.supabase
      .from(TABLES.jobs)
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) return null
    return data
  }

  async getBySlug(slug: string): Promise<JobRow | null> {
    const { data, error } = await this.supabase
      .from(TABLES.jobs)
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) return null
    return data
  }

  async getManyByIds(ids: string[]): Promise<JobRow[]> {
    if (ids.length === 0) return []
    const { data, error } = await this.supabase
      .from(TABLES.jobs)
      .select('*')
      .in('id', ids)
      .limit(ids.length)

    throwIfError(error)
    return data ?? []
  }

  /**
   * Inserts a row. Typed as the table's `Insert` shape rather than
   * `Partial<JobRow>`: the two differ in which columns are required, and the
   * useful question at a call site is "does this provide everything the database
   * cannot default?", which only `Insert` can answer.
   */
  async create(data: TablesInsert<'jobs'>): Promise<JobRow> {
    const { data: row, error } = await this.supabase
      .from(TABLES.jobs)
      .insert(data)
      .select('*')
      .single()

    throwIfError(error)
    return writtenRow(row, TABLES.jobs)
  }

  /** Every column optional, which is what makes a partial edit safe. */
  async update(id: string, data: TablesUpdate<'jobs'>): Promise<JobRow> {
    const { data: row, error } = await this.supabase
      .from(TABLES.jobs)
      .update(data)
      .eq('id', id)
      .select('*')
      .single()

    throwIfError(error)
    return writtenRow(row, TABLES.jobs)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from(TABLES.jobs).delete().eq('id', id)
    throwIfError(error)
  }

  async incrementViews(id: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment_job_views', { target_job_id: id })
    if (error) {
      // View counts are best-effort and must never break a page render.
      console.warn('[jobs] could not increment views', error.message)
    }
  }

  /** Exact count for one predicate, sharing `applyJobFilters` with `list`. */
  private async countBy(params: ListJobsParams): Promise<number> {
    const base = this.supabase.from(TABLES.jobs).select('*', { count: 'exact', head: true })
    const { count, error } = await applyJobFilters(base, params)
    throwIfError(error)
    return count ?? 0
  }

  /** Counts jobs per status, used for the stats strip. */
  async countByStatus(statuses: string[]): Promise<Record<string, number>> {
    if (statuses.length === 0) return {}
    return { [statuses[0]!]: await this.countBy({ statuses }) }
  }

  async countAll(statuses: string[]): Promise<number> {
    return this.countBy({ statuses })
  }

  async countSalaryVisible(statuses: string[]): Promise<number> {
    if (statuses.length === 0) return 0
    const base = this.supabase.from(TABLES.jobs).select('*', { count: 'exact', head: true })
    const { count, error } = await applyJobFilters(base, { statuses }).eq('salary_visible', true)
    throwIfError(error)
    return count ?? 0
  }

  async countByWorkplaceTypes(statuses: string[], workplaceTypes: string[]): Promise<number> {
    if (workplaceTypes.length === 0) return 0
    return this.countBy({ statuses, workplaceTypes })
  }

  async countPublishedSince(since: string): Promise<number> {
    const base = this.supabase.from(TABLES.jobs).select('*', { count: 'exact', head: true })
    const { count, error } = await base.eq('status', 'published').gte('created_at', since)
    throwIfError(error)
    return count ?? 0
  }

  /** Slugs plus timestamps, for sitemap generation. */
  async listSlugsForSitemap(limit = 5000): Promise<Array<Pick<JobRow, 'slug' | 'updated_at'>>> {
    const { data, error } = await this.supabase
      .from(TABLES.jobs)
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(limit)

    throwIfError(error)
    return data ?? []
  }
}

export class CompanyRepository {
  constructor(private readonly supabase: TypedClient) {}

  async list(params: { search?: string, limit?: number, offset?: number } = {}): Promise<{ rows: CompanyRow[], total: number }> {
    const limit = params.limit ?? 20
    const offset = params.offset ?? 0

    let query = this.supabase.from(TABLES.companies).select('*', { count: 'exact' })
    if (params.search) {
      // Company search is a prefix/substring match on the name: users type the
      // beginning of a name far more often than a word from the middle of it.
      query = query.ilike('name', `%${params.search}%`)
    }

    const { data, error, count } = await query
      .order('name', { ascending: true })
      .range(offset, offset + Math.max(limit, 0) - 1)

    throwIfError(error)
    return { rows: data ?? [], total: count ?? 0 }
  }

  async getById(id: string): Promise<CompanyRow | null> {
    const { data, error } = await this.supabase
      .from(TABLES.companies)
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) return null
    return data
  }

  async getBySlug(slug: string): Promise<CompanyRow | null> {
    const { data, error } = await this.supabase
      .from(TABLES.companies)
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) return null
    return data
  }

  async getManyByIds(ids: string[]): Promise<CompanyRow[]> {
    if (ids.length === 0) return []
    const { data, error } = await this.supabase
      .from(TABLES.companies)
      .select('*')
      .in('id', ids)
      .limit(ids.length)

    throwIfError(error)
    return data ?? []
  }

  async getManyByOwner(ownerId: string): Promise<CompanyRow[]> {
    const { data, error } = await this.supabase
      .from(TABLES.companies)
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    throwIfError(error)
    return data ?? []
  }

  async create(data: TablesInsert<'companies'>): Promise<CompanyRow> {
    const { data: row, error } = await this.supabase
      .from(TABLES.companies)
      .insert(data)
      .select('*')
      .single()

    throwIfError(error)
    return writtenRow(row, TABLES.companies)
  }

  async update(id: string, data: TablesUpdate<'companies'>): Promise<CompanyRow> {
    const { data: row, error } = await this.supabase
      .from(TABLES.companies)
      .update(data)
      .eq('id', id)
      .select('*')
      .single()

    throwIfError(error)
    return writtenRow(row, TABLES.companies)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from(TABLES.companies).delete().eq('id', id)
    throwIfError(error)
  }

  async count(): Promise<number> {
    const { count, error } = await this.supabase
      .from(TABLES.companies)
      .select('*', { count: 'exact', head: true })

    throwIfError(error)
    return count ?? 0
  }

  async listSlugsForSitemap(limit = 5000): Promise<Array<Pick<CompanyRow, 'slug' | 'updated_at'>>> {
    const { data, error } = await this.supabase
      .from(TABLES.companies)
      .select('slug, updated_at')
      .order('updated_at', { ascending: false })
      .limit(limit)

    throwIfError(error)
    return data ?? []
  }
}

/**
 * PostgREST reports failures in the response body instead of throwing, which
 * would otherwise let a failed insert look like a successful one. Routing every
 * error through here keeps the services' `try`/`catch` semantics intact and
 * gives the error plugin one shape to translate.
 */
function throwIfError(error: { code?: string, message: string, details?: string } | null): void {
  if (!error) return
  throw Object.assign(new Error(error.message), {
    code: error.code,
    details: error.details,
    postgrest: true
  })
}

/**
 * Narrow the nullable result of a write that used `.single()`.
 *
 * PostgREST types `.single()` as possibly null because it is also the shape a
 * failed match produces. After an insert or update by primary key that cannot
 * legitimately happen, so a null here is an internal fault rather than a "not
 * found" — reporting it as a 404 would send the caller looking for a row that
 * was just written.
 */
function writtenRow<T>(row: T | null, table: string): T {
  if (row !== null) return row

  throw Object.assign(new Error(`Expected one row from ${table}, got none`), {
    postgrest: true,
    code: 'PGRST116'
  })
}
