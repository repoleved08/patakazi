import type { Job, JobSummary } from '../types/api'
import { formatSalary } from './salary'
import {
  labelForEmploymentType,
  labelForSeniority,
  labelForWorkplaceType
} from './format'

/**
 * Markdown serialisation of a job listing.
 *
 * One implementation feeds three surfaces, so an agent, a reader who copies the
 * text, and a crawler all see byte-identical content:
 *
 * - `/jobs/<slug>.md` served by nuxt-ai-ready
 * - the "Copy as Markdown" button on the job page
 * - the per-job section of `/llms-jobs.txt`
 *
 * The field names in the frontmatter are the public API. They are lower_snake_case
 * to match the JSON feed at `/api/jobs`, so an agent parses one shape rather
 * than two.
 */

/** Quotes a YAML scalar only when it needs it, so output stays readable. */
function yamlString(value: string): string {
  const text = value.trim()
  if (text === '') return '""'
  // Quote anything that would otherwise parse as a number, bool, null, or that
  // contains YAML punctuation at the edges.
  const needsQuotes = /^[\s>|*&!%@`'"[\]{},#?-]|[:#]\s|\s$|^$/.test(text)
    || /^(true|false|null|yes|no|on|off|~)$/i.test(text)
    || /^-?\d+(\.\d+)?$/.test(text)
  return needsQuotes ? `"${text.replace(/"/g, '\\"')}"` : text
}

function yamlList(values: string[] | undefined): string {
  if (!values?.length) return '[]'
  return `[${values.map(v => yamlString(v)).join(', ')}]`
}

export interface JobMarkdownOptions {
  /** Absolute origin, e.g. `https://patakazi.com`. Links are made absolute so a
   * copied or fetched document still resolves when read away from the site. */
  origin: string
  /** Include the full description. Off for index listings, where the summary
   * line plus a link is the better trade. */
  includeDescription?: boolean
}

function jobUrl(origin: string, slug: string): string {
  return `${origin.replace(/\/+$/, '')}/jobs/${slug}`
}

function companyUrl(origin: string, slug: string): string {
  return `${origin.replace(/\/+$/, '')}/companies/${slug}`
}

/** `Nairobi, Kenya · Hybrid · Full-time · Senior`, skipping anything empty. */
function jobHeadline(job: JobSummary): string {
  const parts = [
    job.location,
    labelForWorkplaceType(job.workplaceType),
    labelForEmploymentType(job.employmentType),
    job.seniority ? labelForSeniority(job.seniority) : ''
  ]

  // A level-1 internship lists "Internship" as both employment type and
  // seniority, which reads as a stutter in the one-line index. Collapsing
  // adjacent repeats keeps the line scannable without losing a distinction.
  return parts
    .filter(Boolean)
    .filter((part, index, all) => part !== all[index - 1])
    .join(' · ')
}

/** Frontmatter block describing a listing. */
export function jobFrontmatter(job: Job, options: JobMarkdownOptions): string {
  const origin = options.origin.replace(/\/+$/, '')
  const salary = job.salary

  const lines = [
    '---',
    `title: ${yamlString(job.title)}`,
    `company: ${yamlString(job.company.name)}`,
    `company_url: ${companyUrl(origin, job.company.slug)}`,
    `job_url: ${jobUrl(origin, job.slug)}`,
    `markdown_url: ${jobUrl(origin, job.slug)}.md`,
    `location: ${yamlString(job.location)}`,
    `workplace_type: ${yamlString(job.workplaceType)}`,
    `employment_type: ${yamlString(job.employmentType)}`,
    ...(job.seniority ? [`seniority: ${yamlString(job.seniority)}`] : []),
    // Salary is always present, including when hidden: `salary_visible: false`
    // is the signal, and omitting the numbers entirely would make "hidden" and
    // "not provided" indistinguishable to a consumer.
    `salary_visible: ${salary.visible}`,
    ...(salary.visible
      ? [
          `salary_min: ${salary.min}`,
          `salary_max: ${salary.max}`,
          `salary_currency: ${yamlString(salary.currency)}`,
          `salary_period: ${yamlString(salary.period)}`
        ]
      : []),
    `skills: ${yamlList(job.skills)}`,
    `tags: ${yamlList(job.tags)}`,
    `published_at: ${yamlString(job.publishedAt)}`,
    ...(job.expiresAt ? [`expires_at: ${yamlString(job.expiresAt)}`] : []),
    `featured: ${job.featured}`,
    ...(job.company.verified ? ['company_verified: true'] : []),
    ...(job.applyUrl ? [`apply_url: ${yamlString(job.applyUrl)}`] : []),
    ...(!job.applyUrl && job.applyEmail ? [`apply_email: ${yamlString(job.applyEmail)}`] : []),
    '---'
  ]

  return lines.join('\n')
}

