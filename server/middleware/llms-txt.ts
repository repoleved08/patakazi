import { defineCachedFunction } from 'nitropack/runtime'
import { getRequestURL, send, setHeader } from 'h3'
import { queryCollection } from '@nuxt/content/nitro'
import { useJobService } from '../services/job.service'
import { jobToIndexLine, jobToMarkdown } from '#shared/utils/jobMarkdown'
import { labelForWorkplaceType, slugify } from '#shared/utils/format'
import { postBodyText } from '#shared/utils/content'
import type { Job } from '#shared/types/api'
import type { WorkplaceType } from '#shared/types/job'

/**
 * Serves `/llms.txt` and `/llms-full.txt` for this site.
 *
 * Why this shadows `nuxt-ai-ready`:
 *
 * 1. `/llms.txt`. The module generates it from site config plus a static `notes`
 *    array, so it cannot contain a job index — and on a job board the index *is*
 *    the content. What the module produced was a generic site description whose
 *    most useful line was the literal text `<route>.md`.
 * 2. `/llms-full.txt`. The module streams it from a local SQLite file. That works
 *    on a long-lived Node process and nowhere else: on serverless the filesystem
 *    is read-only and discarded between invocations, so the table is always empty
 *    and the file degrades to "No pages indexed". It is generated from the
 *    database instead, which is correct everywhere.
 *
 * Both documents follow the llmstxt.org conventions: an H1, a blockquote summary,
 * then `##` sections of markdown links.
 *
 * To hand these back to the module, delete this file. Nothing else references it.
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  if (event.method !== 'GET' && event.method !== 'HEAD') return

  const isFull = url.pathname === '/llms-full.txt'
  if (url.pathname !== '/llms.txt' && !isFull) return

  const body = await buildDocument(event, url.origin, isFull)

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400')
  return send(event, body)
})

/**
 * Builds the document, cached.
 *
 * A route rule cannot cache this: route rules wrap route *handlers*, and a
 * middleware that answers the request short-circuits before that layer, so
 * `swr` never applied. Caching the build makes the origin cheap on a warm hit
 * whether or not the CDN is also holding a copy.
 *
 * Keyed on origin and variant. The origin matters because every link in these
 * documents is absolute, and the variant because the full document is a
 * different and much larger payload.
 */
