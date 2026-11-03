// Initialise Mermaid diagrams, re-running after each instant navigation.
function render() {
  if (typeof mermaid === "undefined") return;
  const dark = document.body.getAttribute("data-md-color-scheme") === "night";
  mermaid.initialize({
    startOnLoad: false,
    theme: dark ? "dark" : "neutral",
    fontFamily: "Manrope, system-ui, sans-serif",
    flowchart: { curve: "basis" },
  });
  mermaid.run({ querySelector: ".mermaid" });
}

if (typeof document$ !== "undefined") {
  document$.subscribe(render);
} else {
  document.addEventListener("DOMContentLoaded", render);
}
