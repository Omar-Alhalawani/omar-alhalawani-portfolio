# Focused visual polish

Contact now has a dedicated lazy-loaded globe scene: graphite sphere, restrained metallic land dots and grid, a real Ottawa marker, layered amber paths, traveling heads/trails, local light spill, slow drift and damped desktop pointer tilt. Unlabelled routes are explicitly described as conceptual. Two shared route materials cycle independently. No downloaded globe assets or map textures.

The HTML form stays below the hero. Its CTA scrolls and focuses Name; submission, validation, status announcements and keyboard access remain intact. Desktop uses a split layout; mobile stacks text, a 340px globe, then the form. Mobile uses three paths and no bloom or pulse lights. Reduced motion fixes orientation and pulses, disables mouse reaction, and renders on demand. Offscreen rendering pauses through the existing render budget.

Budget: six desktop paths, instanced land/nodes/pulses, two local lights, no shadow maps or depth of field, adaptive bloom, desktop DPR ceiling 1.25 and mobile DPR 1. Observed software-renderer samples: desktop 27 calls including bloom passes / 41,355 triangles; mobile 9 calls / 18,388 triangles. Adaptive quality remains enabled. Hardware GPU frame rate was not measured. Static Contact, EMG, LumaLink, Home and platform posters were exported from the real scenes.

LumaLink adds transmitter control electronics, camera board interface and receiver heat-sink detail while retaining the screen-flash → optical pulse → camera response → decode sequence. EMG adds an acquisition PCB, sensor input identification, processing chassis and waveform-station status detail; signals remain synthetic. Shared model details appear on the project platform as well as case pages.

Title-length attributes preserve short-title size and reduce long titles: desktop EMG measured two lines, CubeX three. Labels have quieter typography, an amber anchor node and their existing model leader. Hero core light and the strongest emissive strip are softened. Engineering involvement now precedes leadership/community on About, preserving its content. Projects says “where available”; EMG says “View repository”; JPacman uses shared-team wording.

Validation: production build, typecheck (zero errors/warnings, one existing hint), changed-file lint, all nine existing tests. Focused Contact desktop/mobile/reduced-motion checks passed; energy clock advances, offscreen clock stops, reduced motion is demand/clock zero, and one mocked form request succeeds without sending a message. Home and three case heroes were inspected. One FIFO client-navigation/retained-handoff sanity check passed without a document reload or page errors. Transition architecture, SEO staging directives and resume are unchanged. No Lighthouse or exhaustive viewport matrix.

Captures:
- [Contact desktop](contact-desktop.jpg)
- [Globe detail](contact-globe.jpg)
- [Contact mobile](contact-mobile.jpg)
- [Contact reduced motion](contact-reduced.jpg)
- [EMG hero](emg-hero.jpg)
- [LumaLink hero](lumalink-hero.jpg)
- [CubeX long title](cubex-hero.jpg)
- [Home hero](home-hero.jpg)

Remaining visual difference: the lightweight dotted continents and clean paths are more schematic than the reference’s dense coastlines and volumetric energy. Mobile deliberately has less glow and fewer paths. Smoothness on physical mobile hardware remains unverified; the available browser uses SwiftShader.
