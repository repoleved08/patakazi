<script setup lang="ts">
import { EMPLOYMENT_TYPES, WORKPLACE_TYPES } from '#shared/types/job'
import type { EmploymentType, JobSortField, WorkplaceType } from '#shared/types/job'
import type { JobSearchFilters } from '#shared/types/api'

const props = defineProps<{ modelValue: JobSearchFilters }>()

const emit = defineEmits<{
  'update:modelValue': [value: JobSearchFilters]
}>()

const workplaceOptions: Array<{ value: WorkplaceType, label: string }> = WORKPLACE_TYPES.map(value => ({
  value,
  label: labelForWorkplaceType(value)
}))
const employmentOptions: Array<{ value: EmploymentType, label: string }> = EMPLOYMENT_TYPES.map(value => ({
  value,
  label: labelForEmploymentType(value)
}))
const sortOptions: Array<{ value: JobSortField, label: string }> = [
  { value: 'newest', label: 'Newest first' },
  { value: 'relevance', label: 'Most relevant' },
  { value: 'salary', label: 'Highest salary' }
]

const local = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

// Debounce the text fields so typing does not fire a request per keystroke.
const q = ref(props.modelValue.q ?? '')
const location = ref(props.modelValue.location ?? '')
let timer: ReturnType<typeof setTimeout> | undefined

watch([q, location], () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    local.value = { ...local.value, q: q.value || undefined, location: location.value || undefined }
  }, 300)
})

function patch(partial: Partial<JobSearchFilters>) {
  local.value = { ...local.value, ...partial }
}

function reset() {
  q.value = ''
  location.value = ''
  local.value = { sort: 'newest' }
}
</script>

<template>
  <form
    class="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_auto_auto]"
    role="search"
    @submit.prevent
  >
    <UInput
      v-model="q"
      icon="i-lucide-search"
      placeholder="Role, skill, or company"
      aria-label="Search jobs"
      size="lg"
      class="w-full"
    />

    <UInput
      v-model="location"
      icon="i-lucide-map-pin"
      placeholder="City or timezone"
      aria-label="Location"
      size="lg"
      class="w-full"
    />

    <USelect
      :model-value="modelValue.workplaceType"
      :items="workplaceOptions"
      placeholder="Workplace"
      aria-label="Workplace type"
      size="lg"
      class="w-full lg:w-44"
      @update:model-value="value => patch({ workplaceType: value as WorkplaceType })"
    />

    <USelect
      :model-value="modelValue.employmentType"
      :items="employmentOptions"
      placeholder="Employment"
      aria-label="Employment type"
      size="lg"
      class="w-full lg:w-44"
      @update:model-value="value => patch({ employmentType: value as EmploymentType })"
    />

    <div class="flex items-center gap-2 lg:col-span-5 lg:justify-between">
      <div class="flex items-center gap-3">
        <USelect
          :model-value="modelValue.sort"
          :items="sortOptions"
          size="sm"
          class="w-40"
          aria-label="Sort by"
          @update:model-value="value => patch({ sort: value as JobSortField })"
        />
        <UButton
          v-if="modelValue.salaryMin"
          :label="`From ${modelValue.salaryMin.toLocaleString()}`"
          icon="i-lucide-x"
          color="secondary"
          variant="subtle"
          size="sm"
          @click="patch({ salaryMin: undefined })"
        />
      </div>

      <UButton
        label="Clear"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="reset"
      />
    </div>
  </form>
</template>
