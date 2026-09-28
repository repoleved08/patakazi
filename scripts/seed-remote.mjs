/**
 * Seed generator.
 *
 * Single source of truth for the demo dataset. Emits `supabase/seed.sql`
 * (used by `supabase db reset`) and, with --remote, applies the same rows to the
 * live project through PostgREST so the checked-in SQL and the live database
 * can never drift apart.
 */
import { writeFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const OWNER = '0af97a37-bee3-4308-92e2-2444bc9ef6b3'
const day = 86_400_000
const ago = d => new Date(Date.now() - d * day).toISOString()
const ahead = d => new Date(Date.now() + d * day).toISOString()

/* ---------------------------------------------------------------- companies */

const companies = [
  {
    id: 'c0000001-0000-4000-8000-000000000001',
    name: 'Safaricom',
    slug: 'safaricom',
    industry: 'Telecommunications',
    size: '5000_plus',
    founded: 1997,
    location: 'Nairobi, Kenya',
    website: 'https://www.safaricom.co.ke',
    verified: true,
    description: `Safaricom is East Africa's leading telecommunications operator and a flagship Kenya business, connecting more than 40 million customers across mobile, broadband, and financial services.

The company runs a large technology organisation in Nairobi: network engineering, M-PESA and fintech platforms, enterprise cloud, data and analytics, and customer experience. Its technology teams ship software that has to stay available on low-end Android devices and unreliable networks, which makes engineering quality and performance discipline unusually concrete.

**What Safaricom works on**

- Mobile voice and data networks, and the fixed and fibre backbone underneath them
- M-PESA, the mobile money and fintech platform used across Kenya and neighbouring markets
- Enterprise connectivity, cloud, and managed network services for businesses
- Data platforms that turn network, transaction, and customer telemetry into decisions

**Why it is a good place to build agent-readable software**

Safaricom operates at national scale in a market where most users are on mobile data. Teams here routinely optimise for the slowest connection and the cheapest device in the room rather than for a fast office network.`,
    services: `Mobile network and broadband
M-PESA mobile money and fintech
Enterprise connectivity and managed networks
Cloud and hosting services
Customer and network data analytics
Developer platforms and public APIs`,
    workingHours: `Monday to Friday, 08:00–17:00 East Africa Time (EAT, UTC+3)
Hybrid: teams are in the office two to three days a week
On-call is shared within engineering rotations and compensated`
  },
  {
    id: 'c0000002-0000-4000-8000-000000000002',
    name: 'M-KOPA',
    slug: 'm-kopa',
    industry: 'Fintech',
    size: '1001_5000',
    founded: 2011,
    location: 'Nairobi, Kenya',
    website: 'https://m-kopa.com',
    verified: true,
    description: `M-KOPA is a fintech company that sells smartphones, solar systems, and productive assets on flexible daily, weekly, and monthly payment plans, with more than three million active customers across Africa.

Roughly 70% of M-KOPA's customers have never held a bank account, so the product is built around USSD and low-end Android rather than desktop web. The engineering challenge is less about scale for its own sake and more about making a credit and logistics business work on a $40 handset and an intermittent connection.

**What M-KOPA works on**

- Asset financing and credit scoring for customers without formal credit history
- Agent and field operations tooling used across six markets
- Payments and collections, including mobile money integrations
- Customer support, identity verification, and fraud prevention`,
    services: `Asset financing (smartphones, solar, productive assets)
Credit scoring and underwriting
Mobile money and payments
Field agent operations platform
Customer identity and fraud prevention`,
    workingHours: `Monday to Friday, 08:30–17:30 EAT
Hybrid: three days in the Nairobi office, two days remote
Some engineering teams support US and LATAM customers on a later shift`
  },
  {
    id: 'c0000003-0000-4000-8000-000000000003',
    name: 'Twiga Foods',
    slug: 'twiga-foods',
    industry: 'Agritech & Logistics',
    size: '501_1000',
    founded: 2014,
    location: 'Nairobi, Kenya',
    website: 'https://twiga.com',
    verified: true,
    description: `Twiga Foods is an agritech marketplace that collects fresh produce directly from smallholder farmers and delivers it to restaurants and retailers across Kenya, moving tens of thousands of kilograms every week.

The interesting part of the business is the last mile. Orders from restaurants are consolidated into collection routes, matched to farmers who have the volume and the crop, and then picked and delivered within hours of harvest. That means the software is a scheduling and logistics system before it is anything else.

**What Twiga Foods works on**

- Demand forecasting and order consolidation for restaurants and retail
- Farmer supply matching, pricing, and collection scheduling
- Route planning and last-mile delivery operations
- Quality grading, traceability, and cold-chain handling`,
    services: `Fresh produce aggregation and distribution
Restaurant and retail supply
Farmer marketplace and pricing
Last-mile delivery and route planning
Produce traceability and quality grading`,
    workingHours: `Monday to Saturday, 07:00–19:00 EAT, because produce moves early
Hybrid: warehouse and field teams start earlier than office teams
Market-day coverage means weekend availability during peak weeks`
  },
  {
    id: 'c0000004-0000-4000-8000-000000000004',
    name: 'Sendy',
    slug: 'sendy',
    industry: 'Logistics',
    size: '201_500',
    founded: 2015,
    location: 'Nairobi, Kenya',
    website: 'https://sendyit.com',
    verified: true,
    description: `Sendy is an on-demand logistics platform that matches businesses needing to move freight in Nairobi with a network of independent motorcycle and van riders, tracked in real time from pickup to proof of delivery.

Freight matching in a dense city like Nairobi is a routing problem with a lot of edge cases: a rider's phone dies mid-delivery, an address does not resolve, a parcel is rejected on arrival. The engineering team spends most of its time on dispatch, pricing, and the reliability of the tracking surface that customers use to see where their goods are.

**What Sendy works on**

- Freight dispatch, rider allocation, and route optimisation
- Real-time tracking, ETAs, and proof of delivery
- Pricing, quoting, and payment collection
- Enterprise accounts and API integrations for regular shippers`,
    services: `On-demand motorcycle and van freight
Real-time tracking and proof of delivery
Freight quoting and pricing
Enterprise logistics API
Rider and driver marketplace`,
    workingHours: `Monday to Saturday, 08:00–19:00 EAT
Hybrid: two office days per week
Dispatch and support are covered in shifts, including one weekend day`
  },
  {
    id: 'c0000005-0000-4000-8000-000000000005',
    name: 'Cellulant',
    slug: 'cellulant',
    industry: 'Payments',
    size: '501_1000',
    founded: 2004,
    location: 'Lagos, Nigeria and Nairobi, Kenya',
    website: 'https://cellulant.io',
    verified: true,
    description: `Cellulant is a payments infrastructure provider that connects banks, mobile money operators, and fintechs to a single collection and payout API across more than thirty African markets.

Its customers are regulated institutions, so the engineering bar is different from a consumer app: audit trails, idempotency, reconciliation, and uptime guarantees are part of the product rather than an afterthought. Teams work across time zones, and the Nairobi office is the East African engineering hub.

**What Cellulant works on**

- Collections and payouts APIs for banks, mobile money, and merchants
- Payment orchestration, routing, and retries
- Reconciliation, settlement, and regulatory reporting
- Platform reliability, observability, and compliance tooling`,
    services: `Payment collections and payouts
Payment orchestration and smart routing
Reconciliation and settlement
Regulatory and compliance reporting
Mobile money and bank integrations`,
    workingHours: `Monday to Friday, 09:00–18:00 WAT (UTC+1) / 09:00–18:00 EAT (UTC+3)
Hybrid: three office days per week in Nairobi
Follow-the-sun on-call across Lagos, Nairobi, and partner markets`
  },
  {
    id: 'c0000006-0000-4000-8000-000000000006',
    name: 'iHub Nairobi',
    slug: 'ihub-nairobi',
    industry: 'Technology Incubator',
    size: '11_50',
    founded: 2010,
    location: 'Nairobi, Kenya',
    website: 'https://ihub.co.ke',
    verified: false,
    description: `iHub Nairobi is one of Africa's oldest technology incubators, a co-working and research community in Kileleshwa that has hosted hundreds of startups and runs programmes for founders and early technical hires.

Because it operates more like a community than a corporation, the work is wide: internal platforms, programme tooling, events, and building alongside the startups in the building. It is a good fit for someone early in their career who wants breadth and ownership rather than a narrow specialism.

**What iHub Nairobi works on**

- Incubator programmes, mentorship, and founder support
- Community events, workshops, and training
- Shared infrastructure for resident startups
- Research and partnerships with universities and NGOs`,
    services: `Startup incubation and acceleration
Mentorship and founder support
Co-working space and community
Technical workshops and training
Partnerships with universities and NGOs`,
    workingHours: `Monday to Friday, 09:00–18:00 EAT
Mostly onsite, with flexible hours around community events
Some evening and weekend work during programme launches`
  }
]

/* --------------------------------------------------------------------- jobs */

/**
 * `body` carries only what is specific to the role. The markdown scaffolding
 * (headings, salary block, apply block, company context) is generated so every
 * listing has the same structure a candidate can scan quickly, on any device,
 * and an agent can parse.
 */
const jobs = [
  {
    company: 'safaricom',
    title: 'Senior Frontend Engineer — Agent-Readable Listings',
    slug: 'safaricom-senior-frontend-engineer',
    location: 'Nairobi, Kenya',
    workplace: 'hybrid',
    employment: 'full_time',
    seniority: 'senior',
    salary: [95000, 140000],
    visible: true,
    featured: true,
    views: 1243,
    publishedDaysAgo: 1,
    expiresInDays: 60,
    skills: ['nuxt', 'typescript', 'vue', 'tailwind', 'accessibility'],
    tags: ['agent-ready', 'salary-transparent', 'performance'],
    intro: `Safaricom is looking for a senior frontend engineer to own the public-facing web surfaces where job listings, company profiles, and pricing are published. The team is deliberately small and the work is visible: what you ship is what millions of people see, including on a two-year-old Android phone with a metered connection.

This is a role for someone who treats performance, accessibility, and structured data as product features rather than cleanup tasks. You will work alongside backend and data engineers who expose the salary bands, skills, and locations that both the UI and the public APIs read from.`,
    responsibilities: [
      'Build and maintain the component library that renders job cards, company profiles, search results, and detail pages across web and mobile web.',
      'Own Core Web Vitals for public pages, including a concrete performance budget enforced in CI on real mid-range Android hardware profiles.',
      'Make every listing page emit correct JSON-LD structured data so search engines and AI agents can parse salary, location, and skills without scraping.',
      'Keep the interface usable on small screens and slow connections, including navigation, filters, and long-form job descriptions.',
      'Pair with backend engineers on the API shapes the UI consumes, and give design a component API that does not need a bespoke page for every new pattern.',
      'Write tests for the behaviour that matters to candidates: filtering, saving a job, and reading a salary band on a 360px screen.'
    ],
    required: [
      '5+ years building production web applications, with at least two on a framework you own end to end.',
      'Deep TypeScript, and real depth in Vue or Nuxt rather than familiarity.',
      'Practical accessibility knowledge, WCAG 2.1 AA, and keyboard-first interaction patterns.',
      'Experience measuring and improving real-user performance, not just bundle size.',
      'Comfort working in a regulated, high-traffic environment with other engineers rather than in isolation.'
    ],
    nice: [
      'Experience exposing structured data (JobPosting, Organization) and maintaining a public API or MCP surface.',
      'Familiarity with Postgres and a typed data layer such as Supabase.',
      'Contributions to open source, or writing you would be happy to link to in an interview.'
    ],
    benefits: [
      'Medical cover for you, your partner, and dependants, plus a life assurance policy.',
      'A published salary band, reviewed annually against market data.',
      'Hybrid schedule: two to three days in the Nairobi office, the rest wherever you work well.'
    ]
  },
  {
    company: 'safaricom',
    title: 'Data Engineer — Listings and Salary Transparency',
    slug: 'safaricom-data-engineer-listings',
    location: 'Nairobi, Kenya',
    workplace: 'remote',
    employment: 'full_time',
    seniority: 'senior',
    salary: [88000, 132000],
    visible: true,
    featured: false,
    views: 612,
    publishedDaysAgo: 4,
    expiresInDays: 45,
    skills: ['postgresql', 'python', 'sql', 'airflow', 'data-engineering'],
    tags: ['agent-ready', 'salary-transparent', 'remote-first'],
    intro: `Safaricom is hiring a data engineer to build the pipelines that turn raw hiring data into a clean, queryable, agent-readable layer. The output is not a dashboard for managers; it is the structured layer that both the public site and automated agents depend on to answer questions like "what does a senior data engineer earn at Safaricom, and where do they work?".

You will work with product and backend engineers on the shape of the tables, and you will own the indexes, freshness guarantees, and quality checks that make the layer trustworthy.`,
    responsibilities: [
      'Design and operate ingestion pipelines that normalise job, company, and salary data into the canonical tables the platform reads.',
      'Keep search fast: maintain full-text and GIN indexes and verify the plan for every query pattern the API generates.',
      'Define data quality checks and freshness SLAs, and make failures visible instead of silent.',
      'Publish aggregates that power salary transparency pages without exposing a full scan to every request.',
      'Document the data model well enough that an agent or a new engineer can answer questions about it without a meeting.'
    ],
    required: [
      '4+ years in data engineering, with strong Python and SQL.',
      'Deep Postgres knowledge: indexing, query plans, partitioning, and isolation.',
      'Production experience with a scheduler or orchestrator such as Airflow, Dagster, or dbt.',
      'A habit of validating data quality rather than assuming the upstream is correct.'
    ],
    nice: [
      'Experience building a public or partner-facing data API.',
      'Familiarity with search relevance, tsvector ranking, or vector search.',
      'Interest in making data legible to language models.'
    ],
    benefits: [
      'Fully remote within East Africa, with two optional on-site days per quarter.',
      'Published salary band and an annual review.',
      'Conference or training budget with five days of dedicated learning time a year.'
    ]
  },
  {
    company: 'safaricom',
    title: 'Backend Engineer — M-PESA Payments Platform',
    slug: 'safaricom-backend-engineer-mpesa',
    location: 'Nairobi, Kenya',
    workplace: 'onsite',
    employment: 'full_time',
    seniority: 'mid',
    salary: [70000, 105000],
    visible: true,
    featured: false,
    views: 903,
    publishedDaysAgo: 9,
    expiresInDays: 30,
    skills: ['go', 'postgresql', 'kubernetes', 'kafka', 'microservices'],
    tags: ['payments', 'reliability', 'high-scale'],
    intro: `This role sits inside the engineering team that keeps M-PESA transaction processing available. The systems are high throughput, heavily audited, and unforgiving of subtle errors: an idempotency mistake is a support escalation, and an availability mistake is a national story.

We are looking for an engineer who is comfortable in that environment and wants their work to be boring in the best possible way.`,
    responsibilities: [
      'Build and maintain services in the transaction processing path, with idempotency and reconciliation as first-class requirements.',
      'Write services that are safe to deploy on a Friday: feature flags, staged rollouts, and backward-compatible schemas.',
      'Instrument services so that on-call engineers can tell a real outage from a traffic spike in under five minutes.',
      'Take part in a fair, well-trodden on-call rotation, and fix the things that made it noisy.',
      'Review designs for auditability, because external auditors read this code.'
    ],
    required: [
      '3+ years building backend services in production.',
      'Strong in one of Go, Java, Kotlin, or Python, and comfort with the trade-offs of each.',
      'Working knowledge of distributed systems: idempotency, retries, consistency, and queues.',
      'Experience operating services in Kubernetes or a comparable environment.'
    ],
    nice: [
      'Payments or ledger experience, particularly around reconciliation.',
      'Observability tooling you have actually relied on during an incident.',
      'Performance work on a hot path.'
    ],
    benefits: [
      'On-site in Nairobi with subsidised transport and a subsidised cafeteria.',
      'Medical cover for the whole family.',
      'Structured on-call allowance and time off in lieu.'
    ]
  },
  {
    company: 'safaricom',
    title: 'Product Manager — Small Business and USSD',
    slug: 'safaricom-product-manager-usd',
    location: 'Nairobi, Kenya',
    workplace: 'hybrid',
    employment: 'full_time',
    seniority: 'lead',
    salary: [90000, 130000],
    visible: true,
    featured: false,
    views: 431,
    publishedDaysAgo: 16,
    expiresInDays: 60,
    skills: ['product-management', 'sql', 'user-research', 'analytics'],
    tags: ['fintech', 'emerging-markets', 'customer-facing'],
    intro: `Safaricom wants a product manager for the small-business and USSD portfolio: the flows through which a shop owner without a smartphone checks a balance, pays a supplier, or gets a mobile money statement.

This is product work in the hardest sense. There is no modern browser to optimise for, session lengths are measured in keypresses, and the constraint is often the cost of a USSD interaction rather than what a customer would ideally see. You will be the one deciding what to cut.`,
    responsibilities: [
      'Own a roadmap spanning USSD, mobile web, and the small-business app, and explain the trade-offs in plain language.',
      'Run field research with shop owners and agents, in Swahili and in their own premises, rather than only in the office.',
      'Define the metric that matters for each initiative, and hold the team to it after launch.',
      'Work with network and cost teams, because some product decisions are really tariff decisions.',
      'Write clear briefs that an engineer can implement without a follow-up meeting for every edge case.'
    ],
    required: [
      '4+ years in product management, at least one of them in a mobile or payments context.',
      'Genuine comfort with USSD or feature-phone constraints, or a strong willingness to learn them.',
      'Fluency in data: you can write your own SQL and interrogate it.',
      'Experience running discovery with users who are not early adopters.'
    ],
    nice: [
      'A second East African language.',
      'Background in agent or SME banking.',
      'Experience owning a product with per-transaction unit costs.'
    ],
    benefits: [
      'Published salary band.',
      'Hybrid schedule with field days budgeted into the quarter, not squeezed into evenings.',
      'Tuition support for a relevant qualification.'
    ]
  },
  {
    company: 'm-kopa',
    title: 'Senior Backend Engineer — Credit and Collections',
    slug: 'm-kopa-senior-backend-engineer-credit',
    location: 'Nairobi, Kenya',
    workplace: 'hybrid',
    employment: 'full_time',
    seniority: 'senior',
    salary: [78000, 115000],
    visible: true,
    featured: true,
    views: 1587,
    publishedDaysAgo: 2,
    expiresInDays: 45,
    skills: ['python', 'postgresql', 'fastapi', 'celery', 'aws'],
    tags: ['fintech', 'lending', 'salary-transparent'],
    intro: `M-KOPA's credit engine decides who gets a financed phone, and its collections system decides what happens when someone falls behind. Both are built on repayment behaviour rather than credit history, because our customers have no credit file. That makes the engineering interesting: the rules are subtle, the data is behavioural, and the consequences of a bug are real people's devices.

We are looking for a senior engineer who can own a system end to end and reason carefully about correctness in a domain where rounding errors and timezone bugs become actual losses.`,
    responsibilities: [
      'Own services behind credit decisions, disbursement, and repayment collection, and keep their behaviour predictable under change.',
      'Make state machines explicit: a loan is a sequence of transitions, and every illegal transition should be impossible, not merely discouraged.',
      'Build idempotency into anything that moves money or touches a mobile money provider.',
      'Add the test coverage that lets a new engineer change pricing logic without fear.',
      'Participate in incident review and carry the follow-through to completion.'
    ],
    required: [
      '5+ years of backend engineering, including at least one system in a financial or transactional domain.',
      'Strong Python and relational database design, including transactions and locking.',
      'Experience with asynchronous work: queues, retries, dead letters, and idempotent consumers.',
      'Clear written communication, because half the job is aligning with risk and finance teams.'
    ],
    nice: [
      'Experience with mobile money integrations such as M-PESA.',
      'Familiarity with a cloud-native deployment workflow you have debugged under pressure.',
      'Interest in credit policy and how it is operationalised.'
    ],
    benefits: [
      'Published salary band, adjusted twice a year against market data.',
      'Medical, dental, and life cover for you and your dependants.',
      'Hybrid: three days in the office, two fully remote, negotiable per team.'
    ]
  },
  {
    company: 'm-kopa',
    title: 'Android Engineer — Customer App',
    slug: 'm-kopa-android-engineer',
    location: 'Remote, East Africa',
    workplace: 'remote',
    employment: 'full_time',
    seniority: 'mid',
    salary: [65000, 95000],
    visible: true,
    featured: false,
    views: 743,
    publishedDaysAgo: 6,
    expiresInDays: 45,
    skills: ['kotlin', 'android', 'jetpack-compose', 'mvvm', 'testing'],
    tags: ['mobile', 'low-bandwidth', 'fintech'],
    intro: `M-KOPA's customer app is used on low-end Android devices across six markets, often on 2G-equivalent connections with limited storage. Making it feel fast and reliable under those conditions is the actual product challenge, and it is a more interesting constraint than most app teams work under.

This role sits in the mobile team building the app customers use to pay, view their balance, and manage their account.`,
    responsibilities: [
      'Build and maintain customer-facing screens in Kotlin and Jetpack Compose.',
      'Own offline behaviour: the app must degrade gracefully when the network drops mid-payment.',
      'Keep the install size and memory footprint low enough for the devices our customers actually own.',
      'Write instrumentation tests for the flows where a bug costs a real payment.',
      'Work with the backend team on the API contract, and say clearly when it is the API that needs to change.'
    ],
    required: [
      '3+ years of Android development in production.',
      'Kotlin, modern Android architecture patterns, and a testing practice you would defend in review.',
      'Genuine empathy for low-end devices and constrained networks.'
    ],
    nice: [
      'Experience with mobile money or payments flows.',
      'Performance profiling work that produced measurable improvements.',
      'CI and release engineering experience.'
    ],
    benefits: [
      'Fully remote across East Africa, with two optional meetups a year in Nairobi.',
      'Published salary band.',
      'Device budget and a home office setup allowance.'
    ]
  },
  {
    company: 'm-kopa',
    title: 'Data Scientist — Credit Risk Modelling',
    slug: 'm-kopa-data-scientist-risk',
    location: 'Nairobi, Kenya',
    workplace: 'hybrid',
    employment: 'full_time',
    seniority: 'senior',
    salary: [82000, 120000],
    visible: true,
    featured: false,
    views: 588,
    publishedDaysAgo: 11,
    expiresInDays: 30,
    skills: ['python', 'machine-learning', 'sql', 'statistics', 'pandas'],
    tags: ['fintech', 'lending', 'responsible-ml'],
    intro: `M-KOPA is hiring a data scientist to improve how we assess credit for customers who have no conventional credit history. The data is behavioural: repayment patterns, USSD interaction, device characteristics, and consistency of cash flow. The work is closer to applied risk than to research, and every model decision has to be explainable to a risk manager and defensible to a regulator.

This is a role for someone who wants their models to affect real decisions, and who is equally comfortable arguing about calibration as about architecture.`,
    responsibilities: [
      'Develop and maintain models for credit scoring and repayment forecasting, with a bias and fairness review on every release.',
      'Validate models against realised outcomes, and write down where they fail.',
      'Work with risk and collections to turn model output into an operational decision, not a report.',
      'Build the monitoring that catches drift before it costs money.',
      'Explain model behaviour clearly to non-technical stakeholders, including where the model is least reliable.'
    ],
    required: [
      '4+ years in applied data science with production models.',
      'Strong Python and SQL, and real statistics rather than familiarity with the words.',
      'Experience with imbalanced outcomes and class-imbalance-aware evaluation.',
      'Rigour about fairness, explainability, and documentation.'
    ],
    nice: [
      'Credit risk, lending, or collections experience.',
      'Experience with a formal model governance process.',
      'Ability to prototype quickly in a notebook and then productionise.'
    ],
    benefits: [
      'Published salary band.',
      'Hybrid schedule, three days on site.',
      'Conference attendance and a research budget.'
    ]
  },
  {
    company: 'm-kopa',
    title: 'Customer Operations Intern',
    slug: 'm-kopa-customer-operations-intern',
    location: 'Nairobi, Kenya',
    workplace: 'onsite',
    employment: 'internship',
    seniority: 'internship',
    salary: [12000, 18000],
    visible: true,
    featured: false,
    views: 1102,
    publishedDaysAgo: 3,
    expiresInDays: 21,
    skills: ['customer-support', 'excel', 'communication'],
    tags: ['early-career', 'mentorship', 'operations'],
    intro: `This is a six-month paid internship on the customer operations team at M-KOPA, working directly with customers who are paying off a financed phone or a solar system and who sometimes need help at a difficult moment.

You will be mentored by a team lead, given real work rather than shadowing, and expected to be useful from week two. Past interns have gone on to full-time roles in operations, risk, and product.`,
    responsibilities: [
      'Handle customer contacts across phone, WhatsApp, and the internal case tool.',
      'Keep case records accurate and up to date, including the resolution notes other teams depend on.',
      'Spot recurring problems and write them up so the product or collections team can act on them.',
      'Report daily on the numbers that matter: cases opened, resolved, and escalated.',
      'Ask for help early rather than at the end of a shift.'
    ],
    required: [
      'Clear written and spoken English; Swahili is an advantage.',
      'Patience and the willingness to be the person a customer is glad to hear from.',
      'Basic spreadsheet competence.',
      'Availability on site in Nairobi for the full six months.'
    ],
    nice: [
      'Previous customer-facing work, including part-time or voluntary roles.',
      'Interest in fintech or consumer credit.'
    ],
    benefits: [
      'Paid internship with a named mentor and a written development plan.',
      'Pathway to a full-time operations role at the end of the programme.',
      'Lunch and transport provided.'
    ]
  },
  {
    company: 'twiga-foods',
    title: 'Senior Software Engineer — Logistics and Routing',
    slug: 'twiga-senior-software-engineer-logistics',
    location: 'Nairobi, Kenya',
    workplace: 'hybrid',
    employment: 'full_time',
    seniority: 'senior',
    salary: [75000, 110000],
    visible: true,
    featured: true,
    views: 967,
    publishedDaysAgo: 5,
    expiresInDays: 45,
    skills: ['typescript', 'node', 'postgresql', 'algorithms', 'vue'],
    tags: ['logistics', 'optimisation', 'salary-transparent'],
    intro: `Twiga Foods moves fresh produce from smallholder farmers to restaurants within hours of harvest. The constraint is physical: a route has to be driven, a truck has a load capacity, and a restaurant has a delivery window. Turning that into software is what this team does, and the person who joins it will own the routing surface that dispatchers rely on every morning.

The work is unusually concrete. You will see your scheduling change on a real route the following day.`,
    responsibilities: [
      'Own the dispatch and routing services that decide which truck serves which order.',
      'Improve the constraint solver: capacity, delivery windows, and driver hours all compete.',
      'Make the dispatch UI fast, because a dispatcher working from a phone in the yard cannot wait for a spinner.',
      'Handle the messy real world: a driver who calls in sick, a customer who cancels at 06:00, a road that is closed.',
      'Write the tests that let dispatchers trust a change you made last week.'
    ],
    required: [
      '5+ years of software engineering, with real backend experience.',
      'Strong TypeScript and a relational database you are comfortable designing.',
      'Some exposure to scheduling, routing, or optimisation problems, or clear evidence you can learn one quickly.',
      'Practical instincts about performance in an interactive tool.'
    ],
    nice: [
      'Experience with OR-Tools, linear programming, or a similar solver.',
      'Background in logistics, supply chain, or field operations.',
      'Exposure to map and routing services.'
    ],
    benefits: [
      'Published salary band.',
      'Hybrid: three days on site, two remote.',
      'Produce discount and lunch on warehouse days.'
    ]
  },
  {
    company: 'twiga-foods',
    title: 'Field Operations Manager — Farmer Network',
    slug: 'twiga-field-operations-manager',
    location: 'Nakuru, Kenya',
    workplace: 'onsite',
    employment: 'full_time',
    seniority: 'mid',
    salary: [42000, 60000],
    visible: true,
    featured: false,
    views: 402,
    publishedDaysAgo: 14,
    expiresInDays: 30,
    skills: ['operations', 'farmer-engagement', 'excel', 'logistics'],
    tags: ['field-operations', 'early-career-leadership'],
    intro: `Twiga Foods is looking for a field operations manager to lead the farmer network in Nakuru county. You will be the link between the agronomists and the software: you know what farmers will actually agree to, and you can turn that into a requirement the product team can build.

This is a people role with numbers attached. You will manage a field team, own collection targets, and spend a lot of time in the field rather than at a desk.`,
    responsibilities: [
      'Manage and grow a network of farmer suppliers across Nakuru county.',
      'Own weekly collection volumes and quality grading targets, and report against them honestly.',
      'Work with the product team to test new collection tools with farmers, and to kill the ones that do not work.',
      'Resolve the day-to-day problems nobody wrote a process for.',
      'Coach field officers and raise the standard of record-keeping across the team.'
    ],
    required: [
      '3+ years in operations, ideally in agriculture, aggregation, or FMCG distribution.',
      'Fluency in Swahili and working English.',
      'Comfort with spreadsheets and basic data analysis.',
      'Willingness to travel within the county regularly.'
    ],
    nice: [
      'Agronomy training or a relevant certificate.',
      'Experience with a collection or field sales network.',
      'A bike or motorcycle licence.'
    ],
    benefits: [
      'Medical cover and a transport allowance.',
      'Bonus tied to collection targets, paid quarterly.',
      'Company laptop and phone.'
    ]
  },
  {
    company: 'twiga-foods',
    title: 'QA Engineer — Mobile and Web',
    slug: 'twiga-qa-engineer',
    location: 'Nairobi, Kenya',
    workplace: 'remote',
    employment: 'contract',
    seniority: 'mid',
    salary: [9000, 13000],
    visible: false,
    featured: false,
    views: 214,
    publishedDaysAgo: 8,
    expiresInDays: 40,
    skills: ['testing', 'cypress', 'playwright', 'postman', 'api-testing'],
    tags: ['contract', 'automation', 'quality'],
    intro: `Twiga Foods is looking for a contract QA engineer to strengthen automated testing across our customer ordering flows and the internal tools our field teams rely on.

The engagement is a six-month contract with a strong possibility of extension. You will have real authority over the test strategy for your scope, and the support of the engineering leads who own the code.`,
    responsibilities: [
      'Own automated end-to-end coverage for the ordering and collection flows.',
      'Keep the API test suite fast and trustworthy, so it is something people run rather than something people ignore.',
      'Add regression coverage for every production incident, agreed with the team.',
      'Make failures diagnosable: a red build should tell you what broke, not that something broke.',
      'Work with engineers on testability, rather than working around code that cannot be tested.'
    ],
    required: [
      '3+ years in test automation for web and mobile.',
      'Strong Playwright or Cypress experience, and API testing with Postman or similar.',
      'SQL comfort for data verification.',
      'Available for six months, at least four days a week.'
    ],
    nice: [
      'Performance or load testing experience.',
      'CI pipeline ownership.',
      'Experience testing on real low-end devices or slow networks.'
    ],
    benefits: [
      'Competitive day rate, paid monthly.',
      'Fully remote with flexible hours.',
      'Extension to a permanent role if the fit is right.'
    ]
  },
  {
    company: 'sendy',
    title: 'Backend Engineer — Dispatch and Tracking',
    slug: 'sendy-backend-engineer-dispatch',
    location: 'Nairobi, Kenya',
    workplace: 'hybrid',
    employment: 'full_time',
    seniority: 'mid',
    salary: [68000, 98000],
    visible: true,
    featured: false,
    views: 846,
    publishedDaysAgo: 7,
    expiresInDays: 45,
    skills: ['typescript', 'node', 'postgresql', 'redis', 'websocket'],
    tags: ['logistics', 'real-time', 'high-scale'],
    intro: `Sendy's dispatch engine assigns a job to a rider, and the tracking surface shows the customer where their parcel is. Both live or die on real-time behaviour, which is what this role is about.

You will work on services that handle a high volume of small, fast-moving events, and on the API that enterprise shippers integrate against. Reliability and clarity matter more here than novelty.`,
    responsibilities: [
      'Build and operate the dispatch services that match jobs to riders in real time.',
      'Improve tracking accuracy and ETA quality, including how the UI behaves when a signal is stale.',
      'Design the public API for regular shippers, with versioning and a real deprecation policy.',
      'Reduce operational cost per delivery, which is the number the business is judged on.',
      'Join the on-call rotation and improve the alerts so the noise goes down.'
    ],
    required: [
      '3+ years backend engineering with TypeScript or Node in production.',
      'Solid understanding of concurrency, queues, and state machines.',
      'Postgres fluency, including query tuning and locking.',
      'Experience with a customer-facing API and its clients.'
    ],
    nice: [
      'Real-time systems, WebSockets, or location data.',
      'Payments integration.',
      'Mapping or routing services experience.'
    ],
    benefits: [
      'Published salary band.',
      'Hybrid: two days a week in the Nairobi office.',
      'Rider-network discount and fuel or transport support.'
    ]
  },
  {
    company: 'sendy',
    title: 'Product Designer — Rider and Customer Apps',
    slug: 'sendy-product-designer',
    location: 'Nairobi, Kenya',
    workplace: 'hybrid',
    employment: 'full_time',
    seniority: 'senior',
    salary: [72000, 105000],
    visible: true,
    featured: false,
    views: 377,
    publishedDaysAgo: 13,
    expiresInDays: 30,
    skills: ['figma', 'ux-design', 'design-systems', 'user-research', 'accessibility'],
    tags: ['design', 'mobile-first', 'low-bandwidth'],
    intro: `Sendy is looking for a product designer who can work across two very different interfaces: a customer booking a delivery, and a rider on a motorcycle with one hand and a cracked screen.

The role needs someone who can hold both contexts at once, design for genuinely constrained devices, and work in the field rather than only in a design file.`,
    responsibilities: [
      'Own the design for rider flows end to end, from on-boarding to cash-out.',
      'Design for real conditions: sunlight, vibration, gloves, and intermittent data.',
      'Extend the design system so a new flow costs days rather than weeks.',
      'Run usability sessions with riders and customers, in person, on their own devices.',
      'Partner with engineering closely enough that what is designed is what ships.'
    ],
    required: [
      '4+ years in product design with a portfolio that shows shipped work, not just concept screens.',
      'Strong interaction design for small screens.',
      'Systems thinking: you can define components and rules, not just draw screens.',
      'Willingness to be in the field.'
    ],
    nice: [
      'Experience designing for low-connectivity markets.',
      'Motion or prototyping skills.',
      'A background in front-end implementation.'
    ],
    benefits: [
      'Published salary band.',
      'Hybrid schedule with two office days.',
      'Field travel budget and a testing device budget.'
    ]
  },
  {
    company: 'sendy',
    title: 'Growth Analyst',
    slug: 'sendy-growth-analyst',
    location: 'Remote, East Africa',
    workplace: 'remote',
    employment: 'part_time',
    seniority: 'mid',
    salary: [14000, 20000],
    visible: true,
    featured: false,
    views: 205,
    publishedDaysAgo: 19,
    expiresInDays: 60,
    skills: ['sql', 'analytics', 'experimentation', 'python'],
    tags: ['part-time', 'analytics', 'growth'],
    intro: `Sendy is hiring a part-time growth analyst to help the team understand what actually drives a first delivery, and what makes customers come back.

This is a three-day-a-week role with genuine ownership of the growth question. You will define the metrics, run the analysis, and present the findings to the people who can act on them.`,
    responsibilities: [
      'Own the funnel from signup to first completed delivery, and make it legible to the whole company.',
      'Design and read experiments properly, including the ones that come back inconclusive.',
      'Build the self-serve dashboards that let product teams answer their own questions.',
      'Challenge assumptions with data rather than enthusiasm.'
    ],
    required: [
      '3+ years in analytics or data science.',
      'Excellent SQL and comfort with a modern BI tool.',
      'Understanding of experimentation design and its limits.',
      'Available three days per week, with at least one overlapping with the Nairobi team.'
    ],
    nice: [
      'Marketplace or logistics metrics experience.',
      'Python for analysis beyond SQL.',
      'Experience with a mobile marketplace.'
    ],
    benefits: [
      'Pro-rated salary with a three-day week.',
      'Fully remote, with a once-a-month team day in Nairobi.',
      'Flexible hours around your other commitments.'
    ]
  },
  {
    company: 'cellulant',
    title: 'Platform Engineer — Kubernetes and Infrastructure',
    slug: 'cellulant-platform-engineer',
    location: 'Nairobi, Kenya',
    workplace: 'hybrid',
    employment: 'full_time',
    seniority: 'senior',
    salary: [85000, 125000],
    visible: true,
    featured: false,
    views: 521,
    publishedDaysAgo: 10,
    expiresInDays: 45,
    skills: ['kubernetes', 'terraform', 'aws', 'observability', 'go'],
    tags: ['platform', 'reliability', 'regulated'],
    intro: `Cellulant's platform team builds the infrastructure that banks and mobile money operators run payments on. That means multi-region, audited, and extremely boring in the best sense. When it is not boring, it is an incident that involves a central bank.

This role is for a senior engineer who wants to own infrastructure that other engineers depend on and who enjoys the discipline of a regulated environment.`,
    responsibilities: [
      'Own the Kubernetes platform that runs payment services, and keep it boring and patchable.',
      'Codify infrastructure in Terraform so a new environment is a pull request rather than a wiki page.',
      'Improve observability so that an operator can answer "is it us or them?" in minutes.',
      'Lead the response to infrastructure incidents, including the write-up afterwards.',
      'Support and enforce the compliance controls that auditors and regulators expect.'
    ],
    required: [
      '5+ years in infrastructure or platform engineering.',
      'Production Kubernetes and infrastructure-as-code experience.',
      'Fluency in at least one of Go, Python, or Bash at a level you can maintain.',
      'A track record of reducing incident severity, not just responding to it.'
    ],
    nice: [
      'Payments, banking, or other regulated-industry infrastructure.',
      'Multi-region and disaster recovery design.',
      'Certificate management and workload identity.'
    ],
    benefits: [
      'Published salary band.',
      'Hybrid: three days in the Nairobi office.',
      'Certification support and an on-call allowance.'
    ]
  },
  {
    company: 'cellulant',
    title: 'Technical Writer — Payments APIs',
    slug: 'cellulant-technical-writer',
    location: 'Remote, Africa',
    workplace: 'remote',
    employment: 'contract',
    seniority: 'mid',
    salary: [8000, 12000],
    visible: true,
    featured: false,
    views: 168,
    publishedDaysAgo: 18,
    expiresInDays: 50,
    skills: ['technical-writing', 'api-documentation', 'openapi', 'markdown'],
    tags: ['contract', 'developer-experience', 'remote-first'],
    intro: `Cellulant is looking for a technical writer to own the documentation for its collections and payouts APIs. Our integration partners are banks and fintechs whose engineers need to implement a payment flow correctly the first time, and our current docs do not always make that easy.

This is a six-month contract with a strong chance of becoming permanent. You will work directly with the engineers who built the API, which is the only way documentation gets genuinely good.`,
    responsibilities: [
      'Own the API reference, quickstarts, and integration guides.',
      'Write examples in at least two languages that actually run, and keep them in CI.',
      'Turn the top ten support tickets into documentation, and watch the number fall.',
      'Define and enforce a documentation style so the site stays consistent.',
      'Make the docs machine-readable, so an agent can use them as well as a human can.'
    ],
    required: [
      '3+ years writing developer documentation for an API or SDK.',
      'Ability to read code in at least one language well enough to test your own examples.',
      'Clear, plain English with no tolerance for filler.',
      'Available for six months, at least four days a week.'
    ],
    nice: [
      'Payments or fintech documentation experience.',
      'Familiarity with OpenAPI, Docusaurus, or a similar stack.',
      'Interest in LLM-readable documentation formats.'
    ],
    benefits: [
      'Competitive day rate paid monthly.',
      'Fully remote across African time zones.',
      'Strong likelihood of converting to a permanent role.'
    ]
  },
  {
    company: 'ihub-nairobi',
    title: 'Full-Stack Developer — Community Platform',
    slug: 'ihub-full-stack-developer',
    location: 'Nairobi, Kenya',
    workplace: 'onsite',
    employment: 'full_time',
    seniority: 'junior',
    salary: [38000, 52000],
    visible: true,
    featured: false,
    views: 336,
    publishedDaysAgo: 6,
    expiresInDays: 40,
    skills: ['typescript', 'vue', 'nuxt', 'postgresql', 'css'],
    tags: ['early-career', 'breadth', 'mentorship'],
    intro: `iHub Nairobi is hiring a full-stack developer to work on the platform that runs our community: event listings, programme applications, resident directory, and the tools our mentors use.

This is a deliberately broad role. You will touch the front end, the API, and the database, and you will have a senior engineer reviewing your work closely. If you want to learn quickly by owning real features, this is the job.`,
    responsibilities: [
      'Build and maintain features across the Nuxt front end and the API behind it.',
      'Keep the event and programme tooling reliable during busy enrolment periods.',
      'Improve accessibility, because the community includes people using assistive technology.',
      'Write documentation for the platform so other teams can use it without asking you.',
      'Take part in internal workshops and help run the community tech sessions.'
    ],
    required: [
      '1–3 years of professional web development, or a strong portfolio from a bootcamp or self-teaching.',
      'Solid JavaScript or TypeScript and a working grasp of HTML and CSS.',
      'Some database experience; you do not need to be an expert.',
      'Genuine curiosity and the habit of asking questions early.'
    ],
    nice: [
      'Experience with Nuxt, Vue, or any similar framework.',
      'Any exposure to payments, ticketing, or scheduling.',
      'Community or events experience.'
    ],
    benefits: [
      'Published salary band for the band you are hired into.',
      'On-site in Kileleshwa with a flexible start time.',
      'Free access to all iHub programmes, events, and community sessions.'
    ]
  },
  {
    company: 'ihub-nairobi',
    title: 'Community Programme Intern',
    slug: 'ihub-community-programme-intern',
    location: 'Nairobi, Kenya',
    workplace: 'onsite',
    employment: 'part_time',
    seniority: 'internship',
    salary: [8000, 12000],
    visible: false,
    featured: false,
    views: 129,
    publishedDaysAgo: 22,
    expiresInDays: 25,
    skills: ['communication', 'events', 'community', 'documentation'],
    tags: ['early-career', 'community', 'part-time'],
    intro: `iHub Nairobi is looking for a part-time community programme intern to help run our training and mentorship programmes. You will coordinate sessions, support mentors, and keep the programme documentation current.

This is a four-day-a-week, six-month internship. It is a good fit if you are early in your studies or career and want experience running real programmes with real stakeholders.`,
    responsibilities: [
      'Coordinate training sessions: venue, materials, attendance, and follow-up.',
      'Support mentors and participants, and escalate the things you cannot solve.',
      'Keep programme documentation and reporting up to date.',
      'Gather participant feedback and summarise it honestly.',
      'Help run community events, including some evening sessions.'
    ],
    required: [
      'Clear English, and Swahili is an advantage.',
      'Organisational reliability.',
      'A willingness to work in the community rather than only at a desk.',
      'Available four days a week for six months.'
    ],
    nice: [
      'Interest in tech, entrepreneurship, or innovation.',
      'Event or project coordination experience.'
    ],
    benefits: [
      'Paid internship with mentorship.',
      'Access to all iHub programmes and events.',
      'Lunch provided on working days.'
    ]
  }
]

/* --------------------------------------------------------------- rendering */

const COMPANY_BY_SLUG = new Map(companies.map(c => [c.slug, c]))

const usd = n => `$${n.toLocaleString('en-US')}`

function descriptionFor(job) {
  const company = COMPANY_BY_SLUG.get(job.company)
  const salaryLine = job.visible
    ? `- **Published salary range:** ${usd(job.salary[0])} – ${usd(job.salary[1])} USD per year, before tax. This is the real band, not a placeholder.`
    : '- **Salary:** not published on this listing. The range is discussed at the first interview.'

  return `## About the role

${job.intro}

## What you'll do

${job.responsibilities.map(r => `- ${r}`).join('\n')}

## What you'll bring

**Required**

${job.required.map(r => `- ${r}`).join('\n')}

**Nice to have**

${job.nice.map(r => `- ${r}`).join('\n')}

## Compensation and benefits

${salaryLine}
${job.benefits.map(b => `- ${b}`).join('\n')}

## Working arrangements

- **Location:** ${job.location}
- **Workplace:** ${job.workplace}
- **Employment type:** ${job.employment.replace('_', ' ')}

## About ${company.name}

${company.description.split('\n\n').filter(Boolean).join('\n\n')}

## How to apply

Apply on the ${company.name} careers page or by email. This listing is published on Patakazi, an agent-readable job board, so you can also hand the structured listing to an assistant and get a shortlist instead of a wall of text.

**${company.name}** — ${company.industry} · ${company.size.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())} · founded ${company.founded} · ${company.location}
`
}

/* ------------------------------------------------------------------- SQL */

const q = s => `'${String(s).replace(/'/g, '\'\'')}'`
const arr = v => `array[${v.map(q).join(', ')}]`

function companyRows() {
  return companies.map(c => `  (${q(c.id)}, ${q(c.name)}, ${q(c.slug)}, ${q(c.description)}, ${q(c.website)}, ${q(c.industry)}, ${q(c.size)}, ${c.founded}, ${q(c.location)}, ${q(c.services)}, ${q(c.workingHours)}, '', ${q(OWNER)}, ${c.verified})`)
}

/** Deterministic UUID per job, so the SQL and the live rows agree. */
const jobId = n => `d0000001-0000-4000-8000-${String(n).padStart(12, '0')}`
const careersHost = slug => (slug === 'ihub-nairobi' ? 'ihub.co.ke' : `${slug}.example`)

function jobRows() {
  return jobs.map((j, i) => {
    const c = COMPANY_BY_SLUG.get(j.company)
    return `  (${q(jobId(i + 1))}, ${q(j.title)}, ${q(j.slug)}, ${q(descriptionFor(j))}, ${q(c.id)}, ${q(c.name)}, ${q(c.slug)}, '', ${q(j.location)}, ${q(j.workplace)}, ${q(j.employment)}, ${q(j.seniority)}, ${j.salary[0]}, ${j.salary[1]}, 'USD', 'year', ${j.visible}, ${arr(j.skills)}, ${arr(j.tags)}, ${q(`https://${careersHost(c.slug)}/careers`)}, ${q(`careers@${c.slug}.example`)}, 'published', ${q(ago(j.publishedDaysAgo))}, ${q(ahead(j.expiresInDays))}, ${j.views}, ${j.featured}, ${q(OWNER)})`
  })
}

const sql = `-- ===========================================================================
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
${companyRows().join(',\n')}
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
${jobRows().join(',\n')}
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
  '${OWNER}'
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
  '${OWNER}'
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
`

writeFileSync('/home/repoleved08/Projects/techxtrasol/nuxt/airbnb/supabase/seed.sql', sql)
console.log(`wrote supabase/seed.sql: ${companies.length} companies, ${jobs.length + 2} jobs`)

/* ------------------------------------------------------------------ remote */

async function remote() {
  const url = process.env.NUXT_PUBLIC_SUPABASE_URL
  const key = process.env.NUXT_SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('missing supabase env')
  const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

  // `id` is deliberately omitted from every payload. PostgREST includes supplied
  // columns in the DO UPDATE SET clause, so sending an id would try to move an
  // existing row's primary key and break every job that references it. Rows keep
  // whatever id they already have, and we read the real ids back below.
  for (const c of companies) {
    const { error } = await db.from('companies').upsert({
      name: c.name,
      slug: c.slug,
      description: c.description,
      website: c.website,
      industry: c.industry,
      size: c.size,
      founded: c.founded,
      location: c.location,
      services: c.services,
      working_hours: c.workingHours,
      logo_id: '',
      owner_id: OWNER,
      verified: c.verified
    }, { onConflict: 'slug' })
    if (error) throw new Error(`company ${c.slug}: ${error.message}`)
  }

  const { data: companyRowsBack, error: readError } = await db
    .from('companies')
    .select('id, slug')
    .in('slug', companies.map(c => c.slug))
  if (readError) throw new Error(`company read: ${readError.message}`)
  const idBySlug = new Map(companyRowsBack.map(r => [r.slug, r.id]))
  for (const c of companies) {
    if (!idBySlug.has(c.slug)) throw new Error(`company ${c.slug} missing after upsert`)
  }
  console.log(`companies: ${companies.length}`)

  const extra = [
    {
      company: 'm-kopa',
      title: 'Head of Data Platform (Filled)',
      slug: 'm-kopa-head-of-data-platform-filled',
      description: 'This role has been filled. It is kept in the database so the closed-listing state is represented in development and demos.',
      seniority: 'director', workplace: 'hybrid', employment: 'full_time',
      location: 'Nairobi, Kenya', salary: [140000, 180000], visible: true,
      skills: ['data-engineering', 'leadership', 'python', 'postgresql'],
      tags: ['filled', 'historical'], views: 2814, status: 'closed',
      publishedDaysAgo: 120, expiresInDays: -30
    },
    {
      company: 'twiga-foods',
      title: 'Machine Learning Engineer (Draft)',
      slug: 'twiga-machine-learning-engineer-draft',
      description: 'This listing is still a draft. It exists so the draft state, and the publish flow, can be tested without creating a real post.',
      seniority: 'senior', workplace: 'hybrid', employment: 'full_time',
      location: 'Nairobi, Kenya', salary: [80000, 115000], visible: true,
      skills: ['python', 'machine-learning', 'forecasting'],
      tags: ['draft', 'unpublished'], views: 0, status: 'draft',
      publishedDaysAgo: null, expiresInDays: null
    }
  ]

  for (const j of [...jobs, ...extra]) {
    const c = COMPANY_BY_SLUG.get(j.company)
    const { error } = await db.from('jobs').upsert({
      title: j.title,
      slug: j.slug,
      description: j.description ?? descriptionFor(j),
      company_id: idBySlug.get(c.slug),
      company_name: c.name,
      company_slug: c.slug,
      company_logo_id: '',
      location: j.location,
      workplace_type: j.workplace,
      employment_type: j.employment,
      seniority: j.seniority,
      salary_min: j.salary[0],
      salary_max: j.salary[1],
      salary_currency: 'USD',
      salary_period: 'year',
      salary_visible: j.visible,
      skills: j.skills,
      tags: j.tags,
      apply_url: `https://${c.slug === 'ihub-nairobi' ? 'ihub.co.ke' : c.slug}.example/careers`,
      apply_email: `careers@${c.slug}.example`,
      status: j.status ?? 'published',
      published_at: j.publishedDaysAgo === null ? null : ago(j.publishedDaysAgo),
      expires_at: j.expiresInDays === null ? null : ahead(j.expiresInDays),
      views: j.views,
      featured: j.featured ?? false,
      created_by: OWNER
    }, { onConflict: 'slug' })
    if (error) throw new Error(`job ${j.slug}: ${error.message}`)
  }
  console.log(`jobs: ${jobs.length + extra.length}`)

  // Rows written by earlier ad-hoc seeding runs, superseded by this dataset.
  const legacyJobSlugs = ['senior-frontend-engineer', 'senior-frontend-engineer-safaricom', 'data-engineer-safaricom']
  const { error: legacyJobs } = await db.from('jobs').delete().in('slug', legacyJobSlugs)
  if (legacyJobs) throw new Error(`legacy job cleanup: ${legacyJobs.message}`)
  const { error: legacyCompanies } = await db.from('companies').delete().eq('slug', 'patakazi-labs')
  if (legacyCompanies) throw new Error(`legacy company cleanup: ${legacyCompanies.message}`)

  // profiles.user_id references auth.users, so the remote path assumes the demo
  // account exists (it is created through the Auth admin API, not by seeding).
  const { error: profileError } = await db.from('profiles').upsert({
    user_id: OWNER,
    full_name: 'Jordan Mwangi',
    headline: 'Senior Frontend Engineer \u2014 agent-readable interfaces',
    summary: 'Frontend engineer focused on fast, accessible, structured-data-driven interfaces. Six years building design systems and public web surfaces in Vue and Nuxt, with a lot of attention on how well a page performs on a cheap Android phone over a metered connection.',
    location: 'Nairobi, Kenya',
    skills: ['nuxt', 'typescript', 'vue', 'tailwind', 'accessibility', 'performance'],
    resume_id: '',
    portfolio_url: 'https://portfolio.example',
    linkedin_url: 'https://www.linkedin.com/in/example',
    open_to_work: true,
    role: 'admin',
    is_active: true
  }, { onConflict: 'user_id' })
  if (profileError) throw new Error(`profile: ${profileError.message}`)
  console.log('profile: ok')

  const slugs = [...jobs, ...extra].map(j => j.slug)
  const { data: saved } = await db.from('jobs').select('id, slug').in('slug', slugs.slice(0, 3))
  if (saved?.length) {
    const { error } = await db.from('saved_jobs')
      .upsert(saved.map(s => ({ user_id: OWNER, job_id: s.id })), { onConflict: 'user_id,job_id', ignoreDuplicates: true })
    if (error) throw new Error(`saved: ${error.message}`)
  }
  console.log('saved_jobs: ok')
}

if (process.argv.includes('--remote')) await remote()
