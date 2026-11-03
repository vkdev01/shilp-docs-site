# 06 · Essential LLM Optimization Techniques

**Covers:** request batching and scheduling (dynamic, continuous, chunked prefill), scalable attention and kernel fusion, model compression (quantisation, distillation, pruning), and prefix caching / RadixAttention.

The chapter shilp most needs and least has. Four families of technique, in order of how much they change a single-box server.

**Batching and scheduling** is the biggest. Static batching waits for a full batch, runs it, waits again — simple, and bad for tail latency. Dynamic batching starts a batch on a timer or a size threshold. Continuous batching lets a finished sequence leave the batch and a new one join at the next decode step, so the batch is never idle waiting for its slowest member. Chunked prefill splits a long prompt across several steps so a single 30k-token prefill cannot stall everyone else's decode.

**Attention and kernel fusion** is about making each step cheaper: flash-attention-style tiled computation, fused operations to avoid round-tripping through memory. Mostly a framework's job; you read about it to know what you are buying.

**Model compression** is the one shilp implements. Quantisation (fewer bits per weight), distillation (a smaller student), pruning (fewer layers or heads). Quantisation is the reliable win because it attacks the bandwidth term directly; the other two need evaluation to prove they did not cost you quality.

**Prefix caching and RadixAttention** exploit repeated prefixes. A radix tree over token sequences lets a server find the longest shared prefix, reuse its KV, and branch from there. This is the multi-tenant generalisation of the single-prefix reuse shilp measured.

## Where this lands

<div class="sh-lands" markdown>
<span class="lbl">shilp files</span>

- `src/shilp/modify/quantize.py` — compression, implemented, with trade-offs written into the docstring
- `src/shilp/modify/surgery.py` — pruning and vocabulary truncation; lossy and explicitly unvalidated
- `src/shilp/engine/llamacpp.py` — where batching *would* live; today `llama-cpp-python` is single-sequence
- `src/shilp/server/generate.py` — the straight-through path a scheduler would interrupt
- `Makefile` → `loadtest` — the measurement that shows why batching is needed
</div>

## The gap, stated precisely

shilp's status table says it plainly: continuous batching is missing, because `llama-cpp-python` serves one sequence. The consequence is measured, not assumed:

> Four simultaneous requests each streamed at full speed, but their first tokens arrived at 0, 1.6, 3.2 and 4.7 seconds, and aggregate throughput stayed at one stream's worth.

Four requests, four turns. Each is fast; the aggregate is not. Continuous batching would not make any single stream faster — it would make four streams finish in roughly the time of one, because decode is bandwidth-bound and the weights are read once per step regardless of how many sequences are in the batch.

That is the whole argument, and it is worth being able to reproduce it in one sentence.

## Two honest paths

**Path A — adopt a batched backend.** `llama-server --parallel N` batches on the same GGUF files, Metal included. On a CUDA box, vLLM. shilp's `Engine` protocol was shaped for this: `engine/base.py` defines `GenParams`, `Chunk`, `ContextOverflow`, and a new backend is one file next to `llamacpp.py`.

**Path B — build a scheduler.** Put a queue between `server/generate.py` and the engine, admit requests into a batch, and step the batch yourself. This requires an engine API that exposes a decode step rather than a whole generation, which the current protocol does not. It is a much bigger change, and it is the version that teaches you the most.

The book's Chapter 6 is the specification for either path; Chapter 8 tells you which framework gives you the most of it for free.

## Prefix caching, already present

shilp measured a prompt repeating a 1,712-token prefix costing 43 ms instead of 823 ms. That is llama.cpp's prefix cache doing single-tenant reuse. RadixAttention is the same idea with a tree instead of a hash, so that N tenants sharing a system prompt all hit it, and divergent continuations share their common ancestor. If you are serving an agent, this is the highest-value technique in the chapter after batching — a system prompt and tool schema repeated on every call is exactly a shared prefix.

## Compression, honestly

`modify/quantize.py` is real and measured: Q4_K_M versus fp16 is 3.3× less memory and roughly 3.3× more throughput. `modify/surgery.py` is real but lossy — pruning layers will happily make your model worse, and the module says so. The book's framing is right: compression without evaluation is vandalism. shilp's roadmap has an eval harness at the top for exactly this reason.

## Checkpoint

1. Why does continuous batching improve aggregate throughput without improving per-stream decode speed?
2. What does chunked prefill protect, and from what?
3. Your model is 7B, your prefix is 2k tokens and shared by 50 users. Which technique do you reach for first, and what does it cost in memory?
