# 03 · Model-Serving System Design: A Deep Dive

**Covers:** building online single-model and multi-model serving services from scratch, batching and streaming, NVIDIA Triton, and cost- versus latency-optimised designs.

The chapter where the book stops describing and starts building. Two services: one that serves a single LLM with batching and streaming behind a vLLM backend, and one that serves many models with a manager routing requests to workers. Then Triton, as the industrial version of the multi-model pattern, and finally the design axis that decides everything: are you optimising for cost or for latency?

Cost-optimised means large batches, high utilisation, queues that are allowed to grow, and a tolerance for p99 latency. Latency-optimised means small batches, headroom, admission control that sheds load, and a tolerance for idle GPUs. You cannot have both on one deployment, and the mistake the chapter is guarding against is claiming you have both.

## Where this lands

<div class="sh-lands" markdown>
<span class="lbl">shilp files</span>

- `src/shilp/server/generate.py` — the single generation path both API surfaces share; shilp's answer to the book's executor
- `src/shilp/server/stream.py` — bridging a blocking generator to an async, cancellable stream
- `src/shilp/server/app.py` — `create_app`, error translation, health, metrics
- `src/shilp/engine/loader.py` — one resident model, LRU eviction, reference counting: the multi-model decision, reduced to one file
- `src/shilp/server/routes_ollama.py`, `routes_openai.py` — two dialects over one engine
</div>

## The closest comparison in the book

`ch03/single_model_llm_serving/` is structurally the same animal as shilp: `llm/model_executor.py`, `llm/model_manager.py`, `llm/model_worker.py`, `llm/workload_manager.py`, `main.py`, and a test suite. Read it next to shilp's `server/` and `engine/` and you get two independent answers to the same design questions:

| Question | Book's service | shilp |
| --- | --- | --- |
| Where does batching happen? | In the workload manager, against a vLLM backend | Nowhere — single-sequence |
| How is a request cancelled? | Not a first-class concern in the sample | Client disconnect stops generation, logged 499 |
| How many models resident? | One, with a manager to swap | One, with LRU eviction and reference counting |
| How many API dialects? | One | Two — Ollama NDJSON and OpenAI SSE |
| Telemetry | Not the sample's focus | SQLite row per request, Prometheus text |

That table is the useful output of this chapter. The book's version is closer to a production shape; shilp's is closer to a readable one, with cancellation and dual dialects where the book spends its complexity on batching.

## What to read it for

Read it for the **workload manager** concept. Separating "what the client asked for" from "what the GPU should run next" is the single structural idea that makes batching possible later, and shilp does not have it: `generate.py` runs a request straight through. Introducing a queue between the route and the engine is the first step toward every optimisation in Chapter 6, and it is a smaller change than it looks — the `Engine` protocol already takes `GenParams` and yields `Chunk`.

Read it also for the cost-versus-latency framing. shilp's README is, read carefully, a latency-optimised single-user design that is honest about plateauing under concurrency. The book gives you the vocabulary to say that precisely: shilp has no admission control, so it degrades by queueing rather than by shedding.

## What shilp deliberately skips

- **Triton.** A multi-model serving runtime with a model repository and `config.pbtxt` per model. shilp's answer is a Python loader and a manifest, which is the same idea without the ecosystem.
- **A separate worker process.** shilp serves in-process. The book's worker model buys isolation and crash resilience, at the cost of an IPC layer.
- **Multi-model routing.** shilp loads on demand and evicts; the book's manager keeps a set warm.

None of these are oversights; they are the price of 4,100 lines. See [the roadmap](../gaps/roadmap.md) for what would change if shilp grew.

## Checkpoint

1. Sketch where a request queue would go in shilp, and which two files it would touch.
2. Which shilp component already gives you the per-request hook a scheduler needs?
3. Your p99 latency is 8 s and your GPU is 30% utilised. Are you cost-optimised, latency-optimised, or neither?
