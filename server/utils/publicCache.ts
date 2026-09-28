import type { H3Event } from 'h3'
import { getRequestURL } from 'h3'

/**
 * Cache key for a public read endpoint.
 *
 * Two things this has to get right:
 *
 * 1. **The query string must be in the key.** These endpoints return different
 *    bodies per filter, and a key that ignored the query would serve one
 *    filter's results for every other.
 * 2. **Query order must not matter.** `?a=1&b=2` and `?b=2&a=1` are the same
 *    request, so entries are sorted before hashing rather than being cached
 *    twice.
 *
 * Only GET is ever passed here. That is not incidental: see `definePublicGet`
 * below for why caching is attached to the handler rather than to a route rule.
 */
export function publicCacheKey(event: H3Event, name: string): string {
  const url = getRequestURL(event)
  const params = [...url.searchParams.entries()].sort(([aKey, aVal], [bKey, bVal]) =>
    aKey === bKey ? aVal.localeCompare(bVal) : aKey.localeCompare(bKey)
  )

  const suffix = params.length ? `?${params.map(([key, value]) => `${key}=${value}`).join('&')}` : ''
  return `${name}:${url.pathname}${suffix}`
}

type CacheOptions = {
  /** Seconds the entry stays fresh. */
  maxAge: number
  /** Seconds a stale entry may keep being served while one refreshes. */
  staleMaxAge?: number
}

/**
 * A cached public read handler.
 *
 * Why not a `swr` route rule, which is the shorter spelling: Nitro's route-rule
 * cache never inspects the HTTP method, so a rule on `/api/jobs` made a
 * subsequent `POST /api/jobs` return 200 with the *cached GET body* instead of
 * the 401 it should have. The handler for `index.post.ts` never ran at all.
 * Route rules have no method filter, so the only way to make caching
 * method-safe is to attach it to the GET handler, where the method is already
 * fixed by the filename.
 */
export function definePublicGet<T>(
  name: string,
  handler: (event: H3Event) => Promise<T> | T,
  options: CacheOptions
) {
  const { maxAge, staleMaxAge = 86400 } = options

  return defineCachedEventHandler(
    async (event: H3Event) => {
      const body = await handler(event)
      setHeader(event, 'cache-control', `public, max-age=60, s-maxage=${maxAge}, stale-while-revalidate=${staleMaxAge}`)
      return body
    },
    {
      name,
      group: 'public-api',
      maxAge,
      swr: true,
      getKey: event => publicCacheKey(event, name)
    }
  )
}
