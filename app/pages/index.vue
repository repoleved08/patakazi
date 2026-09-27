<script setup lang="ts">
import type { JobQuery } from '#shared/types/api'

/**
 * The landing page.
 *
 * Job counts come from `/api/jobs/stats`, which is cached independently of the
 * list. The featured strip is the first page of published jobs.
 */
const filters = ref<JobQuery>({ sort: 'newest' })

const { data: stats } = await useJobStats()
const { data: featured } = await useJobs({ ...filters.value, perPage: 6 })

const highlight = [
  { label: 'Open roles', value: stats.value?.total ?? 0, icon: 'i-lucide-briefcase' },
  { label: 'Remote & hybrid', value: stats.value?.remote ?? 0, icon: 'i-lucide-globe' },
  { label: 'Added this week', value: stats.value?.lastWeek ?? 0, icon: 'i-lucide-sparkles' },
  { label: 'With published salary', value: stats.value?.withSalary ?? 0, icon: 'i-lucide-banknote' }
]

useSeoMeta({
  title: 'Patakazi — Agent-readable job listings',
  description: 'Public job listings with salary transparency, company profiles, and structured data for AI agents and people.',
  ogTitle: 'Patakazi — Careers for people and agents',
  ogDescription: 'Browse open roles with salary ranges, company profiles, and structured job data readable by AI agents.'
})
</script>

<template>
  <div>
    <section class="border-default border-b">
      <UContainer class="py-16 lg:py-24">
        <div class="max-w-3xl">
          <UBadge
            label="Readable by people and agents"
            icon="i-lucide-sparkles"
            color="primary"
            variant="subtle"
            class="mb-4"
          />
          <h1 class="text-4xl font-bold tracking-tight text-balance lg:text-5xl">
            Jobs with the salary range up front.
          </h1>
          <p class="text-muted mt-4 text-lg text-pretty">
            Every listing shows its compensation band before you apply. No recruiter
            games, no "competitive salary". Browse in a browser, or point your AI agent at
            our MCP server.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton
              to="/jobs"
              label="Browse all roles"
              icon="i-lucide-arrow-right"
              trailing
              size="xl"
            />
            <UButton
              to="/llms.txt"
              label="View llms.txt"
              icon="i-lucide-file-text"
              color="neutral"
              variant="subtle"
              size="xl"
            />
          </div>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-12">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UCard
          v-for="item in highlight"
          :key="item.label"
        >
          <div class="flex items-center gap-3">
            <UIcon
              :name="item.icon"
              class="text-primary size-5 shrink-0"
            />
            <div>
              <p class="text-2xl font-bold tabular-nums">
                {{ item.value.toLocaleString() }}
              </p>
              <p class="text-muted text-sm">
                {{ item.label }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </UContainer>

    <section class="border-default border-t">
      <UContainer class="py-12">
        <div class="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 class="text-2xl font-semibold">
              Latest roles
            </h2>
            <p class="text-muted mt-1 text-sm">
              {{ featured?.total ?? 0 }} open positions across {{ stats?.companies ?? 0 }} companies
            </p>
          </div>
          <UButton
            to="/jobs"
            label="See all"
            trailing-icon="i-lucide-arrow-right"
            color="neutral"
            variant="ghost"
          />
        </div>

        <JobsJobList :result="featured ?? null" />
      </UContainer>
    </section>
  </div>
</template>
