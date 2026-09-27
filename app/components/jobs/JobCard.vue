<script setup lang="ts">
import type { JobSummary } from '#shared/types/api'

const props = defineProps<{ job: JobSummary }>()

const salary = computed(() => formatSalary(props.job.salary))
</script>

<template>
  <UCard
    :ui="{ root: 'group relative ring-default ring-1 transition-all hover:ring-primary/40 focus-within:ring-primary/60' }"
    class="h-full"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3">
        <CompaniesCompanyLogo
          :company="job.company"
          class="size-10 shrink-0"
        />
        <div class="min-w-0">
          <NuxtLink
            :to="`/companies/${job.company.slug}`"
            class="text-muted hover:text-default block truncate text-sm transition-colors"
          >
            {{ job.company.name }}
            <UIcon
              v-if="job.company.verified"
              name="i-lucide-badge-check"
              class="text-success inline size-3.5 align-text-bottom"
              aria-label="Verified company"
            />
          </NuxtLink>
          <p class="text-muted text-xs">
            {{ job.location || 'Location flexible' }}
          </p>
        </div>
      </div>

      <UBadge
        v-if="job.featured"
        label="Featured"
        color="primary"
        variant="subtle"
        size="sm"
        class="shrink-0"
      />
    </div>

    <h3 class="mt-3 text-base leading-snug font-semibold">
      <NuxtLink
        :to="`/jobs/${job.slug}`"
        class="after:absolute after:inset-0 group-hover:text-primary transition-colors"
      >
        {{ job.title }}
      </NuxtLink>
    </h3>

    <div class="mt-3 flex flex-wrap items-center gap-1.5">
      <UBadge
        :label="labelForWorkplaceType(job.workplaceType)"
        color="neutral"
        variant="subtle"
        size="sm"
      />
      <UBadge
        :label="labelForEmploymentType(job.employmentType)"
        color="neutral"
        variant="subtle"
        size="sm"
      />
      <UBadge
        v-if="job.seniority"
        :label="labelForSeniority(job.seniority)"
        color="neutral"
        variant="subtle"
        size="sm"
      />
    </div>

    <div class="mt-3 flex items-baseline justify-between gap-3">
      <p
        v-if="salary"
        class="text-success text-sm font-semibold tabular-nums"
      >
        {{ salary }}
      </p>
      <p
        v-else
        class="text-muted text-sm"
      >
        Salary not disclosed
      </p>

      <time
        v-if="job.publishedAt"
        :datetime="job.publishedAt"
        class="text-muted shrink-0 text-xs"
      >
        {{ timeAgo(job.publishedAt) }}
      </time>
    </div>

    <ul
      v-if="job.skills.length"
      class="mt-3 flex flex-wrap gap-1.5"
    >
      <li
        v-for="skill in job.skills.slice(0, 4)"
        :key="skill"
      >
        <UBadge
          :label="skill"
          color="neutral"
          variant="outline"
          size="sm"
        />
      </li>
      <li v-if="job.skills.length > 4">
        <UBadge
          :label="`+${job.skills.length - 4}`"
          color="neutral"
          variant="outline"
          size="sm"
        />
      </li>
    </ul>
  </UCard>
</template>
