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

useSeoMeta({
  title: post.value.title,
  description: post.value.description,
  ogTitle: post.value.title,
  ogDescription: post.value.description,
  ogType: 'article',
  ...(post.value.date ? { articlePublishedTime: post.value.date } : {}),
  ...(post.value.updated ? { articleModifiedTime: post.value.updated } : {}),
  ...(post.value.author ? { articleAuthor: [post.value.author] } : {})
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
          <time :datetime="post.date">{{ post.date }}</time>
          <template v-if="post.updated">
            <span aria-hidden="true">·</span>
            <span>Updated {{ post.updated }}</span>
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
    </article>
  </UContainer>
</template>
