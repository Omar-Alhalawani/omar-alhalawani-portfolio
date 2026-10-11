# Geographic Contact globe

Source: world-atlas 2.0.2 land-110m, derived from Natural Earth 4.1.0. Its published coastline coordinates are decoded at preprocessing time; polygons and holes produce a 1024 × 512 gunmetal land texture, real coastline segments and land-only metallic detail samples. Source URL, checksum, endpoint checks and license are included. No hand-drawn land, country meshes or runtime GIS library. Compact coast/detail data is 110KB uncompressed; the map texture is 28KB.

All geographic elements use the same latitude/longitude conversion: x = r cos(lat) sin(lon), y = r sin(lat), z = r cos(lat) cos(lon). Texture longitude offset is aligned to this convention. Ottawa uses 45.4215°, −75.6972°. Every conceptual node passed the source land-polygon check. Six desktop / three mobile routes join different continents using spherical interpolation in the great-circle plane and a sine elevation based on angular distance. Endpoints, particles, coastline, local lights and globe share one rotating parent; sphere depth testing obscures rear routes.

Custom pointer rotation provides direct drag, vertical tilt, unlimited horizontal turns and damped release inertia, with no pan or zoom. Auto rotation pauses at drag start and eases back after three idle seconds. Pointer capture, cancellation, lost capture and blur release controls. Touch-action is limited to the canvas and permits vertical scrolling/pinch zoom; deliberate horizontal/diagonal touch rotates. Reduced motion stops idle movement and pulse travel but retains manual drag and 24 static motes.

More particles: 420 desktop / 144 mobile, in one Points draw, with directional fading pulse trails, endpoint scatter and faint route-side motes. Shared materials, instanced details, adaptive DPR/bloom, offscreen pause and no shadows remain. Captured software-renderer samples: desktop 38 calls / 50,919 triangles with bloom, reducing to 23 calls / 50,904 triangles when adaptive quality disables bloom; mobile 17 calls / 23,812 triangles. Hardware frame rate is unmeasured. The static poster was regenerated from the real scene in the default Americas orientation.

Checks passed: slow/fast/horizontal/vertical drag, repeated full turns, release momentum, idle auto resume, actual touch rotation plus vertical page scrolling, reduced-motion manual drag, no stuck controls or page errors. Four regional views inspected. Build, typecheck, changed-file lint and all 11 tests pass, including projection cardinal directions and every route’s great-circle plane/endpoints. No unrelated site QA. Contact content/form, project models/transitions, SEO and other page designs are unchanged.

- [Americas](americas.jpg)
- [Europe / Africa](europe-africa.jpg)
- [Asia](asia.jpg)
- [Oceania / Pacific](oceania-pacific.jpg)
- [Desktop Contact](contact-desktop.jpg)
- [Mobile Contact](contact-mobile.jpg)
- [Reduced motion](contact-reduced.jpg)

The 1:110m dataset deliberately simplifies small islands/coastlines. Particle richness is bounded; mobile omits bloom and traveling pulse lights.
