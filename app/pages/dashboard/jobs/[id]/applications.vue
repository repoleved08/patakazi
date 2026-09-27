<script setup lang="ts">
import { APPLICATION_STATUSES } from '#shared/types/job'
import type { ApplicationStatus } from '#shared/types/job'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const id = computed(() => String(route.params.id ?? ''))

const { data: job } = await useJob(id)
const { data: applications, status, setStatus } = useJobApplications(id)

const error = ref<string | null>(null)
const pendingId = ref<string | null>(null)

const statusOptions: Array<{ value: ApplicationStatus, label: string }> = APPLICATION_STATUSES.map(value => ({
  value,
  label: labelForApplicationStatus(value)
}))

/** Applied, reviewing, interview and offer are the pipeline worth working. */
const active = computed(() => applications.value
  ?.filter(application => !['rejected', 'withdrawn'].includes(application.status))
  ?? [])
const closed = computed(() => applications.value
  ?.filter(application => ['rejected', 'withdrawn'].includes(application.status))
  ?? [])

async function change(applicationId: string, next: ApplicationStatus) {
  error.value = null
  pendingId.value = applicationId
  try {
    await setStatus(applicationId, next)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not update the application.'
  } finally {
    pendingId.value = null
  }
}

useSeoMeta({ title: () => `Applications · ${job.value?.title ?? ''}`, robots: 'noindex' })
</script>

<template>
  <UContainer class="py-10">
    <div class="mx-auto max-w-3xl">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">
            Applications
          </h1>
          <p class="text-muted mt-1 text-sm">
            {{ job?.title }}<template v-if="job">
              · {{ job.company.name }}
            </template>
          </p>
        </div>
        <div class="flex gap-2">
          <UButton
            v-if="job"
            :to="`/jobs/${job.slug}`"
            label="View listing"
            icon="i-lucide-external-link"
            color="neutral"
            variant="ghost"
            size="sm"
          />
          <UButton
            v-if="job"
            :to="`/jobs/${job.id}/edit`"
            label="Edit listing"
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="sm"
          />
        </div>
      </div>

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

      <template v-else>
        <p
          v-if="!applications?.length"
          class="text-muted mt-10 text-sm"
        >
          No applications yet.
        </p>

        <template v-else>
          <h2 class="mt-8 text-sm font-semibold">
            In progress ({{ active.length }})
          </h2>
          <UCard
            v-for="application in active"
            :key="application.id"
            class="mt-3"
          >
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="min-w-0">
                <p class="font-medium">
                  {{ application.fullName }}
                </p>
                <p class="text-muted truncate text-sm">
                  <a
                    :href="`mailto:${application.email}`"
                    class="hover:underline"
                  >{{ application.email }}</a>
                  · applied {{ timeAgo(application.createdAt) }}
                </p>
              </div>
              <USelect
                :model-value="application.status"
                :items="statusOptions"
                :loading="pendingId === application.id"
                class="w-44"
                @update:model-value="change(application.id, $event as ApplicationStatus)"
              />
            </div>

            <p
              v-if="application.coverNote"
              class="text-muted mt-3 text-sm whitespace-pre-line"
            >
              {{ application.coverNote }}
            </p>
          </UCard>

          <template v-if="closed.length">
            <h2 class="mt-8 text-sm font-semibold text-muted">
              Closed ({{ closed.length }})
            </h2>
            <UCard
              v-for="application in closed"
              :key="application.id"
              class="mt-3 opacity-70"
            >
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div class="min-w-0">
                  <p class="truncate font-medium">
                    {{ application.fullName }}
                  </p>
                  <p class="text-muted truncate text-sm">
                    {{ application.email }}
                  </p>
                </div>
                <UBadge
                  :label="labelForApplicationStatus(application.status)"
                  color="neutral"
                  variant="subtle"
                />
              </div>
            </UCard>
          </template>
        </template>
      </template>
    </div>
  </UContainer>
</template>
