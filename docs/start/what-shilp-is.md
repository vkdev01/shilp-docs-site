# What shilp is

shilp is a model-serving stack in about 4,100 lines: a content-addressed model store, an inference engine, and an HTTP API. It is not a wrapper around `ollama serve` — it is the thing Ollama is, built from scratch so that every part of the pipeline belongs to the reader.

```bash
shilp pull hf:bartowski/google_gemma-3-1b-it-GGUF:q4_k_m   # 1. download
shilp build -f Shilpfile                                   # 2. reshape
shilp serve --model google_gemma-3-1b-it-gguf:q4_k_m       # 3. serve
curl localhost:8000/api/chat -d '{"model":"…","messages":[…]}# 4. use it
```

## The four steps

| Step | Command | What it does |
| --- | --- | --- |
| 1. Download | `shilp pull` | Fetch a repo from the Hub into a content-addressed store, revision-pinned |
| 2. Reshape | `shilp build`, `convert`, `quantize`, `merge-lora`, `surgery` | Change the model: format, precision, parameters, template, structure |
| 3. Serve | `shilp serve` | One engine, two HTTP surfaces, streaming, telemetry, a chat UI |
| 4. Observe | `shilp ps`, `shilp usage`, `/metrics` | What is resident, how fast, how much |

The reshape step is the one with no equivalent in Ollama. Ollama can import a GGUF and change its parameters; it cannot convert a Hugging Face repo, prune transformer layers, truncate a vocabulary, merge a LoRA adapter, and hand back a recipe of what it did. shilp does all four and writes each step into `recipes/<name>/<tag>.json`, so a model can explain how it was made.

## A model on disk

Weights live in `blobs/sha256-<hex>`; a manifest names them. Two tags that share a file store it once, and a manifest can never point at bytes that changed underneath it — the filename *is* the checksum. The same idea as OCI images, which is why the manifest format looks familiar.

```json
{
  "schemaVersion": 1,
  "name": "qwen2.5-1.5b-instruct-gguf",
  "tag": "q4_k_m",
  "layers": [{ "mediaType": "application/vnd.shilp.gguf", "digest": "sha256:…", "size": 1117320736 }],
  "params": { "temperature": 0.6, "num_ctx": 8192 },
  "metadata": { "source": "hf:Qwen/Qwen2.5-1.5B-Instruct-GGUF", "quantization": "Q4_K_M" }
}
```

## Three engines, one protocol

`shilp serve --engine <name>` picks the backend. Nothing above it changes — same loader, same API surfaces, same telemetry.

| | `llamacpp` (default) | `transformers` | `fake` |
| --- | --- | --- | --- |
| Weights | one GGUF, quantised, mmap'd | safetensors directory, dense | none |
| Memory, 7B | ~4.3 GiB at Q4_K_M | ~14.2 GiB at fp16 | — |
| Install | compiles C++ (3–10 min) | `pip install -e ".[base]"` | instant |
| Apple GPU | Metal | no | n/a |
| New architectures | after a GGUF port | day one | n/a |
| Debug a forward pass | read C++ | `print` the tensor | trivial |

The `transformers` engine exists to make the boundary demonstrable rather than asserted: one new file, and `scripts/bare_inference.py` is the same code as a standalone script. The `fake` engine is deterministic and lets the entire HTTP surface run without weights or a network, which is how the 127 unit tests stay hermetic.

## Code map

```
src/shilp/
  cli.py            typer commands, one per pipeline step
  config.py         settings from the environment; no config-file format
  store.py          blobs, manifests, recipes, garbage collection
  hub.py            Hugging Face download, behind a protocol so tests need no network
  modelfile.py      the Shilpfile format (FROM / PARAMETER / TEMPLATE / SYSTEM)
  export.py         materialise a manifest back into a plain directory
  modify/
    toolchain.py    find llama.cpp, run its binaries, explain what is missing
    convert.py      HF safetensors -> GGUF
    quantize.py     GGUF precision reduction, with the trade-offs written down
    surgery.py      prune layers, truncate vocab, rope scaling, chat template
    merge.py        fold a LoRA adapter into the base weights
  engine/
    base.py         Engine protocol, GenParams, Chunk, ContextOverflow
    llamacpp.py     the real backend (GGUF, mmap, Metal/CUDA offload)
    transformers_engine.py  the same protocol on plain PyTorch
    fake.py         deterministic backend, so the API is testable and demoable
    loader.py       one resident model, LRU eviction, reference counting
    template.py     render Ollama-style templates to a prompt
  server/
    app.py          create_app, error translation, health, metrics
    ui.py           /api/stats for the dashboard; serves the exported web UI at /
    routes_ollama.py  /api/chat, /api/generate, /api/tags, /api/pull, …
    routes_openai.py  /v1/chat/completions, /v1/models, /v1/embeddings
    generate.py     the single generation path both surfaces share
    stream.py       bridge a blocking generator to an async one, cancellable
    telemetry.py    one SQLite row per request
    metrics.py      Prometheus text, hand-written, no client library
web/                Next.js + Tailwind UI: overview, playground, models, requests
```

Every module opens with a doc comment saying what it is for and, where it matters, what it deliberately does not do. That habit is worth copying: the "does not do" half of a docstring is usually more useful than the "does" half.

## Two dialects, one engine

The same generation runs behind both surfaces. `/api/chat` speaks Ollama's shape — nanoseconds, `done: true`, NDJSON. `/v1/chat/completions` speaks OpenAI's — seconds, a `[DONE]` sentinel, SSE. Serving both honestly from one engine is the exercise, and `server/generate.py` is where the two are reconciled.

```python
from openai import OpenAI
client = OpenAI(base_url="http://127.0.0.1:8000/v1", api_key="not-needed")
print(client.chat.completions.create(
    model="google_gemma-3-1b-it-gguf:q4_k_m",
    messages=[{"role": "user", "content": "hello"}],
).choices[0].message.content)
```

## Why it was built

Three reasons, all of them relevant to reading the book:

1. **Ollama is a black box at exactly the layer worth learning.** Which file gets loaded, how the chat template is applied, where the KV cache lives, why the second request is faster than the first — invisible from outside.
2. **The reshape step has no equivalent.** Convert, prune, truncate, merge, and a recipe of what happened.
3. **The API surface is a real design problem.** Two dialects describing the same operation with different types.

Read the book with those three in mind and the chapters sort themselves into "explains something I can already see in the code" and "describes something I have not built yet". The [chapter map](../companion/chapter-map.md) does that sorting explicitly.
