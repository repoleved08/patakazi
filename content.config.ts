import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    posts: defineCollection({
      type: 'page',
      // `prefix` re-roots the collection: files in `content/posts` get the path
      // `/blog/<file>`, so `post.path` is directly linkable and matches the
      // `app/pages/blog/[slug].vue` route.
      source: { include: 'posts/**/*.md', prefix: '/blog' },
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        updated: z.string().optional(),
        author: z.string().default('Editorial team'),
        image: z.string().optional(),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().default(false)
      })
    })
  }
})
