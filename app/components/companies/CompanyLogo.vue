<script setup lang="ts">
import type { CompanySummary } from '#shared/types/api'

const props = withDefaults(defineProps<{
  company: Pick<CompanySummary, 'name' | 'logoId'>
  size?: string
}>(), { size: 'size-10' })

/** Two-letter monogram used when a company has no uploaded logo. */
const initials = computed(() =>
  props.company.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
)

const src = computed(() => props.company.logoId
  ? `/api/files/${props.company.logoId}`
  : '')
</script>

<template>
  <div
    class="bg-elevated/50 ring-default grid shrink-0 place-items-center overflow-hidden rounded-lg ring-1"
    :class="size"
  >
    <img
      v-if="src"
      :src="src"
      :alt="company.name"
      class="size-full object-cover"
      loading="lazy"
    >
    <span
      v-else
      class="text-muted text-xs font-semibold"
      aria-hidden="true"
    >
      {{ initials }}
    </span>
  </div>
</template>
