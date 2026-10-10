# Portfolio V2 implementation and QA report

Repository: [Omar-Alhalawani/omar-portfolio-v2](https://github.com/Omar-Alhalawani/omar-portfolio-v2).

**The full portfolio is built, pushed, and tested locally. Vercel deployment is blocked at the user sign-in/authorization step.** There is no verified deployment URL, live Lighthouse score, or claim of stable Vercel staging. The prepared import page contains the V2 repository URL. See [deployment checkpoint](DEPLOYMENT_STATUS.md).

## Design process

Audited all required V1 pages, metadata, links, imagery, and the original resume, plus five public project repositories. The content audit corrected overstated FIFO coverage, the FPGA display/FSM/debounce description, limited EMG source evidence, and CubeX completion status. Misleading project thumbnails were excluded. Ciena content is a public-safe description of responsibilities and methods.

Wrote all twelve required design documents before full implementation. The visual direction is **silicon → signal → system**: dark editorial typography, a broad custom material, routed layers, and a conceptual project map. Prototype critique covered recruiter, ASIC engineer, creative director, frontend engineer, mobile, and accessibility perspectives. It led to darker material, thinner layers, a corrected plate radius, aspect-aware framing, and readiness based on actual rendering.

## Architecture, hero, and scenes

Astro generates twelve content routes plus a dedicated 404. Typed data files hold projects, experience, and skills. React islands handle graphics and two bounded interactive models; all essential content is server-rendered HTML. The shared CanvasShell lazily imports the scene requested by its island. About, Resume, Contact, and 404 exclude Three.js.

The original GLSL shader reshapes a sphere topology into broad, flattened computational material, then a die. Low-frequency deformation, controlled cyan/violet reflections, and gradual routing replace generic sphere/cloud effects. Normal scroll drives the morph and separation; mouse response is damped and bounded. Reduced motion uses a fixed composition. The five layers explain engineering disciplines rather than fabrication.

The verification scene illustrates specification, RTL, testbench, and verification without reproducing employer architecture. The floorplan has six distinct regions and responds to project hover and keyboard focus. Individual scenes show FIFO memory/pointers, the FPGA registers/ALU/LED bank, synthetic EMG traces, a transmitter/receiver optical link, printer motion, and a research DAQ chain. These are conceptual illustrations, not measurements or unsupported implementation evidence.

FIFO and FPGA models were tested against independent behavioral expectations. The original resume remains byte-identical. Contact preserves V1's Formspree endpoint and adds native validation, pending/success/error status, and retained input after failure. No real test message was sent.

## Verification completed

| Check | Actual result |
| --- | --- |
| Install, typecheck, lint, tests, build | Pass; zero typecheck errors/warnings/hints; eight behavioral tests |
| Static output | 13 HTML pages, 12 sitemap entries, 348 internal asset/link references verified |
| Responsive browser matrix | 84 route/viewport combinations passed, no horizontal overflow or broken images |
| Required sizes | 1280×720, 1366×768, 1440×900, 1920×1080, 2560×1440; 320×568, 375×812, 390×844, 430×932, 768×1024 |
| Additional sizes | 3440×1440 ultrawide and 844×390 landscape |
| Automated accessibility | All twelve content routes passed axe WCAG 2 A/AA and 2.1 A/AA checks |
| Interaction | Skip link, visible focus, skill/project keyboard selection, mobile menu, FIFO and FPGA controls, contact validation and mocked delivery |
| Scroll / resize | Downward, fast, reverse, bottom/top, and live resize passed; normal browser scrolling retained |
| Rendering lifecycle | Offscreen pause/resume, emulated document visibility, reduced-motion demand rendering, context-loss fallback, two route stress cycles |
| Missing WebGL / JavaScript | SVG fallback and complete HTML retained; six routes checked with JavaScript disabled |
| DPR caps | Emulated device scale 3 verified caps of 1.75 / 1.35 / 1 across high / medium / low tiers |
| Console / network | No unexpected application errors, asset failures, duplicated JS requests, or unrelated initial project-scene downloads |
| Resume | Embed URL and direct response pass; 89,116 bytes; original SHA-256 preserved |
| Social preview | Dedicated original 1200×630 PNG |
| Public source links | FIFO, FPGA, EMG, LumaLink, CubeX repository endpoints verified |
| V1 safety | Local reference clean; remote main still `743a055d707521ecbd031f85cec06022260d2cca` |

The browser tests ran against production-built files in isolated Chromium 153. The managed preview endpoint was inaccessible, so an ephemeral QA server served the actual `dist` output. Software WebGL was used. Visibility testing emulated the document visibility API; it is not a physical tab-switch or device-power benchmark. The deliberate invalid route's 404 and the mocked Formspree failure's 500 are expected test responses.

## Actual performance

Latest local production Lighthouse run, 2026-10-10 at 19:21–19:22 UTC:

| Profile | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Desktop | 100 | 100 | 100 | 66 | 0.570s | 0ms | 0.000101 |
| Emulated mobile | 94 | 100 | 100 | 66 | 2.256s | 220ms | 0.000090 |

These are local lab results, not deployed-site scores or field Core Web Vitals. INP and physical-device FPS were not measured. SEO is deliberately reduced by HTML noindex, the X-Robots-Tag, and robots disallow. Those restrictions were retained.

The largest deferred graphics chunk is 240,997 bytes gzip; React's client chunk is 64,613 bytes gzip. Initial homepage resource delivery including graphics was approximately 433KB. The initial homepage did not fetch project scenes. About, Resume, and Contact fetched no graphics code. The build still warns about the minified Three.js chunk exceeding 500KB; compressed size and actual lazy delivery are recorded rather than hiding that warning.

Measured renderer samples: hero 17 draw calls / 8,144 triangles at medium quality; verification 14 / 3,844; project floorplan 38 / 17,404. Renderer memory reported one texture in those samples. Geometry detail and DPR respond to ordinary viewport/coarse-pointer heuristics. No large texture downloads, HDR map, postprocessing, or duplicated animation framework are used.

## Meaningful fixes

- Corrected thin-layer corner radius and tablet clipping during prototype critique.
- Waited for real draw calls before replacing static artwork; fixed demand-render initialization.
- Corrected unsupported FIFO/FPGA claims and excluded the misleading seven-segment/FSM image.
- Added appropriate static SVGs for each scene and safe context-loss disposal.
- Fixed default browser button backgrounds and accessible brand labels.
- CPU profiling identified about 985ms in the synchronous WebGL availability probe. A short-lived worker now performs that check off the interaction thread. Desktop performance improved from 72 to 100; emulated mobile improved from 75 to 94 after worker preparation and font delivery improvements.
- Preloaded the main self-hosted text/heading fonts, reducing observed layout shift to approximately 0.0001.

## Git and remaining work

Logical commits cover initialization, twelve design documents, Astro scaffold, hero/layers prototype, complete routes/models, graphics-startup optimization, and QA evidence/deployment preparation. Each pushed source tree was compared with its local Git tree. Only V2 was written.

The unresolved task is Vercel sign-in/authorization, import/deployment, and live acceptance testing. The project cannot yet be called stable staging. Platform cache behavior, real hardware FPS, real tab switching, and field INP must be assessed on live/physical environments when available. No known critical local application defect remains in the completed checks.

If Omar later chooses to replace V1, first select the production host and canonical origin, remove staging indexing restrictions, regenerate and verify metadata/sitemap, finish live acceptance testing, then separately authorize any domains, DNS, redirects, and V1 transition. This task made none of those production changes.

## Evidence

Raw matrix/a11y results, network measurements, Lighthouse summaries, static results, targeted graphics checks, and selected screenshots are stored alongside this report. Full local Lighthouse HTML/JSON and the CPU profile remain reproducible through the documented QA scripts.
