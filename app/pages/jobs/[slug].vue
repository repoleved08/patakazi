<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

const { data: job, error } = await useJob(slug)

if (error.value || !job.value) {
  throw createError({ statusCode: 404, statusMessage: 'This role is no longer available', fatal: true })
}

const posting = job.value
const salary = computed(() => formatSalary(posting.salary))
const { toggle, isSaved } = useSavedJobs()

const appliedUrl = computed(() => posting.applyUrl || (posting.applyEmail ? `mailto:${posting.applyEmail}` : ''))

// Fire-and-forget: a view must never block or fail the render.
onMounted(() => {
  $fetch(`/api/jobs/${slug.value}/view`, { method: 'POST' }).catch(() => {})
})

// No `ogImage` here: generating one per listing needs a server-side image
// renderer, which this project does not have. `@nuxtjs/seo` falls back to the
// site default rather than pointing at an endpoint that does not exist.
useSeoMeta({
  title: `${posting.title} at ${posting.company.name}`,
  description: jobMetaDescription(posting),
  ogTitle: `${posting.title} at ${posting.company.name}`,
  ogDescription: jobMetaDescription(posting),
  ogType: 'article'
})

// JobPosting structured data is what makes this listing eligible for rich
// results and for agents to parse confidently.
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        'title': posting.title,
        'description': posting.description,
        'datePosted': posting.publishedAt || posting.createdAt,
        'employmentType': posting.employmentType.toUpperCase(),
        'hiringOrganization': {
          '@type': 'Organization',
          'name': posting.company.name,
          ...(posting.company.website ? { sameAs: posting.company.website } : {})
        },
        'jobLocationType': posting.workplaceType === 'remote' ? 'TELECOMMUTE' : undefined,
        ...(posting.location
          ? {
              jobLocation: {
                '@type': 'Place',
                'address': { '@type': 'PostalAddress', 'addressLocality': posting.location }
              }
            }
          : {}),
        ...(salary.value
          ? {
              baseSalary: {
                '@type': 'MonetaryAmount',
                'currency': posting.salary.currency,
                'value': {
                  '@type': 'QuantitativeValue',
                  'minValue': posting.salary.min,
                  'maxValue': posting.salary.max,
                  'unitText': posting.salary.period === 'year'
                    ? 'YEAR'
                    : posting.salary.period === 'month' ? 'MONTH' : 'HOUR'
                }
              }
            }
          : {}),
        ...(posting.expiresAt ? { validThrough: posting.expiresAt } : {})
      })
    }
  ]
})
</script>

<template>
  <UContainer class="py-10">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <article>
        <header class="border-b border-default pb-6">
          <nav class="mb-4 flex items-center gap-2 text-sm">
            <NuxtLink
              to="/jobs"
              class="text-muted hover:text-default"
            >
              All roles
            </NuxtLink>
            <UIcon
              name="i-lucide-chevron-right"
              class="text-muted size-4"
            />
            <NuxtLink
              :to="`/companies/${posting.company.slug}`"
              class="text-muted hover:text-default"
            >
              {{ posting.company.name }}
            </NuxtLink>
          </nav>

          <h1 class="text-3xl font-bold tracking-tight text-balance">
            {{ posting.title }}
          </h1>

          <div class="text-muted mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span>{{ posting.location || 'Location flexible' }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ labelForWorkplaceType(posting.workplaceType) }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ labelForEmploymentType(posting.employmentType) }}</span>
          </div>
        </header>

        <div class="job-description py-6">
          <MDC :value="posting.description" />
        </div>
      </article>

      <aside class="lg:sticky lg:top-24 lg:self-start">
        <UCard>
          <div class="flex items-center gap-3">
            <CompaniesCompanyLogo
              :company="posting.company"
              size="size-12"
            />
            <div class="min-w-0">
              <NuxtLink
                :to="`/companies/${posting.company.slug}`"
                class="font-semibold hover:text-primary truncate transition-colors"
              >
                {{ posting.company.name }}
              </NuxtLink>
              <p
                v-if="posting.company.verified"
                class="text-success flex items-center gap-1 text-xs"
              >
                <UIcon
                  name="i-lucide-badge-check"
                  class="size-3.5"
                />
                Verified
              </p>
            </div>
          </div>

          <div
            v-if="salary"
            class="bg-success/10 border-success/20 mt-4 rounded-lg border p-4"
          >
            <p class="text-muted text-xs uppercase tracking-wide">
              Compensation
            </p>
            <p class="text-success mt-1 text-lg font-bold tabular-nums">
              {{ salary }}
            </p>
          </div>
          <div
            v-else
            class="bg-elevated/50 mt-4 rounded-lg p-4"
          >
            <p class="text-muted text-sm">
              This employer has not published a salary range.
            </p>
          </div>

          <div class="mt-4 space-y-1.5 text-sm">
            <p
              v-if="posting.seniority"
              class="flex justify-between gap-4"
            >
              <span class="text-muted">Level</span>
              <span class="font-medium">{{ labelForSeniority(posting.seniority) }}</span>
            </p>
            <p class="flex justify-between gap-4">
              <span class="text-muted">Posted</span>
              <span class="font-medium">{{ timeAgo(posting.publishedAt || posting.createdAt) }}</span>
            </p>
            <p class="flex justify-between gap-4">
              <span class="text-muted">Views</span>
              <span class="font-medium tabular-nums">{{ posting.views.toLocaleString() }}</span>
            </p>
          </div>

          <ul
            v-if="posting.skills.length"
            class="mt-4 flex flex-wrap gap-1.5"
          >
            <li
              v-for="skill in posting.skills"
              :key="skill"
            >
              <UBadge
                :label="skill"
                color="neutral"
                variant="subtle"
                size="sm"
              />
            </li>
          </ul>

          <div class="mt-5 space-y-2">
            <UButton
              v-if="appliedUrl"
              :to="appliedUrl"
              :external="!posting.applyUrl"
              target="_blank"
              rel="noopener"
              label="Apply for this role"
              icon="i-lucide-send"
              trailing
              block
              size="lg"
            />
            <UButton
              :label="isSaved(posting.id) ? 'Saved' : 'Save job'"
              :icon="isSaved(posting.id) ? 'i-lucide-bookmark-check' : 'i-lucide-bookmark'"
              :variant="isSaved(posting.id) ? 'soft' : 'outline'"
              color="neutral"
              block
              @click="toggle(posting.id)"
            />
            <JobCopyAsMarkdown :job="posting" />
            <UButton
              :to="`${posting.slug}.md`"
              :external="true"
              target="_blank"
              rel="noopener"
              label="View raw Markdown"
              icon="i-lucide-file-text"
              variant="ghost"
              color="neutral"
              block
            />
          </div>
        </UCard>

        <UAlert
          v-if="posting.status !== 'published'"
          class="mt-4"
          icon="i-lucide-info"
          color="warning"
          variant="subtle"
          title="This listing is not open"
          :description="`Its status is ${posting.status}. It may have been filled.`"
        />
      </aside>
    </div>
  </UContainer>
</template>
