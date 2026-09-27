<script setup lang="ts">
import type { Job, Paginated } from '#shared/types/api'

defineProps<{ result: Paginated<Job> | null }>()

const page = defineModel<number>('page', { default: 1 })
</script>

<template>
  <div
    v-if="result && result.data.length"
    class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
  >
    <JobsJobCard
      v-for="job in result.data"
      :key="job.id"
      :job="job"
    />
  </div>

  <UEmpty
    v-else
    icon="i-lucide-search-x"
    title="No roles match those filters"
    description="Try widening the workplace type, clearing the location, or removing the salary floor."
    class="py-16"
  >
    <template #actions>
      <UButton
        to="/jobs"
        label="Reset filters"
        icon="i-lucide-rotate-ccw"
        color="neutral"
        variant="outline"
      />
    </template>
  </UEmpty>

  <UPagination
    v-if="result && result.totalPages > 1"
    v-model:page="page"
    :items-per-page="result.perPage"
    :total="result.total"
    :sibling-count="1"
    class="mt-8"
  />
</template>
