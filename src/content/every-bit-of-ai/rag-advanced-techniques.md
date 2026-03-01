---
title: "RAG Advanced Techniques"
description: "A practical reference list of modern RAG techniques—chunking, embeddings, query rewrite/expansion, reranking, hierarchical/graph/agentic RAG—with concrete examples and tradeoffs."
date: 2026-03-01
---

# RAG Advanced Techniques

Naive RAG is simple:

1. Chunk documents
2. Embed everything
3. Retrieve top‑k
4. Paste into LLM
5. Hope it works

That version is mostly dead in production systems.

Modern RAG is retrieval engineering.

Below is a structured reference of advanced RAG techniques, grouped by layer, with concrete examples and tradeoffs.

# Retrieval-Level Techniques

These techniques improve recall and precision before the LLM generates anything.

## Chunking R&D

**What it is**  
Designing how documents are split before embedding.

**Example**

Instead of:

- Fixed 1000-token chunks

Try:

- 400-token chunks with 100-token overlap
- Split by headings (`##`, `###`)
- Semantic chunking using sentence boundaries

**Why it matters**

Too small → context fragmentation  
Too large → noisy embeddings  
No overlap → boundary information loss

**When to use**

Always. Chunking is often the highest ROI optimization in RAG.

**Tradeoff**

More chunks → higher storage + indexing cost.

## Encoder (Embedding Model) R&D

**What it is**  
Evaluating and selecting the best embedding model.

**Example**

Compare models using Recall@K on a test set:

- `text-embedding-3-large`
- `bge-large`
- `e5-large`

Measure:

- Recall@5
- MRR
- nDCG

**Why it matters**

Embedding quality directly determines retrieval quality.

**When to use**

When retrieval feels “almost correct” but not reliable.

**Tradeoff**

Better models may be slower or more expensive.

## Document Pre-processing

**What it is**  
Cleaning or transforming documents before embedding.

**Example**

- Remove navigation bars from scraped HTML
- Convert tables into structured text
- Rewrite messy PDF content into normalized paragraphs

Example transformation:

Raw:

```
Header | Footer | Legal disclaimer
```

Processed:

```
Product specification: ...
```

**Why it matters**

Embeddings capture signal. Garbage input reduces signal density.

**When to use**

Enterprise documents, PDFs, scraped content.

**Tradeoff**

Pre-processing pipelines increase system complexity.

## Query Rewriting

**What it is**  
Transforming user questions into retrieval-friendly queries.

**Example**

User:

> Why is my service slow?

Rewrite:

> Common causes of high latency in distributed microservices

**Why it matters**

Embedding search works better with explicit semantic signals.

**When to use**

User questions are vague or conversational.

**Tradeoff**

Adds an extra LLM step.

## Query Expansion

**What it is**  
Generating multiple retrieval queries.

**Example**

User:

> How do I scale my backend?

Expand into:

- Horizontal scaling strategies
- Vertical scaling tradeoffs
- Load balancing approaches
- Caching techniques

Retrieve for each and merge results.

**Why it matters**

Improves recall.

**When to use**

Complex or multi-faceted questions.

**Tradeoff**

Higher compute and retrieval cost.

## Re-ranking

**What it is**  
Improving precision after vector retrieval.

**Pipeline**

1. Retrieve top 20 via vector similarity
2. Use cross-encoder or LLM to score each
3. Keep best 5

**Why it matters**

Vector similarity ≠ semantic relevance.

Re-ranking often yields major quality improvements.

**When to use**

When retrieval returns partially relevant chunks.

**Tradeoff**

Slower due to cross-encoder inference.

# Architecture-Level Techniques

These techniques change how retrieval is structured.

## Hierarchical RAG

**What it is**  
Multi-level retrieval or summarization.

**Example**

Step 1: Retrieve relevant documents  
Step 2: Retrieve relevant sections within them  
Step 3: Summarize sections

Alternative:

- Pre-summarize large documents
- Embed summaries
- Retrieve summaries first

**Why it matters**

Scales better for very large corpora.

**When to use**

Large knowledge bases or long documents.

**Tradeoff**

More orchestration logic.

## Graph RAG

**What it is**  
Combining vector retrieval with structured relationships.

**Example**

Instead of only similarity search:

- Retrieve documents linked to the same entity
- Traverse knowledge graph edges
- Expand based on shared metadata

**Why it matters**

Captures relational structure beyond semantic similarity.

**When to use**

Enterprise knowledge graphs, legal corpora, technical documentation.

**Tradeoff**

Requires maintaining structured metadata or graph database.

## Agentic RAG

**What it is**  
Letting an agent decide how and where to retrieve.

**Example**

Agent workflow:

- Decide whether to query vector DB
- Query SQL database
- Call API
- Chain multiple retrieval steps

**Why it matters**

Supports multi-source reasoning.

**When to use**

Complex enterprise workflows.

**Tradeoff**

Higher latency, higher complexity, harder to debug.

# Generation-Level Improvements

These techniques improve answer quality after retrieval.

## Prompt Engineering

**What it is**  
Structuring context and instructions before generation.

**Example**

Instead of:

> Here are some documents: {docs}

Use:

> Today is {date}. Use only the verified documents below. If unsure, say you don’t know.

Include:

- Clear system instructions
- Context formatting
- Conversation history
- Source citation format

**Why it matters**

Reduces hallucination and improves answer reliability.

**When to use**

Always, but only after retrieval quality is stable.

**Tradeoff**

Prompt tweaks cannot fix broken retrieval.

# Summary

Modern RAG is not about “adding GPT to a vector database.”

It is about:

- Retrieval evaluation
- Chunk design
- Embedding selection
- Query control
- Ranking precision
- Architectural scaling

If retrieval is weak, generation cannot save it.

RAG engineering is retrieval engineering.
