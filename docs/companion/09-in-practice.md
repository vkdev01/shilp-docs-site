# 09 · LLM Optimization in Practice

**Covers:** a step-by-step optimisation plan for Qwen3-14B with vLLM — hardware inspection, benchmarking, quantisation, distributed serving, and the trade-offs at each step, with sample workloads.

The chapter that fixes the order of operations, and the one most worth copying wholesale. The sequence is the argument:

1. **Inspect the hardware.** What do you actually have — VRAM, bandwidth, interconnect, driver, framework versions? Not what the spec sheet says.
2. **Benchmark the baseline.** Real prompts, real concurrency, TTFT and decode and p99 recorded before you change anything.
3. **Quantise.** The largest single lever, applied second, and re-benchmarked with the same workload.
4. **Scale out.** Only now do tensor or pipeline parallelism, because you can no longer tell whether a change helped without step 2's numbers.
5. **Record the trade-offs.** Quality delta, latency delta, memory delta, cost delta — for each step, in one table.

The reason this ordering matters is stated in the chapter and worth repeating: **you cannot tell what is slowing you down until you have measured it.** Quantising first is the most common version of this mistake — it makes everything 3.3× smaller, so it hides the scheduling problem you were actually trying to find.

## Where this lands

<div class="sh-lands" markdown>
<span class="lbl">shilp files</span>

- `shilp doctor` — step 1, hardware inspection, as a command
- `Makefile` → `loadtest` — step 2, the baseline benchmark
- `src/shilp/modify/quantize.py` — step 3, with the trade-offs documented in the module
- `recipes/<name>/<tag>.json` — the natural home for step 5
- `web/` requests page, `/metrics` — the per-request data a proper baseline needs
</div>

## Shilp's version of the plan

The chapter's plan maps onto shilp's pipeline almost one-to-one, which is why this is the most immediately actionable chapter in the book.

| Book step | shilp today | What is missing |
| --- | --- | --- |
| Inspect hardware | `shilp doctor` reports what the machine has | It does not compare against the model's requirement |
| Benchmark baseline | `make loadtest --rate --duration` | No workload file; prompts are synthetic |
| Quantise | `shilp quantize` across GGUF precisions | No quality measurement after quantising |
| Scale out | Not supported on one box | `llama-server --parallel N`, or vLLM |
| Record trade-offs | `recipes/*.json` records the steps | It records *what*, not *how much* |

That last row is the highest-value, lowest-effort improvement in this whole site. A recipe that recorded the measured delta per step — memory before and after, TTFT before and after, decode before and after — would turn shilp from a tool that reshapes models into a tool that explains them. The schema change is a few fields; the discipline is running the benchmark twice.

## A worked plan for shilp, on one box

If you want to run the chapter's plan against shilp rather than vLLM:

```bash
shilp doctor                                    # 1. what do I have
make pull                                       # 2. get a model
make serve &                                    # 3. bring it up
make loadtest ARGS="--rate 0.5 --duration 60"   # 4. baseline: p50, p99, tok/s
shilp quantize models/gemma-3-1b.gguf --out models/gemma-3-1b-q4.gguf --qtype Q4_K_M   # 5. the lever
make loadtest ARGS="--rate 0.5 --duration 60"   # 6. same workload, again
```

Two runs, one variable. That is the entire method, and the only hard part is resisting the urge to change three things at once.

The honest expectation on a single box: quantisation will show a large, clean win (memory and decode throughput both improve roughly 3.3×). Concurrency will not improve at all, because the bottleneck is serialisation, not size. Discovering that *from your own numbers* is the point of the chapter.

## What to read it for

Read it for the **discipline of one variable at a time**, and for the trade-off table. The chapter's Qwen3-14B run is a template you can re-run on whatever you have; the specific numbers will not transfer, the ordering will.

Read it also for the sample workloads. A benchmark is only as honest as its prompt distribution, and the chapter is explicit that a synthetic uniform-length workload will flatter your server in ways real traffic will not.

## Companion code

`ch09/model_optimization_in_practice.ipynb` is the end-to-end plan on Qwen3-14B with vLLM, with sample workloads. Run it on a CUDA box if you have one; read it regardless, because the structure — inspect, baseline, quantise, distribute, tabulate — is the deliverable.

## Checkpoint

1. Why is quantising before benchmarking a mistake, even though quantisation is the biggest lever?
2. What four numbers belong in the trade-off table for each step?
3. Your p99 improves after quantisation but your throughput does not. What does that tell you about the bottleneck?
