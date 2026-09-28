<script setup lang="ts">
/**
 * Root shell.
 *
 * Global SEO defaults live here; individual pages override the title and
 * description with `useSeoMeta`. `nuxt-ai-ready` appends `llms.txt` and
 * sitemap links, and `@nuxtjs/seo` supplies canonical URLs and OG images.
 *
 * The chrome itself lives in `app/layouts/default.vue` rather than inline here.
 * A page that opts into another layout — `bare` for the sign-in flow, which
 * should not carry the header — could never actually get one while the header
 * was hard-coded at this level.
 */
const site = useSiteConfig()

useHead({
  htmlAttrs: { lang: 'en' },
  link: [{ rel: 'icon', href: '/favicon.ico' }]
})

useSeoMeta({
  titleTemplate: title => title ? `${title} · ${site.name}` : site.name,
  description: site.description,
  ogTitle: site.name,
  ogDescription: site.description,
  ogType: 'website',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator
      color="primary"
      :height="2"
    />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
