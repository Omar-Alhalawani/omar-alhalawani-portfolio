# Portfolio design brief

Present Omar's engineering work through readable, source-backed explanations and purposeful hardware visuals. The primary visitor tasks are assessing experience, opening a project, reading the resume, and making contact.

## Visual system

- Preserve the dark Amber + Steel palette. Amber is the action/energy accent; cool steel supports material and read-path contrast. No unrelated gradients or extra accent colors.
- Space Grotesk headings, Inter body text and JetBrains Mono technical labels have distinct roles. Keep readable body typography rather than replacing fonts to follow a trend.
- Shared spacing tokens follow a 4px scale. Use one 4px surface radius through `--radius`; `--radius-panel` aliases it. Functional circles such as LEDs remain circular.
- Prefer open sections and clear hierarchy. Reserve panels for actual tools, diagrams, forms, and selected-project context. Keep tap targets at least 44px.
- Use the existing real portrait and clearly labeled conceptual engineering artwork. Do not invent project photos, measurements, achievements, or availability.

## Interaction states

- Loading: retain the real scene poster while interactive graphics initialize, with a small status label. A visible scene that stalls for 30 seconds returns to its poster; offscreen/hidden time does not trigger this fallback.
- Fallback: distinguish an intentional static view or data saver from unavailable 3D. Keep project selectors, links, and page content usable.
- Contact: prevent duplicate pending submissions, preserve drafts after failure, identify provider validation fields, explain rate limits/offline/service errors, bound delivery confirmation to 20 seconds, and provide a direct email link. Cancel requests on page navigation.
- Empty: explain what the visitor can do next. The existing FIFO empty state already explains requests and clocking; do not add redundant empty-state cards to populated sections.
- Motion: animate meaningful engineering activity and useful state changes. Honor reduced motion, pause offscreen/hidden rendering, and preserve existing project transitions.

## Checklist decisions

Already present: distinct page titles, favicons, a custom 404, real portrait, professional factual copy, restrained amber identity, reduced motion, and project-specific demonstrations.

Applied in this pass: explicit scene loading/fallback states, bounded loading, actionable contact errors with field recovery, shared spacing/radius tokens, and this design brief.

A custom domain requires an owned domain and DNS setup, so this pass keeps the existing deployment. Do not purchase a domain or install an unrelated skill as a cosmetic checklist task.
