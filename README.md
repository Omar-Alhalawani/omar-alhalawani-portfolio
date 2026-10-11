# OA // SYSTEMS — Omar Alhalawani Portfolio

Current repository: [Omar-Alhalawani/omar-alhalawani-portfolio](https://github.com/Omar-Alhalawani/omar-alhalawani-portfolio)

Current staging site: https://omar-alhalawani-portfolio.vercel.app/

An Astro portfolio covering ASIC verification, RTL, FPGA, embedded systems, research instrumentation, electronics repair, and engineering automation. The original GitHub Pages portfolio is unchanged. This replacement remains protected by HTML noindex, robots.txt restrictions, and Vercel X-Robots-Tag until an explicitly approved production migration.

## Design and interaction

Amber + Steel: near-black surfaces, graphite/anodized-metal hardware, neutral reflection and rim light, and selective amber signal paths. The intact computing assembly has five physical plates and a translucent cover. Normal scroll separates conceptual engineering layers. Bounded autonomous drift, pointer damping, and pulses follow routed hardware paths; no OrbitControls or scroll hijack.

The enlarged Projects platform has six distinct modules: memory, registers/ALU, optical TX/RX, DAQ, signal instrumentation, and a mechanical printer. Real WebGL hit targets select the same state as HTML hover/focus. Desktop clicks use a 320 ms camera transition; touch selects first and opens through the CTA or a second intentional tap. Dragged gestures do not navigate. Essential links and descriptions remain semantic HTML.

Metal reflections come from a procedural room environment, with no remote HDR maps. Populated substrates use local circuit/metal textures and instanced component banks. Medium/high tiers add soft shadows, restrained HDR bloom, and FXAA; low tiers keep routed cores and pulse sprites without those passes. DPR caps remain 1 / 1.35 / 1.75. Hidden/offscreen scenes pause. Reduced motion settles directly into a static composition and uses demand rendering. Scene-specific WebP renders provide the same hardware world during loading, failure, and no-JavaScript use.

The corrective pass adds a compact four-panel overview, a full-width project ecosystem with integrated previews, and richer case-study panels. FIFO includes actual Icarus output from its unchanged public directed testbench: VCD, plots, simulation log, and source hashes. The plots retain the source timing units and do not imply a physical clock frequency or exhaustive coverage.

## Content and resume

The supplied Master Resume informs broader content but is never committed or publicly hosted. Public project source takes precedence for implementation details. CubeX, JPacman, and Robot Dog remain clearly in progress. FIFO simultaneous-transfer capability is distinguished from the public testbench's narrower evidence. Mini-Lysimeter rates are omitted without public corroboration; EMG signals are explicitly synthetic.

The only public resume is the unchanged supplied ASIC PDF at `/resume/Omar_Alhalawani_ASIC_Resume.pdf` (SHA-256 `d08af79e099aee625ded17228042a7df109f1c6a919c3f9dc35acd5722d5a7f6`). Hero, preview, open, and download actions use that file. Contact retains the original Formspree integration; QA intercepts it and sends no email.

## Setup

Use Node 24 or later. No API key, database, or secret configuration is required.

```sh
npm install
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

## Validation

| Command | Purpose |
| --- | --- |
| `npm run qa:static` | Routes, references, metadata, staging protection, ASIC PDF hash, icons, OG |
| `npm run qa:browser` | 84 layouts, 12 axe audits, keyboard, scroll/resize, demos, mocked contact, lifecycle, fallback, stress |
| `node scripts/upgrade-qa.mjs` | Six actual WebGL project selections/routes, shared HTML state, touch gestures, hero motion/neutral reset |
| `npm run qa:network` | Scene splitting, graphics-free routes, delivery, renderer statistics |
| `node scripts/targeted-qa.mjs` | All home scenes, DPR caps, no-JavaScript content |
| `npm run qa:interaction` | Pointer stability and delayed demo controls |
| `npm run qa:lighthouse` | Desktop and emulated mobile Lighthouse |
| `QA_BASE_URL=https://omar-alhalawani-portfolio.vercel.app python3 scripts/delivery-qa.py` | Live headers/metadata/PDF/asset byte identity |
| `npm run art` / `npm run og` | Regenerate original fallback vectors / social preview |

Build before QA. Scripts use an ephemeral production server unless `QA_BASE_URL` is set. `QA_OUTPUT` selects the evidence folder. `QA_BEHAVIOR_ONLY=1` repeats browser behavior without re-running the layout/a11y matrix. `QA_PROXY_SERVER` optionally uses an environment's existing proxy, with certificate validation enabled. Chromium/software WebGL and Lighthouse emulation are laboratory measurements, not physical-device GPU or field INP measurements.

## Architecture

| Path | Responsibility |
| --- | --- |
| `src/pages`, `src/layouts` | Astro routes, semantic shell, fonts and metadata |
| `src/data` | Source-audited experience, projects, skills |
| `src/lib/project-selection.ts` | Small HTML/WebGL selection event contract |
| `src/lib/fifo.ts`, `fpga.ts` | Pure interactive illustration models |
| `src/components/SceneIsland.tsx` | Progressive loading, error boundary, fallback |
| `src/components/three/CanvasShell.tsx` | Lazy scenes, environment, shader preparation, DPR, lifecycle |
| `src/components/three/Hardware.tsx` | Beveled plates, chips, bolts, local/disposed label textures |
| `src/components/three/projects` | Project-specific visuals |
| `public` | Portrait, original vectors, icons, OG, ASIC resume, robots |
| `docs/upgrade` | Current audit and verified final report/evidence |
| `docs/design`, `docs/qa` | Historical design and testing checkpoints; version references are archival |

## Existing Vercel integration

Use the existing `omar-alhalawani-portfolio` project and main-branch Git integration. Astro defaults: root `./`, `npm install`, `npm run build`, output `dist`. Do not import another project. `VERCEL_PROJECT_PRODUCTION_URL` chooses the public metadata/sitemap origin; the fallback is the current staging host. Do not canonicalize assets to a protected immutable deployment URL.

No DNS, redirects, domains, paid services, or production-indexing changes are part of this upgrade. Authentication/MFA/consent must be completed by Omar when required. See `docs/upgrade/FINAL_REPORT.md` for the actual deployed measurements and limitations.
