# Implementation plan

1. Initialize the empty V2 repository independently. Record the V1 source snapshot and project-claim corrections. Do not write to any reference repository.
2. Define the documents in this directory before finished-site implementation.
3. Scaffold Astro + TypeScript + React; structured data, design tokens, layout/header/footer. Build the wafer shader, SVG fallback, pointer damping, first morph, layers, and mobile/reduced-motion variants.
4. Run a prototype production build and browser critique from recruiter, ASIC engineer, creative director, frontend engineer, mobile, and accessibility perspectives. Record evidence and fix real weaknesses before other pages.
5. Add experience, projects/floorplan, individual case studies, and bounded FIFO/FPGA models with meaningful edge-case tests. Add about/resume/contact/404, metadata/schema, staging noindex and headers, sitemap, OG, and original assets.
6. Typecheck, lint, tests, production build, route/link checks, browser viewport/keyboard/scroll/resize/reduced-motion/no-WebGL checks, console/network inspection, and performance measurements. Fix observed failures.
7. Push logical commits only to V2. Import/connect the separate Vercel project using existing user authentication if available. No paid add-ons, domains, DNS, or V1 redirects. Stop at an actual authentication/MFA/consent boundary; never request secrets.
8. Inspect deployed routes and graphics in a real browser, run available audits, fix/redeploy, and record actual status. A successful build or Vercel Ready flag alone does not close QA.

## Architecture choices
Static Astro pages render semantic HTML. React SceneIsland dynamically imports CanvasShell/scene implementations. DOM events bridge project-card focus and skill selection into the decorative scene; shared application state libraries are unnecessary. Node's test runner checks simulation behavior. ESLint, Astro check, and TypeScript validate implementation. Vercel has static Astro defaults and an explicit X-Robots-Tag; no server/database/secrets are required.

## Checkpoint policy
Use coherent commits for scaffold/design, hero prototype, content/case studies, and QA/deployment fixes. Repository-backed artifacts are persisted in GitHub, not copied to a second file store. QA records distinguish local measurements, live measurements, and blocked verification.
