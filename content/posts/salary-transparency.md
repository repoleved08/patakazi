---
title: "Why we publish salary ranges on every listing"
description: "A defence of showing the band before you apply, and what changes when you do."
date: "2026-01-14"
author: "Editorial team"
tags:
  - compensation
  - transparency
draft: false
---

## The problem with "competitive salary"

"Competitive salary" tells a candidate nothing. It is a way of saying *we have
decided not to tell you*, dressed up as information. Candidates end up guessing
against a market they cannot see, and the employers who do publish bands get a
structural advantage for free.

So every listing on this board carries a range, and the range is part of the
contract of the page rather than something you have to ask an interviewer to
reveal after three rounds.

## What publishing a band actually changes

For candidates:

- You can filter by a floor before you apply, not after you have spent a week.
- You can compare two offers with different scope without guessing at equity.
- You can tell immediately whether a role is a step up or a lateral move.

For employers:

- You spend less time in first calls that were never going to work.
- Your listing ranks higher against listings that hide pay, because candidates
  filter on it.
- You attract people who were going to say yes anyway, and who now find you
  credible.

## The rules we hold ourselves to

A published band has to be a band, not a decoration.

1. The lower bound is a real offer for a competent candidate at that level, not
   an entry point we expect to negotiate downward.
2. The upper bound reflects the range we would actually pay for scope at the top
   of the band.
3. The period and currency are explicit. An annual figure and an hourly figure
   are not interchangeable, and we do not let a listing quietly compare them.
4. If you cannot commit to a band, the listing says *salary not disclosed* and
   you lose the filter. We would rather show an honest blank than a number you
   will move after the offer.

## Filtering on it

The board exposes a salary floor as a first-class filter, and the underlying
API takes a `salaryMin` parameter that is normalised to an annual figure before
comparison, so monthly and hourly postings sort alongside annual ones without
being quietly flattered.

The same data is available to AI agents through our MCP server and a plain JSON
search endpoint, so an assistant can answer "what does this pay?" with the same
number a human sees on the page.
