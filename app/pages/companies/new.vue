<script setup lang="ts">
import { COMPANY_SIZES } from '#shared/types/job'
import type { CompanySize } from '#shared/types/job'

definePageMeta({ middleware: 'auth' })

const { data: existing } = await useMyCompanies()
const sizeOptions: Array<{ value: CompanySize, label: string }> = COMPANY_SIZES
  .filter(value => value !== 'just_me')
  .map(value => ({ value, label: labelForCompanySize(value) }))

const error = ref<string | null>(null)
const isSaving = ref(false)

const form = reactive({
  name: '',
  website: '',
  industry: '',
  location: '',
  size: undefined as CompanySize | undefined,
  description: ''
})

async function submit() {
  error.value = null
  isSaving.value = true
  try {
    const company = await $fetch('/api/companies', { method: 'POST', body: form })
    await navigateTo(`/companies/${company.slug}`)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not create the company.'
  } finally {
    isSaving.value = false
  }
}

useSeoMeta({ title: 'Create a company' })
</script>

<template>
  <UContainer class="py-10">
    <div class="mx-auto max-w-2xl">
      <h1 class="text-3xl font-bold tracking-tight">
        Create a company profile
      </h1>
      <p class="text-muted mt-1 text-sm">
        A verified company profile is what candidates trust. You can post roles as soon as this exists.
      </p>

      <UAlert
        v-if="existing?.length"
        class="mt-6"
        icon="i-lucide-info"
        color="primary"
        variant="subtle"
        :title="`You already manage ${existing.length} ${existing.length === 1 ? 'company' : 'companies'}.`"
      >
        <template #actions>
          <UButton
            to="/jobs/new"
            label="Post a role instead"
            size="sm"
          />
        </template>
      </UAlert>

      <UAlert
        v-if="error"
        class="mt-6"
        icon="i-lucide-circle-alert"
        color="error"
        variant="subtle"
        :title="error"
      />

      <UForm
        class="mt-6 space-y-4"
        @submit="submit"
      >
        <UFormField
          label="Company name"
          required
        >
          <UInput
            v-model="form.name"
            placeholder="Acme Labs"
            required
            class="w-full"
          />
        </UFormField>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Website">
            <UInput
              v-model="form.website"
              type="url"
              placeholder="https://acme.com"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Location">
            <UInput
              v-model="form.location"
              placeholder="Remote"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Industry">
            <UInput
              v-model="form.industry"
              placeholder="Developer tools"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Size">
            <USelect
              v-model="form.size"
              :items="sizeOptions"
              placeholder="Select"
              class="w-full"
            />
          </UFormField>
        </div>

        <UFormField
          label="About"
          hint="Markdown supported."
        >
          <UTextarea
            v-model="form.description"
            :rows="8"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end">
          <UButton
            type="submit"
            label="Create company"
            :loading="isSaving"
          />
        </div>
      </UForm>
    </div>
  </UContainer>
</template>
