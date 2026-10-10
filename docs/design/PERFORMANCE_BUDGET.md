# Performance budget

## Delivery
Astro static output; body content has no React hydration dependency. Fonts are self-hosted WOFF2 subsets with swap. No external HDR maps, large textures, hero video, animation framework, or full-site SPA. Three is dynamically imported near scene visibility; project-specific scene modules are route split. Resume/contact/about do not download Three.

Initial HTML + CSS + fonts target <180KB transferred. Scene code target ≤300KB compressed; report the actual bundle instead of claiming the budget was met. Project evidence images ≤150KB each where practical. Original resume remains 89,116 bytes. Canvas dimensions are reserved to avoid layout shift.

| Tier | Selection | DPR cap | Geometry | Effects |
| --- | --- | --- | --- | --- |
| High | Wide desktop with ordinary viewport heuristics | 1.75 | 96×64 primary surface | Custom shader, five layers, few signals; no postprocess |
| Medium | Standard laptop/tablet | 1.35 | 64×40 | Fewer surface details/signals |
| Low | Coarse pointer or narrow mobile | 1 | 40×24 | Simplified fields, no extra signal cloud |

No GPU fingerprinting. Persistent low FPS may downgrade one tier. The profiler observes the actual renderer, not a fake dashboard. Target ~60FPS on capable desktop and 30–60 on phones; report only measured data and device/testing limitations.

Hidden or offscreen scenes use no continuous render loop. Reduced motion uses demand frames. Bound delta on tab resumption, clean observers/listeners, let R3F dispose owned geometries/materials, and verify context loss recovery. Use actual Lighthouse and bundle measurements where available. Staging noindex intentionally prevents a perfect SEO audit score.
