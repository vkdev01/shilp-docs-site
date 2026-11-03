# Sources

## The book

**Hands-On LLM Serving and Optimization: Hosting LLMs at Scale** — Chi Wang and Peiheng Hu, O'Reilly.

- Book website: <https://orca3.github.io/llm-model-inference/>
- Read on O'Reilly: <https://www.oreilly.com/library/view/hands-llm-serving/9798341621480/>
- Amazon: <https://www.amazon.com/Hands-LLM-Serving-Optimization-Hosting/dp/B0G48JRRMF>

## Companion repository

<https://github.com/orca3/llm-model-inference> — source code, notebooks and examples organised by chapter (`ch02/` through `ch09/`; Chapters 1 and 5 are conceptual and ship no code).

Directories referenced in these notes:

| Path | Contents |
| --- | --- |
| `ch02/` | Transformer internals, LLM execution walkthrough and KV cache, running Qwen with vLLM, batching, streaming (`streaming.py`) |
| `ch03/single_model_llm_serving/` | A from-scratch single-model LLM serving service: executor, manager, worker, workload manager, API, tests |
| `ch03/multi_model_serving/` | Multi-model serving with an NVIDIA Triton example (`model_dir/densenet_onnx`, `config/models.json`) |
| `ch04/KnowledgeAgent/` | Sample RAG-plus-planning agent |
| `ch04/bedrock/`, `jumpstart/`, `dlc/`, `dlc_customization/` | AWS deployment examples |
| `ch06/` | Quantisation walkthrough comparing precision and throughput trade-offs |
| `ch07/` | Speculative decoding, and LMCache for advanced KV caching |
| `ch08/` | SGLang, TensorRT-LLM and llama.cpp notebooks |
| `ch09/` | End-to-end optimisation plan benchmarking Qwen3-14B with vLLM |

## shilp

- Repository: <https://github.com/vkdev01/shilp>
- Documentation (private, access on request): <https://github.com/vkdev01/shilp-docs>

Files and claims in these notes are drawn from the shilp `README.md` at the commit these notes were written against, in particular its *Numbers that matter*, *Running it as a service*, *What this is not* and *Code map* sections, and the module docstrings under `src/shilp/`.

## How this reading started

A LinkedIn post by **Kalyan KS** sharing the book's chapter outline, which linked to the companion repository above. That post is the origin of this companion site; the repository is the primary source for anything about the book's code.

## Related reading, not covered here

- vLLM documentation — PagedAttention and the scheduler
- llama.cpp repository — the layer beneath shilp's default engine
- SGLang — RadixAttention and structured generation
- NVIDIA Triton — multi-model serving and model repositories

## A note on accuracy

These notes summarise the book's scope from its published chapter outline and its companion code. Where the book's prose was not available to check, the notes deliberately stay with the outline rather than inferring what a section says. Anything here about the book's *content* is a pointer to read the chapter, not a substitute for it.

The shilp measurements quoted throughout (84.5 versus 98.7 tok/s decode, 178 versus 27 ms TTFT, 9.15 versus 1.59 s prefill, the four-stream stagger, the 43 ms versus 823 ms prefix result) are the repository's own figures, measured on an M3 Pro with Gemma-3-1B at Q4_K_M. They are properties of that machine and that model, not universal constants — the ratios transfer, the absolute numbers do not.
