# Project Platform footprint correction

All six core models use explicit dock width, dock depth, uniform model scale and resting height. A mount wrapper measures the complete physical hierarchy once after construction, centers X/Z, and aligns the physical bottom with the dock's PCB mounting plane. Controls, connectors, labels, printer controller, motors and rails are included. HTML callouts and sprite illumination are excluded. Line2 bounds use route bounds rather than extrusion shader vertices.

FIFO and CubeX retain their original uniform scales (0.60 and 0.71). Wider docks and the revised layout separate the full printer from the FIFO controls. Peripheral hardware and routes follow the new dock layout. Labels follow measured model heights.

`?footprints` on a development build shows dock bounds, model bounds, center and origin axes. Debug geometry is absent from production. The construction-time fit check requires at least 8% of dock width/depth as clearance at every edge. `node scripts/project-footprints-check.mjs` asserts all six fits, separate dock frames, +0.22 FIFO/CubeX hover with unchanged X/Z, and exact return to rest. It captures only idle, FIFO hover, CubeX hover and a top overview; measurements are in bounds.json.

The existing cinematic transition implementation remains; its focus coordinates account for the normalized model origin and new dock positions. TypeScript, changed-file lint and the production build pass. Platform captures use software WebGL in this workspace.
