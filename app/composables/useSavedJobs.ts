import type { CandidateProfile, SavedJob } from '#shared/types/api'

/** Saved jobs. Client-only, because it is per-user and never cacheable. */
export function useSavedJobs() {
  const saved = useAsyncData('saved-jobs', () => $fetch<SavedJob[]>('/api/saved-jobs'), {
    server: false
  })

  const isSaved = (jobId: string) => computed(() => saved.data.value?.some(item => item.jobId === jobId) ?? false)

  async function save(jobId: string) {
    await $fetch('/api/saved-jobs', { method: 'POST', body: { jobId } })
    await saved.refresh()
  }

  async function unsave(jobId: string) {
    await $fetch(`/api/saved-jobs/${jobId}`, { method: 'DELETE' })
    await saved.refresh()
  }

  async function toggle(jobId: string) {
    if (isSaved(jobId).value) await unsave(jobId)
    else await save(jobId)
  }

  return { ...saved, isSaved, save, unsave, toggle }
}

/** The signed-in candidate's profile. */
export function useCandidateProfile() {
  const profile = useAsyncData('profile', () => $fetch<CandidateProfile | null>('/api/profile'), {
    server: false
  })

  async function save(body: Partial<CandidateProfile>) {
    await $fetch('/api/profile', { method: 'PUT', body })
    await profile.refresh()
  }

  return { ...profile, save }
}
