<script setup lang="ts">
import type { Job } from '#shared/types/api'

definePageMeta({ middleware: 'auth' })

const { data: saved, status } = await useSavedJobs()
const { unsave } = useSavedJobs()

const jobIds = computed(() => saved.value?.map(entry => entry.jobId) ?? [])

/**
 * The saved-jobs API returns ids only, so hydrate each one against the jobs
 * endpoint. A job that was unpublished or expired in the meantime drops out
 * rather than rendering a broken card.
 */
const { data: jobs } = await useAsyncData(
  () => `saved-jobs-detail:${jobIds.value.join(',')}`,
  async () => {
    const rows = await Promise.all(jobIds.value.map(jobId =>
      $fetch<Job>(`/api/jobs/${jobId}`).catch(() => null)
    ))
    return rows.filter((job): job is Job => job !== null)
  },
  { server: false, watch: [jobIds] }
)

const error = ref<string | null>(null)
const pendingId = ref<string | null>(null)

async function remove(jobId: string) {
  error.value = null
  pendingId.value = jobId
  try {
    await unsave(jobId)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not remove the saved job.'
  } finally {
    pendingId.value = null
  }
}

useSeoMeta({ title: 'Saved jobs', robots: 'noindex' })
</script>

<template>
  <UContainer class="py-10">
    <div class="mx-auto max-w-3xl">
      <h1 class="text-3xl font-bold tracking-tight">
        Saved jobs
      </h1>
      <p class="text-muted mt-1 text-sm">
        Roles you bookmarked. Only you can see this list.
      </p>

      <UAlert
        v-if="error"
        class="mt-6"
        icon="i-lucide-circle-alert"
        color="error"
        variant="subtle"
        :title="error"
      />

      <USkeleton
        v-if="status === 'pending'"
        class="mt-6 h-32 w-full"
      />

      <p
        v-else-if="!jobs?.length"
        class="text-muted mt-10 text-sm"
      >
        Nothing saved yet. Browse <NuxtLink
          to="/jobs"
          class="font-medium underline"
        >open roles</NuxtLink> to start a shortlist.
      </p>

      <div
        v-else
        class="mt-6 space-y-3"
      >
        <UCard
          v-for="job in jobs"
          :key="job.id"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0">
              <NuxtLink
                :to="`/jobs/${job.slug}`"
                class="font-medium hover:underline"
              >
                {{ job.title }}
              </NuxtLink>
              <p class="text-muted mt-0.5 text-sm">
                {{ job.company.name }}
                <template v-if="job.location">
                  · {{ job.location }}
                </template>
                · {{ labelForEmploymentType(job.employmentType) }}
              </p>
              <UBadge
                v-if="job.salary.visible && job.salary.max > 0"
                class="mt-2"
                :label="formatSalary(job.salary) ?? undefined"
                color="primary"
                variant="subtle"
                size="sm"
              />
            </div>
            <UButton
              label="Remove"
              icon="i-lucide-bookmark-x"
              color="neutral"
              variant="ghost"
              size="sm"
              :loading="pendingId === job.id"
              @click="remove(job.id)"
            />
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
