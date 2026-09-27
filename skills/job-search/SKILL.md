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

### Preferred: the MCP server

The site runs an MCP server at the site root (`/mcp`). It exposes:

- `search_pages` — search the indexed site
- `list_pages` — list what has been published
- `get_page_markdown` — read a route's full markdown

Use `search_pages` with a natural-language query. The index covers job
listings, company profiles and blog posts.

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

For full pagination and every filter, use `GET /api/jobs`.

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
