# Glossary

Short definitions, in the order they matter for serving. Each one links to the chapter note that develops it.

**Arithmetic intensity** — FLOPs performed per byte read from memory. High intensity is compute-bound (prefill); low intensity is bandwidth-bound (decode). The single most predictive idea in the book. → [05](../companion/05-challenges.md)

**Autoregressive generation** — producing one token at a time, each conditioned on all previous tokens. Why serving is a loop, not a single pass. → [02](../companion/02-serving.md)

**Continuous batching** — letting sequences join and leave a running batch at each decode step, instead of waiting for a whole batch to finish. The largest gap in shilp. → [06](../companion/06-essential.md)

**Chunked prefill** — splitting a long prompt's prefill across several steps so it interleaves with ongoing decode. The cheap approximation of disaggregation. → [06](../companion/06-essential.md)

**Decode** — the generation phase, one token per step. Bandwidth-bound: cost scales with model size, not with batch size. → [02](../companion/02-serving.md)

**Disaggregation (prefill–decode)** — running prefill and decode on separate pools, because they have different bottlenecks. Costs a KV transfer. → [07](../companion/07-advanced.md)

**GGUF** — llama.cpp's single-file quantised model format. shilp's default engine consumes it; `modify/convert.py` produces it from safetensors.

**KV cache** — the stored keys and values for every token already processed, so each new step computes one row instead of the whole prefix. Sized by layers, heads, head dimension, context and concurrency. → [05](../companion/05-challenges.md)

**Manifest** — shilp's name for a model's descriptor: name, tag, layers by digest, params, template. OCI-shaped, content-addressed. → [What shilp is](../start/what-shilp-is.md)

**PagedAttention** — vLLM's technique of storing the KV cache in fixed-size pages so it need not be contiguous, removing fragmentation. → [08](../companion/08-frameworks.md)

**Prefill** — the phase that processes the whole prompt to produce the first token. Compute-bound; dominates time-to-first-token. → [02](../companion/02-serving.md)

**Prefix caching** — reusing the KV cache of a shared prompt prefix. llama.cpp does it per process; RadixAttention generalises it to many tenants. → [06](../companion/06-essential.md)

**Quantisation** — reducing the bits per weight (fp16 → Q4_K_M). Attacks the bandwidth term directly: 3.3× less memory and roughly 3.3× more decode throughput. → [06](../companion/06-essential.md)

**RadixAttention** — prefix reuse via a radix tree over token sequences, so divergent continuations share their common ancestor. SGLang's core idea. → [08](../companion/08-frameworks.md)

**Recipe** — shilp's record of how a model was reshaped: a list of steps, each with its parameters. → [Roadmap](../gaps/roadmap.md)

**Shilpfile** — shilp's model-definition format: `FROM`, `PARAMETER`, `TEMPLATE`, `SYSTEM`.

**Speculative decoding** — a small draft model proposes tokens, the large model verifies them in one pass. Lossless in output, faster when acceptance is high, costs a second model's memory. → [07](../companion/07-advanced.md)

**TTFT (time to first token)** — how long until the first chunk arrives; dominated by prefill plus queueing. → [Numbers](../start/numbers-that-matter.md)

**Tensor parallel** — splitting each layer's matrices across GPUs with an all-reduce per layer. Needs fast interconnect. → [07](../companion/07-advanced.md)

**Workload manager** — the component that separates "what the client asked for" from "what the GPU should run next". The structure that makes batching possible. → [03](../companion/03-system-design.md)
