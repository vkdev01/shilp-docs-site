# LLM serving · companion notes

A chapter-by-chapter companion to **[orca3/llm-model-inference](https://github.com/orca3/llm-model-inference)** — the companion code for *Hands-On LLM Serving and Optimization* by Chi Wang and Peiheng Hu (O'Reilly).

Every page is grounded in the repository itself: the notebooks, the two FastAPI services in `ch03/`, the framework labs in `ch06/`–`ch08/`, and the benchmark results the notebooks record. Nothing here describes a different codebase.

Built as a static site with MkDocs Material. Light, numbered, one content column, three switchable colour schemes — the same shape as the `engineering-notes` library, with its own palette.

## What is in it

| Section | Pages |
| --- | --- |
| Start here | Repository tour · Benchmarks (the measured results, transcribed from the notebooks) |
| Chapter notes | One page per chapter (01–10): what is in the repo, how to run it, what to look for, a checkpoint |
| Code walkthroughs | Single-model service · Multi-model service · Benchmark method |
| Plan | Four-week reading plan · Twelve exercises |
| Reference | Glossary · Sources |

## Run it locally

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
mkdocs serve            # http://127.0.0.1:8000
mkdocs build --strict   # fail on broken internal links
```

## Publish

`.github/workflows/pages.yml` builds with `mkdocs build --strict` and deploys to GitHub Pages on every push to `main`. Pages is already configured for the repository (Settings → Pages → Source: GitHub Actions).

The site is served from `https://vkdev01.github.io/shilp-docs-site/`, which is what `site_url` in `mkdocs.yml` declares. Rename the repository and that one line is the only thing that needs changing.

## Structure

```
mkdocs.yml                    site config, nav, theme palettes, extensions
requirements.txt              mkdocs-material, pinned
docs/
  index.md                    hero, module cards, the repository in one paragraph
  start/                      repository tour; benchmark results
  chapters/                   ten chapter notes
  walkthroughs/               ch03 single-model, ch03 multi-model, ch09 method
  plan/                       reading plan; exercises
  reference/                  glossary; sources
  stylesheets/shilp.css       the theme: three schemes, numbered headings
  javascripts/mermaid.mjs     Mermaid init, re-runs on instant navigation
```

## Theme notes

Three custom schemes, defined as CSS variables in `docs/stylesheets/shilp.css` and registered in `mkdocs.yml`:

- **kiln** — warm light, terracotta accent, sand paper
- **quarry** — cool light, petrol-teal accent, blue-grey paper
- **night** — dark, amber accent

Type is Manrope for prose and JetBrains Mono for code. Headings are heavy and tightly tracked; `h2` carries a short accent rule; the sidebar is wide with uppercase section labels; content is capped at a 46rem measure.

To add a scheme, copy a block in the CSS, change the variables, and add a `palette` entry in `mkdocs.yml` with `scheme: <name>`.

## Licence

MIT. The repository these notes describe is MIT-licensed; the book is © its authors.
