---
title: Layers of the AI Stack
description: What LLMs, RAG, agents, and multi-agent systems really are — and why they appeared in this order.
date: 2026-01-29
---

## The Feeling of Chaos

If you’ve looked at the AI ecosystem recently, it probably feels overwhelming.

New terms keep appearing:

- LLMs
- prompt engineering
- RAG
- LangChain
- tools
- agents
- MCP
- multi-agent systems

They sound overlapping, abstract, and sometimes redundant.

But they’re not random.

They are **layers**, each one created because the previous layer hit a hard limit.

This post explains:

- what each layer is
- what problem it targets
- how it works
- and when it emerged

---

## 1. LLMs — The Engine (≈ 2018–2020, mainstream in 2022)

Large Language Models are the foundation.

At their core, they do one thing:

> Given a sequence of tokens, predict the most likely next token.

The transformer architecture (2017) made this possible, but LLMs became practically transformative with:

- GPT-3 (2020)
- ChatGPT (2022)

### What problem LLMs solved

Before LLMs, human–computer interaction was rigid.

LLMs allowed:

- natural language as an interface
- reasoning patterns instead of rules
- code as text

### What they did _not_ solve

LLMs are:

- stateless
- non-deterministic
- unaware of truth
- disconnected from the real world

They are powerful — but incomplete.

---

## 2. Prompt Engineering — Steering the Engine (≈ 2020–2022)

Once people started using LLMs seriously, a realization emerged:

> The model’s behavior depends heavily on _how_ you ask.

Prompt engineering is simply learning how to:

- structure instructions
- provide examples
- reduce ambiguity
- shape outputs

### The problem it solved

“How do I get useful and repeatable results from a probabilistic model?”

### Why it appeared

Because early users noticed:

- small wording changes caused massive output shifts
- there was no fine-tuning access for most users

Prompting became the first control layer.

---

## 3. RAG — Grounding the Model (≈ 2021–2023)

RAG (Retrieval-Augmented Generation) adds external knowledge at inference time.

The system:

1. retrieves relevant documents
2. injects them into the prompt
3. asks the model to answer using that context

### The problem it solved

- hallucinations
- outdated training data
- private or proprietary knowledge

### Why it mattered

People didn’t want general intelligence.

They wanted:

> “An AI that knows **my data**.”

RAG was the fastest, cheapest way to achieve that.

---

## 4. Orchestration Frameworks — Managing the Chaos (≈ 2022–2023)

Once developers combined:

- prompts
- RAG
- retries
- branching logic
- multiple model calls

their codebases became unmanageable.

Frameworks like LangChain emerged to:

- standardize workflows
- chain LLM calls
- manage context and state

### The problem they solved

“How do I build an actual product, not just a notebook demo?”

### The tradeoff

They reduce boilerplate —  
but introduce abstraction and coupling.

Many mature teams later outgrow them.

---

## 5. Tools & Plugins — From Thinking to Doing (≈ 2023)

LLMs can explain how to do things.

They cannot actually **do** things.

Tools connect models to:

- APIs
- databases
- code execution
- browsers
- file systems

### The problem this layer solved

“How does language turn into real-world action?”

### The key idea

LLMs should not replace tools.

They should **decide when and how to use them**.

LLM = brain  
Tools = hands

---

## 6. Agents — Loops with Intent (≈ 2023–2024)

Agents introduce a loop:

- reason
- choose a tool
- act
- observe
- iterate

Instead of one response, the system works toward a goal.

### The problem agents target

- multi-step tasks
- long-running objectives
- adaptive workflows

### The reality

Agents are powerful — and fragile.

The successful ones are:

- narrow
- bounded
- heavily constrained
- tool-first

This is where hype and reality diverged sharply.

---

## 7. Standardization (MCP) — Taming Fragmentation (≈ 2024–2025)

As tools and agents multiplied, fragmentation became the bottleneck.

Every system had:

- custom tool formats
- custom memory schemas
- custom integrations

MCP (Model Context Protocol) emerged to standardize:

- tool interfaces
- context exchange
- model–system boundaries

### The problem it solves

- vendor lock-in
- brittle agent pipelines
- duplicated integration work

This layer is infrastructure — not product hype.

---

## 8. Multi-Agent Systems — Dividing Cognition (≈ 2024–2025)

Some tasks exceed what a single agent can reliably handle.

Multi-agent systems divide responsibility:

- planner
- executor
- critic
- verifier
- specialist

They collaborate, critique, or cross-check each other.

### The problem they address

- reasoning blind spots
- error accumulation
- complex decision-making

### The cost

- higher latency
- higher compute
- more orchestration complexity

Used carefully, they improve quality.  
Used casually, they become expensive chaos.

---

### A Concrete Example: CrawDBot

CrawDBot is also a multi-agent system — but not in the hype-driven sense of multiple chatbots talking to each other.

It uses **role-based agents**, each responsible for a clearly bounded task in the crawling pipeline:

- **Planner agent** — decides where to go next and when to stop
- **Navigator agent** — controls a real browser (scrolling, clicking, pagination)
- **Extractor agent** — interprets the DOM and maps content into structured data
- **Validator agent** — checks completeness, consistency, and duplication
- **State / memory layer** — persists progress and feeds context back into planning

Each agent can be implemented as:

- an LLM
- deterministic code
- or a hybrid of both

The key idea is separation of cognitive responsibilities, not “AI personalities”.

In systems like CrawDBot, LLMs act as an **adaptive control layer** on top of deterministic tooling (browsers, parsers, storage).  
This makes the system more robust, debuggable, and scalable than a single monolithic agent.

CrawDBot represents the _practical_ end of multi-agent design:  
goal-bounded, tool-first, and engineered for reliability rather than autonomy.

---

## The Timeline That Makes It Click

Each layer exists because the one before it hit a ceiling:

```
2018–2020  LLMs
      ↓
2020–2022  Prompt engineering
      ↓
2021–2023  RAG
      ↓
2022–2023  Orchestration frameworks
      ↓
2023       Tools & plugins
      ↓
2023–2024  Agents
      ↓
2024–2025  Standardization (MCP)
      ↓
2024–2025  Multi-agent systems
```

This is not hype.

It is **engineering pressure over time**.

---

## The Mental Model

Modern AI systems are not “smart models”.

They are:

> Deterministic software  
> augmented by probabilistic reasoning engines

The future is not one autonomous super-AI.

It’s **boring, reliable systems** —  
with LLMs quietly embedded where judgment helps,  
and hard constraints everywhere else.
