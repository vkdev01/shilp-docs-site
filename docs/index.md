<div class="sh-hero" markdown>
<span class="sh-kicker">companion notes · shilp</span>

# Reading the inference stack
{: .sh-title }

A chapter-by-chapter reading companion to *Hands-On LLM Serving and Optimization*, mapped onto [shilp](https://github.com/vkdev01/shilp) — a from-scratch model-serving stack that pulls from the Hugging Face Hub, reshapes a model, and serves it over the Ollama and OpenAI APIs with its own code doing the serving.
{: .sh-lede }
</div>

The book explains how LLM serving works at scale: KV caches, prefill and decode, batching and scheduling, quantisation, parallelism, framework internals. shilp implements a deliberately small, readable slice of exactly that surface, and its README is unusually explicit about where the slice stops. Put the two together and each chapter has somewhere to land — a file to open, a measurement to reproduce, a gap to close.

These notes do three things. They summarise what each chapter covers. They say which shilp module the chapter explains, improves, or contradicts. And they mark, honestly, whether that chapter is something shilp already does, something it deliberately does not do, or something on its roadmap.

<div class="sh-cards">
  <a class="sh-card" href="start/what-shilp-is/">
    <span class="n">01</span>
    <span class="t">What shilp is</span>
    <span class="d">The four steps, the three engines, the two API surfaces, and what the code map looks like.</span>
  </a>
  <a class="sh-card" href="start/numbers-that-matter/">
    <span class="n">02</span>
    <span class="t">Numbers that matter</span>
    <span class="d">Prefill is compute-bound, decode is bandwidth-bound — with the measurements and the capacity formulas.</span>
  </a>
  <a class="sh-card" href="companion/chapter-map/">
    <span class="n">03</span>
    <span class="t">Chapter map</span>
    <span class="d">One table: book chapter, shilp module, what it closes, and how much of it shilp already has.</span>
  </a>
  <a class="sh-card" href="plan/reading-plan/">
    <span class="n">04</span>
    <span class="t">Reading plan</span>
    <span class="d">A four-week order for reading the book against the repo, with what to run each week.</span>
  </a>
  <a class="sh-card" href="gaps/serving-gaps/">
    <span class="n">05</span>
    <span class="t">What shilp does not do</span>
    <span class="d">No auth, no admission control, no continuous batching, no multi-tenancy — and why each one is missing.</span>
  </a>
  <a class="sh-card" href="reference/sources/">
    <span class="n">06</span>
    <span class="t">Sources</span>
    <span class="d">The book, its companion repository, the shilp repo, and the post that started this reading.</span>
  </a>
</div>

## How to use these notes

Read a chapter, then open the shilp file named in its *Where this lands* block. The chapter gives you the general mechanism; the file gives you one concrete implementation of it, small enough to read in a sitting. When the two disagree, that is the interesting part — usually it means the book is describing a clustered, batched, multi-tenant system and shilp is describing one box serving one model.

!!! note "Scope"
    These notes cover *Hands-On LLM Serving and Optimization* by Chi Wang and Peiheng Hu (O'Reilly), and the shilp repository at the commit these notes were written against. They are study notes, not a substitute for either. Where the book's text was not available, the notes stick to its published chapter outline and its companion code rather than guessing at content.

## The one-paragraph version

If you only read one page, read [Numbers that matter](start/numbers-that-matter.md). The single idea that reorganises everything else is that prefill and decode are bound by different resources — compute and memory bandwidth — so a GPU buys you a 6× improvement in time-to-first-token and a 1.2× improvement in decode speed on the same model. Every optimisation in the book, and every gap in shilp, follows from that asymmetry.
