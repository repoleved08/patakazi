// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',

    // Data + content
    '@nuxtjs/supabase',
    '@nuxt/content',

    // Must load before nuxt-ai-ready so the latter can read sitemap/robots config
    '@nuxtjs/seo',
    'nuxt-ai-ready',
    '@nuxtjs/mcp-toolkit'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  // --- Site identity (nuxt-site-config, via @nuxtjs/seo) -------------------
  site: {
    name: 'Patakazi',
    description: 'A hand-curated tech job board. Every listing publishes its salary range, and every page is readable by people and AI agents alike.',
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  },

  // --- @nuxt/content ------------------------------------------------------
  content: {},

  // Supabase credentials are declared by @nuxtjs/supabase, which reads
  // NUXT_PUBLIC_SUPABASE_URL / _KEY and NUXT_SUPABASE_SERVICE_KEY. Only the
  // site URL is ours.
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },

  routeRules: {
    // --- Caching -----------------------------------------------------------
    //
    // This is a hand-curated board: listings are entered by an admin a handful
    // of times a week, so the data changes far more slowly than it is read.
    // Without these rules every page view and every API call opened a fresh
    // connection to Postgres, which made the pages that matter most (the index,
    // the landing page) the slowest ones.
    //
    // `swr` serves the cached copy immediately and revalidates in the
    // background, so a cold cache is never a user-visible delay. The
    // consequence to be aware of: an edit made in the dashboard can take up to
    // the TTL to appear. Five minutes is the ceiling here, and it only matters
    // to the person who just made the edit.
    '/': { swr: 300 },
    '/jobs': { swr: 300 },
    '/companies': { swr: 300 },
    '/jobs/**': { swr: 300 },
    '/companies/**': { swr: 300 },

    // The public read APIs are cached in their own handlers
    // (`server/utils/publicCache.ts`), not here. `/api/jobs` and
    // `/api/companies` each have a POST sibling on the same path, and a route
    // rule's cache does not distinguish methods — a rule on `/api/jobs` made
    // `POST /api/jobs` answer 200 with the cached list instead of 401. Route
    // rules have no method filter, so caching has to live on the GET handler.

    // `/llms-jobs.txt` is a plain read-only route, so a route rule is safe and
    // lets the CDN hold it. `/llms.txt` and `/llms-full.txt` are answered by
    // middleware, which short-circuits before this layer, so they are cached
    // inside the document builder instead.

    // --- Prerender ---------------------------------------------------------
    //
    // Only static prose is baked at build time. The landing page and the job
    // index read live data, so freezing them into the build would ship an empty
    // board; they are served from the SWR cache above instead.
    '/about': { prerender: true },
    '/blog': { prerender: true },
    '/blog/**': { prerender: true },

    // --- Never cache -------------------------------------------------------
    //
    // These are per-visitor or per-account. Caching any of them would serve one
    // person's dashboard, saved jobs or profile to the next. The editor routes
    // are listed explicitly because `/jobs/**` above is a prefix match that
    // would otherwise swallow them.
    '/dashboard/**': { swr: false, cache: false },
    '/jobs/new': { swr: false, cache: false },
    '/jobs/*/edit': { swr: false, cache: false },
    '/companies/new': { swr: false, cache: false },
    '/companies/*/edit': { swr: false, cache: false },
    '/api/saved-jobs/**': { swr: false, cache: false },
    '/api/profile/**': { swr: false, cache: false },
    '/api/files/**': { swr: false, cache: false }
  },

  compatibilityDate: '2026-06-30',

  // --- Nitro --------------------------------------------------------------
  nitro: {
    // Precompress the hashed build output so the CDN can serve .br/.gz without
    // compressing per request. The 49 MB of server chunks are not affected;
    // this is for the client bundle and the public assets.
    compressPublicAssets: true
  },

  // --- nuxt-ai-ready ------------------------------------------------------
  aiReady: {
    // Every route is also served as .md, which is what agents fetch.
    contentNegotiation: true,
    contentSource: true,
    // Permit agents to read and search our content, but not train on it.
    contentSignal: {
      aiTrain: false,
      aiInput: true,
      search: true,
      contentUsage: false
    },
    llmsTxt: {
      markdownLinks: true,
      notes: [
        'Job listings are available as structured JSON at /api/jobs and as markdown at <route>.md.',
        'This board exposes an MCP server for real-time job search.'
      ]
    },
    // Prerender-time index is enough for the blog; jobs are runtime-indexed.
    runtimeSync: {
      ttl: 3600,
      batchSize: 100
    },
    // WebMCP lets in-browser agents (e.g. Chrome) call our search tools directly.
    webmcp: {
      tools: true
    },
    agentSkills: {
      dir: 'skills',
      llmsTxt: true
    },
    // Jobs are dynamic, so the AI index needs a database rather than prerender only.
    database: {
      type: 'sqlite',
      filename: '.data/ai-ready/pages.db'
    },
    runtimeSyncSecret: process.env.NUXT_AI_READY_SYNC_SECRET || '',
    mcpServerCard: {
      name: 'com.patakazi/jobs'
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  // --- nuxt-link-checker --------------------------------------------------
  linkChecker: {
    // The checker resolves link responses from prerendered output, so any link
    // to an SSR-only route is reported as a 404 that does not exist at runtime.
    // Excluding the live, auth-gated and API surface keeps the rule active where
    // it can actually verify something — the prerendered pages, which is how it
    // caught the content-collection path prefix bug.
    excludeLinks: [
      /^\/jobs(\/|$|\?)/,
      /^\/companies/,
      /^\/blog\/.+/,
      /^\/login/,
      /^\/dashboard/,
      /^\/mcp/,
      /^\/api\//
    ]
  },

  // --- mcp-toolkit -------------------------------------------------------
  // Publishes an MCP server at /mcp. Combined with nuxt-ai-ready this gives
  // agents list_pages / search_pages / get_page_markdown over the whole site.
  mcp: {
    name: 'Jobboard',
    version: '1.0.0',
    description: 'Search open job listings and read company profiles. Use when a user asks about jobs, roles, hiring, or open positions.',
    instructions: [
      'This server exposes a job board.',
      'Use search_pages to find listings by role, skill, location, or company.',
      'Use get_page_markdown on a /jobs/<slug> route for the full description.',
      'Every listing is also available as JSON from /api/jobs and /api/search.',
      'Always cite the listing URL you used so the user can open it.'
    ].join(' ')
  },

  // --- @nuxtjs/robots -----------------------------------------------------
  // AI usage preferences are declared once, under aiReady.contentSignal, which
  // emits the robots.txt directives. This block only sets crawler policy.
  robots: {
    disallow: ['/api/companies/mine', '/api/saved-jobs', '/api/profile', '/dashboard']
  },

  // --- @nuxtjs/sitemap ----------------------------------------------------
  sitemap: {
    sources: [
      '/api/__sitemap__/jobs',
      '/api/__sitemap__/companies',
      '/api/__sitemap__/posts'
    ]
  },

  // --- Supabase ------------------------------------------------------------
  // We handle the sign-in redirect ourselves in `app/middleware/auth.ts` so the
  // `?redirect=` target survives the round trip, which the module's built-in
  // redirect drops. `/confirm` stays the OAuth and magic-link callback: it is
  // the page Supabase returns to with a one-time code.
  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/confirm'
    },
    // Checked in, so the clients stay typed from a clean clone. `pnpm db:types`
    // regenerates it from a live database after a schema change.
    types: '~~/shared/types/database.types.ts'
  }
})
