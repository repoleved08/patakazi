<script setup lang="ts">
/**
 * Blog index.
 *
 * Reads straight from the `posts` collection, so drafts are filtered at the
 * query level rather than in the template.
 *
 * Layout is a bento grid: the newest post is the large tile, the next two are
 * tall side tiles, and the rest fill the remaining cells. Grid placement is
 * done with explicit spans rather than `auto-fit` because a masonry look needs
 * deliberate asymmetry, and with `dense` packing the remaining tiles fill any
 * gap instead of leaving holes at the end of the row.
 *
 * The visual order is also the DOM order, so the reading order and the keyboard
 * order stay the same.
 */
const { data: page } = await useAsyncData('blog:index', () =>
  queryCollection('posts')
    .where('draft', '=', false)
    .order('date', 'DESC')
    .all()
)

const posts = computed(() => page.value ?? [])

/** The newest post with an image gets the hero tile. */
const lead = computed(() => posts.value.find(post => post.image) ?? posts.value[0])
const rest = computed(() => posts.value.filter(post => post !== lead.value))

/**
 * Span classes cycle so the grid stays irregular but predictable. Tailwind needs
 * these to be complete class names at build time, so the map is static.
 */
const SPANS = [
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-2 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-2 md:row-span-1',
  'md:col-span-1 md:row-span-1'
] as const

function spanFor(index: number): string {
  return SPANS[index % SPANS.length]!
}

function formatDate(value: string): string {
  return postDate(value)
}

const tagCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const post of posts.value) {
    for (const tag of post.tags ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
})

useSeoMeta({
  title: 'Blog',
  ogTitle: 'Blog — AI, cybersecurity and IT hiring insight',
  description: 'Practical writing on AI, cybersecurity and IT careers: what the roles actually involve, what they pay, and how to get hired.',
  ogDescription: 'Practical writing on AI, cybersecurity and IT careers: what the roles actually involve, what they pay, and how to get hired.'
})
</script>

<template>
  <UContainer class="py-10">
    <header class="mb-8 max-w-2xl">
      <h1 class="text-3xl font-bold tracking-tight text-balance">
        Notes on AI, security and IT careers
      </h1>
      <p class="text-muted mt-2">
        What these roles actually involve, what they pay, and how to get hired. Written for people
        deciding where to spend the next few years of their working life.
      </p>
    </header>

    <div
      v-if="tagCounts.length"
      class="mb-8 flex flex-wrap items-center gap-1.5"
    >
      <UBadge
        v-for="[tag, count] in tagCounts"
        :key="tag"
        :label="`${tag} (${count})`"
        color="neutral"
        variant="subtle"
        size="sm"
      />
    </div>

    <div
      v-if="posts.length"
      class="grid grid-cols-1 gap-4 md:grid-cols-4 md:auto-rows-[13rem]"
    >
      <!-- Lead tile: image, larger type, full summary. -->
      <NuxtLink
        v-if="lead"
        :to="lead.path"
        class="group ring-default relative col-span-1 flex flex-col overflow-hidden rounded-xl ring-1 transition-all hover:ring-primary/50 focus-visible:ring-2 focus-visible:ring-primary md:col-span-2 md:row-span-2"
      >
        <AppCoverImage
          v-if="lead.image"
          :src="lead.image"
          :alt="lead.title"
          :width="1200"
          :height="675"
          sizes="(min-width: 768px) 50vw, 100vw"
          class="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/10" />
        <div class="relative mt-auto p-5">
          <div class="mb-2 flex flex-wrap items-center gap-2 text-xs text-white/80">
            <span class="rounded-full bg-white/15 px-2 py-0.5 backdrop-blur-sm">Latest</span>
            <time :datetime="lead.date">{{ formatDate(lead.date) }}</time>
            <span aria-hidden="true">·</span>
            <span>{{ postReadingTime(lead.body) }} min read</span>
          </div>
          <h2 class="text-xl font-semibold text-balance text-white lg:text-2xl">
            {{ lead.title }}
          </h2>
          <p class="mt-2 line-clamp-3 text-sm text-white/85">
            {{ lead.description }}
          </p>
        </div>
      </NuxtLink>

      <!-- Remaining posts: compact tiles, image only where one exists. -->
      <NuxtLink
        v-for="(post, index) in rest"
        :key="post.path"
        :to="post.path"
        :class="spanFor(index)"
        class="group ring-default relative flex flex-col overflow-hidden rounded-xl ring-1 transition-all hover:ring-primary/50 focus-visible:ring-2 focus-visible:ring-primary"
      >
        <AppCoverImage
          v-if="post.image"
          :src="post.image"
          :alt="post.title"
          :width="1200"
          :height="675"
          sizes="(min-width: 768px) 25vw, 100vw"
          class="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          v-if="post.image"
          class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent"
        />
        <div class="relative mt-auto p-4">
          <time
            :datetime="post.date"
            class="text-xs"
            :class="post.image ? 'text-white/80' : 'text-muted'"
          >
            {{ formatDate(post.date) }}
          </time>
          <h2
            class="mt-1.5 text-base leading-snug font-semibold text-balance"
            :class="post.image ? 'text-white' : 'group-hover:text-primary transition-colors'"
          >
            {{ post.title }}
          </h2>
          <p
            v-if="index < 4"
            class="mt-1.5 line-clamp-2 text-sm"
            :class="post.image ? 'text-white/85' : 'text-muted'"
          >
            {{ post.description }}
          </p>
        </div>
      </NuxtLink>
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
