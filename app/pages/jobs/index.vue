<script setup lang="ts">
import { EMPLOYMENT_TYPES, WORKPLACE_TYPES } from '#shared/types/job'
import type { EmploymentType, JobSortField, WorkplaceType } from '#shared/types/job'
import type { JobQuery, JobSearchFilters } from '#shared/types/api'

/**
 * Job search results.
 *
 * Filter state lives in the URL query so a result set is shareable, survives a
 * refresh, and can be linked by an agent. `useAsyncData` re-runs whenever the
 * query object changes, so pagination and filtering share one code path.
 *
 * URL keys are short and lowercase (`workplace`, `type`, `pay`) while the API
 * keeps descriptive field names. Keeping the mapping in one place means the
 * public URL surface stays tidy without leaking SDK naming into the links.
 */
const route = useRoute()
const router = useRouter()

/** First value of a query param, or undefined. */
function text(value: unknown): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' && raw !== '' ? raw : undefined
}

function count(value: unknown): number | undefined {
  const raw = Number(text(value))
  return Number.isFinite(raw) && raw > 0 ? raw : undefined
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  const raw = text(value)
  return allowed.find(option => option === raw)
}

const filters = computed<JobQuery>(() => ({
  q: text(route.query.q),
  location: text(route.query.location),
  workplaceType: oneOf(route.query.workplace, WORKPLACE_TYPES),
  employmentType: oneOf(route.query.type, EMPLOYMENT_TYPES),
  salaryMin: count(route.query.pay),
  sort: oneOf(route.query.sort, ['relevance', 'newest', 'salary'] as const) as JobSortField | undefined,
  page: count(route.query.page) ?? 1,
  perPage: 20
}))

const { data: result, status } = await useJobs(filters)

/**
 * The search bar is single-valued, while `JobQuery` also carries list filters
 * for the API, so narrow the URL state down to what the controls can express.
 */
const searchFilters = computed<JobSearchFilters>(() => ({
  q: filters.value.q,
  location: filters.value.location,
  workplaceType: filters.value.workplaceType as WorkplaceType | undefined,
  employmentType: filters.value.employmentType as EmploymentType | undefined,
  salaryMin: filters.value.salaryMin,
  sort: filters.value.sort
}))

const page = computed({
  get: () => filters.value.page ?? 1,
  set: value => applyQuery({ page: String(value) })
})

/**
 * Push filter state into the URL.
 *
 * Any filter change resets to page one, otherwise a narrower result set can
 * land you on a page that no longer exists and renders as empty.
 */
function applyQuery(query: Record<string, string | undefined>) {
  const merged = { ...route.query, ...query }
  if (query.page === undefined) delete merged.page
  router.push({ query: merged })
}

function onFilterChange(value: JobSearchFilters) {
  applyQuery({
    q: value.q,
    location: value.location,
    workplace: value.workplaceType,
    type: value.employmentType,
    pay: value.salaryMin?.toString(),
    sort: value.sort
  })
}

useSeoMeta({
  title: 'Browse open roles',
  description: 'Search every open role on the board by title, skill, location, workplace type and salary floor.'
})
</script>

<template>
  <div>
    <UContainer class="py-10">
      <header class="mb-6">
        <h1 class="text-3xl font-bold tracking-tight">
          Open roles
        </h1>
        <p class="text-muted mt-1 text-sm">
          <template v-if="status === 'pending'">
            Searching…
          </template>
          <template v-else>
            {{ result?.total ?? 0 }} {{ result?.total === 1 ? 'role' : 'roles' }} match your filters
          </template>
        </p>
      </header>

      <JobsJobSearchBar
        :model-value="searchFilters"
        class="mb-8"
        @update:model-value="onFilterChange"
      />

      <JobsJobList
        v-model:page="page"
        :result="result ?? null"
      />
    </UContainer>
  </div>
</template>
