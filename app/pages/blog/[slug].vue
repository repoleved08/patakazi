<script setup lang="ts">
/**
 * A single blog post.
 *
 * `nuxt-ai-ready` serves the source markdown of this route directly at
 * `/blog/<slug>.md`, so the prose here is exactly what an agent reads.
 */
const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

const { data: page } = await useAsyncData(`blog:${slug.value}`, () =>
  queryCollection('posts').path(`/blog/${slug.value}`).first()
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
}

const post = computed(() => page.value!)

/**
 * Absolute origin for breadcrumb URLs. Falls back to the incoming request so
 * breadcrumbs stay correct in preview and local environments where the public
 * site URL is not set.
 */
const siteOrigin = computed(() => {
  const configured = useRuntimeConfig().public.siteUrl
  if (typeof configured === 'string' && configured) {
    return configured.replace(/\/+$/, '')
  }
  return useRequestURL().origin
})

/**
 * Related posts, ranked by how many tags they share with this one.
 *
 * Scored rather than filtered so that a post sharing two tags outranks one that
 * only shares a broad tag like `careers`. Falls back to the newest posts when
 * there is no tag overlap, so the section is never empty on a small blog.
 */
const RELATED_LIMIT = 3

const { data: allPosts } = await useAsyncData('blog:related-source', () =>
  queryCollection('posts').where('draft', '=', false).order('date', 'DESC').all()
)

const related = computed(() => {
  const tags = new Set(post.value.tags ?? [])
  const others = (allPosts.value ?? []).filter(item => item.path !== post.value.path)

  if (tags.size === 0) {
    return others.slice(0, RELATED_LIMIT)
  }

  const scored = others
    .map(item => ({
      item,
      score: (item.tags ?? []).filter(tag => tags.has(tag)).length
    }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  return [...scored, ...others.map(item => ({ item, score: 0 }))]
    .filter((entry, index, all) => all.findIndex(other => other.item.path === entry.item.path) === index)
    .slice(0, RELATED_LIMIT)
    .map(entry => entry.item)
})

useSeoMeta({
  title: post.value.title,
  description: post.value.description,
  ogTitle: post.value.title,
  ogDescription: post.value.description,
  ogType: 'article',
  ...(post.value.image ? { ogImage: post.value.image } : {}),
  ...(post.value.date ? { articlePublishedTime: post.value.date } : {}),
  ...(post.value.updated ? { articleModifiedTime: post.value.updated } : {}),
  ...(post.value.author ? { articleAuthor: [post.value.author] } : {})
})

/**
 * Article structured data. Google uses this for the byline and publish date in
 * search results, and it is the same shape an agent reads to decide whether a
 * page is worth fetching.
 */
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline': post.value.title,
          'description': post.value.description,
          'datePublished': post.value.date,
          ...(post.value.updated ? { dateModified: post.value.updated } : {}),
          'author': { '@type': 'Organization', 'name': post.value.author },
          'publisher': { '@type': 'Organization', 'name': 'Patakazi' },
          ...(post.value.image ? { image: post.value.image } : {}),
          ...(post.value.tags?.length ? { keywords: post.value.tags.join(', ') } : {}),
          'wordCount': postWordCount(post.value.body),
          'inLanguage': 'en',
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': useRequestURL().href
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${siteOrigin.value}/` },
            { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${siteOrigin.value}/blog` },
            { '@type': 'ListItem', 'position': 3, 'name': post.value.title }
          ]
        }
      ])
    }
  ]
})
</script>

<template>
  <UContainer class="py-10">
    <article class="mx-auto max-w-3xl">
      <nav class="mb-4">
        <NuxtLink
          to="/blog"
          class="text-muted hover:text-default flex items-center gap-1 text-sm"
        >
          <UIcon
            name="i-lucide-arrow-left"
            class="size-4"
          />
          All posts
        </NuxtLink>
      </nav>

      <AppCoverImage
        v-if="post.image"
        :src="post.image"
        :alt="post.title"
        :width="1600"
        :height="900"
        sizes="(min-width: 1024px) 768px, 100vw"
        priority
        class="mb-8 aspect-video w-full rounded-xl object-cover"
      />

      <header class="border-b border-default pb-6">
        <h1 class="text-3xl font-bold tracking-tight text-balance lg:text-4xl">
          {{ post.title }}
        </h1>
        <p class="text-muted mt-3 text-lg">
          {{ post.description }}
        </p>
        <div class="text-muted mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span>{{ post.author }}</span>
          <span aria-hidden="true">·</span>
          <time :datetime="post.date">{{ postDate(post.date) }}</time>
          <span aria-hidden="true">·</span>
          <span>{{ postReadingTime(post.body) }} min read</span>
          <template v-if="post.updated">
            <span aria-hidden="true">·</span>
            <span>Updated {{ postDate(post.updated) }}</span>
          </template>
        </div>
        <div
          v-if="post.tags?.length"
          class="mt-4 flex flex-wrap gap-1.5"
        >
          <UBadge
            v-for="tag in post.tags"
            :key="tag"
            :label="tag"
            color="neutral"
            variant="subtle"
            size="sm"
          />
        </div>
      </header>

      <ContentRenderer
        :value="post"
        class="job-description py-8"
      />

      <!-- Related posts: internal linking, and the last thing an agent reads. -->
      <aside
        v-if="related.length"
        class="border-default border-t pt-6"
        aria-labelledby="related-heading"
      >
        <h2
          id="related-heading"
          class="text-lg font-semibold"
        >
          Related reading
        </h2>
        <ul class="mt-4 grid gap-4 sm:grid-cols-3">
          <li
            v-for="item in related"
            :key="item.path"
          >
            <NuxtLink
              :to="item.path"
              class="group ring-default hover:ring-primary/50 focus-visible:ring-primary block h-full overflow-hidden rounded-lg ring-1 transition-all focus-visible:ring-2"
            >
              <AppCoverImage
                v-if="item.image"
                :src="item.image"
                :alt="item.title"
                :width="600"
                :height="338"
                sizes="(min-width: 640px) 240px, 100vw"
                class="aspect-video w-full object-cover"
              />
              <div class="p-3">
                <time
                  :datetime="item.date"
                  class="text-muted text-xs"
                >
                  {{ postDate(item.date) }}
                </time>
                <h3 class="group-hover:text-primary mt-1 text-sm leading-snug font-semibold transition-colors">
                  {{ item.title }}
                </h3>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </aside>
    </article>
  </UContainer>
</template>
