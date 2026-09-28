-- ===========================================================================
-- Demo seed.
--
-- Generated content for local development and demos. Run with:
--
--   supabase db reset          (local)
--
-- Idempotent: keyed on the slug column, so re-running updates rather than duplicating.
-- The search_vector column is deliberately not inserted; the jobs_search_trigger
-- maintains it.
--
-- owner_id and created_by point at the demo admin account. If that account does
-- not exist (a fresh local database), they are set to NULL by the guard below, and
-- the listings still publish because public reads do not require an owner.
-- ===========================================================================

-- --- Companies ---------------------------------------------------------------

insert into companies (id, name, slug, description, website, industry, size, founded, location, services, working_hours, logo_id, owner_id, verified)
values
  ('c0000001-0000-4000-8000-000000000001', 'Safaricom', 'safaricom', 'Safaricom is East Africa''s leading telecommunications operator and a flagship Kenya business, connecting more than 40 million customers across mobile, broadband, and financial services.

The company runs a large technology organisation in Nairobi: network engineering, M-PESA and fintech platforms, enterprise cloud, data and analytics, and customer experience. Its technology teams ship software that has to stay available on low-end Android devices and unreliable networks, which makes engineering quality and performance discipline unusually concrete.

**What Safaricom works on**

- Mobile voice and data networks, and the fixed and fibre backbone underneath them
- M-PESA, the mobile money and fintech platform used across Kenya and neighbouring markets
- Enterprise connectivity, cloud, and managed network services for businesses
- Data platforms that turn network, transaction, and customer telemetry into decisions

**Why it is a good place to build agent-readable software**

Safaricom operates at national scale in a market where most users are on mobile data. Teams here routinely optimise for the slowest connection and the cheapest device in the room rather than for a fast office network.', 'https://www.safaricom.co.ke', 'Telecommunications', '5000_plus', 1997, 'Nairobi, Kenya', 'Mobile network and broadband
M-PESA mobile money and fintech
Enterprise connectivity and managed networks
Cloud and hosting services
Customer and network data analytics
Developer platforms and public APIs', 'Monday to Friday, 08:00–17:00 East Africa Time (EAT, UTC+3)
Hybrid: teams are in the office two to three days a week
On-call is shared within engineering rotations and compensated', '', '0af97a37-bee3-4308-92e2-2444bc9ef6b3', true),
  ('c0000002-0000-4000-8000-000000000002', 'M-KOPA', 'm-kopa', 'M-KOPA is a fintech company that sells smartphones, solar systems, and productive assets on flexible daily, weekly, and monthly payment plans, with more than three million active customers across Africa.

Roughly 70% of M-KOPA''s customers have never held a bank account, so the product is built around USSD and low-end Android rather than desktop web. The engineering challenge is less about scale for its own sake and more about making a credit and logistics business work on a $40 handset and an intermittent connection.

**What M-KOPA works on**

- Asset financing and credit scoring for customers without formal credit history
- Agent and field operations tooling used across six markets
- Payments and collections, including mobile money integrations
- Customer support, identity verification, and fraud prevention', 'https://m-kopa.com', 'Fintech', '1001_5000', 2011, 'Nairobi, Kenya', 'Asset financing (smartphones, solar, productive assets)
Credit scoring and underwriting
Mobile money and payments
Field agent operations platform
Customer identity and fraud prevention', 'Monday to Friday, 08:30–17:30 EAT
Hybrid: three days in the Nairobi office, two days remote
Some engineering teams support US and LATAM customers on a later shift', '', '0af97a37-bee3-4308-92e2-2444bc9ef6b3', true),
  ('c0000003-0000-4000-8000-000000000003', 'Twiga Foods', 'twiga-foods', 'Twiga Foods is an agritech marketplace that collects fresh produce directly from smallholder farmers and delivers it to restaurants and retailers across Kenya, moving tens of thousands of kilograms every week.

The interesting part of the business is the last mile. Orders from restaurants are consolidated into collection routes, matched to farmers who have the volume and the crop, and then picked and delivered within hours of harvest. That means the software is a scheduling and logistics system before it is anything else.

**What Twiga Foods works on**

- Demand forecasting and order consolidation for restaurants and retail
- Farmer supply matching, pricing, and collection scheduling
- Route planning and last-mile delivery operations
- Quality grading, traceability, and cold-chain handling', 'https://twiga.com', 'Agritech & Logistics', '501_1000', 2014, 'Nairobi, Kenya', 'Fresh produce aggregation and distribution
Restaurant and retail supply
Farmer marketplace and pricing
Last-mile delivery and route planning
Produce traceability and quality grading', 'Monday to Saturday, 07:00–19:00 EAT, because produce moves early
Hybrid: warehouse and field teams start earlier than office teams
Market-day coverage means weekend availability during peak weeks', '', '0af97a37-bee3-4308-92e2-2444bc9ef6b3', true),
  ('c0000004-0000-4000-8000-000000000004', 'Sendy', 'sendy', 'Sendy is an on-demand logistics platform that matches businesses needing to move freight in Nairobi with a network of independent motorcycle and van riders, tracked in real time from pickup to proof of delivery.

Freight matching in a dense city like Nairobi is a routing problem with a lot of edge cases: a rider''s phone dies mid-delivery, an address does not resolve, a parcel is rejected on arrival. The engineering team spends most of its time on dispatch, pricing, and the reliability of the tracking surface that customers use to see where their goods are.

**What Sendy works on**

- Freight dispatch, rider allocation, and route optimisation
- Real-time tracking, ETAs, and proof of delivery
- Pricing, quoting, and payment collection
- Enterprise accounts and API integrations for regular shippers', 'https://sendyit.com', 'Logistics', '201_500', 2015, 'Nairobi, Kenya', 'On-demand motorcycle and van freight
Real-time tracking and proof of delivery
Freight quoting and pricing
Enterprise logistics API
Rider and driver marketplace', 'Monday to Saturday, 08:00–19:00 EAT
Hybrid: two office days per week
Dispatch and support are covered in shifts, including one weekend day', '', '0af97a37-bee3-4308-92e2-2444bc9ef6b3', true),
  ('c0000005-0000-4000-8000-000000000005', 'Cellulant', 'cellulant', 'Cellulant is a payments infrastructure provider that connects banks, mobile money operators, and fintechs to a single collection and payout API across more than thirty African markets.

Its customers are regulated institutions, so the engineering bar is different from a consumer app: audit trails, idempotency, reconciliation, and uptime guarantees are part of the product rather than an afterthought. Teams work across time zones, and the Nairobi office is the East African engineering hub.

**What Cellulant works on**

- Collections and payouts APIs for banks, mobile money, and merchants
- Payment orchestration, routing, and retries
- Reconciliation, settlement, and regulatory reporting
- Platform reliability, observability, and compliance tooling', 'https://cellulant.io', 'Payments', '501_1000', 2004, 'Lagos, Nigeria and Nairobi, Kenya', 'Payment collections and payouts
Payment orchestration and smart routing
Reconciliation and settlement
Regulatory and compliance reporting
Mobile money and bank integrations', 'Monday to Friday, 09:00–18:00 WAT (UTC+1) / 09:00–18:00 EAT (UTC+3)
Hybrid: three office days per week in Nairobi
Follow-the-sun on-call across Lagos, Nairobi, and partner markets', '', '0af97a37-bee3-4308-92e2-2444bc9ef6b3', true),
  ('c0000006-0000-4000-8000-000000000006', 'iHub Nairobi', 'ihub-nairobi', 'iHub Nairobi is one of Africa''s oldest technology incubators, a co-working and research community in Kileleshwa that has hosted hundreds of startups and runs programmes for founders and early technical hires.

Because it operates more like a community than a corporation, the work is wide: internal platforms, programme tooling, events, and building alongside the startups in the building. It is a good fit for someone early in their career who wants breadth and ownership rather than a narrow specialism.

**What iHub Nairobi works on**

- Incubator programmes, mentorship, and founder support
- Community events, workshops, and training
- Shared infrastructure for resident startups
- Research and partnerships with universities and NGOs', 'https://ihub.co.ke', 'Technology Incubator', '11_50', 2010, 'Nairobi, Kenya', 'Startup incubation and acceleration
Mentorship and founder support
Co-working space and community
Technical workshops and training
Partnerships with universities and NGOs', 'Monday to Friday, 09:00–18:00 EAT
Mostly onsite, with flexible hours around community events
Some evening and weekend work during programme launches', '', '0af97a37-bee3-4308-92e2-2444bc9ef6b3', false)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  website = excluded.website,
  industry = excluded.industry,
  size = excluded.size,
  founded = excluded.founded,
  location = excluded.location,
  services = excluded.services,
  working_hours = excluded.working_hours,
  verified = excluded.verified;

-- --- Jobs --------------------------------------------------------------------
-- One non-published listing so the dashboard, the "not open" alert, and the
-- draft/closed paths have something to render.

insert into jobs (id, title, slug, description, company_id, company_name, company_slug, company_logo_id, location, workplace_type, employment_type, seniority, salary_min, salary_max, salary_currency, salary_period, salary_visible, skills, tags, apply_url, apply_email, status, published_at, expires_at, views, featured, created_by)
values
  ('d0000001-0000-4000-8000-000000000001', 'Senior Frontend Engineer — Agent-Readable Listings', 'safaricom-senior-frontend-engineer', '## About the role

Safaricom is looking for a senior frontend engineer to own the public-facing web surfaces where job listings, company profiles, and pricing are published. The team is deliberately small and the work is visible: what you ship is what millions of people see, including on a two-year-old Android phone with a metered connection.

This is a role for someone who treats performance, accessibility, and structured data as product features rather than cleanup tasks. You will work alongside backend and data engineers who expose the salary bands, skills, and locations that both the UI and the public APIs read from.

## What you''ll do

- Build and maintain the component library that renders job cards, company profiles, search results, and detail pages across web and mobile web.
- Own Core Web Vitals for public pages, including a concrete performance budget enforced in CI on real mid-range Android hardware profiles.
- Make every listing page emit correct JSON-LD structured data so search engines and AI agents can parse salary, location, and skills without scraping.
- Keep the interface usable on small screens and slow connections, including navigation, filters, and long-form job descriptions.
- Pair with backend engineers on the API shapes the UI consumes, and give design a component API that does not need a bespoke page for every new pattern.
- Write tests for the behaviour that matters to candidates: filtering, saving a job, and reading a salary band on a 360px screen.

## What you''ll bring

**Required**

- 5+ years building production web applications, with at least two on a framework you own end to end.
- Deep TypeScript, and real depth in Vue or Nuxt rather than familiarity.
- Practical accessibility knowledge, WCAG 2.1 AA, and keyboard-first interaction patterns.
- Experience measuring and improving real-user performance, not just bundle size.
- Comfort working in a regulated, high-traffic environment with other engineers rather than in isolation.

**Nice to have**

- Experience exposing structured data (JobPosting, Organization) and maintaining a public API or MCP surface.
- Familiarity with Postgres and a typed data layer such as Supabase.
- Contributions to open source, or writing you would be happy to link to in an interview.

## Compensation and benefits

- **Published salary range:** $95,000 – $140,000 USD per year, before tax. This is the real band, not a placeholder.
- Medical cover for you, your partner, and dependants, plus a life assurance policy.
- A published salary band, reviewed annually against market data.
- Hybrid schedule: two to three days in the Nairobi office, the rest wherever you work well.

## Working arrangements

- **Location:** Nairobi, Kenya
- **Workplace:** hybrid
- **Employment type:** full time

## About Safaricom

Safaricom is East Africa''s leading telecommunications operator and a flagship Kenya business, connecting more than 40 million customers across mobile, broadband, and financial services.

The company runs a large technology organisation in Nairobi: network engineering, M-PESA and fintech platforms, enterprise cloud, data and analytics, and customer experience. Its technology teams ship software that has to stay available on low-end Android devices and unreliable networks, which makes engineering quality and performance discipline unusually concrete.

**What Safaricom works on**

- Mobile voice and data networks, and the fixed and fibre backbone underneath them
- M-PESA, the mobile money and fintech platform used across Kenya and neighbouring markets
- Enterprise connectivity, cloud, and managed network services for businesses
- Data platforms that turn network, transaction, and customer telemetry into decisions

**Why it is a good place to build agent-readable software**

Safaricom operates at national scale in a market where most users are on mobile data. Teams here routinely optimise for the slowest connection and the cheapest device in the room rather than for a fast office network.

## How to apply

Apply on the Safaricom careers page or by email. This listing is published on Patakazi, an agent-readable job board, so you can also hand the structured listing to an assistant and get a shortlist instead of a wall of text.

**Safaricom** — Telecommunications · 5000 plus · founded 1997 · Nairobi, Kenya
', 'c0000001-0000-4000-8000-000000000001', 'Safaricom', 'safaricom', '', 'Nairobi, Kenya', 'hybrid', 'full_time', 'senior', 95000, 140000, 'USD', 'year', true, array['nuxt', 'typescript', 'vue', 'tailwind', 'accessibility'], array['agent-ready', 'salary-transparent', 'performance'], 'https://safaricom.example/careers', 'careers@safaricom.example', 'published', '2026-09-27T07:12:40.399Z', '2026-11-27T07:12:40.400Z', 1243, true, '0af97a37-bee3-4308-92e2-2444bc9ef6b3'),
  ('d0000001-0000-4000-8000-000000000002', 'Data Engineer — Listings and Salary Transparency', 'safaricom-data-engineer-listings', '## About the role

Safaricom is hiring a data engineer to build the pipelines that turn raw hiring data into a clean, queryable, agent-readable layer. The output is not a dashboard for managers; it is the structured layer that both the public site and automated agents depend on to answer questions like "what does a senior data engineer earn at Safaricom, and where do they work?".

You will work with product and backend engineers on the shape of the tables, and you will own the indexes, freshness guarantees, and quality checks that make the layer trustworthy.

## What you''ll do

- Design and operate ingestion pipelines that normalise job, company, and salary data into the canonical tables the platform reads.
- Keep search fast: maintain full-text and GIN indexes and verify the plan for every query pattern the API generates.
- Define data quality checks and freshness SLAs, and make failures visible instead of silent.
- Publish aggregates that power salary transparency pages without exposing a full scan to every request.
- Document the data model well enough that an agent or a new engineer can answer questions about it without a meeting.

## What you''ll bring

**Required**

- 4+ years in data engineering, with strong Python and SQL.
- Deep Postgres knowledge: indexing, query plans, partitioning, and isolation.
- Production experience with a scheduler or orchestrator such as Airflow, Dagster, or dbt.
- A habit of validating data quality rather than assuming the upstream is correct.

**Nice to have**

- Experience building a public or partner-facing data API.
- Familiarity with search relevance, tsvector ranking, or vector search.
- Interest in making data legible to language models.

## Compensation and benefits

- **Published salary range:** $88,000 – $132,000 USD per year, before tax. This is the real band, not a placeholder.
- Fully remote within East Africa, with two optional on-site days per quarter.
- Published salary band and an annual review.
- Conference or training budget with five days of dedicated learning time a year.

## Working arrangements

- **Location:** Nairobi, Kenya
- **Workplace:** remote
- **Employment type:** full time

## About Safaricom

Safaricom is East Africa''s leading telecommunications operator and a flagship Kenya business, connecting more than 40 million customers across mobile, broadband, and financial services.

The company runs a large technology organisation in Nairobi: network engineering, M-PESA and fintech platforms, enterprise cloud, data and analytics, and customer experience. Its technology teams ship software that has to stay available on low-end Android devices and unreliable networks, which makes engineering quality and performance discipline unusually concrete.

**What Safaricom works on**

- Mobile voice and data networks, and the fixed and fibre backbone underneath them
- M-PESA, the mobile money and fintech platform used across Kenya and neighbouring markets
- Enterprise connectivity, cloud, and managed network services for businesses
- Data platforms that turn network, transaction, and customer telemetry into decisions

**Why it is a good place to build agent-readable software**

Safaricom operates at national scale in a market where most users are on mobile data. Teams here routinely optimise for the slowest connection and the cheapest device in the room rather than for a fast office network.

## How to apply

Apply on the Safaricom careers page or by email. This listing is published on Patakazi, an agent-readable job board, so you can also hand the structured listing to an assistant and get a shortlist instead of a wall of text.

**Safaricom** — Telecommunications · 5000 plus · founded 1997 · Nairobi, Kenya
', 'c0000001-0000-4000-8000-000000000001', 'Safaricom', 'safaricom', '', 'Nairobi, Kenya', 'remote', 'full_time', 'senior', 88000, 132000, 'USD', 'year', true, array['postgresql', 'python', 'sql', 'airflow', 'data-engineering'], array['agent-ready', 'salary-transparent', 'remote-first'], 'https://safaricom.example/careers', 'careers@safaricom.example', 'published', '2026-09-24T07:12:40.400Z', '2026-11-12T07:12:40.400Z', 612, false, '0af97a37-bee3-4308-92e2-2444bc9ef6b3'),
  ('d0000001-0000-4000-8000-000000000003', 'Backend Engineer — M-PESA Payments Platform', 'safaricom-backend-engineer-mpesa', '## About the role

This role sits inside the engineering team that keeps M-PESA transaction processing available. The systems are high throughput, heavily audited, and unforgiving of subtle errors: an idempotency mistake is a support escalation, and an availability mistake is a national story.

We are looking for an engineer who is comfortable in that environment and wants their work to be boring in the best possible way.

## What you''ll do

- Build and maintain services in the transaction processing path, with idempotency and reconciliation as first-class requirements.
- Write services that are safe to deploy on a Friday: feature flags, staged rollouts, and backward-compatible schemas.
- Instrument services so that on-call engineers can tell a real outage from a traffic spike in under five minutes.
- Take part in a fair, well-trodden on-call rotation, and fix the things that made it noisy.
- Review designs for auditability, because external auditors read this code.

## What you''ll bring

**Required**

- 3+ years building backend services in production.
- Strong in one of Go, Java, Kotlin, or Python, and comfort with the trade-offs of each.
- Working knowledge of distributed systems: idempotency, retries, consistency, and queues.
- Experience operating services in Kubernetes or a comparable environment.

**Nice to have**

- Payments or ledger experience, particularly around reconciliation.
- Observability tooling you have actually relied on during an incident.
- Performance work on a hot path.

## Compensation and benefits

- **Published salary range:** $70,000 – $105,000 USD per year, before tax. This is the real band, not a placeholder.
- On-site in Nairobi with subsidised transport and a subsidised cafeteria.
- Medical cover for the whole family.
- Structured on-call allowance and time off in lieu.

## Working arrangements

- **Location:** Nairobi, Kenya
- **Workplace:** onsite
- **Employment type:** full time

## About Safaricom

Safaricom is East Africa''s leading telecommunications operator and a flagship Kenya business, connecting more than 40 million customers across mobile, broadband, and financial services.

The company runs a large technology organisation in Nairobi: network engineering, M-PESA and fintech platforms, enterprise cloud, data and analytics, and customer experience. Its technology teams ship software that has to stay available on low-end Android devices and unreliable networks, which makes engineering quality and performance discipline unusually concrete.

**What Safaricom works on**

- Mobile voice and data networks, and the fixed and fibre backbone underneath them
- M-PESA, the mobile money and fintech platform used across Kenya and neighbouring markets
- Enterprise connectivity, cloud, and managed network services for businesses
- Data platforms that turn network, transaction, and customer telemetry into decisions

**Why it is a good place to build agent-readable software**

Safaricom operates at national scale in a market where most users are on mobile data. Teams here routinely optimise for the slowest connection and the cheapest device in the room rather than for a fast office network.

## How to apply

Apply on the Safaricom careers page or by email. This listing is published on Patakazi, an agent-readable job board, so you can also hand the structured listing to an assistant and get a shortlist instead of a wall of text.

**Safaricom** — Telecommunications · 5000 plus · founded 1997 · Nairobi, Kenya
', 'c0000001-0000-4000-8000-000000000001', 'Safaricom', 'safaricom', '', 'Nairobi, Kenya', 'onsite', 'full_time', 'mid', 70000, 105000, 'USD', 'year', true, array['go', 'postgresql', 'kubernetes', 'kafka', 'microservices'], array['payments', 'reliability', 'high-scale'], 'https://safaricom.example/careers', 'careers@safaricom.example', 'published', '2026-09-19T07:12:40.400Z', '2026-10-28T07:12:40.400Z', 903, false, '0af97a37-bee3-4308-92e2-2444bc9ef6b3'),
  ('d0000001-0000-4000-8000-000000000004', 'Product Manager — Small Business and USSD', 'safaricom-product-manager-usd', '## About the role

Safaricom wants a product manager for the small-business and USSD portfolio: the flows through which a shop owner without a smartphone checks a balance, pays a supplier, or gets a mobile money statement.

This is product work in the hardest sense. There is no modern browser to optimise for, session lengths are measured in keypresses, and the constraint is often the cost of a USSD interaction rather than what a customer would ideally see. You will be the one deciding what to cut.

## What you''ll do

- Own a roadmap spanning USSD, mobile web, and the small-business app, and explain the trade-offs in plain language.
- Run field research with shop owners and agents, in Swahili and in their own premises, rather than only in the office.
- Define the metric that matters for each initiative, and hold the team to it after launch.
- Work with network and cost teams, because some product decisions are really tariff decisions.
- Write clear briefs that an engineer can implement without a follow-up meeting for every edge case.

## What you''ll bring

**Required**

- 4+ years in product management, at least one of them in a mobile or payments context.
- Genuine comfort with USSD or feature-phone constraints, or a strong willingness to learn them.
- Fluency in data: you can write your own SQL and interrogate it.
- Experience running discovery with users who are not early adopters.

**Nice to have**

- A second East African language.
- Background in agent or SME banking.
- Experience owning a product with per-transaction unit costs.

## Compensation and benefits

- **Published salary range:** $90,000 – $130,000 USD per year, before tax. This is the real band, not a placeholder.
- Published salary band.
- Hybrid schedule with field days budgeted into the quarter, not squeezed into evenings.
- Tuition support for a relevant qualification.

## Working arrangements

- **Location:** Nairobi, Kenya
- **Workplace:** hybrid
- **Employment type:** full time

## About Safaricom

Safaricom is East Africa''s leading telecommunications operator and a flagship Kenya business, connecting more than 40 million customers across mobile, broadband, and financial services.

The company runs a large technology organisation in Nairobi: network engineering, M-PESA and fintech platforms, enterprise cloud, data and analytics, and customer experience. Its technology teams ship software that has to stay available on low-end Android devices and unreliable networks, which makes engineering quality and performance discipline unusually concrete.

**What Safaricom works on**

- Mobile voice and data networks, and the fixed and fibre backbone underneath them
- M-PESA, the mobile money and fintech platform used across Kenya and neighbouring markets
- Enterprise connectivity, cloud, and managed network services for businesses
- Data platforms that turn network, transaction, and customer telemetry into decisions

**Why it is a good place to build agent-readable software**

Safaricom operates at national scale in a market where most users are on mobile data. Teams here routinely optimise for the slowest connection and the cheapest device in the room rather than for a fast office network.

## How to apply

Apply on the Safaricom careers page or by email. This listing is published on Patakazi, an agent-readable job board, so you can also hand the structured listing to an assistant and get a shortlist instead of a wall of text.

**Safaricom** — Telecommunications · 5000 plus · founded 1997 · Nairobi, Kenya
', 'c0000001-0000-4000-8000-000000000001', 'Safaricom', 'safaricom', '', 'Nairobi, Kenya', 'hybrid', 'full_time', 'lead', 90000, 130000, 'USD', 'year', true, array['product-management', 'sql', 'user-research', 'analytics'], array['fintech', 'emerging-markets', 'customer-facing'], 'https://safaricom.example/careers', 'careers@safaricom.example', 'published', '2026-09-12T07:12:40.400Z', '2026-11-27T07:12:40.400Z', 431, false, '0af97a37-bee3-4308-92e2-2444bc9ef6b3'),
  ('d0000001-0000-4000-8000-000000000005', 'Senior Backend Engineer — Credit and Collections', 'm-kopa-senior-backend-engineer-credit', '## About the role

M-KOPA''s credit engine decides who gets a financed phone, and its collections system decides what happens when someone falls behind. Both are built on repayment behaviour rather than credit history, because our customers have no credit file. That makes the engineering interesting: the rules are subtle, the data is behavioural, and the consequences of a bug are real people''s devices.

We are looking for a senior engineer who can own a system end to end and reason carefully about correctness in a domain where rounding errors and timezone bugs become actual losses.

## What you''ll do

- Own services behind credit decisions, disbursement, and repayment collection, and keep their behaviour predictable under change.
- Make state machines explicit: a loan is a sequence of transitions, and every illegal transition should be impossible, not merely discouraged.
- Build idempotency into anything that moves money or touches a mobile money provider.
- Add the test coverage that lets a new engineer change pricing logic without fear.
- Participate in incident review and carry the follow-through to completion.

## What you''ll bring

**Required**

- 5+ years of backend engineering, including at least one system in a financial or transactional domain.
- Strong Python and relational database design, including transactions and locking.
- Experience with asynchronous work: queues, retries, dead letters, and idempotent consumers.
- Clear written communication, because half the job is aligning with risk and finance teams.

**Nice to have**

- Experience with mobile money integrations such as M-PESA.
- Familiarity with a cloud-native deployment workflow you have debugged under pressure.
- Interest in credit policy and how it is operationalised.

## Compensation and benefits

- **Published salary range:** $78,000 – $115,000 USD per year, before tax. This is the real band, not a placeholder.
- Published salary band, adjusted twice a year against market data.
- Medical, dental, and life cover for you and your dependants.
- Hybrid: three days in the office, two fully remote, negotiable per team.

## Working arrangements

- **Location:** Nairobi, Kenya
- **Workplace:** hybrid
- **Employment type:** full time

## About M-KOPA

M-KOPA is a fintech company that sells smartphones, solar systems, and productive assets on flexible daily, weekly, and monthly payment plans, with more than three million active customers across Africa.

Roughly 70% of M-KOPA''s customers have never held a bank account, so the product is built around USSD and low-end Android rather than desktop web. The engineering challenge is less about scale for its own sake and more about making a credit and logistics business work on a $40 handset and an intermittent connection.

**What M-KOPA works on**

- Asset financing and credit scoring for customers without formal credit history
- Agent and field operations tooling used across six markets
- Payments and collections, including mobile money integrations
- Customer support, identity verification, and fraud prevention

## How to apply

Apply on the M-KOPA careers page or by email. This listing is published on Patakazi, an agent-readable job board, so you can also hand the structured listing to an assistant and get a shortlist instead of a wall of text.

**M-KOPA** — Fintech · 1001 5000 · founded 2011 · Nairobi, Kenya
', 'c0000002-0000-4000-8000-000000000002', 'M-KOPA', 'm-kopa', '', 'Nairobi, Kenya', 'hybrid', 'full_time', 'senior', 78000, 115000, 'USD', 'year', true, array['python', 'postgresql', 'fastapi', 'celery', 'aws'], array['fintech', 'lending', 'salary-transparent'], 'https://m-kopa.example/careers', 'careers@m-kopa.example', 'published', '2026-09-26T07:12:40.400Z', '2026-11-12T07:12:40.400Z', 1587, true, '0af97a37-bee3-4308-92e2-2444bc9ef6b3'),
  ('d0000001-0000-4000-8000-000000000006', 'Android Engineer — Customer App', 'm-kopa-android-engineer', '## About the role

M-KOPA''s customer app is used on low-end Android devices across six markets, often on 2G-equivalent connections with limited storage. Making it feel fast and reliable under those conditions is the actual product challenge, and it is a more interesting constraint than most app teams work under.

This role sits in the mobile team building the app customers use to pay, view their balance, and manage their account.

## What you''ll do

- Build and maintain customer-facing screens in Kotlin and Jetpack Compose.
- Own offline behaviour: the app must degrade gracefully when the network drops mid-payment.
- Keep the install size and memory footprint low enough for the devices our customers actually own.
- Write instrumentation tests for the flows where a bug costs a real payment.
- Work with the backend team on the API contract, and say clearly when it is the API that needs to change.

## What you''ll bring

**Required**

- 3+ years of Android development in production.
- Kotlin, modern Android architecture patterns, and a testing practice you would defend in review.
- Genuine empathy for low-end devices and constrained networks.

**Nice to have**

- Experience with mobile money or payments flows.
- Performance profiling work that produced measurable improvements.
- CI and release engineering experience.

## Compensation and benefits

- **Published salary range:** $65,000 – $95,000 USD per year, before tax. This is the real band, not a placeholder.
- Fully remote across East Africa, with two optional meetups a year in Nairobi.
- Published salary band.
- Device budget and a home office setup allowance.

## Working arrangements

- **Location:** Remote, East Africa
- **Workplace:** remote
- **Employment type:** full time

## About M-KOPA

M-KOPA is a fintech company that sells smartphones, solar systems, and productive assets on flexible daily, weekly, and monthly payment plans, with more than three million active customers across Africa.

Roughly 70% of M-KOPA''s customers have never held a bank account, so the product is built around USSD and low-end Android rather than desktop web. The engineering challenge is less about scale for its own sake and more about making a credit and logistics business work on a $40 handset and an intermittent connection.

**What M-KOPA works on**

- Asset financing and credit scoring for customers without formal credit history
- Agent and field operations tooling used across six markets
- Payments and collections, including mobile money integrations
- Customer support, identity verification, and fraud prevention

## How to apply

Apply on the M-KOPA careers page or by email. This listing is published on Patakazi, an agent-readable job board, so you can also hand the structured listing to an assistant and get a shortlist instead of a wall of text.

**M-KOPA** — Fintech · 1001 5000 · founded 2011 · Nairobi, Kenya
', 'c0000002-0000-4000-8000-000000000002', 'M-KOPA', 'm-kopa', '', 'Remote, East Africa', 'remote', 'full_time', 'mid', 65000, 95000, 'USD', 'year', true, array['kotlin', 'android', 'jetpack-compose', 'mvvm', 'testing'], array['mobile', 'low-bandwidth', 'fintech'], 'https://m-kopa.example/careers', 'careers@m-kopa.example', 'published', '2026-09-22T07:12:40.400Z', '2026-11-12T07:12:40.400Z', 743, false, '0af97a37-bee3-4308-92e2-2444bc9ef6b3'),
  ('d0000001-0000-4000-8000-000000000007', 'Data Scientist — Credit Risk Modelling', 'm-kopa-data-scientist-risk', '## About the role

M-KOPA is hiring a data scientist to improve how we assess credit for customers who have no conventional credit history. The data is behavioural: repayment patterns, USSD interaction, device characteristics, and consistency of cash flow. The work is closer to applied risk than to research, and every model decision has to be explainable to a risk manager and defensible to a regulator.

This is a role for someone who wants their models to affect real decisions, and who is equally comfortable arguing about calibration as about architecture.

## What you''ll do

- Develop and maintain models for credit scoring and repayment forecasting, with a bias and fairness review on every release.
- Validate models against realised outcomes, and write down where they fail.
- Work with risk and collections to turn model output into an operational decision, not a report.
- Build the monitoring that catches drift before it costs money.
- Explain model behaviour clearly to non-technical stakeholders, including where the model is least reliable.

## What you''ll bring

**Required**

- 4+ years in applied data science with production models.
- Strong Python and SQL, and real statistics rather than familiarity with the words.
- Experience with imbalanced outcomes and class-imbalance-aware evaluation.
- Rigour about fairness, explainability, and documentation.

**Nice to have**

- Credit risk, lending, or collections experience.
- Experience with a formal model governance process.
- Ability to prototype quickly in a notebook and then productionise.

## Compensation and benefits

- **Published salary range:** $82,000 – $120,000 USD per year, before tax. This is the real band, not a placeholder.
- Published salary band.
- Hybrid schedule, three days on site.
- Conference attendance and a research budget.

## Working arrangements

- **Location:** Nairobi, Kenya
- **Workplace:** hybrid
- **Employment type:** full time

## About M-KOPA

M-KOPA is a fintech company that sells smartphones, solar systems, and productive assets on flexible daily, weekly, and monthly payment plans, with more than three million active customers across Africa.

Roughly 70% of M-KOPA''s customers have never held a bank account, so the product is built around USSD and low-end Android rather than desktop web. The engineering challenge is less about scale for its own sake and more about making a credit and logistics business work on a $40 handset and an intermittent connection.

**What M-KOPA works on**

- Asset financing and credit scoring for customers without formal credit history
- Agent and field operations tooling used across six markets
- Payments and collections, including mobile money integrations
- Customer support, identity verification, and fraud prevention

## How to apply

Apply on the M-KOPA careers page or by email. This listing is published on Patakazi, an agent-readable job board, so you can also hand the structured listing to an assistant and get a shortlist instead of a wall of text.

**M-KOPA** — Fintech · 1001 5000 · founded 2011 · Nairobi, Kenya
', 'c0000002-0000-4000-8000-000000000002', 'M-KOPA', 'm-kopa', '', 'Nairobi, Kenya', 'hybrid', 'full_time', 'senior', 82000, 120000, 'USD', 'year', true, array['python', 'machine-learning', 'sql', 'statistics', 'pandas'], array['fintech', 'lending', 'responsible-ml'], 'https://m-kopa.example/careers', 'careers@m-kopa.example', 'published', '2026-09-17T07:12:40.400Z', '2026-10-28T07:12:40.400Z', 588, false, '0af97a37-bee3-4308-92e2-2444bc9ef6b3'),
  ('d0000001-0000-4000-8000-000000000008', 'Customer Operations Intern', 'm-kopa-customer-operations-intern', '## About the role

This is a six-month paid internship on the customer operations team at M-KOPA, working directly with customers who are paying off a financed phone or a solar system and who sometimes need help at a difficult moment.

You will be mentored by a team lead, given real work rather than shadowing, and expected to be useful from week two. Past interns have gone on to full-time roles in operations, risk, and product.

## What you''ll do

- Handle customer contacts across phone, WhatsApp, and the internal case tool.
- Keep case records accurate and up to date, including the resolution notes other teams depend on.
- Spot recurring problems and write them up so the product or collections team can act on them.
- Report daily on the numbers that matter: cases opened, resolved, and escalated.
- Ask for help early rather than at the end of a shift.

## What you''ll bring

**Required**

- Clear written and spoken English; Swahili is an advantage.
- Patience and the willingness to be the person a customer is glad to hear from.
- Basic spreadsheet competence.
- Availability on site in Nairobi for the full six months.

**Nice to have**

- Previous customer-facing work, including part-time or voluntary roles.
- Interest in fintech or consumer credit.

## Compensation and benefits

- **Published salary range:** $12,000 – $18,000 USD per year, before tax. This is the real band, not a placeholder.
- Paid internship with a named mentor and a written development plan.
- Pathway to a full-time operations role at the end of the programme.
- Lunch and transport provided.

## Working arrangements

- **Location:** Nairobi, Kenya
- **Workplace:** onsite
- **Employment type:** internship

## About M-KOPA

M-KOPA is a fintech company that sells smartphones, solar systems, and productive assets on flexible daily, weekly, and monthly payment plans, with more than three million active customers across Africa.

Roughly 70% of M-KOPA''s customers have never held a bank account, so the product is built around USSD and low-end Android rather than desktop web. The engineering challenge is less about scale for its own sake and more about making a credit and logistics business work on a $40 handset and an intermittent connection.

**What M-KOPA works on**

- Asset financing and credit scoring for customers without formal credit history
- Agent and field operations tooling used across six markets
- Payments and collections, including mobile money integrations
- Customer support, identity verification, and fraud prevention

## How to apply

Apply on the M-KOPA careers page or by email. This listing is published on Patakazi, an agent-readable job board, so you can also hand the structured listing to an assistant and get a shortlist instead of a wall of text.

**M-KOPA** — Fintech · 1001 5000 · founded 2011 · Nairobi, Kenya
', 'c0000002-0000-4000-8000-000000000002', 'M-KOPA', 'm-kopa', '', 'Nairobi, Kenya', 'onsite', 'internship', 'internship', 12000, 18000, 'USD', 'year', true, array['customer-support', 'excel', 'communication'], array['early-career', 'mentorship', 'operations'], 'https://m-kopa.example/careers', 'careers@m-kopa.example', 'published', '2026-09-25T07:12:40.401Z', '2026-10-19T07:12:40.401Z', 1102, false, '0af97a37-bee3-4308-92e2-2444bc9ef6b3'),
  ('d0000001-0000-4000-8000-000000000009', 'Senior Software Engineer — Logistics and Routing', 'twiga-senior-software-engineer-logistics', '## About the role

Twiga Foods moves fresh produce from smallholder farmers to restaurants within hours of harvest. The constraint is physical: a route has to be driven, a truck has a load capacity, and a restaurant has a delivery window. Turning that into software is what this team does, and the person who joins it will own the routing surface that dispatchers rely on every morning.

The work is unusually concrete. You will see your scheduling change on a real route the following day.

## What you''ll do

- Own the dispatch and routing services that decide which truck serves which order.
- Improve the constraint solver: capacity, delivery windows, and driver hours all compete.
- Make the dispatch UI fast, because a dispatcher working from a phone in the yard cannot wait for a spinner.
- Handle the messy real world: a driver who calls in sick, a customer who cancels at 06:00, a road that is closed.
- Write the tests that let dispatchers trust a change you made last week.

## What you''ll bring

**Required**

- 5+ years of software engineering, with real backend experience.
- Strong TypeScript and a relational database you are comfortable designing.
- Some exposure to scheduling, routing, or optimisation problems, or clear evidence you can learn one quickly.
- Practical instincts about performance in an interactive tool.

**Nice to have**

- Experience with OR-Tools, linear programming, or a similar solver.
- Background in logistics, supply chain, or field operations.
- Exposure to map and routing services.

## Compensation and benefits

- **Published salary range:** $75,000 – $110,000 USD per year, before tax. This is the real band, not a placeholder.
- Published salary band.
- Hybrid: three days on site, two remote.
- Produce discount and lunch on warehouse days.

## Working arrangements

- **Location:** Nairobi, Kenya
- **Workplace:** hybrid
- **Employment type:** full time

## About Twiga Foods

Twiga Foods is an agritech marketplace that collects fresh produce directly from smallholder farmers and delivers it to restaurants and retailers across Kenya, moving tens of thousands of kilograms every week.

The interesting part of the business is the last mile. Orders from restaurants are consolidated into collection routes, matched to farmers who have the volume and the crop, and then picked and delivered within hours of harvest. That means the software is a scheduling and logistics system before it is anything else.

**What Twiga Foods works on**

- Demand forecasting and order consolidation for restaurants and retail
- Farmer supply matching, pricing, and collection scheduling
- Route planning and last-mile delivery operations
- Quality grading, traceability, and cold-chain handling

## How to apply

Apply on the Twiga Foods careers page or by email. This listing is published on Patakazi, an agent-readable job board, so you can also hand the structured listing to an assistant and get a shortlist instead of a wall of text.

**Twiga Foods** — Agritech & Logistics · 501 1000 · founded 2014 · Nairobi, Kenya
', 'c0000003-0000-4000-8000-000000000003', 'Twiga Foods', 'twiga-foods', '', 'Nairobi, Kenya', 'hybrid', 'full_time', 'senior', 75000, 110000, 'USD', 'year', true, array['typescript', 'node', 'postgresql', 'algorithms', 'vue'], array['logistics', 'optimisation', 'salary-transparent'], 'https://twiga-foods.example/careers', 'careers@twiga-foods.example', 'published', '2026-09-23T07:12:40.401Z', '2026-11-12T07:12:40.401Z', 967, true, '0af97a37-bee3-4308-92e2-2444bc9ef6b3'),
  ('d0000001-0000-4000-8000-000000000010', 'Field Operations Manager — Farmer Network', 'twiga-field-operations-manager', '## About the role

Twiga Foods is looking for a field operations manager to lead the farmer network in Nakuru county. You will be the link between the agronomists and the software: you know what farmers will actually agree to, and you can turn that into a requirement the product team can build.

This is a people role with numbers attached. You will manage a field team, own collection targets, and spend a lot of time in the field rather than at a desk.

## What you''ll do

- Manage and grow a network of farmer suppliers across Nakuru county.
- Own weekly collection volumes and quality grading targets, and report against them honestly.
- Work with the product team to test new collection tools with farmers, and to kill the ones that do not work.
- Resolve the day-to-day problems nobody wrote a process for.
- Coach field officers and raise the standard of record-keeping across the team.

## What you''ll bring

**Required**

- 3+ years in operations, ideally in agriculture, aggregation, or FMCG distribution.
- Fluency in Swahili and working English.
- Comfort with spreadsheets and basic data analysis.
- Willingness to travel within the county regularly.

**Nice to have**

- Agronomy training or a relevant certificate.
- Experience with a collection or field sales network.
- A bike or motorcycle licence.

## Compensation and benefits

- **Published salary range:** $42,000 – $60,000 USD per year, before tax. This is the real band, not a placeholder.
- Medical cover and a transport allowance.
- Bonus tied to collection targets, paid quarterly.
- Company laptop and phone.

## Working arrangements

- **Location:** Nakuru, Kenya
- **Workplace:** onsite
- **Employment type:** full time

## About Twiga Foods

Twiga Foods is an agritech marketplace that collects fresh produce directly from smallholder farmers and delivers it to restaurants and retailers across Kenya, moving tens of thousands of kilograms every week.

The interesting part of the business is the last mile. Orders from restaurants are consolidated into collection routes, matched to farmers who have the volume and the crop, and then picked and delivered within hours of harvest. That means the software is a scheduling and logistics system before it is anything else.

**What Twiga Foods works on**

- Demand forecasting and order consolidation for restaurants and retail
- Farmer supply matching, pricing, and collection scheduling
- Route planning and last-mile delivery operations
- Quality grading, traceability, and cold-chain handling

## How to apply

Apply on the Twiga Foods careers page or by email. This listing is published on Patakazi, an agent-readable job board, so you can also hand the structured listing to an assistant and get a shortlist instead of a wall of text.

**Twiga Foods** — Agritech & Logistics · 501 1000 · founded 2014 · Nairobi, Kenya
', 'c0000003-0000-4000-8000-000000000003', 'Twiga Foods', 'twiga-foods', '', 'Nakuru, Kenya', 'onsite', 'full_time', 'mid', 42000, 60000, 'USD', 'year', true, array['operations', 'farmer-engagement', 'excel', 'logistics'], array['field-operations', 'early-career-leadership'], 'https://twiga-foods.example/careers', 'careers@twiga-foods.example', 'published', '2026-09-14T07:12:40.401Z', '2026-10-28T07:12:40.401Z', 402, false, '0af97a37-bee3-4308-92e2-2444bc9ef6b3'),
  ('d0000001-0000-4000-8000-000000000011', 'QA Engineer — Mobile and Web', 'twiga-qa-engineer', '## About the role

Twiga Foods is looking for a contract QA engineer to strengthen automated testing across our customer ordering flows and the internal tools our field teams rely on.

The engagement is a six-month contract with a strong possibility of extension. You will have real authority over the test strategy for your scope, and the support of the engineering leads who own the code.

## What you''ll do

- Own automated end-to-end coverage for the ordering and collection flows.
- Keep the API test suite fast and trustworthy, so it is something people run rather than something people ignore.
- Add regression coverage for every production incident, agreed with the team.
- Make failures diagnosable: a red build should tell you what broke, not that something broke.
- Work with engineers on testability, rather than working around code that cannot be tested.

## What you''ll bring

**Required**

- 3+ years in test automation for web and mobile.
- Strong Playwright or Cypress experience, and API testing with Postman or similar.
- SQL comfort for data verification.
- Available for six months, at least four days a week.

**Nice to have**

- Performance or load testing experience.
- CI pipeline ownership.
- Experience testing on real low-end devices or slow networks.

## Compensation and benefits

- **Salary:** not published on this listing. The range is discussed at the first interview.
- Competitive day rate, paid monthly.
- Fully remote with flexible hours.
- Extension to a permanent role if the fit is right.

## Working arrangements

- **Location:** Nairobi, Kenya
- **Workplace:** remote
- **Employment type:** contract

## About Twiga Foods

Twiga Foods is an agritech marketplace that collects fresh produce directly from smallholder farmers and delivers it to restaurants and retailers across Kenya, moving tens of thousands of kilograms every week.

The interesting part of the business is the last mile. Orders from restaurants are consolidated into collection routes, matched to farmers who have the volume and the crop, and then picked and delivered within hours of harvest. That means the software is a scheduling and logistics system before it is anything else.

**What Twiga Foods works on**

- Demand forecasting and order consolidation for restaurants and retail
- Farmer supply matching, pricing, and collection scheduling
- Route planning and last-mile delivery operations
- Quality grading, traceability, and cold-chain handling

## How to apply

Apply on the Twiga Foods careers page or by email. This listing is published on Patakazi, an agent-readable job board, so you can also hand the structured listing to an assistant and get a shortlist instead of a wall of text.

**Twiga Foods** — Agritech & Logistics · 501 1000 · founded 2014 · Nairobi, Kenya
', 'c0000003-0000-4000-8000-000000000003', 'Twiga Foods', 'twiga-foods', '', 'Nairobi, Kenya', 'remote', 'contract', 'mid', 9000, 13000, 'USD', 'year', false, array['testing', 'cypress', 'playwright', 'postman', 'api-testing'], array['contract', 'automation', 'quality'], 'https://twiga-foods.example/careers', 'careers@twiga-foods.example', 'published', '2026-09-20T07:12:40.401Z', '2026-11-07T07:12:40.401Z', 214, false, '0af97a37-bee3-4308-92e2-2444bc9ef6b3'),
  ('d0000001-0000-4000-8000-000000000012', 'Backend Engineer — Dispatch and Tracking', 'sendy-backend-engineer-dispatch', '## About the role

Sendy''s dispatch engine assigns a job to a rider, and the tracking surface shows the customer where their parcel is. Both live or die on real-time behaviour, which is what this role is about.

You will work on services that handle a high volume of small, fast-moving events, and on the API that enterprise shippers integrate against. Reliability and clarity matter more here than novelty.

## What you''ll do

- Build and operate the dispatch services that match jobs to riders in real time.
- Improve tracking accuracy and ETA quality, including how the UI behaves when a signal is stale.
- Design the public API for regular shippers, with versioning and a real deprecation policy.
- Reduce operational cost per delivery, which is the number the business is judged on.
- Join the on-call rotation and improve the alerts so the noise goes down.

## What you''ll bring

**Required**

- 3+ years backend engineering with TypeScript or Node in production.
- Solid understanding of concurrency, queues, and state machines.
- Postgres fluency, including query tuning and locking.
- Experience with a customer-facing API and its clients.

**Nice to have**

- Real-time systems, WebSockets, or location data.
- Payments integration.
- Mapping or routing services experience.

## Compensation and benefits

- **Published salary range:** $68,000 – $98,000 USD per year, before tax. This is the real band, not a placeholder.
- Published salary band.
- Hybrid: two days a week in the Nairobi office.
- Rider-network discount and fuel or transport support.

## Working arrangements

- **Location:** Nairobi, Kenya
- **Workplace:** hybrid
- **Employment type:** full time

## About Sendy

Sendy is an on-demand logistics platform that matches businesses needing to move freight in Nairobi with a network of independent motorcycle and van riders, tracked in real time from pickup to proof of delivery.

Freight matching in a dense city like Nairobi is a routing problem with a lot of edge cases: a rider''s phone dies mid-delivery, an address does not resolve, a parcel is rejected on arrival. The engineering team spends most of its time on dispatch, pricing, and the reliability of the tracking surface that customers use to see where their goods are.

**What Sendy works on**

- Freight dispatch, rider allocation, and route optimisation
- Real-time tracking, ETAs, and proof of delivery
- Pricing, quoting, and payment collection
- Enterprise accounts and API integrations for regular shippers

## How to apply

Apply on the Sendy careers page or by email. This listing is published on Patakazi, an agent-readable job board, so you can also hand the structured listing to an assistant and get a shortlist instead of a wall of text.

**Sendy** — Logistics · 201 500 · founded 2015 · Nairobi, Kenya
', 'c0000004-0000-4000-8000-000000000004', 'Sendy', 'sendy', '', 'Nairobi, Kenya', 'hybrid', 'full_time', 'mid', 68000, 98000, 'USD', 'year', true, array['typescript', 'node', 'postgresql', 'redis', 'websocket'], array['logistics', 'real-time', 'high-scale'], 'https://sendy.example/careers', 'careers@sendy.example', 'published', '2026-09-21T07:12:40.401Z', '2026-11-12T07:12:40.401Z', 846, false, '0af97a37-bee3-4308-92e2-2444bc9ef6b3'),
  ('d0000001-0000-4000-8000-000000000013', 'Product Designer — Rider and Customer Apps', 'sendy-product-designer', '## About the role

Sendy is looking for a product designer who can work across two very different interfaces: a customer booking a delivery, and a rider on a motorcycle with one hand and a cracked screen.

The role needs someone who can hold both contexts at once, design for genuinely constrained devices, and work in the field rather than only in a design file.

## What you''ll do

- Own the design for rider flows end to end, from on-boarding to cash-out.
- Design for real conditions: sunlight, vibration, gloves, and intermittent data.
- Extend the design system so a new flow costs days rather than weeks.
- Run usability sessions with riders and customers, in person, on their own devices.
- Partner with engineering closely enough that what is designed is what ships.

## What you''ll bring

**Required**

- 4+ years in product design with a portfolio that shows shipped work, not just concept screens.
- Strong interaction design for small screens.
- Systems thinking: you can define components and rules, not just draw screens.
- Willingness to be in the field.

**Nice to have**

- Experience designing for low-connectivity markets.
- Motion or prototyping skills.
- A background in front-end implementation.

## Compensation and benefits

- **Published salary range:** $72,000 – $105,000 USD per year, before tax. This is the real band, not a placeholder.
- Published salary band.
- Hybrid schedule with two office days.
- Field travel budget and a testing device budget.

## Working arrangements

- **Location:** Nairobi, Kenya
- **Workplace:** hybrid
- **Employment type:** full time

## About Sendy

Sendy is an on-demand logistics platform that matches businesses needing to move freight in Nairobi with a network of independent motorcycle and van riders, tracked in real time from pickup to proof of delivery.

Freight matching in a dense city like Nairobi is a routing problem with a lot of edge cases: a rider''s phone dies mid-delivery, an address does not resolve, a parcel is rejected on arrival. The engineering team spends most of its time on dispatch, pricing, and the reliability of the tracking surface that customers use to see where their goods are.

**What Sendy works on**

- Freight dispatch, rider allocation, and route optimisation
- Real-time tracking, ETAs, and proof of delivery
- Pricing, quoting, and payment collection
- Enterprise accounts and API integrations for regular shippers

## How to apply

Apply on the Sendy careers page or by email. This listing is published on Patakazi, an agent-readable job board, so you can also hand the structured listing to an assistant and get a shortlist instead of a wall of text.

**Sendy** — Logistics · 201 500 · founded 2015 · Nairobi, Kenya
', 'c0000004-0000-4000-8000-000000000004', 'Sendy', 'sendy', '', 'Nairobi, Kenya', 'hybrid', 'full_time', 'senior', 72000, 105000, 'USD', 'year', true, array['figma', 'ux-design', 'design-systems', 'user-research', 'accessibility'], array['design', 'mobile-first', 'low-bandwidth'], 'https://sendy.example/careers', 'careers@sendy.example', 'published', '2026-09-15T07:12:40.401Z', '2026-10-28T07:12:40.401Z', 377, false, '0af97a37-bee3-4308-92e2-2444bc9ef6b3'),
  ('d0000001-0000-4000-8000-000000000014', 'Growth Analyst', 'sendy-growth-analyst', '## About the role

Sendy is hiring a part-time growth analyst to help the team understand what actually drives a first delivery, and what makes customers come back.

This is a three-day-a-week role with genuine ownership of the growth question. You will define the metrics, run the analysis, and present the findings to the people who can act on them.

## What you''ll do

- Own the funnel from signup to first completed delivery, and make it legible to the whole company.
- Design and read experiments properly, including the ones that come back inconclusive.
- Build the self-serve dashboards that let product teams answer their own questions.
- Challenge assumptions with data rather than enthusiasm.

## What you''ll bring

**Required**

- 3+ years in analytics or data science.
- Excellent SQL and comfort with a modern BI tool.
- Understanding of experimentation design and its limits.
- Available three days per week, with at least one overlapping with the Nairobi team.

**Nice to have**

- Marketplace or logistics metrics experience.
- Python for analysis beyond SQL.
- Experience with a mobile marketplace.

## Compensation and benefits

- **Published salary range:** $14,000 – $20,000 USD per year, before tax. This is the real band, not a placeholder.
- Pro-rated salary with a three-day week.
- Fully remote, with a once-a-month team day in Nairobi.
- Flexible hours around your other commitments.

## Working arrangements

- **Location:** Remote, East Africa
- **Workplace:** remote
- **Employment type:** part time

## About Sendy

Sendy is an on-demand logistics platform that matches businesses needing to move freight in Nairobi with a network of independent motorcycle and van riders, tracked in real time from pickup to proof of delivery.

Freight matching in a dense city like Nairobi is a routing problem with a lot of edge cases: a rider''s phone dies mid-delivery, an address does not resolve, a parcel is rejected on arrival. The engineering team spends most of its time on dispatch, pricing, and the reliability of the tracking surface that customers use to see where their goods are.

**What Sendy works on**

- Freight dispatch, rider allocation, and route optimisation
- Real-time tracking, ETAs, and proof of delivery
- Pricing, quoting, and payment collection
- Enterprise accounts and API integrations for regular shippers

## How to apply

Apply on the Sendy careers page or by email. This listing is published on Patakazi, an agent-readable job board, so you can also hand the structured listing to an assistant and get a shortlist instead of a wall of text.

**Sendy** — Logistics · 201 500 · founded 2015 · Nairobi, Kenya
', 'c0000004-0000-4000-8000-000000000004', 'Sendy', 'sendy', '', 'Remote, East Africa', 'remote', 'part_time', 'mid', 14000, 20000, 'USD', 'year', true, array['sql', 'analytics', 'experimentation', 'python'], array['part-time', 'analytics', 'growth'], 'https://sendy.example/careers', 'careers@sendy.example', 'published', '2026-09-09T07:12:40.401Z', '2026-11-27T07:12:40.401Z', 205, false, '0af97a37-bee3-4308-92e2-2444bc9ef6b3'),
  ('d0000001-0000-4000-8000-000000000015', 'Platform Engineer — Kubernetes and Infrastructure', 'cellulant-platform-engineer', '## About the role

Cellulant''s platform team builds the infrastructure that banks and mobile money operators run payments on. That means multi-region, audited, and extremely boring in the best sense. When it is not boring, it is an incident that involves a central bank.

This role is for a senior engineer who wants to own infrastructure that other engineers depend on and who enjoys the discipline of a regulated environment.

## What you''ll do

- Own the Kubernetes platform that runs payment services, and keep it boring and patchable.
- Codify infrastructure in Terraform so a new environment is a pull request rather than a wiki page.
- Improve observability so that an operator can answer "is it us or them?" in minutes.
- Lead the response to infrastructure incidents, including the write-up afterwards.
- Support and enforce the compliance controls that auditors and regulators expect.

## What you''ll bring

**Required**

- 5+ years in infrastructure or platform engineering.
- Production Kubernetes and infrastructure-as-code experience.
- Fluency in at least one of Go, Python, or Bash at a level you can maintain.
- A track record of reducing incident severity, not just responding to it.

**Nice to have**

- Payments, banking, or other regulated-industry infrastructure.
- Multi-region and disaster recovery design.
- Certificate management and workload identity.

## Compensation and benefits

- **Published salary range:** $85,000 – $125,000 USD per year, before tax. This is the real band, not a placeholder.
- Published salary band.
- Hybrid: three days in the Nairobi office.
- Certification support and an on-call allowance.

## Working arrangements

- **Location:** Nairobi, Kenya
- **Workplace:** hybrid
- **Employment type:** full time

## About Cellulant

Cellulant is a payments infrastructure provider that connects banks, mobile money operators, and fintechs to a single collection and payout API across more than thirty African markets.

Its customers are regulated institutions, so the engineering bar is different from a consumer app: audit trails, idempotency, reconciliation, and uptime guarantees are part of the product rather than an afterthought. Teams work across time zones, and the Nairobi office is the East African engineering hub.

**What Cellulant works on**

- Collections and payouts APIs for banks, mobile money, and merchants
- Payment orchestration, routing, and retries
- Reconciliation, settlement, and regulatory reporting
- Platform reliability, observability, and compliance tooling

## How to apply

Apply on the Cellulant careers page or by email. This listing is published on Patakazi, an agent-readable job board, so you can also hand the structured listing to an assistant and get a shortlist instead of a wall of text.

**Cellulant** — Payments · 501 1000 · founded 2004 · Lagos, Nigeria and Nairobi, Kenya
', 'c0000005-0000-4000-8000-000000000005', 'Cellulant', 'cellulant', '', 'Nairobi, Kenya', 'hybrid', 'full_time', 'senior', 85000, 125000, 'USD', 'year', true, array['kubernetes', 'terraform', 'aws', 'observability', 'go'], array['platform', 'reliability', 'regulated'], 'https://cellulant.example/careers', 'careers@cellulant.example', 'published', '2026-09-18T07:12:40.401Z', '2026-11-12T07:12:40.401Z', 521, false, '0af97a37-bee3-4308-92e2-2444bc9ef6b3'),
  ('d0000001-0000-4000-8000-000000000016', 'Technical Writer — Payments APIs', 'cellulant-technical-writer', '## About the role

Cellulant is looking for a technical writer to own the documentation for its collections and payouts APIs. Our integration partners are banks and fintechs whose engineers need to implement a payment flow correctly the first time, and our current docs do not always make that easy.

This is a six-month contract with a strong chance of becoming permanent. You will work directly with the engineers who built the API, which is the only way documentation gets genuinely good.

## What you''ll do

- Own the API reference, quickstarts, and integration guides.
- Write examples in at least two languages that actually run, and keep them in CI.
- Turn the top ten support tickets into documentation, and watch the number fall.
- Define and enforce a documentation style so the site stays consistent.
- Make the docs machine-readable, so an agent can use them as well as a human can.

## What you''ll bring

**Required**

- 3+ years writing developer documentation for an API or SDK.
- Ability to read code in at least one language well enough to test your own examples.
- Clear, plain English with no tolerance for filler.
- Available for six months, at least four days a week.

**Nice to have**

- Payments or fintech documentation experience.
- Familiarity with OpenAPI, Docusaurus, or a similar stack.
- Interest in LLM-readable documentation formats.

## Compensation and benefits

- **Published salary range:** $8,000 – $12,000 USD per year, before tax. This is the real band, not a placeholder.
- Competitive day rate paid monthly.
- Fully remote across African time zones.
- Strong likelihood of converting to a permanent role.

## Working arrangements

- **Location:** Remote, Africa
- **Workplace:** remote
- **Employment type:** contract

## About Cellulant

Cellulant is a payments infrastructure provider that connects banks, mobile money operators, and fintechs to a single collection and payout API across more than thirty African markets.

Its customers are regulated institutions, so the engineering bar is different from a consumer app: audit trails, idempotency, reconciliation, and uptime guarantees are part of the product rather than an afterthought. Teams work across time zones, and the Nairobi office is the East African engineering hub.

**What Cellulant works on**

- Collections and payouts APIs for banks, mobile money, and merchants
- Payment orchestration, routing, and retries
- Reconciliation, settlement, and regulatory reporting
- Platform reliability, observability, and compliance tooling

## How to apply

Apply on the Cellulant careers page or by email. This listing is published on Patakazi, an agent-readable job board, so you can also hand the structured listing to an assistant and get a shortlist instead of a wall of text.

**Cellulant** — Payments · 501 1000 · founded 2004 · Lagos, Nigeria and Nairobi, Kenya
', 'c0000005-0000-4000-8000-000000000005', 'Cellulant', 'cellulant', '', 'Remote, Africa', 'remote', 'contract', 'mid', 8000, 12000, 'USD', 'year', true, array['technical-writing', 'api-documentation', 'openapi', 'markdown'], array['contract', 'developer-experience', 'remote-first'], 'https://cellulant.example/careers', 'careers@cellulant.example', 'published', '2026-09-10T07:12:40.401Z', '2026-11-17T07:12:40.401Z', 168, false, '0af97a37-bee3-4308-92e2-2444bc9ef6b3'),
  ('d0000001-0000-4000-8000-000000000017', 'Full-Stack Developer — Community Platform', 'ihub-full-stack-developer', '## About the role

iHub Nairobi is hiring a full-stack developer to work on the platform that runs our community: event listings, programme applications, resident directory, and the tools our mentors use.

This is a deliberately broad role. You will touch the front end, the API, and the database, and you will have a senior engineer reviewing your work closely. If you want to learn quickly by owning real features, this is the job.

## What you''ll do

- Build and maintain features across the Nuxt front end and the API behind it.
- Keep the event and programme tooling reliable during busy enrolment periods.
- Improve accessibility, because the community includes people using assistive technology.
- Write documentation for the platform so other teams can use it without asking you.
- Take part in internal workshops and help run the community tech sessions.

## What you''ll bring

**Required**

- 1–3 years of professional web development, or a strong portfolio from a bootcamp or self-teaching.
- Solid JavaScript or TypeScript and a working grasp of HTML and CSS.
- Some database experience; you do not need to be an expert.
- Genuine curiosity and the habit of asking questions early.

**Nice to have**

- Experience with Nuxt, Vue, or any similar framework.
- Any exposure to payments, ticketing, or scheduling.
- Community or events experience.

## Compensation and benefits

- **Published salary range:** $38,000 – $52,000 USD per year, before tax. This is the real band, not a placeholder.
- Published salary band for the band you are hired into.
- On-site in Kileleshwa with a flexible start time.
- Free access to all iHub programmes, events, and community sessions.

## Working arrangements

- **Location:** Nairobi, Kenya
- **Workplace:** onsite
- **Employment type:** full time

## About iHub Nairobi

iHub Nairobi is one of Africa''s oldest technology incubators, a co-working and research community in Kileleshwa that has hosted hundreds of startups and runs programmes for founders and early technical hires.

Because it operates more like a community than a corporation, the work is wide: internal platforms, programme tooling, events, and building alongside the startups in the building. It is a good fit for someone early in their career who wants breadth and ownership rather than a narrow specialism.

**What iHub Nairobi works on**

- Incubator programmes, mentorship, and founder support
- Community events, workshops, and training
- Shared infrastructure for resident startups
- Research and partnerships with universities and NGOs

## How to apply

Apply on the iHub Nairobi careers page or by email. This listing is published on Patakazi, an agent-readable job board, so you can also hand the structured listing to an assistant and get a shortlist instead of a wall of text.

**iHub Nairobi** — Technology Incubator · 11 50 · founded 2010 · Nairobi, Kenya
', 'c0000006-0000-4000-8000-000000000006', 'iHub Nairobi', 'ihub-nairobi', '', 'Nairobi, Kenya', 'onsite', 'full_time', 'junior', 38000, 52000, 'USD', 'year', true, array['typescript', 'vue', 'nuxt', 'postgresql', 'css'], array['early-career', 'breadth', 'mentorship'], 'https://ihub.co.ke/careers', 'careers@ihub-nairobi.example', 'published', '2026-09-22T07:12:40.401Z', '2026-11-07T07:12:40.401Z', 336, false, '0af97a37-bee3-4308-92e2-2444bc9ef6b3'),
  ('d0000001-0000-4000-8000-000000000018', 'Community Programme Intern', 'ihub-community-programme-intern', '## About the role

iHub Nairobi is looking for a part-time community programme intern to help run our training and mentorship programmes. You will coordinate sessions, support mentors, and keep the programme documentation current.

This is a four-day-a-week, six-month internship. It is a good fit if you are early in your studies or career and want experience running real programmes with real stakeholders.

## What you''ll do

- Coordinate training sessions: venue, materials, attendance, and follow-up.
- Support mentors and participants, and escalate the things you cannot solve.
- Keep programme documentation and reporting up to date.
- Gather participant feedback and summarise it honestly.
- Help run community events, including some evening sessions.

## What you''ll bring

**Required**

- Clear English, and Swahili is an advantage.
- Organisational reliability.
- A willingness to work in the community rather than only at a desk.
- Available four days a week for six months.

**Nice to have**

- Interest in tech, entrepreneurship, or innovation.
- Event or project coordination experience.

## Compensation and benefits

- **Salary:** not published on this listing. The range is discussed at the first interview.
- Paid internship with mentorship.
- Access to all iHub programmes and events.
- Lunch provided on working days.

## Working arrangements

- **Location:** Nairobi, Kenya
- **Workplace:** onsite
- **Employment type:** part time

## About iHub Nairobi

iHub Nairobi is one of Africa''s oldest technology incubators, a co-working and research community in Kileleshwa that has hosted hundreds of startups and runs programmes for founders and early technical hires.

Because it operates more like a community than a corporation, the work is wide: internal platforms, programme tooling, events, and building alongside the startups in the building. It is a good fit for someone early in their career who wants breadth and ownership rather than a narrow specialism.

**What iHub Nairobi works on**

- Incubator programmes, mentorship, and founder support
- Community events, workshops, and training
- Shared infrastructure for resident startups
- Research and partnerships with universities and NGOs

## How to apply

Apply on the iHub Nairobi careers page or by email. This listing is published on Patakazi, an agent-readable job board, so you can also hand the structured listing to an assistant and get a shortlist instead of a wall of text.

**iHub Nairobi** — Technology Incubator · 11 50 · founded 2010 · Nairobi, Kenya
', 'c0000006-0000-4000-8000-000000000006', 'iHub Nairobi', 'ihub-nairobi', '', 'Nairobi, Kenya', 'onsite', 'part_time', 'internship', 8000, 12000, 'USD', 'year', false, array['communication', 'events', 'community', 'documentation'], array['early-career', 'community', 'part-time'], 'https://ihub.co.ke/careers', 'careers@ihub-nairobi.example', 'published', '2026-09-06T07:12:40.401Z', '2026-10-23T07:12:40.401Z', 129, false, '0af97a37-bee3-4308-92e2-2444bc9ef6b3')
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  company_id = excluded.company_id,
  company_name = excluded.company_name,
  company_slug = excluded.company_slug,
  location = excluded.location,
  workplace_type = excluded.workplace_type,
  employment_type = excluded.employment_type,
  seniority = excluded.seniority,
  salary_min = excluded.salary_min,
  salary_max = excluded.salary_max,
  salary_visible = excluded.salary_visible,
  skills = excluded.skills,
  tags = excluded.tags,
  apply_url = excluded.apply_url,
  apply_email = excluded.apply_email,
  status = excluded.status,
  published_at = excluded.published_at,
  expires_at = excluded.expires_at,
  views = excluded.views,
  featured = excluded.featured;

-- A closed role: keeps the "this listing is no longer open" path exercised
-- without polluting the public listing.
insert into jobs (id, title, slug, description, company_id, company_name, company_slug, company_logo_id, location, workplace_type, employment_type, seniority, salary_min, salary_max, salary_currency, salary_period, salary_visible, skills, tags, apply_url, apply_email, status, published_at, expires_at, views, featured, created_by)
values (
  'd0000002-0000-4000-8000-000000000002',
  'Head of Data Platform (Filled)',
  'm-kopa-head-of-data-platform-filled',
  'This role has been filled. It is kept in the database so the closed-listing state is represented in development and demos.',
  'c0000002-0000-4000-8000-000000000002',
  'M-KOPA',
  'm-kopa',
  '',
  'Nairobi, Kenya',
  'hybrid',
  'full_time',
  'director',
  140000,
  180000,
  'USD',
  'year',
  true,
  array['data-engineering', 'leadership', 'python', 'postgresql'],
  array['filled', 'historical'],
  'https://m-kopa.com/careers',
  'careers@m-kopa.example',
  'closed',
  now() - interval '120 days',
  now() - interval '30 days',
  2814,
  false,
  '0af97a37-bee3-4308-92e2-2444bc9ef6b3'
)
on conflict (slug) do update set status = excluded.status, description = excluded.description;

-- A draft: only visible to the owner, never in the public list.
insert into jobs (id, title, slug, description, company_id, company_name, company_slug, company_logo_id, location, workplace_type, employment_type, seniority, salary_min, salary_max, salary_currency, salary_period, salary_visible, skills, tags, apply_url, apply_email, status, published_at, expires_at, views, featured, created_by)
values (
  'd0000003-0000-4000-8000-000000000003',
  'Machine Learning Engineer (Draft)',
  'twiga-machine-learning-engineer-draft',
  'This listing is still a draft. It exists so the draft state, and the publish flow, can be tested without creating a real post.',
  'c0000003-0000-4000-8000-000000000003',
  'Twiga Foods',
  'twiga-foods',
  '',
  'Nairobi, Kenya',
  'hybrid',
  'full_time',
  'senior',
  80000,
  115000,
  'USD',
  'year',
  true,
  array['python', 'machine-learning', 'forecasting'],
  array['draft', 'unpublished'],
  'https://twiga.com/careers',
  'careers@twiga-foods.example',
  'draft',
  null,
  null,
  0,
  false,
  '0af97a37-bee3-4308-92e2-2444bc9ef6b3'
)
on conflict (slug) do update set title = excluded.title, description = excluded.description, status = excluded.status;

-- --- Profile and saved jobs --------------------------------------------------
-- profiles.user_id references auth.users, which does not exist on a fresh
-- database, so this block is skipped until an account exists. It is what a
-- signed-in visitor sees in the dashboard.

do $$
declare
  demo_user uuid;
begin
  select id into demo_user from auth.users order by created_at asc limit 1;

  if demo_user is null then
    return;
  end if;

  insert into profiles (user_id, full_name, headline, summary, location, skills, resume_id, portfolio_url, linkedin_url, open_to_work, role, is_active)
  values (
    demo_user,
    'Jordan Mwangi',
    'Senior Frontend Engineer — agent-readable interfaces',
    'Frontend engineer focused on fast, accessible, structured-data-driven interfaces. I have spent the last six years building design systems and public web surfaces in Vue and Nuxt, and I care a great deal about how well a page performs on a cheap Android phone over a metered connection.',
    'Nairobi, Kenya',
    array['nuxt', 'typescript', 'vue', 'tailwind', 'accessibility', 'performance'],
    '',
    'https://portfolio.example',
    'https://www.linkedin.com/in/example',
    true,
    'admin',
    true
  )
  on conflict (user_id) do update set
    full_name = excluded.full_name,
    headline = excluded.headline,
    summary = excluded.summary,
    location = excluded.location,
    skills = excluded.skills,
    open_to_work = excluded.open_to_work,
    role = excluded.role,
    is_active = excluded.is_active;

  insert into saved_jobs (user_id, job_id)
  select demo_user, j.id
  from jobs j
  where j.slug in (
    'safaricom-senior-frontend-engineer',
    'twiga-senior-software-engineer-logistics',
    'sendy-product-designer'
  )
  on conflict (user_id, job_id) do nothing;
end
$$;

-- --- Sanity check ------------------------------------------------------------

select count(*) as companies from companies;
select count(*) as jobs from jobs;
select count(*) as published_jobs from jobs where status = 'published';