/**
 * Full markdown document for one job: frontmatter, a summary block, and
 * optionally the complete description.
 */
export function jobToMarkdown(job: Job, options: JobMarkdownOptions): string {
  const parts: string[] = [jobFrontmatter(job, options)]

  parts.push('', `# ${job.title} — ${job.company.name}`, '')

  const details = [`**Role:** ${jobHeadline(job)}`]
  const salary = formatSalary(job.salary, 'en', { currencyDisplay: 'code' })
  details.push(`**Salary:** ${salary ?? 'Not disclosed'}`)
  if (job.skills.length) details.push(`**Skills:** ${job.skills.join(', ')}`)
  details.push(`**Company:** [${job.company.name}](${companyUrl(options.origin, job.company.slug)})`)
  details.push(`**Listing:** ${jobUrl(options.origin, job.slug)}`)
  if (job.applyUrl) details.push(`**Apply:** ${job.applyUrl}`)

  parts.push(details.join('  \n'), '')

  if (options.includeDescription !== false && job.description.trim()) {
    parts.push('## About this role', '', job.description.trim(), '')
  }

  // The company is referenced, not inlined. `JobSummary.company` is a summary
  // DTO with no description, and repeating the same bio on every one of a
  // company's listings would bloat the feed for no gain — `company_url` in the
  // frontmatter is the link.
  parts.push(
    `Listing maintained by [${job.company.name}](${companyUrl(options.origin, job.company.slug)}). Applications are handled by the employer.`,
    ''
  )

  return `${parts.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`
}

/**
 * One-line index entry.
 *
 * Deliberately dense: the feed lists every open role, so the goal is the most
 * useful facts per token — title, company, the location triple, salary, and a
 * link to the full document.
 */
export function jobToIndexLine(job: JobSummary, options: JobMarkdownOptions): string {
  const salary = formatSalary(job.salary, 'en', { compact: true, currencyDisplay: 'code' }) ?? 'salary not disclosed'
  const bits = [jobHeadline(job), salary]
  if (job.featured) bits.push('featured')

  return `- [${job.title} — ${job.company.name}](${jobUrl(options.origin, job.slug)}) — ${bits.join(' · ')}`
}

/**
 * Meta description for a listing.
 *
 * Built from structured fields rather than the description body. The body is
 * employer-written markdown, so slicing it produced meta descriptions that began
 * with `## About the role` and ran mid-sentence — bad for search results, and
 * worse for an agent reading the page's `.md`, where this string is the first
 * thing it sees.
 *
 * Kept under ~160 characters, which is where Google truncates.
 */
export function jobMetaDescription(job: JobSummary): string {
  const salary = formatSalary(job.salary, 'en', { currencyDisplay: 'code' })
  const facts = [jobHeadline(job), salary ?? 'Salary not disclosed']
  const skills = job.skills.slice(0, 6).join(', ')

  const sentence = `${job.title} at ${job.company.name} — ${facts.join(' · ')}.`
  const withSkills = skills ? `${sentence} Skills: ${skills}.` : sentence

  // Trim to a word boundary rather than mid-token if the skills push it over.
  if (withSkills.length <= 160) return withSkills

  const cut = withSkills.slice(0, 157)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 100 ? lastSpace : 157).trimEnd()}…`
}
