---
title: "RAG explained: how retrieval-augmented generation actually works"
description: "How retrieval-augmented generation works end to end: chunking, embeddings, hybrid search, reranking, and the failure modes nobody warns you about."
date: "2026-06-09"
author: "Editorial team"
image: "https://images.unsplash.com/photo-1677442136019-21780ecad995"
tags:
 - ai
 - machine-learning
 - engineering
draft: false
---

Retrieval-augmented generation is the most common architecture in production AI
applications, and the most commonly mis-implemented. It looks simple: retrieve
relevant documents, put them in the prompt, ask the model to answer.

The hard part is not the prompt. It is the retrieval, and the fact that
retrieval fails quietly.

## The architecture in one paragraph

Documents are split into chunks. Each chunk is turned into an embedding vector
and stored in a vector index. A question is embedded too, the index is searched
for near neighbours, the top results are inserted into the context window, and
the model is asked to answer using them. The model is instructed to say when
the context does not contain the answer.

Every one of those steps has a failure mode, and they compound.

## The failure modes, in order of how often they cause problems

**1. The answer was not in the corpus.** The model, correctly following
instructions, should say so. Instead it blends its training knowledge with the
retrieved fragments and produces something fluent and wrong. This is the single
most common RAG failure, and the instruction to abstain is the least reliable
part of the system.

**2. The right chunk was retrieved but ranked too low.** Semantic similarity is
not relevance. A document that talks *about* the topic in different words
scores well; the specific policy paragraph that answers the question scores
poorly.

**3. The chunk was the wrong size.** Too small and context is missing. Too large
and the relevant sentence is diluted across 2,000 tokens, competing with
irrelevant material for attention.

**4. The corpus is stale.** The index was built once and never updated. The
model confidently quotes a pricing page from eighteen months ago.

**5. Access control was applied at indexing time, not retrieval time.** One
tenant's documents are retrievable by another's query. This is the most serious
one, and it is a security bug, not a quality bug.

**6. The model answers the chunk rather than the question.** Retrieved text
contains a list, and the model returns the list. A frequent, embarrassing, and
completely fixable failure with better instructions.

## What actually improves retrieval

**Hybrid search.** Combine vector similarity with keyword search. The vector
finds paraphrase; the keyword index finds exact identifiers, error codes,
product names, and anything where precision matters. This single change usually
beats tuning the embedding model.

**Reranking.** Retrieve broadly — twenty candidates — then rerank the top few
with a model that reads the query and the chunk together. Reranking is the
highest-value single addition to most RAG systems, and it is a latency cost
worth paying.

**Chunking that respects structure.** Split on headings and sections, not on
fixed token counts. Keep a heading with its body. Add overlap. Preserve document
metadata so you can filter.

**Metadata filtering.** Filter by tenant, date, product, and access scope *at
query time*. This solves the security problem and improves relevance at once.

**Hybrid of the above, tuned on a real evaluation set.** Not a demo. Questions
drawn from actual user queries, with known correct answers.

## Evaluating it properly

If you cannot measure retrieval, you are guessing. The useful split:

- **Retrieval metrics** — recall@k (did the correct chunk make the top k?) and
  MRR (how high?). These isolate retrieval from generation.
- **Answer metrics** — correctness, citation accuracy (does the answer actually
  support the cited chunk?), and abstention accuracy (did it refuse when it
  should?).
- **Business metrics** — task completion, time saved, escalation rate.

Measure retrieval separately. When an answer is wrong, the cause is almost
always one or the other, and the fix is completely different.

## The system around it

Retrieval is the part people write papers about. The part that determines
whether the product works is everything else:

- **Access control on retrieval.** Non-negotiable.
- **Caching.** Retrieval is often half the latency; cache it, with a
  tenant-aware key.
- **Freshness.** A defined index update interval, and a way to force a
  re-index for urgent content.
- **Cost control.** Every query is an embedding call plus a context full of
  tokens plus a generation. Budget them.
- **Fallbacks.** When retrieval returns nothing, say so rather than guessing.

## When not to use RAG

Worth stating plainly, because it is deployed reflexively:

- **The answer is in the model's weights.** A general question about a common
  topic needs no corpus.
- **The data is structured.** A question about your orders is a database query,
  and no amount of chunking will make a vector index good at it.
- **The corpus is small and fixed.** Then you can put it in the prompt, and you
  should.
- **The corpus is not yours to use.** Check what you are allowed to retrieve.

The best system for a given question is sometimes a query, sometimes a
fine-tuned model, and sometimes neither.

## Frequently asked questions

**Do I need a vector database?**
Often not. Postgres with a vector extension is enough for a large number of
production cases, and it removes a system.

**Which embedding model should I use?**
Evaluate on your own data with your own questions. The leaderboard ordering does
not predict performance on your corpus.

**How often should I re-index?**
Define a freshness target as a product requirement — "a policy change is
reflected within an hour" — and build to it.

**Is RAG still the right architecture with long-context models?**
Sometimes not. A larger context removes some retrieval problems and introduces
others: cost, latency, and the loss of the model being selective about what it
reads. Long context is not a retrieval strategy.

## Where to look next

[What an AI engineer does all day](/blog/ai-engineer-day-in-the-life) covers how
this fits into the broader job, and
[the OWASP risks for AI applications](/blog/owasp-top-10-for-ai-applications)
covers what can go wrong when retrieval meets a model that can take actions.
