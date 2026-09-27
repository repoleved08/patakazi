<script setup lang="ts">
const { data: stats } = await useJobStats({ client: true })

const principles = [
  {
    icon: 'i-lucide-wallet',
    title: 'Every listing has a range',
    body: 'Compensation is a filter, not a favour. An employer that will not publish a band does not get the traffic, and the listing says so plainly.'
  },
  {
    icon: 'i-lucide-bot',
    title: 'Readable by agents',
    body: 'Every route is also served as markdown, the data is available as JSON, and an MCP server exposes it to AI assistants directly. Always cite the URL.'
  },
  {
    icon: 'i-lucide-shield-check',
    title: 'Employers are accountable',
    body: 'Listings are attributed to a company profile. Drafts stay private until someone with access to that company publishes them.'
  }
]

useSeoMeta({
  title: 'About',
  description: 'What this job board is, how it is built, and why it is readable by AI agents as well as people.'
})
</script>

<template>
  <div>
    <UContainer class="py-14">
      <div class="mx-auto max-w-2xl">
        <h1 class="text-4xl font-bold tracking-tight">
          About this board
        </h1>
        <p class="text-muted mt-4 text-lg">
          A small job board with two opinions: pay should be public, and the
          content should be legible to whatever is asking — a person or an
          assistant.
        </p>
      </div>

      <div
        v-if="stats"
        class="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4"
      >
        <UCard
          v-for="stat in [
            { label: 'Open roles', value: stats.total },
            { label: 'Remote or hybrid', value: stats.remote },
            { label: 'Added this week', value: stats.lastWeek },
            { label: 'Pay disclosed', value: stats.withSalary }
          ]"
          :key="stat.label"
        >
          <p class="text-2xl font-semibold tabular-nums">
            {{ stat.value }}
          </p>
          <p class="text-muted text-xs">
            {{ stat.label }}
          </p>
        </UCard>
      </div>

      <div class="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-3">
        <UCard
          v-for="item in principles"
          :key="item.title"
        >
          <UIcon
            :name="item.icon"
            class="text-primary size-6"
          />
          <h2 class="mt-3 font-semibold">
            {{ item.title }}
          </h2>
          <p class="text-muted mt-2 text-sm">
            {{ item.body }}
          </p>
        </UCard>
      </div>

      <div class="mx-auto mt-14 max-w-2xl">
        <h2 class="text-xl font-semibold">
          How it is built
        </h2>
        <div class="job-description mt-3">
          <p>
            Nuxt for the site, Appwrite for the data, and a small set of
            endpoints that both the interface and AI agents call. There is no
            separate "API for bots" that can drift from what a human sees,
            because both read the same routes.
          </p>
          <p>
            The <NuxtLink to="/blog/built-for-agents">agent-facing build</NuxtLink>
            and the <NuxtLink to="/blog/salary-transparency">salary policy</NuxtLink>
            are both documented here in full.
          </p>
        </div>

        <UButton
          to="/jobs"
          label="Browse open roles"
          icon="i-lucide-arrow-right"
          trailing
          class="mt-8"
        />
      </div>
    </UContainer>
  </div>
</template>
