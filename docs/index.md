<div class="sh-hero" markdown="1">
<span class="sh-kicker">companion notes · repository</span>

# Hands-On LLM Serving and Optimization

Notes on the book's companion repository — [orca3/llm-model-inference](https://github.com/orca3/llm-model-inference): five chapter notebooks on how an LLM actually runs, two complete serving services in chapter 3, three framework labs, and a seven-phase optimisation study on Qwen3-14B.
</div>

The repository is organised by chapter. Chapters 1 and 5 are conceptual and ship no code; everything else is a notebook you can open in Colab or a directory you can run. These notes are a map to that code: what each directory contains, how to run it, what to look for in the output, and what the numbers mean once you have them.

They deliberately stay with what is in the repository — the source, the notebooks, and the benchmark results the notebooks record. Where the book's prose explains something the code does not, these notes say so rather than filling the gap.

<div class="sh-cards">
  <a class="sh-card" href="start/repo-tour/">
    <span class="n">01</span>
    <span class="t">Repository tour</span>
    <span class="d">Layout, prerequisites, and the one-line command that starts each chapter.</span>
  </a>
  <a class="sh-card" href="start/benchmarks/">
    <span class="n">02</span>
    <span class="t">Benchmarks</span>
    <span class="d">The measured results the notebooks record: quantisation, prefix repetition, tensor parallelism.</span>
  </a>
  <a class="sh-card" href="walkthroughs/single-model-service/">
    <span class="n">03</span>
    <span class="t">Single-model service</span>
    <span class="d">Chapter 3's FastAPI service, file by file: engine, workload manager, executor, worker.</span>
  </a>
  <a class="sh-card" href="walkthroughs/multi-model-service/">
    <span class="n">04</span>
    <span class="t">Multi-model service</span>
    <span class="d">An LRU cache of two models, a worker factory, and a Triton-backed worker.</span>
  </a>
  <a class="sh-card" href="walkthroughs/benchmark-method/">
    <span class="n">05</span>
    <span class="t">Benchmark method</span>
    <span class="d">The seven phases of chapter 9, and the four metrics they collect.</span>
  </a>
  <a class="sh-card" href="plan/reading-plan/">
    <span class="n">06</span>
    <span class="t">Reading plan</span>
    <span class="d">A four-week order for reading the chapters against the code, with what to run each week.</span>
  </a>
</div>

## The repository in one paragraph

Chapter 2 is five notebooks that take a transformer apart — config, attention, memory, a step-by-step generation walkthrough with per-token timings, vLLM versus plain Transformers, batching, and streaming. Chapter 3 is the centre of gravity: two runnable FastAPI services, one serving a single LLM with a workload manager and a separate worker process, one caching up to two models with an LRU and dispatching to framework-specific workers. Chapters 6, 7 and 8 are framework labs: a three-way quantisation comparison, speculative decoding and LMCache, and SGLang, TensorRT-LLM and llama.cpp side by side. Chapter 9 is the capstone: a seven-phase study that benchmarks Qwen3-14B on vLLM, quantises it, then scales it across GPUs, recording every result as JSON you can plot.

!!! note "Scope"
    Every claim on this site is traceable to a file in the repository. Benchmark numbers are quoted from the notebooks' own recorded results and labelled with the setup they were run under. Where a number is missing, the page says it is missing rather than estimating.
