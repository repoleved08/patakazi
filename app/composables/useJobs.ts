import type { CreateJobInput, UpdateJobInput } from '#shared/schemas'
import type { Job, JobQuery, JobStats, Paginated } from '#shared/types/api'

/**
 * Client-side access to the jobs API.
 *
 * Every page goes through these composables rather than calling `$fetch`
 * directly, so keys, error handling and cache policy are defined once. Reads
 * wrap `useAsyncData`, which shares results per request and serialises them
 * into the SSR payload automatically. Writes are plain async functions because
 * they must not be cached.
 */

/** Serialise a JobQuery into the query string the API expects. */
function toQuery(query: JobQuery = {}): Record<string, string> {
  const params: Record<string, string> = {}

  const assign = (key: string, value: unknown) => {
    if (value === undefined || value === null || value === '') return
    params[key] = Array.isArray(value) ? value.join(',') : String(value)
  }

  assign('q', query.q)
  assign('companyId', query.companyId)
  assign('location', query.location)
  assign('workplaceType', query.workplaceType)
  assign('employmentType', query.employmentType)
  assign('seniority', query.seniority)
  assign('skills', query.skills)
  assign('salaryMin', query.salaryMin)
  assign('currency', query.currency)
  assign('status', query.status)
  assign('sort', query.sort)
  assign('page', query.page)
  assign('perPage', query.perPage)

  return params
}

export function useJobs(query: MaybeRef<JobQuery> = {}) {
  const params = computed(() => toQuery(toValue(query)))

  return useAsyncData(
    () => `jobs:${JSON.stringify(params.value)}`,
    () => $fetch<Paginated<Job>>('/api/jobs', { query: params.value }),
    { watch: [params] }
  )
}

/**
 * Board-wide counts.
 *
 * Pass `client: true` on prerendered pages: the build has no Appwrite
 * credentials, so a server-side fetch would log an outage on every build and
 * bake placeholder numbers into the static HTML.
 */
export function useJobStats(options: { client?: boolean } = {}) {
  const nuxtApp = useNuxtApp()
  return useAsyncData('jobs:stats', () => $fetch<JobStats>('/api/jobs/stats'), {
    server: options.client !== true,
    getCachedData: key => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
  })
}

export function useJob(id: MaybeRefOrGetter<string>) {
  return useAsyncData(
    () => `job:${toValue(id)}`,
    () => $fetch<Job>(`/api/jobs/${toValue(id)}`)
  )
}

export function useJobMutations() {
  async function create(body: CreateJobInput) {
    return $fetch<Job>('/api/jobs', { method: 'POST', body })
  }

  async function update(id: string, body: UpdateJobInput) {
    return $fetch<Job>(`/api/jobs/${id}`, { method: 'PATCH', body })
  }

  async function publish(id: string) {
    return $fetch<Job>(`/api/jobs/${id}/publish`, { method: 'POST' })
  }

  async function close(id: string) {
    return $fetch<Job>(`/api/jobs/${id}/close`, { method: 'POST' })
  }

  async function remove(id: string) {
    await $fetch(`/api/jobs/${id}`, { method: 'DELETE' as never })
  }

  return { create, update, publish, close, remove }
}
