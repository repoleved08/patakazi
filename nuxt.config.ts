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
    name: 'Jobboard',
    description: 'A job board built to be read by people and agents alike.',
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
    // Only static prose is baked at build time. The landing page and the job
    // index read live data, so freezing them into the build would ship an empty
    // board; they stay SSR and nuxt-ai-ready indexes them at runtime instead.
    '/about': { prerender: true },
    '/blog': { prerender: true },
    '/blog/**': { prerender: true }
  },

  compatibilityDate: '2026-06-30',

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
      name: 'com.example/jobboard-mcp'
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
