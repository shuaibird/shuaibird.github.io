---
title: LLM Leaderboards — My Living Reference List
description: A curated list of LLM leaderboard sites I keep coming back to, plus what each one is good for when choosing models.
date: 2026-02-19
---

## Why LLM Leaderboards Matter (And How To Read Them Like An Engineer)

Leaderboards are not “the truth.” They’re **instruments**.

As an AI engineer, you’re usually balancing multiple axes at once:

- **Intelligence / capability** (but _for which tasks_?)
- **Cost** (input/output pricing, plus “hidden” reasoning tokens)
- **Latency / speed** (time-to-first-token, tokens/sec, end-to-end response time)
- **Domain strength** (coding vs reasoning vs multilingual vs vision, etc.)
- **Reliability & eval quality** (contamination, leakage, prompt sensitivity, overfitting to benchmarks)
- **Operational constraints** (context window, caching, deployment/hosting, rate limits)

So the real move isn’t “pick the #1 model.”
It’s: **pick the right model for _your_ constraints** — and use leaderboards as shortcuts to narrow the search.

---

## The Leaderboards I Track

### 1) Artificial Analysis — Multi-axis (Intelligence × Cost × Speed)

**Link:** [Artificial Analysis](https://artificialanalysis.ai/)

If I want a clean, fast “big picture” view of models across **intelligence, price, and speed**, this is usually my first stop.

What I use it for:

- Shortlisting models quickly
- Looking at tradeoffs (smart-but-expensive vs cheap-and-smart)
- Comparing speed/latency and not just “benchmark score”

---

### 2) Vellum Leaderboard — Vendor-facing model comparison (Cost + Context window)

**Link:** [Vellum LLM Leaderboard](https://www.vellum.ai/llm-leaderboard)

Vellum is great when I want a “one table” view of **API cost and context window** across major providers.

What I use it for:

- Quickly sanity-checking pricing + context window for common providers
- Fast “which model is cheaper for this setup?” comparisons

(They also have other leaderboards/views, but this page is my “baseline reference.”)

---

### 3) Scale SEAL Leaderboards — Specialized evals (including Humanity’s Last Exam)

**Links:** [Scale SEAL leaderboard](https://scale.com/leaderboard?category=frontier)

Scale’s SEAL leaderboards are useful when I want **more specialized breakdowns** (not just one generic score), and especially for tracking frontier-style evaluations like _Humanity’s Last Exam_.

What I use it for:

- “What’s the strongest model for _this_ specialized capability?”
- Frontier benchmark tracking (when classic benchmarks saturate)

---

### 4) Hugging Face Spaces — A directory of community leaderboards

**Link:** [Hugging Face Spaces leaderboards](https://huggingface.co/spaces?q=leaderboard)

This is less “one leaderboard” and more a **marketplace of leaderboards**: embeddings, agents, ASR, VLM, coding, medical, etc.

What I use it for:

- Finding niche leaderboards quickly (agents, medical, OCR, embeddings, etc.)
- Checking what the community is actively maintaining

⚠️ Note: always check **last updated date** + credibility of the evaluation harness. HF is a directory; quality varies.

---

### 5) LiveBench — Contamination-limited benchmark (keeps rotating questions)

**Link:** [LiveBench](https://livebench.ai/#/)

LiveBench is explicitly designed to be **contamination-limited**, with a benchmark that refreshes over time (to reduce “train-on-the-test” problems).

What I use it for:

- A “trust check” when I suspect benchmark gaming / leakage
- Tracking models on a benchmark that actively defends against staleness

---

### 6) Arena (LMArena / Chatbot Arena-style) — Human preference via blind battles

**Link:** [Arena leaderboard](https://arena.ai/leaderboard)

This is the “people’s vote” style leaderboard: users compare outputs side-by-side and the leaderboard reflects aggregated human preference.

What I use it for:

- “Which model feels best in practice for chat-style prompts?”
- Sanity-checking: _when benchmark winners don’t feel like winners_

---

## Small Reminders I Keep Next To Any Leaderboard

- **Composite scores hide tradeoffs.** A single “intelligence index” might not match your task.
- **Reasoning tokens are real money.** Some models look cheap per-token but “think” a lot.
- **Latency matters in products.** TTFT and end-to-end speed can dominate UX.
- **Benchmarks can be gamed.** Prefer sources that rotate questions / defend against leakage for high-stakes decisions.

---

## Final Takeaway

I use leaderboards to **reduce uncertainty fast**:
shortlist → test on my prompts → pick based on real constraints.

This doc is intentionally a living reference list.
