# 07 · Advanced LLM Optimization Techniques

**Covers:** speculative decoding, multi-GPU and multinode inference (data, tensor, pipeline, expert parallelism), prefill–decode disaggregation, and advanced KV caching for long-context serving.

Everything here assumes one GPU is no longer enough — either for speed, for capacity, or for the shape of the workload. shilp does not do any of it, and the README says so: on one box requests serialise, and the next step on the same GGUF files is `llama-server --parallel N`; on a CUDA box, vLLM.

**Speculative decoding** uses a small draft model to propose k tokens, then verifies them in one pass of the big model. It is a latency trick that pays when the draft model is cheap and the acceptance rate is high, and it is lossless in output distribution — you get the same tokens, just faster. The trade is memory: you now hold two models.

**Parallelism** splits in four ways, and the names are worth knowing cold. *Data* parallel: whole models on separate GPUs, requests split between them — the easiest and the one that scales throughput. *Tensor* parallel: each layer's matrices split across GPUs, requiring an all-reduce per layer — bandwidth-hungry, needs NVLink. *Pipeline* parallel: layers divided into stages, which needs enough concurrent requests to keep every stage busy or you get bubbles. *Expert* parallel: mixture-of-experts routing sends tokens to different GPUs, so capacity scales without compute scaling with it.

**Prefill–decode disaggregation** runs the two phases on separate pools. Prefill is compute-bound and bursty; decode is bandwidth-bound and steady. Mixing them means a long prompt stalls ongoing decodes. Separating them lets each pool be sized and scheduled for its own bottleneck — at the cost of moving the KV cache between them, which is not free.

**Advanced KV caching** for long context: quantised KV, layer-wise offload to CPU or NVMe, eviction policies for stale prefixes, and cache-aware routing so a request lands on the replica that already holds its prefix.

## Where this lands

<div class="sh-lands" markdown>
<span class="lbl">shilp files</span>

- `08-service-roadmap.md` in `shilp-docs` — where this chapter's material currently lives as prose
- `src/shilp/engine/base.py` — the protocol any parallel or disaggregated backend would have to satisfy
- `src/shilp/engine/loader.py` — one resident model, LRU eviction: the design that ends where parallelism begins
- `README.md` → *What this is not* — the explicit statement that none of Chapter 7 is implemented
</div>

## What to read it for

Read it for **vocabulary and cost models**, not for implementation. Three specific payoffs.

First, it tells you which parallelism to reach for given a symptom. Throughput too low with one model? Data parallel — it is nearly free. Model does not fit? Tensor parallel, and now you need NVLink. p99 dominated by long prompts? Disaggregation, not more GPUs.

Second, it explains why shilp's architecture stops where it does. A single process with one mutable KV cache is incompatible with every technique in this chapter. Reaching them is not an increment; it is the `llama-server` or vLLM swap the README already names.

Third, it gives the honest answer to "should shilp ever do this?" Probably not — the point of shilp is a readable single-box stack. But knowing what the ceiling looks like is what makes the choice defensible rather than accidental.

## The disaggregation idea, in shilp's own numbers

shilp measured prefill at 1.59 s for 3,107 tokens on Metal, and decode at 98.7 tok/s. Those are two different bottlenecks in the same request. Now imagine four users, one with a long prompt: the three short requests wait behind a 1.6-second prefill they did nothing to cause. Disaggregation is the systematic fix; chunked prefill is the cheap approximation of it, and it belongs to Chapter 6.

If you take one design lesson from Chapter 7 into shilp, take that: **the two phases have different bottlenecks, so they want different scheduling.** Even a single-box server can benefit from chunking prefill so it interleaves with decode.

## Companion code

`ch07/` has two notebooks: speculative decoding, and LMCache for advanced KV caching. Both are the kind of thing you run once to see the effect and then reason about rather than deploy. LMCache is the more relevant to shilp, because it is about KV as a cacheable artefact across requests — the direction the 43 ms prefix result points in.

## Checkpoint

1. Which parallelism needs an all-reduce per layer, and what hardware does that imply?
2. Speculative decoding is lossless in output but not free in memory. What do you hold, and what decides whether it pays?
3. Why does a long prompt hurt other users on a mixed server, and what are the two fixes?
4. If you had to add one thing from this chapter to shilp, which gives the most benefit per line of code?
