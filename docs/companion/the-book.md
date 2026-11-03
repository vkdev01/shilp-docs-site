# Hands-On LLM Serving and Optimization

**Hosting LLMs at Scale** — Chi Wang and Peiheng Hu, published by O'Reilly.

- Book site: <https://orca3.github.io/llm-model-inference/>
- Companion code: <https://github.com/orca3/llm-model-inference>
- Read on O'Reilly: <https://www.oreilly.com/library/view/hands-on-llm-serving/9798341621480/>

The premise is that inference has moved to the centre of the stack. Training got the attention; serving is where the money and the latency live. Without optimisation, LLMs are expensive and slow to serve — so the book is about the mechanics of making them cheap and fast, and about the engineering discipline of hosting them at scale.

## What the ten chapters cover

| | Chapter | Scope |
| --- | --- | --- |
| 1 | Introduction to Model Serving and Optimization | Anatomy of a model, the model lifecycle, what serving is, why we optimise it, serving paradigms (edge, single-model, multi-model), serving platforms |
| 2 | Large Language Model Serving | Inside the transformer, autoregressive generation, decoder-only architecture, attention, the KV cache, prefill and decode, running a model with vLLM |
| 3 | Model-Serving System Design: A Deep Dive | Building online single-model and multi-model serving services from scratch, batching and streaming, NVIDIA Triton, cost- versus latency-optimised designs |
| 4 | Model Serving Best Practices | Serving in an agentic world (agents, RAG, CAG), enterprise serving architecture, open-source stack versus cloud vendor, build-or-buy, performance measurement |
| 5 | Challenges When Serving LLMs | Why optimisation matters, accelerator chips and GPU specs, model-loading bottlenecks, KV cache sizing, arithmetic-intensity analysis of prefill and decode |
| 6 | Essential LLM Optimization Techniques | Request batching and scheduling (dynamic, continuous, chunked prefill), scalable attention and kernel fusion, model compression (quantisation, distillation, pruning), prefix caching and RadixAttention |
| 7 | Advanced LLM Optimization Techniques | Speculative decoding, multi-GPU and multinode inference (data, tensor, pipeline, expert parallelism), prefill–decode disaggregation, advanced KV caching for long context |
| 8 | LLM Serving Frameworks | vLLM internals (architecture, scheduler, layered optimisation), TensorRT-LLM, SGLang, llama.cpp, and how to choose |
| 9 | LLM Optimization in Practice | A step-by-step optimisation plan for Qwen3-14B with vLLM: hardware inspection, benchmarking, quantisation, distributed serving, trade-offs |
| 10 | Advancements in LLM Serving | Semantic caching, performance profiling, multimodal serving, edge AI, multi-LoRA serving, model serving in reinforcement learning |

## The companion repository

The code is organised by chapter. Chapters 1 and 5 are conceptual and ship no code.

| Chapter | Directory | What is in it |
| --- | --- | --- |
| 2 | `ch02/` | Notebooks walking through transformer internals, step-by-step LLM execution and the KV cache, running Qwen with vLLM, plus batching and streaming basics (`streaming.py`) |
| 3 | `ch03/` | A from-scratch single-model LLM serving service (`single_model_llm_serving/`: executor, manager, worker, workload manager, API) and a multi-model serving service (`multi_model_serving/`) with a Triton example (`model_dir/densenet_onnx`) |
| 4 | `ch04/` | A sample Knowledge Agent (RAG plus planning) and cloud deployment examples on AWS: Bedrock, JumpStart, Deep Learning Containers, and DLC customisation |
| 6 | `ch06/` | A quantisation walkthrough comparing precision and throughput trade-offs |
| 7 | `ch07/` | Hands-on speculative decoding, and LMCache for advanced KV caching |
| 8 | `ch08/` | Framework notebooks: SGLang, TensorRT-LLM, llama.cpp |
| 9 | `ch09/` | An end-to-end optimisation plan benchmarking Qwen3-14B with vLLM — quantisation, distributed serving, trade-off analysis, sample workloads |

Two of these directories are worth flagging before you start, because they overlap with shilp more than the others:

`ch03/single_model_llm_serving/` is the closest thing in the book to shilp's own architecture — a model executor, a model manager, a worker, a workload manager, and an HTTP entry point, all in readable Python. Reading it beside `src/shilp/server/generate.py` and `src/shilp/engine/loader.py` is the single highest-value comparison in this whole exercise.

`ch08/llamaCpp.ipynb` matters because llama.cpp is shilp's default engine. If you want to understand the layer underneath `engine/llamacpp.py` without reading C++, that notebook is the shortest path.

## How these notes treat the book

The notes summarise scope and connect it to shilp; they do not reproduce the chapters. Where the book's prose was not available to check, the notes stay with the published outline and the companion code rather than inferring what a section says. Treat any claim here about the book's *content* as a pointer to go and read the chapter, not as a replacement for it.

!!! note "Provenance"
    This reading started from a LinkedIn post by Kalyan KS sharing the book's chapter outline, which linked to the companion repository above. See [Sources](../reference/sources.md) for the trail.

## Next

The [chapter map](chapter-map.md) turns this outline into a work plan: for each chapter, the shilp file it touches and whether shilp already does the thing, deliberately does not, or has it on the roadmap.
