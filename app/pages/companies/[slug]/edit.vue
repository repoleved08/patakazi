<script setup lang="ts">
import { COMPANY_SIZES } from '#shared/types/job'
import type { CompanySize } from '#shared/types/job'
import type { UpdateCompanyInput } from '#shared/schemas'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

const { data: company } = await useCompany(slug)
const { data: mine } = await useMyCompanies()
const { update, remove } = useCompanyMutations()

/** Ownership is advisory in the UI; the service rejects anyone else. */
const isOwner = computed(() => company.value
  ? mine.value?.some(entry => entry.id === company.value!.id) ?? false
  : false)

const sizeOptions: Array<{ value: CompanySize, label: string }> = COMPANY_SIZES
  .filter(value => value !== 'just_me')
  .map(value => ({ value, label: labelForCompanySize(value) }))

const error = ref<string | null>(null)
const notice = ref<string | null>(null)
const isSaving = ref(false)
const isDeleting = ref(false)
const confirmDelete = ref(false)

const form = reactive({
  name: company.value?.name ?? '',
  website: company.value?.website ?? '',
  industry: company.value?.industry ?? '',
  location: company.value?.location ?? '',
  size: (company.value?.size || undefined) as CompanySize | undefined,
  founded: company.value?.founded ?? 0,
  description: company.value?.description ?? '',
  services: (company.value as any)?.services ?? '',
  workingHours: (company.value as any)?.workingHours ?? ''
})

async function submit() {
  if (!company.value) return
  error.value = null
  notice.value = null
  isSaving.value = true
  try {
    const payload: UpdateCompanyInput = {
      name: form.name,
      website: form.website,
      industry: form.industry,
      location: form.location,
      size: form.size ?? '',
      founded: form.founded,
      description: form.description,
      services: form.services ?? '',
      workingHours: form.workingHours ?? ''
    }
    await update(company.value.id, payload)
    notice.value = 'Saved.'
    // A rename changes the slug, so leave the stale URL behind.
    await navigateTo(`/companies/${slug.value}`, { replace: true })
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not save the company.'
  } finally {
    isSaving.value = false
  }
}

async function destroy() {
  if (!company.value) return
  error.value = null
  isDeleting.value = true
  try {
    await remove(company.value.id)
    await navigateTo('/dashboard')
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not delete the company.'
    isDeleting.value = false
  }
}

useSeoMeta({ title: () => `Edit ${company.value?.name ?? 'company'}` })
</script>

<template>
  <UContainer class="py-10">
    <div class="mx-auto max-w-2xl">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">
            Edit company
          </h1>
          <p class="text-muted mt-1 text-sm">
            {{ company?.name }}
          </p>
        </div>
        <UButton
          v-if="company"
          :to="`/companies/${company.slug}`"
          label="View profile"
          icon="i-lucide-external-link"
          color="neutral"
          variant="ghost"
          size="sm"
        />
      </div>

      <UAlert
        v-if="company && !isOwner"
        class="mt-6"
        icon="i-lucide-lock"
        color="warning"
        variant="subtle"
        title="You do not manage this company"
        description="The form is read-only for you. Saving will be rejected by the server."
      />

      <UAlert
        v-if="error"
        class="mt-6"
        icon="i-lucide-circle-alert"
        color="error"
        variant="subtle"
        :title="error"
      />

      <UAlert
        v-if="notice"
        class="mt-6"
        icon="i-lucide-circle-check"
        color="success"
        variant="subtle"
        :title="notice"
      />

      <UForm
        class="mt-6 space-y-5"
        @submit="submit"
      >
        <UFormField
          label="Name"
          required
        >
          <UInput
            v-model="form.name"
            required
            class="w-full"
          />
        </UFormField>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Website">
            <UInput
              v-model="form.website"
              type="url"
              placeholder="https://…"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Location">
            <UInput
              v-model="form.location"
              placeholder="Berlin, Germany"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Services / Focus" hint="What the company does — clients, products, sectors">
            <UTextarea v-model="form.services" :rows="3" />
          </UFormField>

          <UFormField label="Working hours" hint="Typical schedule or time zones">
            <UInput v-model="form.workingHours" />
          </UFormField>

          <UFormField label="Industry">
            <UInput
              v-model="form.industry"
              placeholder="Developer tools"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Team size">
            <USelect
              v-model="form.size"
              :items="sizeOptions"
              placeholder="Not specified"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Founded"
            class="sm:col-span-2"
          >
            <UInput
              v-model.number="form.founded"
              type="number"
              min="1800"
              max="2100"
            />
          </UFormField>
        </div>

        <UFormField label="About">
          <UTextarea
            v-model="form.description"
            :rows="8"
            placeholder="What the company builds and who it serves…"
            class="w-full"
          />
        </UFormField>

        <div class="flex items-center justify-between gap-2">
          <UButton
            v-if="isOwner && !confirmDelete"
            label="Delete company"
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            @click="confirmDelete = true"
          />
          <UButton
            v-else-if="isOwner"
            label="Really delete? This cannot be undone."
            icon="i-lucide-triangle-alert"
            color="error"
            variant="solid"
            :loading="isDeleting"
            @click="destroy"
          />

          <div class="ml-auto flex gap-2">
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
        </div>
      </UForm>
    </div>
  </UContainer>
</template>
