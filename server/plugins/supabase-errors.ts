/**
 * Central error boundary for Postgres/PostgREST failures.
 *
 * Services let database errors propagate. Without a single translation point at
 * the edge, a database outage escapes as an unhandled 500 that (a) tells the
 * client things it should not know — "relation jobs does not exist" is a schema
 * detail, not a user-facing error — and (b) tears down the surrounding page
 * render, which during prerender takes the rest of the build with it.
 *
 * Handling it once here means no individual handler has to remember to wrap its
 * service calls, and every endpoint fails the same way.
 */

/** A PostgREST failure, as tagged by `throwIfError` in the repositories. */
interface PostgrestError extends Error {
  code?: string
  details?: string
  postgrest?: boolean
  statusCode?: number
  statusMessage?: string
}

/** SQLSTATE classes, mapped to what the caller should be told. */
const STATUS_BY_SQLSTATE: Record<string, { statusCode: number, statusMessage: string }> = {
  // Integrity constraint violations: the request conflicts with stored data.
  23505: { statusCode: 409, statusMessage: 'That change conflicts with the current state' },
  // Foreign key violation: the row it points at is gone.
  23503: { statusCode: 400, statusMessage: 'Invalid request' },
  // Not-null violation: a required field was missing.
  23502: { statusCode: 400, statusMessage: 'Invalid request' },
  // Check-constraint violation, which is how the enum-ish column sets are enforced.
  23514: { statusCode: 400, statusMessage: 'Invalid request' },
  // Statement timeout / too many rows.
  57014: { statusCode: 503, statusMessage: 'The data service is unavailable' },
  53400: { statusCode: 503, statusMessage: 'The data service is unavailable' },
  // PostgREST could not find the row a single-row request expected.
  PGRST116: { statusCode: 404, statusMessage: 'Not found' },
  // Schema cache is cold, which is transient and worth a retry.
  PGRST205: { statusCode: 503, statusMessage: 'The data service is unavailable' }
}

/** Client mistakes keep their status; everything else is an upstream outage. */
function translate(code: string | undefined): { statusCode: number, statusMessage: string } {
  if (code && STATUS_BY_SQLSTATE[code]) return STATUS_BY_SQLSTATE[code]!
  return { statusCode: 503, statusMessage: 'The data service is unavailable' }
}

/**
 * Identify a database failure structurally rather than with `instanceof`.
 *
 * The repositories tag what they throw with `postgrest: true`, because the
 * service-role client is built in several places and `instanceof` would not
 * survive the module being bundled twice. The `code` is the SQLSTATE, which is
 * the only stable part of the shape.
 */
function isPostgrestError(error: unknown): error is PostgrestError {
  return error instanceof Error && (error as PostgrestError).postgrest === true
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error) => {
    if (!isPostgrestError(error)) return

    const { statusCode, statusMessage } = translate(error.code)

    // The original detail is useful to whoever is on call, so it stays in the
    // server log rather than in the response body.
    console.error(`[supabase] ${error.code ?? 'unknown'}: ${error.message}`)

    error.statusCode = statusCode
    error.statusMessage = statusMessage
    error.message = statusMessage
  })
})
