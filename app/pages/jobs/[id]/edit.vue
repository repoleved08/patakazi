<script setup lang="ts">
import { EMPLOYMENT_TYPES, SALARY_PERIODS, SENIORITY_LEVELS, WORKPLACE_TYPES } from '#shared/types/job'
import type { EmploymentType, SalaryPeriod, SeniorityLevel, WorkplaceType } from '#shared/types/job'
import type { UpdateJobInput } from '#shared/schemas'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const id = computed(() => String(route.params.id ?? ''))

const { data: job, error: loadError } = await useJob(id)
const { data: mine } = await useMyCompanies()
const { update } = useJobMutations()

/** Employers may only edit roles posted by a company they manage. */
const isOwner = computed(() => job.value
  ? mine.value?.some(company => company.id === job.value!.company.id) ?? false
  : false)

const error = ref<string | null>(null)
const isSaving = ref(false)

const form = reactive({
  title: job.value?.title ?? '',
  description: job.value?.description ?? '',
  location: job.value?.location ?? '',
  workplaceType: (job.value?.workplaceType ?? 'remote') as WorkplaceType,
  employmentType: (job.value?.employmentType ?? 'full_time') as EmploymentType,
  seniority: (job.value?.seniority || undefined) as SeniorityLevel | undefined,
  salaryMin: job.value?.salary.min ?? 0,
  salaryMax: job.value?.salary.max ?? 0,
  salaryCurrency: job.value?.salary.currency ?? 'USD',
  salaryPeriod: (job.value?.salary.period ?? 'year') as SalaryPeriod,
  salaryVisible: job.value?.salary.visible ?? true,
  skills: job.value?.skills.join(', ') ?? '',
  applyUrl: job.value?.applyUrl ?? '',
  applyEmail: job.value?.applyEmail ?? '',
  featured: job.value?.featured ?? false
})

const workplaceOptions: Array<{ value: WorkplaceType, label: string }> = WORKPLACE_TYPES.map(value => ({
  value,
  label: labelForWorkplaceType(value)
}))
const employmentOptions: Array<{ value: EmploymentType, label: string }> = EMPLOYMENT_TYPES.map(value => ({
  value,
  label: labelForEmploymentType(value)
}))
const seniorityOptions: Array<{ value: SeniorityLevel, label: string }> = SENIORITY_LEVELS.map(value => ({
  value,
  label: labelForSeniority(value)
}))
const periodOptions = SALARY_PERIODS.map(value => ({
  value,
  label: value === 'year' ? 'Per year' : value === 'month' ? 'Per month' : 'Per hour'
}))

async function submit() {
  error.value = null

  if (!form.applyUrl && !form.applyEmail) {
    error.value = 'Provide an apply URL or an apply email so candidates can reach you.'
    return
  }

  isSaving.value = true
  try {
    const payload: UpdateJobInput = {
      title: form.title,
      description: form.description,
      location: form.location,
      workplaceType: form.workplaceType,
      employmentType: form.employmentType,
      seniority: form.seniority ?? '',
      salary: {
        min: form.salaryMin,
        max: form.salaryMax,
        currency: form.salaryCurrency,
        period: form.salaryPeriod,
        visible: form.salaryVisible
      },
      skills: form.skills.split(',').map(skill => skill.trim()).filter(Boolean),
      applyUrl: form.applyUrl,
      applyEmail: form.applyEmail,
      featured: form.featured
    }

    await update(id.value, payload)
    await navigateTo(`/jobs/${job.value?.slug ?? id.value}`)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not save the listing.'
  } finally {
    isSaving.value = false
  }
}

useSeoMeta({ title: () => `Edit ${job.value?.title ?? 'listing'}`, robots: 'noindex' })
</script>

<template>
  <UContainer class="py-10">
    <div class="mx-auto max-w-3xl">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">
            Edit listing
          </h1>
          <p class="text-muted mt-1 text-sm">
            {{ job?.title }} · {{ labelForJobStatus(job?.status ?? 'draft') }}
          </p>
        </div>
        <UButton
          v-if="job"
          :to="`/jobs/${job.slug}`"
          label="View listing"
          icon="i-lucide-external-link"
          color="neutral"
          variant="ghost"
          size="sm"
        />
      </div>

      <UAlert
        v-if="loadError"
        class="mt-6"
        icon="i-lucide-circle-alert"
        color="error"
        variant="subtle"
        title="This listing could not be loaded"
        description="It may have been deleted, or it belongs to another employer."
      />

      <UAlert
        v-else-if="!isOwner"
        class="mt-6"
        icon="i-lucide-lock"
        color="warning"
        variant="subtle"
        title="You do not manage this company"
        description="Saving will be rejected by the server."
      />

      <UAlert
        v-if="error"
        class="mt-6"
        icon="i-lucide-circle-alert"
        color="error"
        variant="subtle"
        :title="error"
      />

      <UForm
        v-if="job"
        class="mt-6 space-y-5"
        @submit="submit"
      >
        <UFormField
          label="Job title"
          required
        >
          <UInput
            v-model="form.title"
            required
            class="w-full"
          />
        </UFormField>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Location">
            <UInput
              v-model="form.location"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Workplace">
            <USelect
              v-model="form.workplaceType"
              :items="workplaceOptions"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Employment type">
            <USelect
              v-model="form.employmentType"
              :items="employmentOptions"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Seniority">
            <USelect
              v-model="form.seniority"
              :items="seniorityOptions"
              placeholder="Not specified"
              class="w-full"
            />
          </UFormField>
        </div>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold">
                Compensation
              </h2>
              <USwitch
                v-model="form.salaryVisible"
                label="Show on listing"
              />
            </div>
          </template>

          <div class="grid gap-4 sm:grid-cols-4">
            <UFormField
              label="Min"
              class="sm:col-span-1"
            >
              <UInput
                v-model.number="form.salaryMin"
                type="number"
                min="0"
              />
            </UFormField>
            <UFormField
              label="Max"
              class="sm:col-span-1"
            >
              <UInput
                v-model.number="form.salaryMax"
                type="number"
                min="0"
              />
            </UFormField>
            <UFormField
              label="Currency"
              class="sm:col-span-1"
            >
              <UInput
                v-model="form.salaryCurrency"
                maxlength="3"
              />
            </UFormField>
            <UFormField
              label="Period"
              class="sm:col-span-1"
            >
              <USelect
                v-model="form.salaryPeriod"
                :items="periodOptions"
                class="w-full"
              />
            </UFormField>
          </div>
        </UCard>

        <UFormField
          label="Description"
          required
          hint="Markdown is supported."
        >
          <UTextarea
            v-model="form.description"
            :rows="12"
            class="w-full font-mono text-sm"
            required
          />
        </UFormField>

        <UFormField
          label="Skills"
          hint="Comma separated."
        >
          <UInput
            v-model="form.skills"
            class="w-full"
          />
        </UFormField>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Apply URL">
            <UInput
              v-model="form.applyUrl"
              type="url"
              placeholder="https://…"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Apply email">
            <UInput
              v-model="form.applyEmail"
              type="email"
              placeholder="jobs@company.com"
              class="w-full"
            />
          </UFormField>
        </div>

        <UFormField label="Featured">
          <USwitch
            v-model="form.featured"
            label="Pin to the top of search results"
          />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            to="/dashboard"
            label="Cancel"
            color="neutral"
            variant="ghost"
          />
          <UButton
            type="submit"
            label="Save changes"
            icon="i-lucide-save"
            :loading="isSaving"
          />
        </div>
      </UForm>
    </div>
  </UContainer>
</template>
