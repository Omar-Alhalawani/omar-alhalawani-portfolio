# OA // SYSTEMS — Portfolio V2

Omar Alhalawani’s independent staging portfolio: Computer Systems Engineering at Carleton University, ASIC verification methodology at Ciena, RTL design, embedded instrumentation, and engineering automation.

**V1 remains the production portfolio.** This repository does not change V1, its GitHub Pages deployment, domains, redirects, or project repositories. V2 remains `noindex` until Omar explicitly approves a production launch.

## Visual philosophy

**Silicon → signal → system.** An original GLSL surface begins as broad computational material, resolves into a die, then separates into five conceptual engineering layers. Normal scrolling drives the transformation; a bounded mouse response adds depth. Cyan and violet signal accents sit within a dark editorial composition.

The scenes explain interfaces. A floorplan links memory, arithmetic, analog acquisition, optical communication, research capture, and motion control. All essential facts are semantic HTML. The layers are not a fabrication stack, and the employer scene is not a Ciena architecture.

## Setup

Use Node 24 or later:

```sh
npm install
npm run dev
npm run build
npm run preview
```

The site is static. No server, database, AI service, API key, or secret needs configuration. Contact uses the public Formspree action preserved from V1. The original resume PDF is unchanged.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run typecheck` | Astro diagnostics and TypeScript |
| `npm run lint` | ESLint for TypeScript, Astro, and QA scripts |
| `npm test` | FIFO boundary/ordering and FPGA arithmetic tests |
| `npm run qa:static` | Built routes/assets, metadata, staging rules, PDF hash, OG dimensions, bundle sizes |
| `npm run qa:browser` | Responsive matrix, axe, keyboard, scroll, resize, models, mocked contact, fallback, lifecycle, route stress |
| `npm run qa:network` | Initial delivery, scene splitting, graphics-free routes, renderer statistics |
| `npm run qa:lighthouse` | Actual desktop and emulated mobile Lighthouse reports |
| `npm run art` | Regenerate original static SVG scene artwork |
| `npm run og` | Regenerate the 1200×630 social preview using built self-hosted fonts |

Build before QA. Browser scripts use an ephemeral production server by default. Set `QA_BASE_URL=https://actual-staging-url.vercel.app` to test a deployment. `QA_OUTPUT` separates browser, network, targeted, and Lighthouse evidence. `QA_PROXY_SERVER` optionally uses an environment's existing proxy; certificate validation remains enabled. Contact tests intercept Formspree requests and do not send email.

Playwright uses installed Chromium, then the bundled Chromium QA dependency. `CHROME_PATH` can select a local executable. The managed QA environment uses software WebGL; these results are not physical-device GPU measurements.

## Architecture

| Path | Responsibility |
| --- | --- |
| `src/pages/` | Static Astro routes, project paths, 404, sitemap |
| `src/layouts/SiteLayout.astro` | Shell, self-hosted fonts, metadata, Person/project structured data |
| `src/data/` | Audited project, experience, and skill content |
| `src/components/` | Accessible navigation, project/experience rows, diagrams, React demos |
| `src/components/SceneIsland.tsx` | Near-viewport initialization, error boundary, SVG fallback |
| `src/components/three/CanvasShell.tsx` | Lazy scene map, shader preparation, DPR tiers, lifecycle, context loss |
| `src/components/three/shaders/` | Original shader and uniforms |
| `src/components/three/projects/` | Project-specific procedural scenes |
| `src/lib/` | Pure FIFO/FPGA illustration models |
| `src/styles/` | Tokens, responsive primitives, demo styles |
| `public/` | Original art, portrait, social preview, original PDF, staging robots |
| `docs/design/` | Brief, audit, IA, visual system, storyboard, critique, implementation decisions |
| `docs/qa/` | Verified measurements, screenshots, fixes, deployment status |

React is used for islands rather than the entire document. No Redux, global animation framework, scroll hijack, remote HDR maps, large textures, or postprocessing chain. Hover and focus dispatch the same small DOM events into decorative scenes. FIFO and FPGA models expose every value and action in HTML.

## Rendering and responsiveness

| Tier | Selection | DPR cap | Hero segments |
| --- | --- | --- | --- |
| High | Viewport at least 1600px wide | 1.75 | 96×64 |
| Medium | Ordinary laptop/tablet | 1.35 | 64×40 |
| Low | Narrow viewport or coarse pointer | 1 | 40×24 |

These are viewport heuristics, not device fingerprinting. SVG artwork remains visible during initialization. A small worker checks WebGL availability away from the interaction thread, then terminates; shaders prepare asynchronously before drawing. Offscreen/hidden scenes pause; reduced motion uses demand frames and a fixed composition. Observers/listeners clean up, R3F disposes owned resources, and waveform resources explicitly dispose. Context loss removes the canvas and restores artwork.

Wide screens share the viewport between text and material. On tablet/mobile, content stacks before bounded artwork; menus, rows, demos, and diagrams reflow. Scene dimensions are reserved. About, Resume, Contact, and 404 do not load Three.js.

## Accessibility and accuracy

Semantic landmarks/headings, skip link, visible focus, native menu, labeled fields, live status, HTML diagrams, and decorative `aria-hidden` canvases support keyboard and assistive technology. Reduced motion, JavaScript-free content, and WebGL failure retain a usable portfolio.

Case studies distinguish primary source from public summaries. FIFO has a registered read result, pre-edge full/empty decisions, and a power-of-two depth constraint. FPGA uses two registers and eight LEDs; synchronization is not full debouncing. EMG source detail is limited, CubeX is in progress, and no unsupported rates, clinical claims, results, or confidential Ciena information are added. Misleading V1 project illustrations are excluded.

## Vercel staging

Import **`Omar-Alhalawani/omar-portfolio-v2`** as a separate project. Use Astro defaults, root `./`, `npm install`, `npm run build`, and `dist`. No manually configured environment variables or paid add-ons are needed. Vercel's system variable `VERCEL_PROJECT_PRODUCTION_URL` sets the metadata/sitemap origin to the public project domain. The fallback is `https://omar-portfolio-v2.vercel.app`, never V1's production identity. Do not use the potentially protected immutable deployment hostname for canonical or social-image links.

Staging has HTML `noindex, nofollow, noarchive`, `robots.txt` disallowing crawling, and Vercel `X-Robots-Tag`. Do not remove these or configure domains/DNS until Omar explicitly chooses to launch. The resulting lower SEO audit score is intentional.

Verify the actual deployment URL with browser/network suites and live Lighthouse. A Ready label alone is insufficient. Omar must complete authentication/MFA/GitHub authorization; no credentials belong here.

For an approved production launch: choose the host, configure its canonical origin, remove staging indexing restrictions, regenerate sitemap/OG metadata, verify live routes and analytics decisions, then separately plan redirects and the V1 transition. Those production changes are outside this staging task.
