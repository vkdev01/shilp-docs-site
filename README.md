# shilp · companion notes

A reading companion for **Hands-On LLM Serving and Optimization** (Chi Wang and Peiheng Hu, O'Reilly), mapped chapter by chapter onto [shilp](https://github.com/vkdev01/shilp) — a from-scratch model-serving stack that pulls from the Hugging Face Hub, reshapes a model, and serves it over the Ollama and OpenAI APIs.

Built as a static site with MkDocs Material. Light, numbered, one content column, three switchable colour schemes — the same shape as the `engineering-notes` library, with its own palette.

## What is in it

| Section | Pages |
| --- | --- |
| Start here | What shilp is · Numbers that matter |
| The book | Book overview · Chapter map |
| Chapter notes | One page per chapter (01–10): what it covers, where it lands in shilp, what to read it for, a checkpoint |
| Gaps and roadmap | What shilp does not do · Roadmap |
| Plan | Four-week reading plan · Ten exercises |
| Reference | Glossary · Sources |

## Run it locally

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
mkdocs serve            # http://127.0.0.1:8000
mkdocs build --strict   # fail on broken internal links
```

## Publish

`.github/workflows/pages.yml` builds with `mkdocs build --strict` and deploys to GitHub Pages on every push to `main`. Enable it once under **Settings → Pages → Source: GitHub Actions**.

The site expects to be served from `https://vkdev01.github.io/shilp-docs-site/`, which is what `site_url` in `mkdocs.yml` declares. Change that one line if the repo is renamed.

## Structure

```
mkdocs.yml                    site config, nav, theme palettes, extensions
requirements.txt              mkdocs-material, pinned
docs/
  index.md                    hero, module cards, how to use these notes
  start/                      what shilp is; the numbers that matter
  companion/                  the book, the chapter map, and ten chapter notes
  gaps/                       what shilp does not do; roadmap
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

Type is Manrope for prose and JetBrains Mono for code. Headings are heavy and tightly tracked; `h2` carries a short accent rule; the sidebar is wide with uppercase section labels. Content is capped at a 46rem measure so the prose stays readable at any window size.

To add a scheme, copy a block in the CSS, change the variables, and add a `palette` entry in `mkdocs.yml` with `scheme: <name>`.

## Licence

MIT.
