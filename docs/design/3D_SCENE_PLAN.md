> Historical checkpoint before the October 10 Amber + Steel upgrade. Current repository, deployment, and final measurements are documented in `docs/upgrade/FINAL_REPORT.md`. Version names and old hosts below are archival.

# 3D scene plan

## Shared rendering shell
One React island owns each visible scene. A dynamic module import delays Three/R3F until the island is near the viewport. SVG artwork is present before hydration and remains beneath WebGL. Context creation or loss exposes that artwork. No essential text uses Drei Text, sprites, or a canvas.

## Hero / silicon
One UV sphere topology is reshaped into a broad superellipsoid wafer in a custom vertex shader, then gradually resolves to a shallow rounded die. Low-frequency deformation slows as structural morph increases. A fragment shader computes dark material, broad cyan/violet bands, edge reflections, and fading trace/grid marks. No texture downloads or HDR environment maps.

The primary surface remains throughout the morph. Four secondary rounded plates separate beneath it; the upper form becomes the fifth. This maintains visual continuity rather than replacing unrelated models. Five skills in HTML correspond to these conceptual layers. Focus/hover selects one layer and its routed signal.

## Verification
Four restrained blocks connected by a signal path. The visual is a generic concept, labeled as such in HTML, not Ciena architecture. SPEC → RTL → TESTBENCH → VERIFY remains readable outside the canvas. No fictional benchmark or company IP.

## Project floorplan
Six regions share one substrate: FIFO, FPGA, EMG, optical, DAQ, and printer. Selecting an HTML project card by focus or hover changes one region's emissive activity. FIFO cells, a small waveform, a TX/RX pulse, and a miniature gantry make the modules distinctive. Unselected regions remain calm. All projects remain accessible without a pointer or WebGL.

## Case-study scenes
- FIFO: 8 illustrative memory slots, write/read pointer markers, accepted transfer and count state from the clock-step model. Demo memory size is explicitly illustrative; current RTL default is 16.
- FPGA: operand-register blocks, ALU, eight lights driven by real browser demo state. Buttons are in HTML. No seven-segment output or controller FSM.
- EMG: synthetic raw and processed waveform, never measured patient data or an implemented filter specification.
- LumaLink: a small number of light pulses from TX to RX; no invented rate.
- CubeX: simple frame, bed, gantry, moving toolhead; visual is an illustration, not evidence of a completed print.
- DAQ: sensor → capture → software blocks, bounded by public content.

No postprocessing in the initial implementation: controlled shader reflections and emissive colors provide depth without a bloom pass. Add complexity only if visible benefit survives the prototype critique.
