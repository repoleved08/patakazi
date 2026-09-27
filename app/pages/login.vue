<script setup lang="ts">
definePageMeta({ layout: 'bare' })

const route = useRoute()
const { sendMagicLink, loginWithOAuth, isLoading } = useAuth()

const email = ref('')
const error = ref<string | null>(null)
const notice = ref<string | null>(null)

/** Where to land after signing in: honour ?redirect, but never off-site. */
const redirectTo = computed(() => {
  const target = route.query.redirect
  // Guard against an open redirect: a relative path only, no scheme or host.
  if (typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')) return target
  return '/dashboard'
})

const providers = [
  { id: 'github', label: 'GitHub', icon: 'i-simple-icons-github' },
  { id: 'google', label: 'Google', icon: 'i-simple-icons-google' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'i-simple-icons-linkedin' }
] as const

async function submit() {
  error.value = null
  notice.value = null

  try {
    await sendMagicLink(email.value, redirectTo.value)
    // Do not navigate: the user is not signed in yet, the link in their inbox
    // is. Redirecting now would bounce them straight back to this page.
    notice.value = `Check ${email.value} for a sign-in link. It expires in an hour.`
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not send the sign-in link.'
  }
}
</script>

<template>
  <UContainer class="flex min-h-[80vh] items-center justify-center py-16">
    <UCard class="w-full max-w-sm">
      <h1 class="text-xl font-semibold">
        Sign in
      </h1>
      <p class="text-muted mt-1 text-sm">
        Employers post roles. Everyone else can apply without an account.
      </p>

      <UAlert
        v-if="error"
        class="mt-4"
        icon="i-lucide-circle-alert"
        color="error"
        variant="subtle"
        :title="error"
      />
      <UAlert
        v-if="notice"
        class="mt-4"
        icon="i-lucide-mail-check"
        color="success"
        variant="subtle"
        :title="notice"
      />

      <UForm
        class="mt-5 space-y-3"
        :state="{}"
        @submit="submit"
      >
        <UFormField
          label="Email"
          required
          hint="We email a one-time link. No password to remember."
        >
          <UInput
            v-model="email"
            type="email"
            placeholder="you@company.com"
            required
            autocomplete="email"
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          block
          :loading="isLoading"
          label="Email me a sign-in link"
          icon="i-lucide-mail"
        />
      </UForm>

      <USeparator
        class="my-5"
        label="or continue with"
      />

      <div class="space-y-2">
        <UButton
          v-for="provider in providers"
          :key="provider.id"
          block
          color="neutral"
          variant="subtle"
          :icon="provider.icon"
          :label="provider.label"
          @click="loginWithOAuth(provider.id, redirectTo)"
        />
      </div>

      <p class="text-muted mt-5 text-xs">
        New here? The same link creates your account. Providers must be enabled in
        the Supabase dashboard before their buttons work.
      </p>
    </UCard>
  </UContainer>
</template>
