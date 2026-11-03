# Roadmap

An order of work derived from the chapter notes, weighted by benefit per line of code. Each item names the chapter that specifies it and the file that would change.

## 1 · Benchmark before you quantise — and record the delta

*Chapter 9 · `recipes/*.json`, `Makefile`*

The cheapest useful change in the repository. Recipes currently record *what* happened; add memory, TTFT, decode tok/s and p99 before and after each step, and a model can explain how it was made *and* what it cost.

```json
{ "step": "quantize", "quant_type": "Q4_K_M",
  "measured": { "size_gib": [2.88, 0.88], "ttft_ms": [178, 173], "decode_tok_s": [84.5, 279.0] } }
```

Effort: small. Value: it makes every later comparison possible, and it is the habit the book argues for hardest.

## 2 · A request queue with admission control

*Chapter 3 · `server/generate.py`, `engine/base.py`*

Put a queue between the route and the engine. Even with a single-sequence backend, this buys you a bounded queue, an explicit reject-with-429 path, and a place to put every later scheduling decision. Without it, continuous batching has nowhere to live.

Effort: medium. Value: it is the precondition for items 3 and 4, and it turns "the server degrades by queueing" into "the server degrades by shedding", which is a design choice you can defend.

## 3 · Continuous batching, via a batched backend

*Chapter 6, Chapter 8 · a new `engine/llama_server.py`*

The largest gap, and the honest way to close it is to adopt a backend that already batches: `llama-server --parallel N` on the same GGUF files, Metal included. `engine/base.py` was written so this is one file.

The interesting work is not the backend, it is deciding whether batching lives behind the protocol (backend manages its own batches) or in front of it (shilp schedules). Both are legitimate; only the first fits the current protocol.

Effort: medium for the backend, large for a real scheduler. Value: the measured 4-stream stagger is the thing this fixes.

## 4 · Chunked prefill

*Chapter 6, Chapter 7 · engine and queue*

The cheap approximation of prefill–decode disaggregation, and the fix for the specific unfairness that a long prompt stalls everyone else's decode. Even on one box, interleaving prefill chunks with decode steps is a real p99 improvement.

## 5 · An eval harness for surgery

*Chapter 6 · new `eval/`, `modify/surgery.py`*

`prune_layers` and vocabulary truncation are lossy and unvalidated, and the README says so. A small fixed prompt set with a scoring function — exact-match, perplexity, or a judge model — would let surgery report damage instead of just describing itself. The README already calls this the top roadmap item; the chapter notes agree.

## 6 · Multi-LoRA serving

*Chapter 10 · `modify/merge.py`, `engine/loader.py`*

One base model resident, adapter deltas selected per request. It reuses the loader's "one base" assumption instead of fighting it, and it is the one Chapter 10 direction that is a genuine feature for the stated audience rather than a benchmark trick.

## 7 · Per-request profiling

*Chapter 10 · `server/telemetry.py`*

Four segments per request: queue, template render, prefill, decode. Enough to answer "where did the time go" for the three cases that actually happen.

## Deliberately not on this list

- **Auth, metering, billing.** A proxy does this better, and doing it in shilp would change what the project is.
- **Tensor or pipeline parallelism.** The `llama-server` or vLLM swap is the answer, not an implementation.
- **Multi-model residency.** The single-model loader is the design.

## How to read this list

Items 1 and 2 are cheap and unlock everything else. Item 3 is the headline gap. Items 5 and 6 are the ones that make shilp more useful to a small team rather than more like a production provider. Items 4 and 7 are quality-of-life for anyone running it under load.

If you only ever do one, do item 1: it costs an afternoon and it makes every claim in the repository checkable.
