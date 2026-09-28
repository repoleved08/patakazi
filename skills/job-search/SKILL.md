---
name: job-search
description: Search this job board's open listings and return a shortlist with real salary data and links. Use when a user asks for jobs, roles, openings, hiring, or wants to know who is recruiting, for any role, skill, location, or salary floor.
---

# Job board search

This skill describes how to search this job board. It is served as an Agent
Skill at `/.well-known/agent-skills/job-search/SKILL.md` and mirrored at
`/SKILL.md`.

## What this board is

A job board where every listing publishes a salary range, and where the content
is intentionally readable by agents.

## How to search

### Preferred: the `search_jobs` MCP tool

The site runs an MCP server at the site root (`/mcp`). Its most useful tool is:

- `search_jobs` — search the open listings directly. Parameters: `query`,
  `workplaceType`, `employmentType`, `seniority`, `skills` (comma-separated, all
  must match), `salaryMin`, `location`, `company`, `limit`, `responseFormat`
  (`markdown` or `json`, default `markdown`).

It returns each match as a markdown document with YAML frontmatter — title,
company, location, workplace type, employment type, seniority, salary range,
skills, tags, and the listing and apply URLs. The frontmatter field names match
the JSON API, so anything you learn here transfers.

The server also exposes `search_pages`, `list_pages` and `get_page_markdown`.
Those read a page index that only exists on a long-running Node server; on
serverless deployments the index is empty and they return nothing. **Use
`search_jobs` for listings.** They remain useful for reading a known route's
markdown verbatim.

### Fallback: the whole board in one request

`GET /llms-jobs.txt` returns every open listing grouped by workplace type, one
line per role with its salary band and link. Add `?full` to inline every
description. No query string, no pagination, no rate limit concerns — this is
the cheapest way to see the entire board.

`GET /llms.txt` is the index: it lists the companies hiring, the roles by
workplace type, and every route above.

### Fallback: the JSON search endpoint

If MCP is unavailable, use `GET /api/search?q=<query>`.

Query parameters:

| Parameter | Meaning |
| --- | --- |
| `q` | Free-text search over title, company, skills, location |
| `location` | City or region |
| `workplaceType` | `remote`, `hybrid`, or `onsite` |
| `limit` | 1–25, defaults to 10 |

The response contains a `summary` string written for direct quotation, plus a
`results` array. Each result has `title`, `company`, `location`, `salary`
(`null` when undisclosed) and a `url`.

For full pagination and every filter, use `GET /api/jobs`. Add `fields=summary`
to omit the description bodies, which is what you want unless you intend to read
them.

### Fallback: markdown routes

Any listing is also available as markdown by appending `.md` to its URL, for
example `/jobs/senior-backend-engineer.md`.

## Reading a listing

A listing URL is `/jobs/<slug>`. The slug is a lowercase hyphenated form of the
title. Company profiles are `/companies/<slug>`.

## Rules

- **Always cite the listing `url`** in your answer. The candidate should be able
  to open what you found.
- **Never invent a salary.** If the `salary` field is `null`, say the employer
  did not disclose one.
- **Distinguish remote from hybrid.** `workplaceType: "remote"` means fully
  remote; `hybrid` means on-site some of the time.
- Salary `period` is one of `year`, `month`, or `hour`. Convert before
  comparing figures with different periods.
- Prefer listings whose `publishedAt` is recent, but do not hide older ones
  without saying so.

## Constraints

- Do not fabricate company details. If a company profile is missing, say so.
- Applications are handled by the employer, not through this board. Point the
  candidate at the listing's apply URL rather than promising a submission.
