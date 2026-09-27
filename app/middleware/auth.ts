/**
 * Client-side route guard for employer-only pages.
 *
 * This is a UX guard only: it avoids rendering a dashboard for a signed-out
 * visitor. Real enforcement lives in the API, where every handler re-checks the
 * Supabase session and the company ownership before writing.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