const buildDocument = defineCachedFunction(
  async (event: Parameters<typeof useJobService>[0], origin: string, isFull: boolean) => {
    const siteName = 'Patakazi'
    const siteDescription = 'A hand-curated tech job board. Every listing publishes its salary range, and every page is readable by people and AI agents alike.'

    // One round trip each, shared by both documents.
    const { data: jobs } = await useJobService(event).listPublic({ perPage: 100, page: 1, sort: 'newest' })

    const byWorkplace = new Map<WorkplaceType, Job[]>()
    for (const job of jobs) {
      const bucket = byWorkplace.get(job.workplaceType) ?? []
      bucket.push(job)
      byWorkplace.set(job.workplaceType, bucket)
    }

    const companyCounts = new Map<string, number>()
    for (const job of jobs) {
      companyCounts.set(job.company.name, (companyCounts.get(job.company.name) ?? 0) + 1)
    }

    const workplaceSection = (['remote', 'hybrid', 'onsite'] as WorkplaceType[])
      .filter(type => byWorkplace.has(type))
      .map((type) => {
        const bucket = [...byWorkplace.get(type)!].sort((a, b) => b.salary.max - a.salary.max)
        return [
          `## ${labelForWorkplaceType(type)} roles (${bucket.length})`,
          '',
          ...bucket.map(job => jobToIndexLine(job, { origin })),
          ''
        ].join('\n')
      })
      .join('\n')

    // Both documents list the articles; only the full one embeds their text.
    const blog = await queryCollection(event, 'posts')
      .where('draft', '=', false)
      .order('date', 'DESC')
      .all()

    const header = [
      `# ${siteName}`,
      '',
      `> ${siteDescription}`,
      '',
      `Canonical Origin: ${origin}/`,
      ''
    ].join('\n')

    const documents = [
      {
        label: 'All open roles, categorised (markdown)',
        url: `${origin}/llms-jobs.txt`,
        note: `${jobs.length} open roles across ${companyCounts.size} companies. Add ?full to inline every description.`
      },
      {
        label: 'Open roles (JSON)',
        url: `${origin}/api/jobs`,
        note: 'Same fields as the markdown. Filters: workplaceType, employmentType, seniority, salaryMin, q, location, skills, companyId, sort, page, perPage.'
      },
      {
        label: 'Companies hiring (JSON)',
        url: `${origin}/api/companies`
      },
      {
        label: 'Blog index (markdown)',
        url: `${origin}/blog.md`,
        note: 'Career and technical writing on AI, security and IT roles. Individual posts are at /blog/<slug>.md.'
      },
      {
        label: 'Everything on this site, in full (markdown)',
        url: `${origin}/llms-full.txt`
      },
      {
        label: 'MCP server',
        url: `${origin}/mcp`,
        note: 'Model Context Protocol endpoint; POST a JSON-RPC request. The `search_jobs` tool searches the listings live and returns markdown by default, JSON on request. `get_page_markdown`, `list_pages` and `search_pages` read a page index that only exists on a long-running Node server, so prefer `search_jobs` here.'
      },
      {
        label: 'Sitemap',
        url: `${origin}/sitemap.xml`
      },
      {
        label: 'Agent skills',
        url: `${origin}/SKILL.md`,
        note: 'A ready-made skill for searching these listings, with a sha256-pinned index at /.well-known/agent-skills/index.json.'
      }
    ]

    const resourceSection = [
      '## Start here',
      '',
      ...documents.map(doc => `- [${doc.label}](${doc.url})${doc.note ? `: ${doc.note}` : ''}`),
      ''
    ].join('\n')

    const companySection = [
      `## Companies hiring (${companyCounts.size})`,
      '',
      ...[...companyCounts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([name, count]) => `- [${name}](${origin}/companies/${slugify(name)}) — ${count} open ${count === 1 ? 'role' : 'roles'}`),
      ''
    ].join('\n')

    const blogSection = blog.length
      ? [
          `## Blog (${blog.length} articles)`,
          '',
          ...blog.map(post => `- [${post.title}](${origin}${post.path}): ${post.description}`),
          ''
        ].join('\n')
      : ''

    const notes = [
      '## Notes',
      '',
      '- Any HTML route is also served as markdown: append `.md`, or send `Accept: text/markdown`.',
      '- Listings are curated by hand. Salaries are published unless a listing says otherwise, and',
      '  `salary_visible: false` in a listing\'s frontmatter is how a hidden range is represented.',
      '- Patakazi does not receive applications. Each listing links to the employer\'s own page, and no',
      '  candidate data is collected or stored here.',
      '- Content is licensed for use in AI answers (`aiInput`); training on it is not permitted.',
      ''
    ].join('\n')

    if (!isFull) {
      return [header, resourceSection, companySection, workplaceSection, blogSection, notes]
        .filter(Boolean)
        .join('\n')
    }

    // Full document: every listing and every article, unabridged.
    const listingDocs = jobs
      .slice()
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .map(job => jobToMarkdown(job, { origin, includeDescription: true }))
      .join('\n---\n\n')

    const articleDocs = blog.length
      ? `\n\n---\n\n# Blog\n\n${blog
        .map(post => `## ${post.title}\n\nSource: ${origin}${post.path}\n\n${postBodyText(post.body)}\n`)
        .join('\n---\n\n')}`
      : ''

    return [
      header,
      resourceSection,
      companySection,
      `## All open roles (${jobs.length})`,
      '',
      listingDocs,
      articleDocs,
      notes
    ].join('\n')
  },
  {
    name: 'llms-txt',
    group: 'ai',
    maxAge: 1800,
    swr: true,
    getKey: (event: unknown, origin: string, isFull: boolean) => `${origin}:${isFull ? 'full' : 'index'}`
  }
)
