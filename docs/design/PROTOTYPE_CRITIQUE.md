> Historical checkpoint before the October 10 Amber + Steel upgrade. Current repository, deployment, and final measurements are documented in `docs/upgrade/FINAL_REPORT.md`. Version names and old hosts below are archival.

# Prototype critique

Reviewed the production-built hero and first transition in Chromium, and inspected V1's live hero for comparison. Tested 1440×900, 320×568, 390×844, and 768×1024. This is the prototype gate; it is not the final whole-site or live Vercel acceptance record.

| Perspective | Finding | Decision / correction |
| --- | --- | --- |
| Recruiter | Omar, engineering focus, Carleton, Ciena, and the 3 next actions are HTML in the first screen. The layout is quieter and the identity larger than V1. | Keep editorial two-line identity. Increase the Ciena proof line's size slightly in the full build. |
| ASIC engineer | Wafer silhouette, gradually resolved routing, and separated conceptual layers communicate the intended hardware metaphor. | Retain the shared topology. No fictional telemetry, frequency readout, company architecture, or performance badge. |
| Creative director | Initial surface was too bright and thick; its soft reflection read as cloudy material. | Flattened the starting wafer, tightened reflection bands, and deepened dark regions. Corrected plate corner radius to fit thin geometry. |
| Frontend engineer | Static HTML is immediate; Three is a dynamically loaded enhancement. Core graphics chunk measured ~239KB gzip in this prototype, below the scene-code target. | Keep React islands and full-document routing. Wait for an actual rendered draw call before fading the fallback. |
| Tablet/mobile | First tablet composition clipped the object because the canvas was narrow and tall. 320px/390px had no horizontal overflow. | Scale the scene to the actual camera viewport and use the stacked composition through 900px. Re-tested 768×1024 successfully. |
| Accessibility | Keyboard skill focus changes the same scene state as hover. Reduced motion initializes a fixed meaningful visual. Blocking WebGL exposes the SVG. | Added pressed state to skill controls; keep all explanatory content and actions outside the canvas. |

## Actual verification
- Typecheck, production build, and ESLint pass at the prototype checkpoint.
- Browser JS errors and error-level console messages: none in the 4 viewport checks.
- Horizontal overflow: none in those viewport checks.
- Shader compiled and the canvas reached a rendered ready state in each check.
- Explicit reduced-motion and unavailable-WebGL checks passed.
- Re-tested after changing loading readiness, aspect-aware framing, tablet layout, and material art direction.

## Gate decision
Proceed with the full portfolio. The hero is sufficiently custom and calm to anchor the remaining work. The floorplan and case studies must strengthen its engineering meaning. Final QA still needs all routes, 10 requested viewport sizes, contact/resume, lifecycle stress, accessibility automation, network inspection, and actual deployed-site verification.

## Environment notes
The managed preview reported a running server, but was inaccessible to both the cloud browser and the local browser. Local verification therefore serves the **actual production dist files** inside the QA process and uses an isolated Chromium instance. The standard Playwright browser download returned an invalid archive; an official npm-packaged Chromium binary provided the working test browser. These are QA-environment issues, not changes to the intended Astro/Vercel architecture.
