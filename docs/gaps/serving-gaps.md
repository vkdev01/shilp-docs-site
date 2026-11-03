# What shilp does not do

shilp's README has a section called *What this is not*, and it is the most useful page in the repository. This page expands it, because a serving stack's gaps are more informative than its features — they tell you which paradigm it chose.

The short version: **shilp is a single-box, single-model, single-tenant learning stack that measures itself honestly.** Everything below follows from that sentence.

## The status table

| Capability | Status | Why |
| --- | --- | --- |
| Two API dialects, streaming, usage reporting | <span class="sh-pill ok">have</span> | The core design exercise |
| Error codes distinguishing retryable from fatal | <span class="sh-pill ok">have</span> | Cheap, and it makes clients sane |
| Cancellation — client disconnect stops generation (logged 499) | <span class="sh-pill ok">have</span> | Easy to skip, expensive to retrofit |
| Telemetry, Prometheus metrics, TTFT and tok/s | <span class="sh-pill ok">have</span> | Measurement designed in, not bolted on |
| Content-addressed store, recipes, GC | <span class="sh-pill ok">have</span> | The OCI-shaped half of the project |
| Convert, quantise, prune, merge LoRA | <span class="sh-pill ok">have</span> | The reshape step with no Ollama equivalent |
| Authentication, quotas, rate limiting | <span class="sh-pill gap">missing</span> | Binds to `127.0.0.1` because of this |
| Request queue with admission control | <span class="sh-pill gap">missing</span> | No workload manager between route and engine |
| Continuous batching | <span class="sh-pill gap">missing</span> | `llama-cpp-python` is single-sequence |
| Metering, billing, multi-tenancy | <span class="sh-pill gap">missing</span> | Not a provider |
| Tool calling | <span class="sh-pill gap">missing</span> | Template is rendered; nothing parses `tool_calls` |
| Sharded GGUFs | <span class="sh-pill gap">rejected</span> | Explicitly refused rather than half-supported |
| Eval harness for surgery | <span class="sh-pill gap">missing</span> | Top item on the roadmap; pruning is unvalidated |

## The four that matter

**No auth, quotas, or rate limiting.** The README's advice is to put a proxy in front that authenticates and terminates TLS. That is correct and also a real amount of work. Until then the default bind is `127.0.0.1`, which is the honest version of "not safe to expose".

**No admission control.** There is no queue, so there is no decision about who gets served next. Requests arrive and run in order of arrival, which means a slow one blocks a fast one. This is the structural precondition for every scheduling improvement: you cannot batch what you never queued.

**No continuous batching.** The measured consequence: four concurrent streams with first tokens at 0, 1.6, 3.2 and 4.7 seconds, aggregate throughput flat. Each stream is fast; the server is not. This is Chapter 6's territory and the single largest gap.

**No eval harness.** `surgery.py` will prune layers and truncate vocabularies and tell you what it did. Whether the model is still good is your problem. For a project whose step two is "reshape the model", that is the most consequential omission — compression without measurement is how you ship a worse model and call it an optimisation.

## The one that is not a gap

**One model resident at a time, one mutable KV cache.** This is a design decision, not a missing feature. It is what makes the loader 200 readable lines and what makes `shilp ps` short. Multi-model residency would be a different project with a different README.

The distinction matters when you read the book: Chapters 3, 6, 7 and 10 all assume a server that manages many concurrent things. shilp manages one thing well and says so. Judge it against its own goal — *readable, small-team, single-box serving* — not against vLLM's.

## What the gaps imply for reading

Read Chapters 3 and 6 as specifications, not descriptions. Read Chapter 7 as the ceiling. Read Chapter 9 as the method for deciding which gap to close first. And read Chapter 8 to find out how much of the gap a different backend would close for free.

[The roadmap](roadmap.md) puts them in an order.
