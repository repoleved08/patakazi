---
title: "How to build a security career from scratch, with no degree"
description: "A realistic path into cybersecurity without a degree: the skills to build, certifications worth taking, the roles to aim for, and what to expect to earn."
date: "2026-06-16"
author: "Editorial team"
image: "https://images.unsplash.com/photo-1518770660439-4636190af475"
tags:
  - cybersecurity
  - careers
  - certifications
draft: false
---

Security is one of the few fields where a degree is genuinely optional. It is
also one where the entry market is crowded with people who have watched a lot of
documentaries and have not touched a system. The difference between those two
groups is portfolio, and it is not close.

## The honest entry problem

The first security job is genuinely hard to get, and the reason is not that
hiring is unreasonable. It is that the work requires trust with systems, and
trust is earned by demonstrated competence.

The candidates who get the offer are the ones who can say "here is a system I
hardened, and here is what I found." That is a low bar to clear and most people
never clear it.

## What to build, in order

**1. Linux, properly.** Almost every security role touches a shell. Comfortable
navigation, permissions, processes, networking tools, and reading logs without
a tutorial.

**2. Networking.** You cannot analyse traffic you cannot read. TCP/IP, DNS, TLS
handshakes, HTTP, and being able to use `tcpdump` or `tshark` and actually
interpret the output.

**3. Scripting.** Python, and enough Bash to be useful. The majority of
security work is automating something tedious, and the ability to write a tool
is the difference between watching and investigating.

**4. A home lab.** VirtualBox or Proxmox, a few VMs, a deliberately vulnerable
target, and packet capture. Install things, break them, read the logs, fix them.

**5. One thing published.** A tool, a write-up, a detection rule, a home lab
guide. Public and readable by someone else.

Steps four and five are what separate candidates. Plenty of people can recite
OWASP; far fewer have a repository.

## Certifications: what is actually worth taking

**Take one of these to get past resume screening:**

- CompTIA Security+ — the most widely recognised entry signal, vendor-neutral.
- eJPT or PNPT — practical, affordable, and less padded than the big names.
- Google or Azure fundamentals — useful if you are aiming at cloud security
  rather than generalist work.

**Consider later, once you have the fundamentals:**

- CEH or Pen+ — recognised in the job market; treat the practical content as
  secondary to your own lab work.
- OSCP — genuinely hard, and worth real money in offensive work.
- CISSP — a senior credential. It requires several years of experience before it
  is even eligible, so it is not an entry-level move.
- Security+ or cloud associate certs if your target employer is vendor-specific.

**Be suspicious of anything expensive that is mostly theory.** A paid course that
is 90% video and 10% practice will not build the skill that gets you hired.

## The roles you can actually aim at

| Role | What it needs | Notes |
| --- | --- | --- |
| SOC analyst tier 1 | Networking, Linux, log reading, documentation | The standard entry point |
| IT support with security remit | Support skills plus fundamentals | Easy transition sideways |
| GRC analyst | Detail, process, documentation | Good fit if you are rigorous, not adversarial |
| Security engineer | Lab work, scripting, cloud basics | Often the first real engineering role |
| Penetration tester | Offensive labs, web fundamentals | Narrower, and harder without experience |
| Cloud security engineer | Cloud + security together | Strong market, learnable from either side |

The two underrated paths are GRC, because it needs precision rather than
adversarial instinct, and cloud security, because the market is short on people
who understand both.

## What to expect to earn

It varies enormously by location, employer, and whether you are on call.

- SOC tier 1 sits near the bottom of the band, often below equivalent software
  roles at the same company. Treat it as a route rather than a destination.
- Security engineer is where the market rate catches up with software
  engineering, and often overtakes it, because the supply of people who are
  both technical and security-literate is small.
- Specialist paths — offensive security, cloud security, detection engineering —
  carry a premium.
- GRC pays less than engineering and is more stable.

For current roles with published bands rather than survey averages, browse
[open positions](/jobs).

## The interview reality

Expect technical questions, and expect to be assessed on how you think.

Common questions:

- Walk me through investigating a suspected compromised account.
- What do you do when a critical vulnerability cannot be patched in time?
- Explain what you see in this packet capture. *(Bring your own; the conversation
  is the assessment.)*
- How would you find out if someone had been exfiltrating data slowly?

The candidates who do well describe a method and are honest about what they do
not know. Bluffing is the fastest way to fail.

## Frequently asked questions

**Is a cybersecurity degree worth it?**
It can be, for network access and internships, but it is not required and it is
not a shortcut past the portfolio.

**Is it too late to start?**
The field is consistently short of competent people, and there is no age
cut-off. What matters is whether you can show the work.

**Should I start with ethical hacking or with defence?**
Defence, or at least both. Offensive-only knowledge without operational
context is common and usually obvious in an interview.

**Do I need to know malware reverse engineering?**
Only for specialised roles. It is a deep, valuable skill and a poor general
entry requirement.

**How do I get a first interview?**
Applications rarely work. Contribute to something visible — an open-source
project, a detection rule set, a write-up — and let the work generate the
contact.

## Where to look next

[AI cybersecurity](/blog/ai-cybersecurity-threat-landscape) covers the fastest-moving
area in the field, [SOC 2 and ISO 27001](/blog/soc2-and-iso-27001-explained)
covers the compliance route, and
[reading a job description](/blog/read-an-ai-job-description) covers how to
assess a listing before you apply.
