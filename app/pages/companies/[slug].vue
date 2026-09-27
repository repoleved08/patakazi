<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

const { data: company, error } = await useCompany(slug)

if (error.value || !company.value) {
  throw createError({ statusCode: 404, statusMessage: 'Company not found', fatal: true })
}

const { data: openings } = await useJobs({ companyId: company.value.id, perPage: 50 })

useSeoMeta({
  title: `${company.value.name} — careers`,
  description: excerpt(
    company.value.description || `${company.value.name} is hiring on this board.`,
    160
  )
})
</script>

<template>
  <UContainer class="py-10">
    <header class="border-b border-default flex flex-wrap items-start gap-4 pb-8">
      <CompaniesCompanyLogo
        :company="company!"
        size="size-16"
      />
      <div class="min-w-0 flex-1">
        <h1 class="flex items-center gap-2 text-3xl font-bold tracking-tight">
          {{ company!.name }}
          <UIcon
            v-if="company!.verified"
            name="i-lucide-badge-check"
            class="text-success size-6"
            aria-label="Verified"
          />
        </h1>
        <p class="text-muted mt-1 text-sm">
          {{ company!.industry || 'Technology' }}
          <template v-if="company!.location">
            · {{ company!.location }}
          </template>
          <template v-if="company!.size">
            · {{ labelForCompanySize(company!.size) }} employees
          </template>
        </p>
        <UButton
          v-if="company!.website"
          :to="company!.website"
          external
          target="_blank"
          rel="noopener"
          label="Company website"
          icon="i-lucide-external-link"
          trailing
          color="neutral"
          variant="outline"
          size="sm"
          class="mt-4"
        />
      </div>
    </header>

    <div class="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div>
        <h2 class="mb-4 text-xl font-semibold">
          Open roles ({{ openings?.total ?? 0 }})
        </h2>

        <div
          v-if="openings?.data.length"
          class="grid gap-4 sm:grid-cols-2"
        >
          <JobsJobCard
            v-for="job in openings.data"
            :key="job.id"
            :job="job"
          />
        </div>

        <UEmpty
          v-else
          icon="i-lucide-briefcase"
          title="No open roles"
          :description="`${company!.name} has no published roles right now.`"
          class="py-12"
        />
      </div>

      <aside class="lg:sticky lg:top-24 lg:self-start">
        <UCard v-if="company!.description">
          <h2 class="text-sm font-semibold">
            About
          </h2>
          <div class="job-description mt-2 text-sm">
            <MDC :value="company!.description" />
          </div>
        </UCard>

        <UCard class="mt-4">
          <h2 class="text-sm font-semibold">
            Facts
          </h2>
          <dl class="mt-3 space-y-2 text-sm">
            <div
              v-if="company!.size"
              class="flex justify-between gap-4"
            >
              <dt class="text-muted">
                Size
              </dt>
              <dd class="font-medium">
                {{ labelForCompanySize(company!.size) }}
              </dd>
            </div>
            <div
              v-if="company!.founded"
              class="flex justify-between gap-4"
            >
              <dt class="text-muted">
                Founded
              </dt>
              <dd class="font-medium tabular-nums">
                {{ company!.founded }}
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-muted">
                Open roles
              </dt>
              <dd class="font-medium tabular-nums">
                {{ company!.openRoles }}
              </dd>
            </div>
          </dl>
        </UCard>
      </aside>
    </div>
  </UContainer>
</template>
