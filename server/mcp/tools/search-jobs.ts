import { z } from 'zod'
import { useEvent } from '#nuxtseo/nitro'
import { jobToMarkdown } from '#shared/utils/jobMarkdown'
import { jobQuerySchema } from '#shared/schemas'
import { EMPLOYMENT_TYPES, SENIORITY_LEVELS, WORKPLACE_TYPES } from '#shared/constants/job'
import { useJobService } from '../../services/job.service'

/**
 * MCP tool: search the open listings.
 *
 * This exists because the tools the AI module ships — `search_pages`,
 * `list_pages` — search its own page index, which is a local SQLite file. That
 * works on a long-lived Node process and nowhere else: on serverless the
 * filesystem is read-only and discarded between invocations, so the index is
 * always empty and those tools return nothing. This tool queries the listings
 * table directly, so it answers correctly wherever the app is deployed.
 *
 * Output is markdown rather than JSON on purpose: an agent that has to parse a
 * nested object to learn a salary and a location does more work than one handed
 * a flat document. `responseFormat: 'json'` switches that for callers that
 * genuinely want to post-process the result.
 */
export default defineMcpTool({
  name: 'search_jobs',
  title: 'Search open job listings',
  description:
    'Search Patakazi\'s open job listings. Every listing publishes its salary range. '
    + 'Returns matching roles with title, company, location, workplace type, employment type, '
    + 'seniority, salary band, skills and a link. Read-only: this board does not receive applications.',
  inputSchema: {
    query: z.string().max(200).optional().describe('Free text matched against title, skills, tags and description.'),
    workplaceType: z.enum(WORKPLACE_TYPES).optional().describe('remote, hybrid or onsite.'),
    employmentType: z.enum(EMPLOYMENT_TYPES).optional().describe('For example full_time, contract, internship.'),
    seniority: z.enum(SENIORITY_LEVELS).optional().describe('For example junior, mid, senior, lead.'),
    skills: z.string().max(300).optional().describe('Comma-separated skills. A role must have every skill listed to match.'),
    salaryMin: z.number().int().nonnegative().optional().describe('Minimum acceptable figure, in the listing\'s own currency per year.'),
    location: z.string().max(120).optional().describe('Match against the location field.'),
    company: z.string().max(120).optional().describe('Company name, matched loosely.'),
    limit: z.number().int().min(1).max(25).optional().default(10).describe('Maximum listings to return.'),
    responseFormat: z.enum(['markdown', 'json']).optional().default('markdown')
  },
  annotations: {
    readOnlyHint: true,
    openWorldHint: false
  },
  // Listings change a few times a week; five minutes keeps repeated searches
  // cheap without showing a role that was closed earlier today.
  cache: '5m',
  inputExamples: [
    { query: 'typescript', workplaceType: 'remote', salaryMin: 80000 },
    { skills: 'python,postgresql', seniority: 'senior' },
    { responseFormat: 'json', limit: 25 }
  ],

  async handler(input) {
    const event = useEvent()

    // Reuse the public query schema rather than reimplementing the filters, so
    // an MCP caller and an HTTP caller cannot diverge.
    const parsed = jobQuerySchema.safeParse({
      q: input.query,
      workplaceType: input.workplaceType,
      employmentType: input.employmentType,
      seniority: input.seniority,
      skills: input.skills,
      salaryMin: input.salaryMin,
      location: input.location,
      companyId: undefined,
      perPage: input.limit,
      // Descriptions are needed: the markdown body carries them.
      fields: 'full'
    })

    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid search',
        data: parsed.error.flatten()
      })
    }

    // Explicit type argument: the schema output types `fields` as a union, so
    // the return type would otherwise widen to `Job | JobSummary` and the
    // description would not be reachable below.
    let result = await useJobService(event).listPublic<'full'>({ ...parsed.data, fields: 'full' })

    // `company` is a convenience the HTTP API does not offer, because filtering
    // by name needs a join the list query does not do. Resolving it here keeps
    // the common "who is hiring" question to one round trip.
    const wanted = input.company?.trim().toLowerCase()
    if (wanted) {
      result = {
        ...result,
        data: result.data.filter(job => job.company.name.toLowerCase().includes(wanted))
      }
    }

    if (result.data.length === 0) {
      // `result.total` counts the *filtered* set, so it says nothing about the
      // rest of the board. Claiming the board is empty here would be wrong on
      // every narrow search.
      return {
        content: [{
          type: 'text',
          text: 'No open listings match those filters. Try widening the workplace type, dropping '
            + '`salaryMin`, or shortening the query. The full board, grouped by workplace type, is at '
            + '/llms-jobs.txt.'
        }]
      }
    }

    const origin = getRequestURL(event).origin

    if (input.responseFormat === 'json') {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ total: result.total, returned: result.data.length, jobs: result.data }, null, 2)
        }]
      }
    }

    const body = result.data
      .map(job => jobToMarkdown(job, { origin, includeDescription: true }))
      .join('\n---\n\n')

    return {
      content: [{
        type: 'text',
        text: `${result.data.length} of ${result.total} open listings.\n\n${body}`
      }]
    }
  }
})
