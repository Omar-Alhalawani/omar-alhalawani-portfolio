# Hardware and runtime refinement

Continued from `5ed9094`. Its FIFO mounting fix, preserved 0.22 hover rise, project transitions, intent prefetch, source links, and case-study navigation remain in place. This pass completes the model, runtime and actual-render fallback gaps.

The hero has a larger die, retention hardware, plated vias, grouped power delivery, detailed port housings, and separate primary/secondary/occasional signal activity. The shared project models add FIFO control and full/empty hardware, five FPGA buttons and synchronizers, an EMG serial/Python path, screen-to-camera Morse timing and decode response, DAQ channel/log indicators, and printer carriage/rail/bed/controller detail. Verification has distinct document, logic, stimulus/monitor and checker forms with a 24-second sequence.

Startup now uses the actual renderer as the capability check and reveals the scene after its first completed frame. Identical labels, pulse geometry, fasteners and capacitors share resources; inactive waveforms stop updating. Very slow frames now reach the existing adaptive-quality monitor. Actual context loss was exercised: one bounded retry restored a ready scene with a new canvas.

## Measurements

One isolated cold load per version at 1440 × 900, local gzip production server, headless Chromium using the **SwiftShader software GPU**. Work’s browser used the static fallback and did not expose a usable hardware scene. These figures do not establish desktop GPU FPS. Adaptive stages and animation affect complexity samples; heap is approximate JavaScript memory.

| Measurement | Committed baseline | Refined |
| --- | ---: | ---: |
| First actual WebGL frame | 2011 ms | 1918 ms |
| Hero ready | 2856 ms | 1919 ms |
| Draw calls | 277 | 274 |
| Triangles | 38,193 | 42,137 |
| Textures | 40 | 34 |
| Geometries | 120 | 84 |
| DPR | 1 | 1 |
| Active animated renderers | 1 | 1 |
| Approximate JavaScript heap | 20.5 MB | 23.1 MB |
| PMREM generation | 45 ms | 43 ms |
| Shader preparation | 33 ms | 32 ms |
| Shader programs | 10 | 10 |

PMREM and shader preparation were small measured costs, so the environment was retained. Extra geometry increased triangle count and heap; shared labels and microgeometry reduced textures and geometry objects. The first frame still takes about 1.9 seconds in this software environment; the eager fallback supplies the initial composition.

Build, typecheck, changed-file lint and all eight existing unit tests pass. Focused captures confirm FIFO idle/hover, accepted writes, a 390 × 844 mobile view, reduced-motion demand rendering and context recovery. No Lighthouse or exhaustive matrix. All nine verified public source links were already present and were preserved; private/unverified sources remain omitted.

## Updated actual scene captures

| View | Screenshot |
| --- | --- |
| Homepage | [View](visual-review/hero.jpg) |
| Project world: idle | [View](visual-review/projects.jpg) |
| Project world: FIFO hover | [View](visual-review/projects-fifo-hover.jpg) |
| Verification | [View](visual-review/verification.jpg) |
| FIFO: three writes | [View](visual-review/fifo.jpg) |
| FPGA arithmetic | [View](visual-review/fpga.jpg) |
| EMG | [View](visual-review/emg.jpg) |
| LumaLink | [View](visual-review/lumalink.jpg) |
| CubeX | [View](visual-review/cubex.jpg) |

The nine scene fallbacks and three overview thumbnails were exported from the real WebGL scenes. Mobile and reduced-motion captures are also available in `visual-review`. The models are materially refined; reference-level cinematic realism and hardware GPU smoothness remain unverified.
