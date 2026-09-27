<script setup lang="ts">
/**
 * Employer dashboard.
 *
 * New roles start as drafts; publishing is an explicit action so a half-written
 * listing is never public by accident.
 */
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const { data: companies } = await useMyCompanies()
const { data: saved } = await useSavedJobs()

useSeoMeta({ title: 'Dashboard' })
</script>

<template>
  <div>
    <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p class="text-muted mt-1 text-sm">
          {{ companies?.length ?? 0 }} {{ companies?.length === 1 ? 'company' : 'companies' }}
          <template v-if="saved?.length">
            · {{ saved.length }} saved {{ saved.length === 1 ? 'role' : 'roles' }}
          </template>
        </p>
      </div>
      <UButton
        to="/jobs/new"
        label="Post a job"
        icon="i-lucide-plus"
      />
    </div>

    <UCard v-if="!companies?.length">
      <div class="py-8 text-center">
        <UIcon
          name="i-lucide-building-2"
          class="text-muted mx-auto size-8"
        />
        <p class="mt-3 font-medium">
          You have not claimed a company yet
        </p>
        <p class="text-muted mt-1 text-sm">
          Create a company profile before posting your first role.
        </p>
        <UButton
          to="/companies/new"
          label="Create a company"
          class="mt-4"
        />
      </div>
    </UCard>

    <section
      v-for="company in companies"
      :key="company.id"
      class="mb-8"
    >
      <header class="mb-3 flex items-center gap-3">
        <CompaniesCompanyLogo
          :company="company"
          size="size-9"
        />
        <div>
          <NuxtLink
            :to="`/companies/${company.slug}`"
            class="font-semibold hover:text-primary transition-colors"
          >
            {{ company.name }}
          </NuxtLink>
          <p class="text-muted text-xs">
            {{ company.openRoles }} open {{ company.openRoles === 1 ? 'role' : 'roles' }}
          </p>
        </div>
        <UButton
          :to="`/companies/${company.slug}/edit`"
          label="Edit"
          icon="i-lucide-pencil"
          size="xs"
          color="neutral"
          variant="ghost"
        />
        <UButton
          :to="`/jobs/new?companyId=${company.id}`"
          label="Add role"
          icon="i-lucide-plus"
          size="xs"
          color="neutral"
          variant="outline"
          class="ms-auto"
        />
      </header>

      <JobCompanyJobs :company-id="company.id" />
    </section>
  </div>
</template>
