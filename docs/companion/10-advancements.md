# 10 · Advancements in LLM Serving

**Covers:** semantic caching, performance profiling, multimodal serving, edge AI, multi-LoRA serving, and model serving in reinforcement learning.

The forward-looking chapter, and the one that most changes what a small stack like shilp could become. Six directions, each a different answer to "what is the next layer of reuse or routing".

**Semantic caching** caches responses by meaning rather than by exact prefix: embed the request, look for a sufficiently similar past request, return the stored answer if the similarity clears a threshold. Cheap to add, dangerous to get wrong — the threshold is a correctness parameter, and a near-miss returns a confidently wrong answer. Worth it for FAQ-shaped traffic, not for anything where a slightly different question deserves a different answer.

**Performance profiling** moves from aggregate metrics to per-request traces: where did the 8 seconds go, in prefill, in queueing, in the template render, in the network? shilp has aggregate telemetry and a per-reply prefill/decode split, which is most of the way there; what is missing is a trace you can follow across the whole request path.

**Multimodal serving** breaks assumptions that single-modality servers bake in — token counts that vary wildly with image resolution, prefill costs that dwarf text, and a KV cache that grows in jumps. The serving problem becomes admission control on a much wider cost distribution.

**Edge AI** inverts every priority: one user, no queue, cold start matters more than throughput, and the model must fit in memory that is not yours. This is the paradigm where shilp's small size would actually be an advantage.

**Multi-LoRA serving** is the most immediately useful for shilp, because shilp already has `merge-lora`. Merging folds an adapter into base weights, which is right when you have one fine-tune per deployment. Serving many adapters means keeping one base model resident and swapping adapter weights per request — many tenants, one set of base weights, a small per-adapter delta. That is a genuinely different memory story and a much better one for a team server.

**Serving in reinforcement learning** — generation as a rollout in a training loop, where throughput and determinism matter more than latency, and the model is a moving target.

## Where this lands

<div class="sh-lands" markdown>
<span class="lbl">shilp files</span>

- `src/shilp/modify/merge.py` — LoRA folding, done; multi-LoRA serving is the natural next step
- `src/shilp/server/telemetry.py` — per-request rows; the raw material for real profiling
- `src/shilp/server/metrics.py` — aggregate Prometheus text, hand-written
- `src/shilp/engine/loader.py` — one resident base model: exactly the structure multi-LoRA serving wants
- `src/shilp/server/routes_openai.py` — where a semantic-cache lookup would sit in front of generation
</div>

## The one to actually build

Of the six, **multi-LoRA serving** is the best fit for shilp, for four reasons.

It reuses `modify/merge.py`'s understanding of adapter weights, but inverts it: instead of folding in, keep the delta separate and apply it per request. It reuses the loader's "one resident base model" assumption rather than fighting it — one base, many small adapters. It is a real feature for the stated audience (a small team serving several fine-tunes), not a benchmark trick. And it is measurable with the tools that already exist: memory per adapter, TTFT with a cold adapter versus a warm one, and the decode cost of applying a delta.

The design question it forces is the interesting one: where does the adapter live in the request path — loaded with the model, selected per request, or compiled in? Each answer has a different memory and latency profile, and reasoning through them is a better education than implementing any of the other five.

## Semantic caching, with the warning attached

If you add it, make the threshold a first-class, visible parameter and log every cache hit with its similarity score. A semantic cache that silently returns a wrong answer is worse than no cache, because it is fast and confident. Start with an exact-prefix cache (which shilp already gets from llama.cpp) and only go semantic when the traffic justifies the risk.

## Profiling, cheaply

The step from shilp's current telemetry to real profiling is smaller than it looks. A request already has a start, a first token, and an end. Adding queue-entry time and template-render time gives you a four-segment waterfall per request — enough to answer "where did the time go" for the three cases that actually occur: long prompt, long queue, slow decode.

## Checkpoint

1. What is the correctness risk of a semantic cache, and what parameter controls it?
2. Why is multi-LoRA serving better for a team than N merged fine-tunes?
3. Which of the six directions would change shilp's architecture most, and which would change it least?
4. If you could only add one, and had a week: which, and what would you measure to prove it worked?
