# Exercises

Small, checkable tasks that pair a chapter with a shilp file. Each has a concrete artefact — a measurement, a sentence, or a diff — so you know when it is done.

## 1 · Predict the asymmetry, then measure it

*Chapter 5, Chapter 2*

Write down, before running anything, your prediction for time-to-first-token on CPU versus Metal for a 3k-token prompt, and for decode tokens per second. Then run both and compare.

Done when: you have a table with predicted and measured columns, and one sentence explaining the largest error.

## 2 · Reproduce the four-stream stagger

*Chapter 6*

Start the server, fire four concurrent streaming requests, and record when each first token arrives. Then change one thing — a smaller `num_ctx`, a shorter prompt, a different quantisation — and run it again.

Done when: you can state, in one sentence, why aggregate throughput did not change.

## 3 · Find the KV cache

*Chapter 2*

Locate where the KV cache is allocated in each engine. In `engine/llamacpp.py` it is inside the C++ context and sized by `num_ctx`; in `transformers_engine.py` you can inspect it directly.

Done when: you can name the parameter that sizes it, and what happens in shilp when you exceed it.

## 4 · Size a deployment on paper

*Chapter 5*

Pick a model and a card. Using the three formulas, compute the maximum concurrent sessions at 8k context before you run out of memory, and the decode ceiling from bandwidth.

Done when: your number is within 20% of what a real run gives you, or you can explain why not.

## 5 · Write the queue

*Chapter 3*

Add a bounded queue between `server/generate.py` and the engine, with a 429 when it is full and a queue-wait field in telemetry.

Done when: `make loadtest` shows queue-wait time rising as rate rises, and rejected requests appear in the error breakdown rather than hanging.

## 6 · Compare two services

*Chapter 3*

Read `ch03/single_model_llm_serving/` and fill in the comparison table from the Chapter 3 note for your own reading, adding two rows of your own.

Done when: you have identified one thing the book's service does that shilp should copy, and one it does that shilp is right to skip.

## 7 · Prove or disprove the one-file claim

*Chapter 8*

Write a stub `engine/vllm_engine.py` that satisfies the `Engine` protocol without implementing generation — raise `NotImplementedError` in the right places. Count how many protocol methods you had to stub.

Done when: you can say whether the "one file" claim holds for a batched backend, and for a scheduler.

## 8 · Extend a recipe

*Chapter 9*

Add measured deltas to `recipes/*.json` for one model: size, TTFT, decode tok/s, before and after quantisation.

Done when: someone can read the recipe and know not just how the model was made but whether it was worth it.

## 9 · Design multi-LoRA

*Chapter 10*

Write the design, not the code: where does the adapter live in the request path, what is resident, and what does a cold adapter cost in TTFT?

Done when: you have two candidate designs and one measurement that would decide between them.

## 10 · The one-sentence test

*Every chapter*

For any chapter, write: *"this chapter explains why `path/to/file.py` does X, and what it cannot do."* If the second half is hard to fill in, that is the chapter worth re-reading.
