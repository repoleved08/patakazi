<script setup lang="ts">
/**
 * Root shell.
 *
 * Global SEO defaults live here; individual pages override the title and
 * description with `useSeoMeta`. `nuxt-ai-ready` appends `llms.txt` and
 * sitemap links, and `@nuxtjs/seo` supplies canonical URLs and OG images.
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

    <AppHeader />
    <UMain>
      <NuxtPage />
    </UMain>
    <AppFooter />
  </UApp>
</template>
