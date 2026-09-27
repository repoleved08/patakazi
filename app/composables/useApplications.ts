import type { Application } from '#shared/types/api'
import type { ApplicationStatus } from '#shared/types/job'

/**
 * Applications for one job, employer-side.
 *
 * Client-only: the list is scoped to the signed-in employer, so it must never
 * be captured in a shared SSR payload or a prerendered page.
 */
export function useJobApplications(jobId: MaybeRefOrGetter<string>) {
  const applications = useAsyncData(
    () => `applications:${toValue(jobId)}`,
    () => $fetch<Application[]>('/api/applications', { query: { jobId: toValue(jobId) } }),
    { server: false }
  )

  async function setStatus(id: string, status: ApplicationStatus) {
    const updated = await $fetch<Application>(`/api/applications/${id}`, {
      method: 'PATCH',
      body: { status }
    })

    // Patch in place rather than refetching: a status change is a single row and
    // a refetch would fight the optimistic ordering an employer expects.
    const rows = applications.data.value
    if (rows) {
      const index = rows.findIndex(application => application.id === id)
      if (index !== -1) rows[index] = updated
    }
    return updated
  }

  return { ...applications, setStatus }
}
