> Historical checkpoint before the October 10 Amber + Steel upgrade. Current repository, deployment, and final measurements are documented in `docs/upgrade/FINAL_REPORT.md`. Version names and old hosts below are archival.

# Accessibility plan

WCAG AA target: semantic landmarks; one H1/page; ordered H2/H3 hierarchy; skip link to focusable main; real anchors; visible focus; no content hidden by animation; 44px control targets. Native details/summary gives mobile navigation keyboard behavior without a hydration dependency.

Every form field has a label and appropriate autocomplete, type, and required state. Submission status uses a live region. Preserve native validation and progressive POST fallback. Verify failure/retry/success through intercepted test requests, never actual inbox submissions.

Canvases and artwork are decorative and aria-hidden. Architecture, skills, project facts, diagrams' explanatory text, FIFO/FPGA states, and actions remain HTML. Every hover activation also responds to keyboard focus. Source opens without canvas interaction.

`prefers-reduced-motion` is detected at runtime and responds to preference changes. Disable camera travel, pointer parallax, and automatic shader/pulse movement; render a meaningful still. Without JS or WebGL, a dedicated SVG fallback remains visible and all static content works.

Run accessibility automation if browser infrastructure permits, plus manual keyboard traversal and narrow-screen inspection. Report tested behavior precisely; do not claim formal WCAG certification.
