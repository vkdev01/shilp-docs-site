# Reading plan

Four weeks, roughly four to six hours each, reading the book against the repository rather than before it. The order is not the book's order: it starts with the arithmetic, because that is what makes the rest quantitative.

## Week 1 — the arithmetic

**Read:** Chapter 5 (Challenges), then Chapter 1 (Introduction).
**Do:** run `make up`, then `make loadtest ARGS="--rate 0.5 --duration 60"`.

Chapter 5 first, deliberately. Arithmetic intensity, KV sizing and GPU specs are the tools you need to read everything else critically. Chapter 1 is short and gives you the vocabulary for the paradigms; read it second, as a map rather than a foundation.

By the end of the week you should be able to predict, before measuring, that a GPU will improve TTFT far more than decode — and then confirm it against [Numbers that matter](../start/numbers-that-matter.md).

## Week 2 — the mechanism

**Read:** Chapter 2 (LLM serving).
**Do:** `ch02/` notebooks in order — transformer internals, the execution walkthrough, vLLM, batching, streaming. Then read `src/shilp/server/stream.py` beside `ch02/streaming.py`.

This is the densest week. The KV cache is the concept everything else hangs off, and the walkthrough notebook is the fastest way to see it move. Keep two questions open as you read: where does the KV cache live in shilp, and why is the second request faster than the first?

## Week 3 — the missing pieces

**Read:** Chapter 6 (Essential techniques), then Chapter 3 (System design).
**Do:** read `ch03/single_model_llm_serving/` and compare it with shilp's `server/` and `engine/` using the table in the [Chapter 3 note](../companion/03-system-design.md).

This is where the reading turns into a work plan. Chapter 6 names the mechanism shilp lacks (continuous batching) and Chapter 3 shows the structure that makes it possible (a workload manager between route and engine). Together they explain the four-stream stagger you measured in week 1.

If you write code this month, it is here: a queue in front of `generate.py`.

## Week 4 — the ceiling

**Read:** Chapter 8 (Frameworks), then Chapter 7 (Advanced), then Chapter 9 (In practice).
**Do:** run `ch08/llamaCpp.ipynb` if your machine allows; read `ch09`'s notebook structure even if you have no CUDA box.

Chapter 8 before Chapter 7, because knowing what a batched framework gives you makes the parallelism discussion concrete rather than aspirational. Chapter 9 last, as the method for deciding which of the earlier gaps to close first.

**Skim:** Chapters 4 and 10. Chapter 4 is mostly organisational (auth, build-versus-buy, agentic traffic) and shilp has decided not to do that work. Chapter 10 is where the next feature lives — multi-LoRA serving — but read it after you have something running.

## If you have one evening

Read Chapter 5's arithmetic, then [Numbers that matter](../start/numbers-that-matter.md), then the [chapter map](../companion/chapter-map.md). That is enough to understand what shilp is, where its ceiling is, and why.

## If you are reading to change shilp

Chapter 5 → 2 → 6 → 3 → 8. Stop there and write the queue. The rest can wait until the queue exists.

## Reading with the code open

A habit worth keeping: for each chapter, write down one sentence of the form *"this chapter explains why `path/to/file.py` does X"*, and one of the form *"this chapter explains what `path/to/file.py` cannot do"*. If you cannot fill in the second sentence, you have read a description rather than a specification, and the chapter is worth a second pass.
