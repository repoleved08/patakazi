<script setup lang="ts">
import type { JobStatus } from '#shared/types/job'

const props = defineProps<{ companyId: string }>()

const { data: result } = await useJobs({ companyId: props.companyId, perPage: 50 })
const { publish, close, remove } = useJobMutations()

const busy = ref<string | null>(null)

async function act(id: string, action: 'publish' | 'close' | 'delete') {
  busy.value = id
  try {
    if (action === 'publish') await publish(id)
    else if (action === 'close') await close(id)
    else await remove(id)
    await refreshNuxtData()
  } finally {
    busy.value = null
  }
}

const statusColor: Record<JobStatus, 'primary' | 'neutral' | 'warning' | 'success'> = {
  draft: 'neutral',
  pending_review: 'warning',
  published: 'success',
  closed: 'neutral',
  rejected: 'warning'
}
</script>

<template>
  <div
    v-if="result?.data.length"
    class="divide-default divide-y overflow-hidden rounded-lg ring-1 ring-default"
  >
    <div
      v-for="job in result.data"
      :key="job.id"
      class="flex flex-wrap items-center gap-3 p-4"
    >
      <div class="min-w-0 flex-1">
        <NuxtLink
          :to="`/jobs/${job.slug}`"
          class="font-medium hover:text-primary transition-colors"
        >
          {{ job.title }}
        </NuxtLink>
        <p class="text-muted text-xs">
          {{ job.location || 'Location flexible' }} ·
          {{ labelForWorkplaceType(job.workplaceType) }} ·
          posted {{ timeAgo(job.publishedAt || job.createdAt) }}
        </p>
      </div>

      <UBadge
        :label="labelForJobStatus(job.status)"
        :color="statusColor[job.status]"
        variant="subtle"
        size="sm"
        class="capitalize"
      />

      <div class="flex items-center gap-1">
        <UButton
          :to="`/jobs/${job.id}/edit`"
          label="Edit"
          icon="i-lucide-pencil"
          color="neutral"
          variant="ghost"
          size="xs"
        />
        <UButton
          v-if="job.status === 'published'"
          label="Close"
          color="neutral"
          variant="ghost"
          size="xs"
          :loading="busy === job.id"
          @click="act(job.id, 'close')"
        />
        <UButton
          v-else
          label="Publish"
          color="primary"
          variant="soft"
          size="xs"
          :loading="busy === job.id"
          @click="act(job.id, 'publish')"
        />
        <UButton
          label="Delete"
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="xs"
          :loading="busy === job.id"
          @click="act(job.id, 'delete')"
        />
      </div>
    </div>
  </div>

  <p
    v-else
    class="text-muted rounded-lg border border-dashed p-6 text-center text-sm"
  >
    No roles yet for this company.
  </p>
</template>
