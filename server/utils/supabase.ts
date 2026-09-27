import type { H3Event } from 'h3'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '#shared/types/database.types'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

/**
 * The single place that knows about Supabase credentials and session state.
 *
 * Two clients exist and they are NOT interchangeable:
 *
 *  - `useSupabaseServer(event)` uses the service-role key. It BYPASSES row
 *    level security, so it must only be used where `server/services/` has
 *    already made the authorisation decision. Treat every call as privileged.
 *  - The client built by `useSupabaseClient()` in the browser is subject to the
 *    RLS policies in `supabase/migrations/0001_init.sql`. That is the boundary
 *    for direct browser access.
 *
 * Because the service layer bypasses RLS, the ownership checks in the services
 * are the *only* thing protecting writes that arrive through our own API. The
 * two layers are complementary, not alternatives: RLS stops someone pointing a
 * browser client at Supabase directly, the services stop someone forging a
 * request to our API.
 */

/** Table names, in one place so a rename is a one-file change. */
export const TABLES = {
  companies: 'companies',
  jobs: 'jobs',
  applications: 'applications',
  savedJobs: 'saved_jobs',
  profiles: 'profiles'
} as const

/** Storage buckets created by the migration. */
export const BUCKETS = {
  /** Public assets: company logos. */
  media: 'media',
  /** Private: candidate resumes. Only reachable via an authorised download. */
  resumes: 'resumes'
} as const

export interface SupabaseServerConfig {
  url: string
  serviceKey: string
}

/**
 * Reads and validates the server config, and fails loudly when it is missing.
 *
 * A service-role client built from an empty key would not error until the first
 * query, which surfaces as an opaque 401 from PostgREST. Checking here means a
 * deployment missing its secrets fails immediately with a message that names
 * the variable to set.
 */
export function useSupabaseServerConfig(): SupabaseServerConfig {
  const { supabase, public: publicConfig } = useRuntimeConfig()

  // `secretKey` is the current name for the privileged key; `serviceKey` is the
  // legacy `service_role` JWT, kept as a fallback so older deployments still
  // boot after upgrading.
  const serviceKey = supabase?.secretKey || supabase?.serviceKey

  const missing: string[] = []
  if (!publicConfig.supabase?.url) missing.push('NUXT_PUBLIC_SUPABASE_URL')
  if (!serviceKey) missing.push('NUXT_SUPABASE_SECRET_KEY')
  if (missing.length) {
    throw createError({
      statusCode: 500,
      statusMessage: `Missing Supabase server configuration: ${missing.join(', ')}`
    })
  }

  return {
    url: publicConfig.supabase.url,
    serviceKey
  }
}

/**
 * A service-role client for the current request.
 *
 * Privileged: it ignores RLS, so the caller is responsible for having checked
 * ownership already.
 *
 * The event is required because that is how the module scopes the client — it
 * memoises it on `event.context` and reads runtime config with the event, which
 * gives request-scoped credentials and a retrying `fetch`. Callers get it from
 * the handler they are already running inside.
 */
export function useSupabaseServer(event: H3Event): SupabaseClient<Database> {
  // Validate before building: the module's own error mentions only the legacy
  // key, which would send someone looking for the wrong variable.
  useSupabaseServerConfig()
  return serverSupabaseServiceRole<Database>(event)
}

/** The signed-in user, resolved from the request cookies. Null when signed out. */
export async function getCurrentUser(event: H3Event) {
  return serverSupabaseUser(event)
}

export interface AuthContext {
  userId: string
  email: string
  name: string
}

/** Resolve the caller's identity, or null when there is no valid session. */
export async function resolveAuthContext(event: H3Event): Promise<AuthContext | null> {
  const user = await serverSupabaseUser(event)
  if (!user) return null

  return {
    userId: user.sub,
    email: typeof user.email === 'string' ? user.email : '',
    name: readName(user.user_metadata)
  }
}

/** Throws 401 unless the request carries a valid session. */
export async function requireAuth(context: AuthContext | null): Promise<AuthContext> {
  if (!context) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in to continue' })
  }
  return context
}

/** True for the roles we treat as employers when creating a company. */
export function isEmployerRole(metadata: Record<string, unknown> | undefined): boolean {
  const role = metadata?.['role']
  return role === 'employer' || role === 'admin'
}

/**
 * Display name, preferring explicit metadata over provider-specific guesses.
 * Returns an empty string rather than a placeholder so callers can decide.
 */
function readName(metadata: Record<string, unknown> | undefined): string {
  if (!metadata) return ''

  for (const key of ['full_name', 'name', 'first_name']) {
    const value = metadata[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  const given = metadata['given_name']
  const family = metadata['family_name']
  if (typeof given === 'string' || typeof family === 'string') {
    return [given, family].filter(part => typeof part === 'string' && part).join(' ').trim()
  }

  return ''
}
