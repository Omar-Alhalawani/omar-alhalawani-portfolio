# Homepage refinement

- Removed the redundant engineering overview and large Technical Focus wall. Skills remain on About and Resume.
- Simplified homepage rhythm to Hero, Experience, Selected Projects, About, Contact; shortened labels and background copy.
- Added a faint shared routing/grid SVG with a slow CSS opacity pulse. No additional WebGL; motion pauses in hidden tabs and stops for reduced motion.
- Anchored the hero to its own section. Mouse response is local and damped, returning to idle on leave; scroll no longer controls layers or camera.
- Added one-time 20px / 600ms opacity reveals to lower sections and content blocks. Above-fold content remains visible. Reduced motion and JavaScript-free fallback remain readable.
- Preserved project geometry, selection, navigation/prefetch/handoff, case studies, adaptive rendering, and the draggable Contact globe.
- Build, typecheck (one existing Astro hint), changed-file lint, and all 11 existing tests pass. Focused Chromium check passed hero/pointer/scroll, reveal, project selection and one FIFO transition, Contact drag, 390px mobile overflow, and reduced motion. See checks.json and captures.
- Compromise: software-rendered Chromium validates behavior and layout, not hardware GPU frame rates. No exhaustive QA or Lighthouse was run.
