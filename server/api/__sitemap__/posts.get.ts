import { queryCollection } from '@nuxt/content/nitro'

/**
 * Dynamic sitemap source for blog posts.
 *
 * Blog routes come from Nuxt Content rather than Appwrite, so they are listed
 * from the content collection.
 *
 * The collection is queried directly rather than through
 * `queryCollectionNavigation`: that helper returns a navigation *tree*, so each
 * post is nested as a child of the `/blog` root and mapping the top level alone
 * emitted a single entry. Navigation nodes also carry no `draft` flag, which
 * made the filter a no-op.
 */
export default defineSitemapEventHandler(async (event) => {
  const posts = await queryCollection(event, 'posts')
    .where('draft', '=', false)
    .select('path', 'date', 'updated')
    .all()

  return posts.map(post => ({
    loc: post.path,
    // `updated` is optional, so a revised post keeps its original date as the
    // change date and the crawler is told to look again.
    lastmod: post.updated ?? post.date,
    changefreq: 'monthly' as const,
    // A recently published post is worth more than a year-old one.
    priority: post.date >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() ? 0.8 : 0.5
  }))
})
