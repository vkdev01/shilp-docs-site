# 05 · Challenges When Serving LLMs

**Covers:** why optimisation matters, accelerator chips and GPU specs, model-loading bottlenecks, KV cache sizing, and arithmetic-intensity analysis of prefill and decode.

The quantitative chapter, and the one to read first if you are reading to improve shilp rather than to survey the field. Four things get numbers attached.

**Accelerator specs** stop being a list of names and become three numbers that matter: memory capacity (how big a model fits), memory bandwidth (how fast decode goes), and FLOPS at the relevant precision (how fast prefill goes). Compute-to-bandwidth ratio is what decides whether a chip is good at serving or only at training.

**Model-loading bottlenecks** are the reason the first request is slow. Reading 800 MB from disk, mapping it, warming up kernels, allocating the KV cache — all of it happens once, and all of it is invisible in a steady-state benchmark. shilp's LRU loader makes this explicit: the first request after a model swap pays, the rest do not.

**KV cache sizing** is the number people get wrong. It scales with layers × heads × head dimension × context × concurrency × 2 (keys and values) × bytes per element. shilp publishes the result: 28 KiB per token for Qwen2.5-1.5B, 56 KiB for the 7B, so 8k context is 0.22 and 0.44 GiB respectively — per session.

**Arithmetic intensity** is the unifying idea. Prefill does many FLOPs per byte read (high intensity, compute-bound). Decode does very few (low intensity, bandwidth-bound). This is why the GPU's benefit splits 6× and 1.2×, and it is the single most useful predictive tool in the book.

## Where this lands

<div class="sh-lands" markdown>
<span class="lbl">shilp files</span>

- `README.md` → *Numbers that matter* — the measured and computed tables, and the three formulas
- `shilp doctor` / `src/shilp/config.py` — hardware inspection: what this machine has, before you plan anything
- `src/shilp/modify/quantize.py` — the module that changes the bandwidth term directly
- `src/shilp/engine/loader.py` — residency and eviction, i.e. the model-loading bottleneck made visible
</div>

## The formulas

```
resident = weights + (KV_per_token × context × concurrent_sessions) + runtime
decode ceiling ≈ memory_bandwidth / model_size_in_bytes
concurrent_requests ≈ arrival_rate × latency
```

Work an example with them. A Qwen2.5-7B at Q4_K_M is 4.34 GiB. Twenty sessions at 8k context add 8.75 GiB of KV. Plus runtime overhead, you are past 13 GiB — so a 16 GiB card holds the weights comfortably and the concurrency not at all. That is the calculation the chapter exists to teach, and it takes about ninety seconds.

## What to read it for

Read it to stop guessing. Every argument in the shilp README about why the server plateaus is one of these three formulas; every argument about what to do next is a term you can move. Quantisation moves the weights term and the bandwidth term at once — which is why it is the largest single lever at 3.3×. A scheduler moves the concurrency term. More VRAM moves the ceiling.

Read it also for the discipline of separating *measured* from *computed*. shilp's tables label each row. That distinction is what stops a capacity plan from being fiction.

## Checkpoint

1. Compute KV per token for a 32-layer model with 8 KV heads of dimension 128, fp16, and multiply by 8k context.
2. A model is 4 GiB and your card does 500 GB/s. What is the absolute decode ceiling, and why will you never hit it?
3. Which term does chunked prefill move, and which does continuous batching move?

## Companion code

Chapters 1 and 5 are conceptual and ship no code in the book's repository. The hands-on equivalents are all in shilp: `shilp doctor` for the hardware half, `make loadtest` for the empirical half, and the README's tables for the arithmetic.

!!! tip "Keep your own numbers"
    When you run `make loadtest`, record the machine, the model, the quantisation, the rate, and the p50/p99. shilp's `recipes/*.json` is the natural place — it already records how a model was made, and the obvious next field is how fast it went on the box it was made for.
