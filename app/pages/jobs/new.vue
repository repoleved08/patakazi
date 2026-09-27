<script setup lang="ts">
import { EMPLOYMENT_TYPES, SALARY_PERIODS, SENIORITY_LEVELS, WORKPLACE_TYPES } from '#shared/types/job'
import type { EmploymentType, SalaryPeriod, SeniorityLevel, WorkplaceType } from '#shared/types/job'
import type { CreateJobInput } from '#shared/schemas'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const { data: companies } = await useMyCompanies()
const { create } = useJobMutations()

const form = reactive({
  title: '',
  companyId: typeof route.query.companyId === 'string' ? route.query.companyId : '',
  description: '',
  location: '',
  workplaceType: 'remote' as WorkplaceType,
  employmentType: 'full_time' as EmploymentType,
  seniority: undefined as SeniorityLevel | undefined,
  salaryMin: 0,
  salaryMax: 0,
  salaryCurrency: 'USD',
  salaryPeriod: 'year' as SalaryPeriod,
  salaryVisible: true,
  skills: '',
  applyUrl: '',
  applyEmail: ''
})

const error = ref<string | null>(null)
const isSaving = ref(false)

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

  if (!form.companyId) {
    error.value = 'Choose which company is hiring.'
    return
  }
  if (!form.applyUrl && !form.applyEmail) {
    error.value = 'Provide an apply URL or an apply email so candidates can reach you.'
    return
  }

  isSaving.value = true
  try {
    const payload: CreateJobInput = {
      title: form.title,
      companyId: form.companyId,
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
      tags: [],
      applyUrl: form.applyUrl,
      applyEmail: form.applyEmail,
      featured: false
    }

    const job = await create(payload)
    await navigateTo(`/jobs/${job.slug}`)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not save the listing.'
  } finally {
    isSaving.value = false
  }
}

useSeoMeta({ title: 'Post a job' })
</script>

<template>
  <UContainer class="py-10">
    <div class="mx-auto max-w-3xl">
      <h1 class="text-3xl font-bold tracking-tight">
        Post a job
      </h1>
      <p class="text-muted mt-1 text-sm">
        Listings save as a draft. You publish them from your dashboard.
      </p>

      <UAlert
        v-if="error"
        class="mt-6"
        icon="i-lucide-circle-alert"
        color="error"
        variant="subtle"
        :title="error"
      />

      <UAlert
        v-if="!companies?.length"
        class="mt-6"
        icon="i-lucide-building-2"
        color="warning"
        variant="subtle"
        title="Claim a company first"
        description="You need a company profile before you can post a role."
      >
        <template #actions>
          <UButton
            to="/companies/new"
            label="Create a company"
            size="sm"
          />
        </template>
      </UAlert>

      <UForm
        v-else
        class="mt-6 space-y-5"
        @submit="submit"
      >
        <UFormField
          label="Company"
          required
        >
          <USelect
            v-model="form.companyId"
            :items="companies.map(c => ({ value: c.id, label: c.name }))"
            placeholder="Select a company"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Job title"
          required
        >
          <UInput
            v-model="form.title"
            placeholder="Senior Backend Engineer"
            required
            class="w-full"
          />
        </UFormField>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Location">
            <UInput
              v-model="form.location"
              placeholder="Berlin, Germany"
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
            placeholder="What the person will own, the team, and how we work…"
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
            placeholder="TypeScript, PostgreSQL, AWS"
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

        <div class="flex justify-end gap-2">
          <UButton
            to="/dashboard"
            label="Cancel"
            color="neutral"
            variant="ghost"
          />
          <UButton
            type="submit"
            label="Save draft"
            icon="i-lucide-save"
            :loading="isSaving"
          />
        </div>
      </UForm>
    </div>
  </UContainer>
</template>
