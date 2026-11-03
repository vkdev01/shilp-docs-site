to read this repository

Three passes, in this order.

**First, read chapter 3.** It is the only place where a whole serving system is assembled from parts, and every other chapter either explains one of those parts or replaces it with a framework. The [single-model walkthrough](../walkthroughs/single-model-service.md) goes through it file by file.

**Second, run chapter 2's notebooks.** They answer the question chapter 3's code raises but does not explain: what is actually being recomputed on each token, and why the first token is slow.

**Third, work through chapter 9's phases.** It is the method — inspect, generate traffic, define metrics, baseline, quantise, distribute — and it is the one chapter whose structure you will reuse on your own hardware.

Chapters 6, 7 and 8 are reference material you will come back to when you have a specific problem: quantisation choices, speculative decoding, or a framework swap.

## What the repository does not include

Worth knowing before you look for it:

- No chapter 1 or 5 code — those chapters are conceptual.
- No Kubernetes or Terraform; deployment examples are notebook-level AWS calls.
- The multi-model service's model download step is commented out (`# Skip the downlaod implementation for simplicity` in `manager.py`), so models are expected to be resolvable by name from the Hub.
- No shared benchmark harness across chapters — each notebook carries its own setup, which is why comparing across chapters is not apples-to-apples.

That last point matters more than it looks. Chapter 6 benchmarks Qwen2.5-7B, chapter 7 benchmarks Qwen3-32B, chapter 9 benchmarks Qwen3-14B. The *method* transfers between them; the numbers do not.
