# 01 · Introduction to Model Serving and Optimization

**Covers:** anatomy of a model, the model lifecycle, what model serving is and why we optimise it, serving paradigms (edge, single-model, multi-model), and serving platforms.

The framing chapter. It separates four things that get blurred together in casual conversation: what a model *is* (weights plus a config plus a tokenizer plus a template), what its *lifecycle* is (train, publish, fetch, load, serve, retire), what *serving* means (turning a request into tokens with a latency budget), and what *optimising* means (buying throughput or latency with memory, precision, or scheduling).

The paradigms are the part worth keeping. Edge serving optimises for one user and no network. Single-model serving optimises for one model, many users, and a queue. Multi-model serving optimises for many models, few requests each, and residency decisions. shilp is squarely the second, which is why its loader has LRU eviction and its README has a "not multi-user" section.

## Where this lands

<div class="sh-lands" markdown>
<span class="lbl">shilp files</span>

- `README.md` — the four-step framing (pull, reshape, serve, observe) is this chapter's lifecycle, made concrete
- `src/shilp/cli.py` — one typer command per lifecycle step
- `src/shilp/store.py` — a model as a manifest, which is the "anatomy of a model" question answered on disk
- `src/shilp/engine/loader.py` — the residency decision that separates single-model from multi-model serving
</div>

## What to read it for

Read it for the vocabulary, and for one specific decision: **which paradigm are you in?** Everything in the rest of the book is a consequence. A single-model server spends its complexity on scheduling and KV management. A multi-model server spends it on routing and eviction. An edge deployment spends it on memory and startup time. If you do not pick one, you end up with shilp's position — a single-model server with a multi-model UI — which is fine as long as you say so out loud.

Read it also for the honest definition of optimisation. Optimising is not "making it faster"; it is choosing which of throughput, latency, cost, and quality you are willing to trade. shilp's `modify/quantize.py` writes its trade-offs down in the module docstring, which is the habit this chapter is trying to install.

## Checkpoint

Before moving on, answer these without looking:

1. What are the four artefacts that make up "a model" on disk, and which one is version-controlled separately in shilp?
2. Name the paradigm where residency, not scheduling, is the hard problem.
3. Why is "make inference faster" not a well-formed optimisation goal?

If you cannot answer the third one, the rest of the book will read as a list of tricks rather than a set of trades.

## Companion code

Chapters 1 and 5 are conceptual and ship no code. The closest thing to a hands-on artefact is shilp itself: `shilp pull` then `shilp ps` gives you the lifecycle in two commands, and `blobs/`, `manifests/`, `recipes/` gives you the anatomy as three directories.

!!! tip "One useful habit from this chapter"
    Keep a one-line answer to "what am I optimising for?" pinned at the top of the project. For shilp the answer is *learning and small-team serving on one box, with readable code* — and every deliberate omission in the README follows from it. Without that sentence, the gaps read as failures instead of choices.
