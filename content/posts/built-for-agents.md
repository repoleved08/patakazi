---
title: "This job board is built to be read by AI agents"
description: "We publish llms.txt, a markdown version of every page, and an MCP server, on purpose."
date: "2026-02-02"
author: "Editorial team"
tags:
  - engineering
  - ai
draft: false
---

## The problem

People increasingly ask an assistant rather than a search engine. "Find me
remote Rust roles paying over 120k" goes to a model, not to a results page. If
your job board is a wall of HTML with a canonical URL and nothing else, the
model has to scrape it, guess, and hope the number it produces is real.

That is a bad experience for the candidate and it does nothing for the
employer.

## What we publish

Every listing on this board is available in four shapes:

- **The page**, for humans.
- **A markdown version** at the same URL with a `.md` suffix, for anything that
  wants plain text instead of markup.
- **JSON** from a documented search endpoint, for anything with an HTTP client.
- **An MCP server**, for agents that speak the protocol natively.

There is also an `llms.txt` at the site root, which is a plain-text index of
what the site contains and which pages matter.

## The MCP server

The server exposes the site's pages as tools, so an agent can search and read
without crawling. It is registered at `/mcp` and advertises itself through the
standard discovery documents.

This means an agent in a chat window can do something like: search for backend
roles in a given city, read the two most promising listings in full, and come
back with a shortlist and the links it used. It cites the listing URL, so the
candidate lands on the same page a human would.

## What we deliberately do not do

We opt out of AI training on our content while explicitly permitting AI input
and search. Being quotable is the point. Being scraped into a training corpus
is not something we agreed to, and the robots directives say so.

## If you are building a job board

The checklist is short:

1. Publish `llms.txt`.
2. Serve markdown for your important routes.
3. Expose a real API, not just HTML.
4. Speak MCP if you can.
5. Put `JobPosting` structured data on every listing.
6. Say plainly in robots directives what you allow.

None of that is exotic. It is a different kind of unfinished business from the
one most job boards have, which is that nothing on the page was meant to be
read by anything other than a person.
