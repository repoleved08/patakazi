import type { H3Event } from 'h3'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '#shared/types/database.types'
import { serverSupabaseUser } from '#supabase/server'
import { BUCKETS, useSupabaseServer } from '../../utils/supabase'

/**
 * GET /api/files/:path
 *
 * Streams a file from Supabase Storage. Going through the server keeps the
 * bucket names and access rules out of the client, and lets us set our own
 * cache headers instead of handing out signed URLs that expire.
 *
 * Logos live in the public `media` bucket, so anyone who can guess a path can
 * read one. Resumes live in the private `resumes` bucket and are only served to
 * the account that uploaded them. A signed URL would also work for those, but
 * streaming keeps the response cacheable and avoids putting a bearer-shaped
 * credential in the browser.
 *
 * The route is a catch-all because Supabase object paths contain slashes, e.g.
 * `<userId>/cv.pdf`.
 */
export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path')
  if (!path) throw createError({ statusCode: 400, statusMessage: 'Missing file path' })

  const supabase = useSupabaseServer(event)
  const filename = basename(path)

  // Public bucket first: logos are the common case and need no ownership check.
  const logo = await download(supabase, BUCKETS.media, path)
  if (logo) return respond(event, logo, filename, 'public, max-age=31536000, immutable')

  // Private bucket: only the owner of the object may read it.
  const user = await serverSupabaseUser(event)
  if (user && isOwnedBy(path, user.sub)) {
    const resume = await download(supabase, BUCKETS.resumes, path)
    if (resume) return respond(event, resume, filename, 'private, max-age=3600')
  }

  // Deliberately 404 rather than 403: a stranger should not learn the object
  // exists, and neither should an anonymous visitor learn it needs to sign in.
  throw createError({ statusCode: 404, statusMessage: 'Not found' })
})

/** Downloads an object, returning null when it is missing or unreadable. */
async function download(supabase: SupabaseClient<Database>, bucket: string, path: string): Promise<Buffer | null> {
  const { data, error } = await supabase.storage.from(bucket).download(path)
  if (error || !data) return null
  return Buffer.from(await data.arrayBuffer())
}

/**
 * Sends the buffer with our own headers.
 *
 * `h3`'s `send` takes a MIME type in its third argument rather than a headers
 * object, so the headers are set first and the type is passed separately.
 */
function respond(event: H3Event, body: Buffer, filename: string, cacheControl: string) {
  setHeader(event, 'content-type', 'application/octet-stream')
  setHeader(event, 'content-disposition', `inline; filename="${filename}"`)
  setHeader(event, 'cache-control', cacheControl)
  return send(event, body)
}

/** The bucket layout makes ownership checkable without a database lookup. */
function isOwnedBy(objectPath: string, userId: string): boolean {
  return objectPath.startsWith(`${userId}/`)
}

function basename(value: string): string {
  return value.split('/').pop() || 'file'
}
