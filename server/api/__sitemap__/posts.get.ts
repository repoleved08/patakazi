import { queryCollectionNavigation } from '@nuxt/content/nitro'

/**
 * Dynamic sitemap source for blog posts.
 *
 * Blog routes come from Nuxt Content rather than Appwrite, so they are listed
 * from the content collection instead.
 */
export default defineSitemapEventHandler(async (event) => {
  const navigation = await queryCollectionNavigation(event, 'posts')
  const published = navigation.filter(item => !item.draft)

  return published.map(page => ({
    loc: page.path,
    changefreq: 'monthly' as const,
    priority: 0.5
  }))
})
