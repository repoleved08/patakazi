---
title: "SOC 2 and ISO 27001 explained, for IT and security candidates"
description: "What SOC 2 and ISO 27001 actually require, the difference between them, and what an employer is really asking you to do about it."
date: "2026-07-28"
author: "Editorial team"
image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3"
tags:
  - compliance
  - cybersecurity
  - certifications
  - careers
draft: false
---

"We are SOC 2 compliant" is a sentence that appears in job postings, sales
calls, and about a quarter of the security questionnaires you will ever fill in.
Very few people involved can explain what it means.

Here is what these two frameworks are, how they differ, and what the work looks
like from inside a team.

## The difference in one line

**SOC 2** is an attestation against a set of criteria, produced by an
independent auditor, covering one organisation over a period of time.

**ISO/IEC 27001** is a certified management system, standard across the world,
proved by accredited certification bodies.

That difference propagates into everything: scope, evidence, cost, timeline, and
what a job in each one is called.

## SOC 2, concretely

SOC 2 (Service Organization Control 2) examines controls against five Trust
Services Criteria. In practice, a security-focused SOC 2 covers:

- **Security** — the mandatory one, covering logical and physical access,
  change management, and monitoring.
- **Availability** — uptime, backup, recovery.
- **Processing integrity** — systems do what they claim.
- **Confidentiality** — protection of non-public information.
- **Privacy** — personal information handling, where in scope.

Most companies scope a Type I (point in time) and a Type II (over a period,
usually 3–12 months). Type II is the one customers actually ask for, and it is
what proves controls operated consistently rather than existing on paper.

**What the work looks like.** You map controls to policies, collect evidence
throughout the period, and keep the trail continuous. That means access reviews
on a schedule, change tickets linked to deployments, vulnerability scans with
tracked remediation, and HR records showing security training completed. The
evidence is the product. A control you cannot evidence does not exist.

**Who does it.** Security engineers, GRC (governance, risk and compliance)
analysts, and internal auditors. It is a real career path and a common entry
point into security for people who are more rigorous than they are
adversarial.

## ISO 27001, concretely

ISO/IEC 27001:2022 requires an Information Security Management System: a
documented, risk-based set of policies, processes, and controls, maintained
across the organisation.

The 2022 structure has ten clauses:

- **4–5**: context, leadership, planning (including risk treatment)
- **6–8**: support, operational planning and control, and improvement
- **9–10**: performance evaluation, internal audit, management review

Annex A supplies a control reference set covering organisational, people,
physical, and technological controls.

**What the work looks like.** Building and running the system: risk register,
statement of applicability, internal audit programme, corrective action process,
management review, and the continual improvement the standard actually assumes.
You own the evidence that the system operates.

**Who does it.** Similar roles, with more organisational-design flavour and more
emphasis on risk.

## Which one does a job listing mean

| Signal in the posting | What they want |
| --- | --- |
| "SOC 2" | Audit cycle support, controls evidence, vendor security reviews |
| "ISO 27001" | ISMS ownership, risk register, internal audit programme |
| "SOC 2 Type II" | Ongoing operational maturity, not a one-off project |
| "ISO 27001 lead auditor" | A senior GRC role owning certification |
| "Attestation" in cloud context | Cloud-specific controls, workload identity, logging |

A listing asking for both usually wants someone comfortable in either framework
and able to translate between them.

## How this affects your CV

The thing that reads well is not the certificate. It is:

- Scope you were responsible for, in a system where you could name the users.
- The number of controls, the audit period, and the finding resolution rate.
- A specific problem you fixed that an audit would otherwise have caught.
- Evidence of the operational side: automation that made evidence collection
  continuous rather than a scramble each quarter.

"Supported SOC 2 Type II for a 300-user B2B SaaS platform, reduced evidence
collection from six weeks to two days by automating access reviews" is worth
more than the exam.

If you want to see how security roles are described in practice, browse
[security jobs on the board](/jobs) — the listings publish the full description
and salary band.

## Common mistakes

**Treating it as paperwork.** The standard outcomes come from real controls, not
from documents describing controls you do not have.

**Letting evidence collection be manual.** If a human assembles it, it will be
incomplete and late.

**Learning the framework before the system.** You cannot apply a control to a
process you do not understand. Fix the process first, then map the control.

**Confusing compliance with security.** A SOC 2 report is a point-in-time
opinion from an auditor, not a guarantee, and does not replace a real security
programme.

## Frequently asked questions

**Do I need a certification to work in GRC?**
No, but ISACA's CISA is widely recognised for audit work, and ISO 27001 Lead
Auditor or Implementer is the credential the hiring managers recognise for the
certification track.

**Is SOC 2 a certification?**
No. It is an attestation report, produced by an independent CPA firm. ISO 27001
is a certification.

**How long does ISO 27001 certification take?**
Typically six to twelve months for a first-time organisation, and most of that
is evidence gathering rather than paperwork.

**Does this work transfer to non-security roles?**
Partly. A background in GRC is genuinely useful in platform engineering, since
control requirements shape what gets built, and in procurement.

## Where to look next

[AI cybersecurity](/blog/ai-cybersecurity-threat-landscape) covers the technical
side of security for AI products, and
[cloud engineering in practice](/blog/cloud-engineer-aws-vs-azure-vs-gcp)
covers the infrastructure these controls sit on.
