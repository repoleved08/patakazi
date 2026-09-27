<script setup lang="ts">
/**
 * OAuth / magic-link landing route.
 *
 * Supabase sends the browser back here with a `code` query parameter. The
 * `@nuxtjs/supabase` browser client notices that parameter on startup and
 * exchanges it for a session, writing the resulting cookies, so this page does
 * not have to do any auth work itself — it only has to wait for that to land
 * and then forward the user on.
 */
definePageMeta({ layout: 'bare' })

const route = useRoute()
const { isAuthenticated } = useAuth()

const failed = ref(false)

/** Same open-redirect guard as the login page. */
const redirectTo = computed(() => {
  const target = route.query.redirect
  if (typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')) return target
  return '/dashboard'
})

onMounted(async () => {
  // The client plugin runs before mount, so one macrotask is enough for the
  // session to be in state. A short bounded wait covers a slow token exchange
  // without leaving the user staring at a spinner if it genuinely failed.
  for (let attempt = 0; attempt < 20; attempt++) {
    if (isAuthenticated.value) {
      await navigateTo(redirectTo.value, { replace: true })
      return
    }
    if (attempt === 19) failed.value = true
    await new Promise(resolve => setTimeout(resolve, 150))
  }
})

useSeoMeta({ title: 'Signing you in', robots: 'noindex' })
</script>

<template>
  <UContainer class="flex min-h-[70vh] items-center justify-center py-16">
    <div class="w-full max-w-sm text-center">
      <template v-if="!failed">
        <UIcon
          name="i-lucide-loader-circle"
          class="text-muted mx-auto size-6 animate-spin"
        />
        <h1 class="mt-4 text-lg font-semibold">
          Signing you in
        </h1>
        <p class="text-muted mt-1 text-sm">
          One moment while we finish setting up your session.
        </p>
      </template>

      <template v-else>
        <UIcon
          name="i-lucide-triangle-alert"
          class="text-error mx-auto size-6"
        />
        <h1 class="mt-4 text-lg font-semibold">
          That did not work
        </h1>
        <p class="text-muted mt-1 text-sm">
          The sign-in link may have expired or already been used.
        </p>
        <UButton
          class="mt-5"
          to="/login"
          label="Back to sign in"
          block
        />
      </template>
    </div>
  </UContainer>
</template>
