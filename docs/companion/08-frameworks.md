# 08 · LLM Serving Frameworks

**Covers:** vLLM internals (architecture, scheduler, layered optimisation), TensorRT-LLM, SGLang, llama.cpp, and how to choose.

The chapter that turns the previous six into a decision. Each framework is a different answer to "where do you spend your complexity".

**vLLM** is the reference implementation of high-throughput serving: PagedAttention for KV memory, continuous batching in the scheduler, prefix caching, tensor parallel, and a Python-first codebase you can read. Its scheduler is the part worth studying — it decides which sequences enter the batch on each step, and that decision *is* continuous batching.

**TensorRT-LLM** compiles models into optimised engines for NVIDIA hardware. Best raw performance, worst portability, and a build step that sits between you and the weights. Choose it when you have fixed hardware and a fixed model and need the last 20%.

**SGLang** pairs a frontend for structured generation with RadixAttention for prefix reuse. Choose it when your workload is agentic — lots of shared prefixes, structured output, branching.

**llama.cpp** is the one shilp already uses. GGUF, mmap, CPU plus Metal/CUDA/ROCm offload, a single binary, no Python. It is the only one of the four that runs comfortably on a laptop, and it is the only one whose single-sequence limitation shilp has to work around.

## Where this lands

<div class="sh-lands" markdown>
<span class="lbl">shilp files</span>

- `src/shilp/engine/base.py` — the `Engine` protocol; this chapter is effectively the spec for writing the next implementation
- `src/shilp/engine/llamacpp.py` — the llama.cpp backend, done
- `src/shilp/engine/transformers_engine.py` — proof that a backend is one file, not an architecture
- `src/shilp/engine/fake.py` — proof that the surface is testable without a backend at all
- `README.md` → *Running it as a service* — the sentence "the engine protocol is shaped so either arrives as one file"
</div>

## The claim this chapter lets you test

shilp asserts that its engine protocol is shaped so a vLLM or `llama-server` backend "arrives as one file". Chapter 8 is how you find out whether that is true or wishful.

Two honest tests:

**Does the protocol expose what a batched backend needs?** `Engine` takes `GenParams` and yields `Chunk`. A continuous-batching backend wants to admit a request into a batch and step it — which is a different shape from "generate this to completion and yield chunks". So a vLLM backend that hides batching inside vLLM works fine behind this protocol; a *scheduler* built in shilp does not. The claim holds for the former, not the latter, and it is worth saying which one you mean.

**Does the protocol survive multiple models?** `loader.py` holds one model with LRU eviction and reference counting. A multi-model backend (the book's Chapter 3 service, or Triton) would want to own residency itself. Again: fine as a backend that manages its own, awkward as a backend the loader manages.

Neither is a flaw. Both are the kind of question this chapter trains you to ask.

## Choosing, as a short decision table

| If your constraint is… | Reach for | Because |
| --- | --- | --- |
| One box, a laptop, no Python | llama.cpp | GGUF, mmap, offload, single binary |
| Throughput on NVIDIA, model fixed | TensorRT-LLM | Compiled engines, best raw performance |
| Many concurrent users, NVIDIA | vLLM | PagedAttention plus continuous batching |
| Agentic, structured output, shared prefixes | SGLang | RadixAttention, structured generation |
| Reading the code to learn | vLLM, then llama.cpp | Readable scheduler; readable everything else |

## What to read it for

Read it for the **scheduler comparison**. vLLM's scheduler, llama.cpp's `--parallel` slots, and SGLang's radix-aware batching are three answers to the same question, and seeing all three makes the concept portable. That is the transferable asset from this chapter — not a framework recommendation, which will be stale in a year.

Read it also for permission to stop. shilp is a learning stack; the honest conclusion of this chapter is that if you need any of these properties in production, use the framework, and keep shilp as the thing that taught you what the framework is doing.

## Companion code

`ch08/` has three notebooks: SGLang, TensorRT-LLM, and llama.cpp. Run the llama.cpp one first — it is the only one that will work on whatever machine you are on, and it is the layer directly beneath shilp's default engine.

## Checkpoint

1. Which framework would you pick for an agent with a 4k-token system prompt and 200 users, and why?
2. What does PagedAttention actually page, and what problem does fragmentation cause without it?
3. Write the `Engine` method signature a continuous-batching backend would need, and say why the current protocol does not have it.
