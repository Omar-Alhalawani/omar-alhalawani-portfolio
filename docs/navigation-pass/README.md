# Client navigation pass

`ClientRouter fallback="swap"` is installed in SiteLayout.astro. Internal project openings use Astro `navigate()` with normal browser history. Astro owns the View Transition; the former nested transition and full-document hot path are removed.

After 180 ms of hover, focus or touch intent, preparation selectively loads route HTML, CSS/module assets, the hero fallback and that project's scene code. The router's preparation hook uses the cached document. No offscreen renderer is created.

The existing 520/360 ms camera push remains. Its final frame is copied to a CSS-sized canvas (maximum width 1000), kept in memory outside the swapped body, and positioned over the destination hero. No image encoding or session-storage image copy occurs on normal navigation. The handoff fades in 140 ms after the first valid scene frame and its ready DOM state. Entry position, target, aspect-correct perspective and adaptive graphics stage carry across; direct visits keep their normal composition. Hard-navigation recovery alone serializes an image. Preparation failure has an 8 s recovery bound; a stalled graphics driver has a 20 s final fallback bound.

Page scripts reinitialize with `astro:page-load` and abort old listeners before swaps. The case TOC disconnects its observer. React demos remount normally. The platform's HTML labels have an independent portal container, preventing double-removal during deferred React disposal. Expected native View Transition cancellation during touch viewport changes is handled without affecting the route swap or retained canvas.

## Measured local production build

| Project | Camera end → DOM swap | Swap → first WebGL frame | Canvas copy |
| --- | --- | --- | --- |
| fifo | 18.8 ms | 11.79 s | 0.5 ms |
| fpga-arithmetic | 19.8 ms | 12.19 s | 0.4 ms |
| lumalink | 16.0 ms | 13.16 s | 0.2 ms |
| cubex | 8.5 ms | 12.43 s | 0.3 ms |

Final FIFO confirmation after entry-framing and ready-state changes: **24.5 ms** to swap, **12.62 s** to first WebGL frame, **1.0 ms** to copy the frame. Timing confirmation runs without browser screenshots. Development/profile-only performance marks and measures cover click, camera, prefetch, preparation, swap, HTML, scene mount, first frame and removal.

These are ANGLE SwiftShader timings. The remaining slow software-renderer startup is covered by the retained picture; hardware GPU timing is unavailable in this workspace. No blank/reload flash was observed in the focused checks. The long renderer delay is not a delayed HTML swap.

The requested navigation matrix and four-route Back stress loop pass across the focused runs (world-stress.json, finish.json, timings.json). The loop returns with one canvas, seven active global project-event listeners and a flat coarse 35.1 MB JS heap sample. It retains selection, restores scroll, and clears overlays/locks. FIFO/FPGA demos, the TOC, Home controls, pagination, reduced motion, unavailable WebGL and one touch route pass. Contact uses exactly one mocked submission; no email was sent.

Build, typecheck and changed-file lint pass. All nine unit tests pass, including an independent 3D projection check across six model scales and three aspect ratios. No Lighthouse or broad viewport QA ran. Models, content and art direction were not changed.
