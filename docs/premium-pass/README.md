# Premium + alive refinement

1. **Noise:** preserved the completed global traveling-dot removal; no new particles, HUDs, scenes, or decorative interactions.
2. **Motion:** shared 160ms micro, 360ms standard, and 600ms section tokens with a consistent ease-out family. Damped 3D response constants; existing 520ms desktop / 360ms touch camera handoff preserved.
3. **Background:** faint fixed routing and section-dependent gradient/opacity emphasis. About is quietest. No traveling object or new rendering loop.
4. **Typography/layout:** automatic title-length sizing, balanced headings, constrained case-study reading widths, sans-serif company/body treatment, and fewer repeated captions. Technical notes now use open sections with subtle rules instead of stacked boxes.
5. **3D:** restrained hero light intensity, damped pointer engagement, quiet idle signal envelopes; verification waveforms run only during the testbench stage and PASS/edge lighting is softer. No geometry added.
6. **Platform:** brief selection route activity settles; existing six project sequences, lifts, footprints, and transition architecture retained. Labels use shared typography and lower-contrast edges; surrounding annotations dim gently.
7. **Contact:** centered form retained with softer gradient/borders and clear amber focus outlines. Globe geography, routes, drag/inertia, idle rotation, and one-session hint unchanged.
8. **Mobile/reduced motion:** mobile background breathing disabled, unselected floating annotations hidden, HTML project navigation retained. Reduced-motion static hero and immediately readable content verified.
9. **Performance:** one active renderer in each representative sample; zero idle waveform redraws. Background is SVG/CSS with no added canvas or continuous JS RAF.
10. **Validation:** production build, typecheck (0 errors/0 warnings; one existing Astro hint), relevant lint, and all 14 existing tests passed. Focused camera transition/document retention, keyboard probe/project selection, Contact drag/form focus, mobile overflow, and reduced-motion checks passed; no page errors.
11. **Captures:** all 17 requested views plus three side-by-side comparison sheets. Portrait decode and tall mobile capture handling corrected during visual review.
12. **Limits:** software SwiftShader measurements are not hardware FPS benchmarks. Adaptive quality changes across samples. Procedural hero/CubeX models remain candidates for future carefully budgeted authored GLBs if finer close-up realism is needed; this pass adds no invisible geometry or heavy assets. Existing FIFO recording is DEPTH=4, while the conceptual 3D model illustrates eight cells.

## Representative samples

| View | Active renderers | DPR | Draw calls |
|---|---:|---:|---:|
| Home | 1 | 1 | 269 |
| Projects idle | 1 | 1 | 491 |
| Projects selected | 1 | 1 | 418 |
| Contact | 1 | 1 | 38 |

Home first WebGL frame: 4.83s in software Chromium. Project call counts are samples at changing adaptive tiers, not a controlled before/after comparison. Contact dragging changed the recorded rotation; existing inertia was retained.

## Side-by-side review

![comparison-desktop](comparison-desktop.jpg)

![comparison-detail](comparison-detail.jpg)

![comparison-mobile](comparison-mobile.jpg)

## Requested captures

### 01-home

![01-home](01-home.jpg)

### 02-home-pointer

![02-home-pointer](02-home-pointer.jpg)

### 03-home-lower

![03-home-lower](03-home-lower.jpg)

### 04-experience

![04-experience](04-experience.jpg)

### 05-platform-idle

![05-platform-idle](05-platform-idle.jpg)

### 06-platform-hover

![06-platform-hover](06-platform-hover.jpg)

### 07-fifo

![07-fifo](07-fifo.jpg)

### 08-lumalink

![08-lumalink](08-lumalink.jpg)

### 09-emg

![09-emg](09-emg.jpg)

### 10-contact

![10-contact](10-contact.jpg)

### 11-contact-drag

![11-contact-drag](11-contact-drag.jpg)

### 12-contact-form

![12-contact-form](12-contact-form.jpg)

### 13-about

![13-about](13-about.jpg)

### 14-mobile-home

![14-mobile-home](14-mobile-home.jpg)

### 15-mobile-projects

![15-mobile-projects](15-mobile-projects.jpg)

### 16-mobile-contact

![16-mobile-contact](16-mobile-contact.jpg)

### 17-reduced-home

![17-reduced-home](17-reduced-home.jpg)
