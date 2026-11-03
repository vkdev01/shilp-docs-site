# 04 · Model Serving Best Practices

**Covers:** serving in an agentic world (agents, RAG, CAG), enterprise serving architecture, building with an open-source stack or a cloud vendor, build-or-buy strategy, and performance measurement.

The chapter that moves up a level, from "how does a request become tokens" to "what does an organisation need around that". Three concerns dominate.

**Agentic workloads change the traffic shape.** An agent makes many small, sequential calls with long shared prefixes and tight dependencies, not one large call. RAG adds retrieval latency and a context that is mostly boilerplate. CAG (cache-augmented generation) leans on that boilerplate being cached. All three break the naive "one request, one generation" model, and all three reward prefix caching and low time-to-first-token far more than raw throughput.

**Build versus buy is a cost question, not a purity question.** An open-source stack means you own the GPU utilisation and the pager. A cloud vendor means you own the bill and the integration. The chapter's framing is that the crossover point is utilisation: below some sustained load, paying per token wins; above it, owning the capacity wins.

**Performance measurement is a discipline.** Not "it feels fast" but TTFT, decode tokens per second, p50/p90/p99 end-to-end, error rate by status, and a load test that holds rate steady while concurrency rises.

## Where this lands

<div class="sh-lands" markdown>
<span class="lbl">shilp files</span>

- `src/shilp/server/telemetry.py` — one SQLite row per request; the raw material for every metric here
- `src/shilp/server/metrics.py` — Prometheus text, hand-written, no client library
- `src/shilp/server/ui.py` and `web/` — the dashboard: req/s, TTFT, p50–p99, decode tok/s, breakdowns by surface and endpoint
- `Makefile` targets `loadtest`, `smoke` — the measurement discipline, as two commands
- `05-deploy.md` in `shilp-docs` — capacity planning, reliability, security, cost
</div>

## What shilp already does well here

This is the chapter where shilp looks most like the book's recommendations, because measurement was designed in rather than bolted on.

Per-request telemetry records TTFT, decode speed, token counts, and a prefill/decode split — the exact decomposition the chapter argues for, because it tells you *which* half of the request to optimise. The playground shows token cadence per reply, which is the honest way to see streaming actually streaming rather than buffering and dumping. The load test measures what neither unit tests nor smoke tests can: latency under concurrency.

The measured result — four streams whose first tokens arrive at 0, 1.6, 3.2 and 4.7 seconds, with flat aggregate throughput — is a Chapter 4 artefact: a performance measurement that reveals an architectural limit rather than a code bug.

## What it does not do

- **No auth, quotas, or rate limiting.** It binds to `127.0.0.1` because of this. The book's enterprise architecture assumes an identity layer and a metering layer; shilp assumes a proxy in front.
- **No cost model.** Nothing converts tokens into money, so build-versus-buy cannot be evaluated from inside the tool.
- **No SLO tracking.** Metrics exist; error budgets and burn rates do not.

## Agentic serving, concretely

If shilp were used behind an agent, three things would matter more than they do today. Time-to-first-token, because an agent makes many calls and each one's latency is additive. Prefix caching, because an agent's system prompt and tool schema repeat on every call — the 1,712-token prefix that cost 43 ms instead of 823 ms is exactly this case. And request cancellation, which shilp already has: an agent that gives up should not leave a generation running.

That last one is worth noting as a design win. Cancellation is easy to skip and expensive to retrofit.

## Companion code

`ch04/` contains a Knowledge Agent (RAG plus planning) and AWS deployment examples — Bedrock, JumpStart, Deep Learning Containers, and DLC customisation. The Knowledge Agent is the useful one for shilp: it is a client that would work against shilp's `/v1` surface, which is the point of speaking the OpenAI dialect.

## Checkpoint

1. Which shilp metric tells you whether to optimise prefill or decode, and what does it record?
2. Why does an agent workload reward prefix caching more than a chat workload does?
3. At what point does owning a GPU beat paying per token, and which number do you need to know first?
