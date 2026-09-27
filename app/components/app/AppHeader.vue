<script setup lang="ts">
const { isAuthenticated, user, logout } = useAuth()

const links = [
  { label: 'Find jobs', to: '/jobs' },
  { label: 'Companies', to: '/companies' },
  { label: 'Blog', to: '/blog' }
]
</script>

<template>
  <UHeader class="border-default sticky top-0 z-40">
    <template #left>
      <NuxtLink
        to="/"
        class="focus-visible:outline-primary/25 flex items-center gap-2 rounded-md p-1 focus-visible:outline-3"
        aria-label="Home"
      >
        <span class="bg-primary text-white grid size-7 place-items-center rounded-lg text-sm font-bold">
          J
        </span>
        <span class="hidden text-base font-semibold sm:block">Jobboard</span>
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="links"
      :ui="{ link: 'font-medium' }"
      class="hidden md:flex"
    />

    <template #right>
      <UColorModeButton />

      <UButton
        to="/jobs/new"
        label="Post a job"
        icon="i-lucide-plus"
        size="sm"
        color="primary"
        variant="solid"
        class="hidden sm:flex"
      />

      <template v-if="isAuthenticated">
        <UDropdownMenu
          :items="[
            { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/dashboard' },
            { label: 'Saved jobs', icon: 'i-lucide-bookmark', to: '/dashboard/saved' },
            { type: 'separator' },
            { label: 'Sign out', icon: 'i-lucide-log-out', onSelect: () => logout() }
          ]"
        >
          <UButton
            color="neutral"
            variant="ghost"
            :avatar="{ src: user?.avatar, alt: user?.name }"
            :label="user?.name"
            trailing-icon="i-lucide-chevron-down"
            size="sm"
          />
        </UDropdownMenu>
      </template>

      <UButton
        v-else
        to="/login"
        label="Sign in"
        color="neutral"
        variant="ghost"
        size="sm"
      />
    </template>
  </UHeader>
</template>
