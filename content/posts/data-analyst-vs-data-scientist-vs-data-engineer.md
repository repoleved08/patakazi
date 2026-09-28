---
title: "Data analyst vs data scientist vs data engineer: which one, and what it pays"
description: "The real differences between data analyst, data scientist and data engineer roles, the skills each needs, and how to choose."
date: "2026-07-21"
author: "Editorial team"
image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71"
tags:
  - data
  - analytics
  - careers
  - salaries
draft: false
---

The three job titles are routinely used interchangeably in job postings, which
makes them impossible to compare. They are not the same job, they do not
transfer the same way, and the difference matters more than the title does.

## The one-sentence version

- **Data analyst**: the person who answers questions and makes dashboards.
- **Data scientist**: the person who builds a model, or a statistical argument.
- **Data engineer**: the person who makes sure the data exists and is correct.

## Side by side

| | Analyst | Data scientist | Data engineer |
| --- | --- | --- | --- |
| Core question | What happened? | What will happen, and why? | Can we trust this data? |
| Main output | Dashboards, reports, recommendations | A model, an evaluation, a decision | Pipelines, tables, contracts |
| Daily work | SQL, BI tools, stakeholder meetings | Python, statistics, experiments | SQL, orchestration, dbt |
| Fails when | Numbers are wrong and nobody noticed | The model is right for the wrong reason | The pipeline broke at 3am |
| Deepest skill | Communication and SQL | Statistics | Data modelling and operations |
| Math expected | Basic statistics | Linear algebra, probability, inference | Less maths, more systems |
| Typical entry | Yes | Often a second role | Yes, from a backend or DBA path |

## Data analyst

Analysts are the most numerous and the most broadly transferable role. The work
is interrogating a relational database with SQL, modelling metrics, and
presenting the answer to people who will act on it.

**What actually gets you hired:** writing SQL that handles window functions
correctly, understanding join semantics well enough to avoid a fan-out bug, and
being able to say what a metric means and how it is computed. Half of analytics
is metric definitions and arguing about them.

**The trap:** staying in the tools. Knowing a BI tool is not the skill; knowing
the data model underneath it is.

**Where it goes next:** senior analyst, analyst engineer, analytics engineer, or
data science if you want to model.

## Data scientist

Data scientists build models and statistical arguments. The scarce skill is not
machine learning, it is judgement about whether a question can be answered with
the data available.

**What actually gets you hired:** statistics you can use rather than recite, a
clear sense of evaluation for your problem (imbalanced classes, leakage, time
series versus cross-sectional), and enough SQL that you do not queue behind an
analyst all day.

**The trap:** model-first thinking. A model built before anyone agrees what
success means is the most common way data science projects fail.

**What has changed recently:** the modelling itself is less differentiated,
because foundation models cover a lot of it. What has *not* been automated is
problem framing, evaluation, and deciding what to do with the answer. Expect
interviews to lean harder on the framing and the evaluation.

## Data engineer

Data engineers own the pipelines and the tables. This is an infrastructure
discipline with a data-shaped surface: modelling schemas, making pipelines
idempotent and recoverable, and defining contracts so downstream consumers stop
breaking when a column changes.

**What actually gets you hired:** deep SQL, dimensional modelling, orchestration
experience, and the specific discipline of making a job safe to re-run.

**The trap:** becoming a YAML engineer who schedules a copy of something that
used to work.

**Why it pays well:** a company that cannot trust its data cannot use a model,
so the dependency chain runs from data engineering to every data science
result.

## How the pay compares

Pay depends far more on company stage, location, and how much you can influence
decisions than on which of the three titles you hold. The general pattern:

- Analytics and data science bands tend to sit higher at larger companies and in
  higher-cost markets, largely because those companies can pay.
- Data engineering tends to be the most consistently demanded and the least
  volatile, because it is tied to mandatory infrastructure work.
- The title that pays most is usually not one of the three; it is the one
  involving people management, ownership of a domain, or being the person
  decisions go through.

To see real published bands rather than survey averages, the
[job listings](/jobs) on this board show the range attached to each role before
you apply.

## How to choose

**Choose the analyst route if** you are strongest at communication and clean
thinking, and want the shortest path to being useful.

**Choose data science if** you are drawn to uncertainty and enjoy being the
person who asks whether the question is answerable.

**Choose data engineering if** you think in systems and would rather build
something other people depend on. It also has the clearest technical ladder and
the least dependence on fashionable tooling.

A fourth path worth naming: **ML engineer**. It sits between data science and
engineering, and is closer to backend work with a model in the middle. See
[what an AI engineer does all day](/blog/ai-engineer-day-in-the-life) for that
role in detail.

## Frequently asked questions

**Can I move from analyst to data scientist?**
Yes, and it is the most common path. You need statistics depth, Python beyond
the basics, and one project that shows evaluation rather than a demo.

**Is a maths degree necessary?**
No, but you will need to become comfortable with it. Many working data
scientists arrived through a non-maths route and closed the gap deliberately.

**Which title should I put on my CV?**
The one that matches what you did. Recruitors read for substance, and inflating a
title is a fast way to fail an interview.

**Is analytics engineering a real role?**
Yes, and it is growing. It is the bridge: SQL and modelling depth combined with
software engineering practices.

## Where to look next

[What an AI engineer does all day](/blog/ai-engineer-day-in-the-life) covers the
engineering side of machine learning work, and
[reading an AI job description](/blog/read-an-ai-job-description) covers what to
look for before you apply.
