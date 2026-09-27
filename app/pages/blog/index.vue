<script setup lang="ts">
/**
 * Blog index.
 *
 * Reads straight from the `posts` collection, so drafts are filtered at the
 * query level rather than in the template.
 */
const { data: page } = await useAsyncData('blog:index', () =>
  queryCollection('posts')
    .where('draft', '=', false)
    .order('date', 'DESC')
    .all()
)

const posts = computed(() => page.value ?? [])

useSeoMeta({
  title: 'Blog',
  description: 'Writing on hiring, compensation transparency, and how to get more out of a job search.'
})
</script>

<template>
  <UContainer class="py-10">
    <header class="mb-8 max-w-2xl">
      <h1 class="text-3xl font-bold tracking-tight">
        From the blog
      </h1>
      <p class="text-muted mt-2">
        Notes on hiring, pay transparency, and looking for work.
      </p>
    </header>

    <div
      v-if="posts.length"
      class="grid gap-6 md:grid-cols-2"
    >
      <UCard
        v-for="post in posts"
        :key="post.path"
        :ui="{ root: 'ring-default ring-1 transition-all hover:ring-primary/40' }"
        class="h-full"
      >
        <NuxtLink
          :to="post.path"
          class="group block"
        >
          <h2 class="text-lg font-semibold group-hover:text-primary transition-colors">
            {{ post.title }}
          </h2>
          <p class="text-muted mt-2 line-clamp-3 text-sm">
            {{ post.description }}
          </p>
          <div class="text-muted mt-4 flex items-center gap-2 text-xs">
            <time :datetime="post.date">{{ post.date }}</time>
            <span aria-hidden="true">·</span>
            <span>{{ post.author }}</span>
          </div>
        </NuxtLink>

        <div
          v-if="post.tags?.length"
          class="mt-3 flex flex-wrap gap-1.5"
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
      </UCard>
    </div>

    <UEmpty
      v-else
      icon="i-lucide-newspaper"
      title="No posts yet"
      description="Add a markdown file under content/posts to publish your first article."
      class="py-16"
    />
  </UContainer>
</template>
