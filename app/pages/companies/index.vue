<script setup lang="ts">
const route = useRoute()

const query = computed(() => ({
  page: route.query.page ? Number(route.query.page) : 1,
  perPage: 24,
  q: typeof route.query.q === 'string' ? route.query.q : undefined
}))

const { data: result } = await useCompanies(query)
const page = computed({
  get: () => query.value.page,
  set: value => navigateTo({ query: { ...route.query, page: String(value) } })
})

useSeoMeta({
  title: 'Companies hiring',
  description: 'Browse employers with open roles on the board, and see how many positions each has open.'
})
</script>

<template>
  <UContainer class="py-10">
    <header class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight">
        Companies hiring
      </h1>
      <p class="text-muted mt-1 text-sm">
        {{ result?.total ?? 0 }} {{ result?.total === 1 ? 'company' : 'companies' }} with open roles
      </p>
    </header>

    <UFormField
      label="Search companies"
      class="mb-6 max-w-sm"
    >
      <UInput
        id="company-search"
        :model-value="query.q"
        icon="i-lucide-search"
        placeholder="Search by name"
        @update:model-value="value => navigateTo({ query: { q: value || undefined } })"
      />
    </UFormField>

    <div
      v-if="result?.data.length"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <UCard
        v-for="company in result.data"
        :key="company.id"
        :ui="{ root: 'ring-default ring-1 transition-all hover:ring-primary/40' }"
      >
        <div class="flex items-start gap-3">
          <CompaniesCompanyLogo
            :company="company"
            size="size-11"
          />
          <div class="min-w-0 flex-1">
            <NuxtLink
              :to="`/companies/${company.slug}`"
              class="font-semibold hover:text-primary block truncate transition-colors"
            >
              {{ company.name }}
              <UIcon
                v-if="company.verified"
                name="i-lucide-badge-check"
                class="text-success inline size-3.5 align-text-bottom"
              />
            </NuxtLink>
            <p class="text-muted text-sm">
              {{ company.location || 'Remote' }}
            </p>
          </div>
        </div>

        <p
          v-if="company.description"
          class="text-muted mt-3 line-clamp-2 text-sm"
        >
          {{ excerpt(company.description, 120) }}
        </p>

        <p class="text-primary mt-3 text-sm font-medium">
          {{ company.openRoles }} open {{ company.openRoles === 1 ? 'role' : 'roles' }}
        </p>
      </UCard>
    </div>

    <UEmpty
      v-else
      icon="i-lucide-building-2"
      title="No companies yet"
      description="No employers have published a role yet."
      class="py-16"
    />

    <UPagination
      v-if="result && result.totalPages > 1"
      v-model:page="page"
      :items-per-page="result.perPage"
      :total="result.total"
      class="mt-8"
    />
  </UContainer>
</template>
