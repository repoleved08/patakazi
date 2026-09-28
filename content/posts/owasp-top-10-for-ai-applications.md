---
title: "The OWASP Top 10 for AI applications, explained for builders"
description: "Prompt injection, excessive agency, improper output handling and the rest of the OWASP LLM risks, written for the engineers shipping the feature."
date: "2026-06-30"
author: "Editorial team"
image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b"
tags:
 - ai
 - security-engineering
 - appsec
draft: false
---

The OWASP Top 10 for LLM Applications has become the shared vocabulary for
reviewing AI features in design review. It is useful precisely because it is
short, and dangerous precisely because it is a checklist.

This is what each item means when you are the one building the thing.

## Why a separate list

Traditional application security risks still apply to an AI feature, but three
things are genuinely new: the model processes untrusted input and treats it as
instruction, the model produces output that other systems act on, and the model
is given tools.

That third point is the one that turns a content problem into a security
problem. A model with a shell is a shell.

## The ten risks

### LLM01 — Prompt injection

The model cannot reliably distinguish instructions from data. Direct injection is
the obvious case; indirect injection, where the payload arrives in content the
model reads, is the one that catches experienced teams.

The reason filtering does not solve it: you are asking a probabilistic component
to enforce a boundary it has no reliable way to draw. Assume the payload gets
through, and design the consequence of success to be survivable.

### LLM02 — Sensitive information disclosure

Data leaves the system: through a response, through a log, through a shared
retrieval index, through a model that memorised training data. Controls are
output filtering, access control on what the model can read, and a hard rule
about what goes into the context at all.

### LLM03 — Supply chain

Models, adapters, datasets, prompt templates, and agents pulled from public
registries. Pin versions, verify provenance, scan what you pull, and treat an
agent or plugin as untrusted code.

### LLM04 — Data and model poisoning

Training data and retrieval corpora can be tampered with, and the effect is hard
to see. Controls: provenance for data, integrity checks, and anomaly detection on
both the corpus and the model's outputs.

### LLM05 — Improper output handling

The single most common real vulnerability. Code that trusts model output and
passes it to an interpreter, a shell, a SQL engine, or a browser. A model
returns JSON with confidence whether or not it is valid JSON.

The fix is unglamorous: validate against a schema, allowlist what you pass on,
and never concatenate output into a command.

### LLM06 — Excessive agency

More permission than the task needs. An agent that can read a document should
not be able to send email. Start from the minimum tool set and add capability
only with a stated reason. Scoped credentials, read-only defaults, explicit
allowlists, and human confirmation for irreversible actions.

### LLM07 — System prompt leakage

Usually not exploitable in itself, but it reveals architecture, and teams
routinely put secrets in prompts where they do not belong. The prompt is not a
security boundary. If it matters, put it in a system the model calls with
permissions.

### LLM08 — Vector and embedding weaknesses

Retrieval introduces its own attacks: poisoning the index, and retrieving content
that was never meant to be visible. Isolation per tenant, access control at
retrieval time rather than at index time, and provenance on what you index.

### LLM09 — Misinformation

The model will be confidently wrong, and users will act on it. This is a product
problem as much as a security one. Ground answers in retrieved sources, show
them, and say clearly when confidence is low.

### LLM10 — Unbounded consumption

Someone drives your costs, or your capacity, with a loop. Rate limits, token
budgets, recursion limits, timeouts, and a per-identity cap. This is both a
denial-of-wallet and a denial-of-service.

## What to do on Monday

If you ship an AI feature, the minimum defensible set is:

1. Validate every model output against a schema.
2. Give the model the minimum tool set that works.
3. Treat retrieved content as data, clearly delimited.
4. Rate limit and cap consumption.
5. Log prompt, retrieved context, tool calls, and output.
6. Add adversarial cases to your test suite and run them on every change.

None of that requires a framework. It requires deciding what the model is
allowed to do, and writing that down.

## Where the frameworks fit

The OWASP list tells you what to look for. The
[NIST AI Risk Management Framework](/blog/soc2-and-iso-27001-explained), with
its Govern, Map, Measure, Manage structure, is better for deciding what your
organisation should be doing about it, and for the documentation an auditor will
eventually ask for.

## Frequently asked questions

**Is the OWASP list a security standard?**
No. It is a prioritised awareness list. It is useful as a review agenda and
inadequate as a control framework.

**How often does it change?**
Every year, and the ordering shifts as threat patterns become clearer. Check the
current version rather than trusting a copy from a blog post.

**Does any of this apply if we use a hosted model?**
Most of it. You did not write the model, but you own the prompt, the tools, the
retrieval store, the logging, and the data handling — and that is where real
incidents occur.

**Do I need a red team for a small feature?**
You need someone to try to break it. Often that is the developer, with a list.

## Where to look next

[AI cybersecurity: the threat landscape](/blog/ai-cybersecurity-threat-landscape)
covers the defensive side in more depth, and
[cloud engineering](/blog/cloud-engineer-aws-vs-azure-vs-gcp) covers the
infrastructure these systems run on.
