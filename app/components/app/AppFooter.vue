<script setup lang="ts">
const site = useSiteConfig()
const year = new Date().getFullYear()

const columns = [
  {
    title: 'Find work',
    links: [
      { label: 'All open roles', to: '/jobs' },
      { label: 'Remote jobs', to: '/jobs?workplace=remote' },
      { label: 'Companies hiring', to: '/companies' }
    ]
  },
  {
    title: 'For employers',
    links: [
      { label: 'Post a job', to: '/jobs/new' },
      { label: 'Employer dashboard', to: '/dashboard' },
      { label: 'Salary transparency', to: '/blog/salary-transparency' }
    ]
  },
  {
    title: 'For agents',
    links: [
      { label: 'llms.txt', to: '/llms.txt' },
      { label: 'MCP server', to: '/mcp' },
      { label: 'Jobs API', to: '/api/jobs' }
    ]
  }
]
</script>

<template>
  <USeparator />

  <UFooter>
    <template #left>
      <p class="text-muted text-sm">
        © {{ year }} {{ site.name }}. Listings are readable by people and agents.
      </p>
    </template>

    <template #right>
      <UButton
        to="/llms.txt"
        label="llms.txt"
        icon="i-lucide-file-text"
        color="neutral"
        variant="ghost"
        size="sm"
        aria-label="View llms.txt"
      />
    </template>
  </UFooter>

  <div class="border-default border-t">
    <UContainer class="py-10">
      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p class="text-base font-semibold">
            {{ site.name }}
          </p>
          <p class="text-muted mt-2 max-w-xs text-sm">
            {{ site.description }}
          </p>
        </div>

        <div
          v-for="column in columns"
          :key="column.title"
        >
          <p class="text-sm font-semibold">
            {{ column.title }}
          </p>
          <ul class="mt-3 space-y-2">
            <li
              v-for="link in column.links"
              :key="link.to"
            >
              <NuxtLink
                :to="link.to"
                class="text-muted hover:text-default text-sm transition-colors"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </UContainer>
  </div>
</template>
