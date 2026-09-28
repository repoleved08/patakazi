import type { JwtPayload } from '@supabase/supabase-js'

/**
 * Client-side auth state, built on `@nuxtjs/supabase`.
 *
 * The module is deliberately the only place that touches the browser Supabase
 * client. This composable adapts it into reactive state so components never call
 * the client directly, and it is the only place that knows which providers the
 * UI offers.
 *
 * Two flows are supported, both server-cookie based so SSR sees the same session
 * as the browser:
 *
 *  - Magic link: `signInWithOtp` emails a one-time link. No password to leak,
 *    and it is the flow we point the sign-in form at by default.
 *  - OAuth: a redirect to GitHub/Google. Supabase returns to `/confirm`, which
 *    exchanges the URL fragment for a session and then forwards on.
 */

/** OAuth providers we surface. Supabase types this as a string union. */
export type OAuthProviderId = 'apple' | 'azure' | 'bitbucket' | 'discord' | 'facebook' | 'figma' | 'github' | 'gitlab' | 'google' | 'kakao' | 'keycloak' | 'linkedin' | 'notion' | 'slack' | 'spotify' | 'twitch' | 'workos' | 'zoom'

/** The subset of the Supabase user this app actually reads. */
export interface AuthUser {
  id: string
  email: string
  /** Display name from provider or profile metadata. May be empty. */
  name: string
  /** Storage object key for the avatar, served through `/api/files/...`. */
  avatar: string
  /** `employer` | `admin` when set; drives employer-only affordances. */
  role: string
}

function toAuthUser(claims: JwtPayload): AuthUser {
  // `useSupabaseUser()` is populated from the access token rather than the
  // `users` table, so the id lives in `sub` and the profile lives in the
  // `user_metadata` claim. Neither is guaranteed to be present — a token from a
  // provider that supplied nothing has an empty `user_metadata` — so every read
  // is checked rather than cast.
  const metadata = (claims['user_metadata'] ?? {}) as Record<string, unknown>

  return {
    id: claims.sub ?? '',
    email: typeof claims['email'] === 'string' ? claims['email'] : '',
    name: firstString(metadata, ['full_name', 'name', 'given_name']),
    avatar: firstString(metadata, ['avatar_url', 'picture']),
    role: typeof metadata['role'] === 'string' ? metadata['role'] : ''
  }
}

function firstString(metadata: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = metadata[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

export function useAuth() {
  const supabase = useSupabaseClient()
  const claims = useSupabaseUser()

  const authUser = computed<AuthUser | null>(() => {
    const value = claims.value
    return value ? toAuthUser(value) : null
  })

  const isLoading = ref(false)

  async function refresh() {
    isLoading.value = true
    try {
      await supabase.auth.getUser()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Email a one-time sign-in link.
   *
   * `shouldCreateUser: true` means a brand-new address is signed up on the
   * first request rather than erroring: there is no separate registration step
   * in this product, and an employer arriving from a "post a job" prompt should
   * not be told the account does not exist.
   *
   * The redirect must be allowed in the Supabase dashboard, or the email link
   * lands on a page that cannot complete the exchange.
   */
  async function sendMagicLink(email: string, redirectTo = '/dashboard') {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true }
    })

    if (error) throw new Error(error.message)
  }

  /**
   * Start an OAuth redirect.
   *
   * Supabase sends the browser away, so nothing after this call runs in the
   * current page: the session is established by the time we return via
   * `/confirm`.
   */
  async function loginWithOAuth(provider: OAuthProviderId, redirectTo = '/dashboard') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo }
    })

    if (error) throw new Error(error.message)
  }

  /**
   * Password sign-in.
   *
   * Kept for accounts that already have a password. New accounts are created
   * through the magic link, which needs no password handling anywhere.
   */
  async function loginWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }

  async function logout() {
    try {
      await supabase.auth.signOut()
    } finally {
      await navigateTo('/')
    }
  }

  return {
    user: readonly(authUser),
    isAuthenticated: computed(() => authUser.value !== null),
    isEmployer: computed(() => authUser.value?.role === 'employer' || authUser.value?.role === 'admin'),
    isAdmin: computed(() => authUser.value?.role === 'admin'),
    isLoading: readonly(isLoading),
    refresh,
    sendMagicLink,
    loginWithOAuth,
    loginWithPassword,
    logout
  }
}
