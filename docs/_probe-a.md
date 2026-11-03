# Repository tour

<https://github.com/orca3/llm-model-inference> — companion source code, notebooks and examples for *Hands-On LLM Serving and Optimization* by Chi Wang and Peiheng Hu (O'Reilly).

## Layout

| Directory | Chapter | What is in it |
| --- | --- | --- |
| `ch02/` | Large Language Model Serving | Five notebooks on transformer internals, execution, vLLM, batching and streaming, plus `streaming.py` |
| `ch03/single_model_llm_serving/` | Model-Serving System Design | A FastAPI service serving one LLM, with a workload manager, a model executor, a separate worker process, and a vLLM path |
| `ch03/multi_model_serving/` | Model-Serving System Design | A FastAPI service caching up to two models with an LRU, a worker factory per framework, and a Triton client |
| `ch04/KnowledgeAgent/` | Model Serving Best Practices | A RAG-plus-planning agent, with `planner.py`, `rag_system.py`, `actions.py`, `llm_manager.py` |
| `ch04/bedrock/`, `jumpstart/`, `dlc/`, `dlc_customization/` | Model Serving Best Practices | AWS deployment examples: Bedrock, SageMaker JumpStart, Deep Learning Containers, and a custom container |
| `ch06/quantization_3way_300.ipynb` | Essential Techniques | Qwen2.5-7B served three ways — fp16, GPTQ-Int4, FP8-dynamic — benchmarked with vLLM's own benchmark script |
| `ch07/SpecDecode.ipynb`, `LMCache.ipynb` | Advanced Techniques | Qwen3-32B with four speculative-decoding configurations; cold-versus-warm KV cache with LMCache |
| `ch08/SGLang.ipynb`, `TensorRT_LLM.ipynb`, `llamaCpp.ipynb` | Frameworks | The same generation in three frameworks |
| `ch09/model_optimization_in_practice.ipynb` | In Practice | Seven phases on Qwen3-14B: GPU inspection, traffic generation, metrics, baseline, quantisation, distributed serving |

Chapters 1 and 5 are conceptual and ship no code. There is no `ch01/` or `ch05/`.

