# 02 · Large Language Model Serving

**Covers:** inside the transformer, autoregressive generation, decoder-only architecture, attention, the KV cache, prefill and decode, and running a model with a serving framework (vLLM).

This is the chapter that makes serving legible. A decoder-only model generates one token at a time, and every token is the same forward pass — so the interesting question is not what the pass computes but what it *recomputes*. Attention over the whole prefix, every step, would be quadratic and wasteful. The KV cache is the answer: keep the keys and values for every token you have already processed, and each new step only computes a row.

That single fact explains almost everything downstream. It explains why the first token is slow and the rest are fast (prefill processes the whole prompt; decode processes one token). It explains why memory grows with context and with concurrency. It explains why batching helps (decode is bandwidth-bound, so a batch amortises one read of the weights across many sequences). And it explains why prefix caching works (a shared prefix has a shared, still-resident KV).

## Where this lands

<div class="sh-lands" markdown>
<span class="lbl">shilp files</span>

- `src/shilp/engine/llamacpp.py` — the real backend: GGUF, mmap, Metal/CUDA offload, and the KV cache handled inside llama.cpp
- `src/shilp/engine/template.py` — renders Ollama-style templates to a prompt; the last step before prefill
- `src/shilp/engine/base.py` — the `Engine` protocol, `GenParams`, `Chunk`, `ContextOverflow`
- `src/shilp/engine/transformers_engine.py` — the same protocol on plain PyTorch, where you can `print` a tensor mid-pass
- `src/shilp/README` numbers — the measured prefill/decode asymmetry this chapter predicts
</div>

## The asymmetry, measured

shilp's own numbers are the chapter's thesis, measured on one machine with Gemma-3-1B at Q4_K_M:

| | CPU | Metal | Ratio |
| --- | --- | --- | --- |
| Decode | 84.5 tok/s | 98.7 tok/s | 1.17× |
| Time to first token | 178 ms | 27 ms | 6.7× |
| Prefill, 3,107 tokens | 9.15 s | 1.59 s | 5.8× |

A GPU makes prefill six times faster and decode almost not at all. If you take one thing from Chapter 2, take that, and then ask of every optimisation you meet: *does this attack compute or bandwidth?*

## What to read it for

Read it for the mechanism, but keep two shilp-specific questions open.

**First: where does the KV cache actually live in shilp?** Not in Python. `llama-cpp-python` allocates it inside the C++ context, sized from `num_ctx`. That is why `shilp`'s manifest carries `num_ctx` as a parameter, why exceeding it raises `ContextOverflow` in `engine/base.py`, and why the resident-memory formula in the README has a per-session term. If you want to see a KV cache you can inspect, `transformers_engine.py` is the honest one.

**Second: why is the second request faster than the first?** In shilp, mostly because the model is already resident (no mmap and warm-up cost) — not because of KV reuse, since each request starts a fresh sequence. The 43 ms versus 823 ms measurement in the README is the exception: a *repeated prefix* within llama.cpp's prefix cache. Distinguishing "model is warm" from "prefix is cached" is exactly the distinction this chapter teaches.

## Companion code

`ch02/` in the book's repository holds five notebooks — transformer internals, a step-by-step walkthrough of LLM execution and the KV cache, running Qwen with vLLM, batching, and streaming — plus `streaming.py`.

Read them in that order, and read `streaming.py` beside `src/shilp/server/stream.py`. Both solve the same problem (bridging a blocking generator to an async, cancellable HTTP stream) at different levels of abstraction. shilp's version adds cancellation — a client disconnect stops generation and is logged as 499 — which is a small feature with an outsized effect on a shared server.

## Checkpoint

1. Why does doubling the context window cost memory linearly but time quadratically during prefill?
2. A batch of 8 sequences at 4k context: what does the KV cache cost at 56 KiB per token per sequence?
3. Which of these helps decode: more FLOPS, more memory bandwidth, or a faster prompt parser?

## What this chapter does not solve

It describes vLLM's approach — PagedAttention, continuous batching — but implementing it is Chapter 6's job, and shilp does not have it. The gap between "understands the KV cache" and "schedules many KV caches concurrently" is where most real serving engineering lives, and it is the subject of [What shilp does not do](../gaps/serving-gaps.md).
