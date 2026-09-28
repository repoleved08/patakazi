import type { Job } from '#shared/types/api'
import type { WorkplaceType } from '#shared/types/job'
import { jobToIndexLine, jobToMarkdown } from '#shared/utils/jobMarkdown'
import { labelForWorkplaceType } from '#shared/utils/format'
import { useJobService } from '../services/job.service'

/**
 * GET /llms-jobs.txt — every open role, categorised, as markdown.
 *
 * `/llms.txt` is an index; this is the payload behind it. The grouping is
 * deliberate: an agent asking "what remote work is available" should not have
 * to fetch and filter 20 listings to answer it, so workplace type leads and each
 * section is ordered by salary so the strongest match surfaces first.
 *
 * A `?full` variant inlines every description, for a consumer that wants one
 * request instead of N. The default stays compact because the full form is
 * roughly 20x the tokens and almost every caller only needs to pick a role and
 * then fetch `/jobs/<slug>.md`.
 */
export default defineEventHandler(async (event) => {
  const origin = getRequestURL(event).origin
  const query = getQuery(event)
  const full = query.full === '1' || query.full === 'true'

  // One generous page rather than a loop: the board is small, and a feed that
  // silently truncates would be worse than a 413.
  const { data: jobs } = await useJobService(event).listPublic({
    perPage: 100,
    page: 1,
    sort: 'newest'
  })

  const byWorkplace = new Map<WorkplaceType, Job[]>()
  for (const job of jobs) {
    const bucket = byWorkplace.get(job.workplaceType) ?? []
    bucket.push(job)
    byWorkplace.set(job.workplaceType, bucket)
  }

  const order: WorkplaceType[] = ['remote', 'hybrid', 'onsite']
  const sections = order
    .filter(type => byWorkplace.has(type))
    .map((type) => {
      const bucket = byWorkplace.get(type)!
      // Highest ceiling first: the listing most likely to be wanted leads.
      const sorted = [...bucket].sort((a, b) => b.salary.max - a.salary.max || b.salary.min - a.salary.min)
      const lines = sorted.map(job => jobToIndexLine(job, { origin }))

      return [`## ${labelForWorkplaceType(type)} (${sorted.length})`, '', ...lines].join('\n')
    })

  const companies = new Map<string, number>()
  for (const job of jobs) {
    companies.set(job.company.name, (companies.get(job.company.name) ?? 0) + 1)
  }

  const header = [
    '# Patakazi — open roles',
    '',
    '> Every published role on Patakazi, a hand-curated tech job board. Salary ranges are',
    '> published on every listing. Applications are handled by the employer; this board holds',
    '> no candidate data.',
    '',
    `Canonical Origin: ${origin}/`,
    `Last updated: ${new Date().toISOString()}`,
    '',
    `**${jobs.length} open roles** across ${companies.size} companies.`,
    '',
    '## How to use this file',
    '',
    `- Full description of one role: append \`.md\` to its URL, e.g. \`/jobs/${jobs[0]?.slug ?? '<slug>'}.md\`.`,
    '- Structured JSON with the same fields: `/api/jobs`. Filter with `?workplaceType=remote`,',
    '  `?employmentType=contract`, `?seniority=senior`, `?salaryMin=<annual>`, `?q=<text>`.',
    '- In this file only, add `?full` to inline every description: `/llms-jobs.txt?full`.',
    '- HTML for any route: append `.md` or send `Accept: text/markdown`.',
    '',
    '## Companies hiring',
    '',
    ...[...companies.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => `- ${name} — ${count} open ${count === 1 ? 'role' : 'roles'}`),
    ''
  ].join('\n')

  let body = sections.join('\n\n')

  if (full) {
    // Lowest ceiling first here, the reverse of the index: the weakest listings
    // are the ones a consumer has not already ruled out from the summary above.
    // Note the join happens before the spread — spreading the joined string
    // itself would splice it into individual characters.
    const documents = jobs
      .slice()
      .sort((a, b) => a.salary.max - b.salary.max)
      .map(job => jobToMarkdown(job, { origin, includeDescription: true }))
      .join('\n---\n\n')

    body += `\n\n---\n\n# Full descriptions\n\n${documents}`
  }

  setHeader(event, 'content-type', 'text/markdown; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400')

  return `${header}\n${body}\n`
})
