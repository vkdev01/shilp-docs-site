# Numbers that matter

Almost every serving decision reduces to one asymmetry: **prefill is compute-bound, decode is bandwidth-bound.** A GPU helps the first enormously and the second barely at all. shilp measures this on one machine so the claim is not taken on faith.

## Measured: Gemma-3-1B Q4_K_M on an M3 Pro

Same build, layers on CPU versus on Metal:

| | CPU only | Metal | Ratio |
| --- | --- | --- | --- |
| Decode (bandwidth-bound) | 84.5 tok/s | 98.7 tok/s | 1.17× |
| Time to first token, short prompt | 178 ms | 27 ms | 6.7× |
| Prefill, 3,107-token prompt | 9.15 s | 1.59 s | 5.8× |

Read that middle row carefully. The GPU did not make the model faster; it made the *prompt* faster. Generation speed moved by 17%, because generating a token means reading the weights once per token regardless of how fast you can multiply. Prefill moved by 6×, because prefill is one big matrix multiplication over the whole prompt.

## Measured: the same server under load

Four simultaneous requests, each streaming at full speed, but their first tokens arrived at 0, 1.6, 3.2 and 4.7 seconds — and aggregate throughput stayed at one stream's worth.

That is a serial server. Requests take turns. Each one is fast; the queue is not. It is the concrete, measured version of the line in the book's outline about batching and scheduling, and it is why continuous batching is the single largest missing piece in shilp (see [What shilp does not do](../gaps/serving-gaps.md)).

A second measurement from the same run: a prompt that repeats a 1,712-token prefix cost 43 ms instead of 823 ms. That is prefix reuse — the KV cache for the shared prefix was still resident, so the prefill was skipped. RadixAttention and prefix caching in the book's Chapter 6 are the general, multi-tenant version of the same trick.

## Computed: what a model costs to hold

| Model | fp16 | Q4_K_M | KV per token | 8k context |
| --- | --- | --- | --- | --- |
| Qwen2.5-1.5B | 2.88 GiB | 0.88 GiB | 28 KiB | 0.22 GiB |
| Qwen2.5-7B | 14.18 GiB | 4.34 GiB | 56 KiB | 0.44 GiB |

Three formulas cover most of the arithmetic you will do:

```
resident = weights + (KV_per_token × context × concurrent_sessions) + runtime
decode ceiling ≈ memory_bandwidth / model_size_in_bytes
concurrent_requests ≈ arrival_rate × latency
```

## Three consequences

**Quantisation is the largest single lever.** Q4_K_M versus fp16 is 3.3× less memory *and* roughly 3.3× more throughput, because decode is bandwidth-bound and you just made the thing you stream 3.3× smaller. No scheduling trick comes close to that ratio.

**The KV cache is per session, and it is not small.** 20 users at 8k context cost 8.75 GiB of KV — as much as the weights themselves. This is the number that turns "just serve a 7B model" into a capacity plan, and it is the reason the book spends a chapter on KV sizing and a section on advanced KV caching.

**Concurrency is a queueing problem, not a speed problem.** 10 requests/second at 8 seconds each means 80 simultaneous generations. A serial server plateaus at a handful of users no matter how fast each one is. That is why the roadmap's first item is a scheduler, not a faster kernel.

## Why this page comes first

Every chapter note in this site refers back to one of these numbers. Chapter 2 explains why prefill and decode behave differently. Chapter 5 gives you the arithmetic intensity that predicts the 6× and the 1.2×. Chapter 6 is a catalogue of ways to move the throughput number without touching the model. Chapter 7 is what you do when one GPU stops being enough. Chapter 9 is these numbers, measured properly, in a fixed order.

!!! tip "Reproduce before you read"
    `make up` gives you a server and `make loadtest` gives you the concurrency measurement. Run both before Chapter 2 — the four-stream stagger is much more memorable when you have watched it happen.
