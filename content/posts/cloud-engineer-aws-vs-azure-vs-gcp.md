---
title: "Cloud engineer in practice: AWS vs Azure vs GCP, and what the job is"
description: "What cloud engineers actually build, how AWS, Azure and GCP differ in practice, and the skills that transfer between them."
date: "2026-08-04"
author: "Editorial team"
image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31"
tags:
  - cloud
  - devops
  - infrastructure
  - careers
draft: false
---

Cloud engineering has an image problem. The job posting talks about "empowering
teams to deliver value through cloud transformation" and lists thirty
certifications. The actual job is closer to: keep a set of servers running,
cheaply, reliably, and in a way that a new engineer can reason about at 2am.

This is what the work involves and how the three major providers genuinely
differ.

## What the job actually is

A cloud engineer sits between the application and the platform it runs on. In
practice the work clusters into four areas.

**Infrastructure as code.** Terraform is the default answer, with OpenTofu as a
credible alternative. The job is not writing templates; it is knowing what
belongs in a module, how to structure state so two engineers do not fight, and
how to make a change reviewable. A diff that recreates a database is a bad
diff, and the design work is preventing that.

**Container orchestration.** Kubernetes, or the managed equivalent. Deployments,
rollouts, resource limits, autoscaling, and the service mesh if the organisation
is big enough to regret it.

**Networking and identity.** VPCs, subnets, routing, DNS, load balancers, and
the IAM model, which is where the real security decisions live.

**Reliability.** On-call, alerting that people trust, dashboards that answer
questions, capacity planning, and post-incident work that changes something.

## How the providers differ in practice

| | AWS | Azure | GCP |
| --- | --- | --- | --- |
| Service catalogue | Widest, most mature | Broadest for enterprise Microsoft estates | Smallest, opinionated |
| Hybrid story | Works, not the pitch | Strongest, via Arc and Stack | Weakest |
| IAM model | Policy documents, explicit | Azure RBAC plus management groups | IAM, simplest of the three |
| Networking | VPC, mature, opinionated | VNet, integrated with on-prem | VPC, most approachable |
| Best fit | Broadest default choice | Microsoft-centred enterprises | Data and ML workloads |
| Main frustration | Surprising defaults, cost | Naming, and portal sprawl | Fewer escape hatches |

**The honest summary:** the differences that shape your day are the identity
model and the networking model. Everything else is a library of managed
services that map across reasonably cleanly. Enterprise estates on Microsoft
often end up on Azure for reasons that were decided years earlier, and that is
a legitimate career path.

## Skills that transfer, and skills that don't

**Transfers:** Terraform or OpenTofu, Kubernetes, Linux administration, networking fundamentals, Python, CI/CD, observability, and — most importantly — the habit of writing things down.

**Does not transfer cleanly:** provider-specific managed services, IAM
vocabulary, and console fluency. A team that runs everything through a console
has an operational problem that no certificate addresses.

The skills that actually predict success in cloud work are unglamorous: reading
a bill, tracing a request end to end, and being the person who can explain why
the architecture is shaped the way it is.

## Cost is the job nobody was hired for

Cloud cost is now routinely a large line item, and the engineers who understand
it are valued. The three things that matter most:

- **Right-sizing from real data**, not from the defaults a template applied.
- **Storage lifecycle rules.** The most common finding in any cost review is
  data nobody deleted, in a class of storage that is expensive for no reason.
- **Understanding what you are paying for at idle.** Environments that are never
  switched off, non-production replicas running 24/7, and unattached volumes
  are the usual culprits.

A cost review is also a security review: public storage, over-permissive roles,
and forgotten buckets are the same problem seen from a different angle.

## What interviews ask

- Walk through deploying a service with zero downtime. (Probes, readiness,
  graceful shutdown, and what happens to in-flight requests.)
- How do you move secrets? (Not environment variables in a repo.)
- A service is slow only in production. Where do you start? (Metrics, then
  traces, then the request path — and the answer should involve comparing
  against a baseline.)
- How do you roll back a bad Terraform change? (State, not just the console.)

## Career shape

The role splits into cloud/platform engineer, site reliability engineer, and
DevOps engineer, with the difference being mostly where you sit: inside a
product team, on shared infrastructure, or in the middle of both. DevOps is
usually the least well-defined title, and the least useful one for levelling —
what you have actually built matters more than the job title.

For current openings with published salary bands, see
[cloud and infrastructure roles](/jobs). If you are weighing two adjacent roles,
[what an AI engineer does all day](/blog/ai-engineer-day-in-the-life) covers the
platform side of that work.

## Frequently asked questions

**Which provider should I learn first?**
Whichever your local market uses. The fundamentals transfer; the provider
specifics are learnable in a few weeks once the fundamentals are solid.

**Is Kubernetes still worth learning?**
Yes, though what pays is knowing how to run it well rather than how to write a
manifest.

**Do I need every cloud certification?**
No. One associate-level certification is a signal; a portfolio is proof. Hiring
managers have said repeatedly that they can tell the difference.

**Is Kubernetes overkill for my company?**
Frequently, yes. A managed container service or even a platform with scheduled
scaling will serve a small team better than raw Kubernetes.

## Where to look next

[SOC 2 and ISO 27001 explained](/blog/soc2-and-iso-27001-explained) covers the
assurance side of running this infrastructure, and
[IT support versus systems administration](/blog/it-support-vs-sysadmin) covers
the entry routes into this work.
