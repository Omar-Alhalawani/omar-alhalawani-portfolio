# Opt-in internal activity loops

1. `useMicroSequence(..., trigger, {loop:true, pause:seconds})` adds explicit looping. Default remains one-shot. Pure timeline math has regression tests.
2. Experience verification, CubeX printer, platform FIFO, FPGA datapath, and EMG acquisition now loop while engaged and permitted to render.
3. Platform entry bus and selection feedback remain one-shot. Project lift, camera/navigation handoff, fade-ins, forms, LumaLink/DAQ sequences, and manual FIFO case-study transactions are unchanged.
4. Pauses: Experience 2.8s; CubeX 1.7s; FIFO 1.9s; FPGA 2.2s; EMG 2.6s. No timers or intervals.
5. CubeX keeps its sine path returning to neutral; damped settling avoids teleporting during pause or pointer leave. Page and platform repeated-motion checks passed over at least 15s each.
6. Experience repeats SPEC → RTL → TESTBENCH → VERIFY → PASS, softens lights during pause, and restarts. Extended 23s observation confirmed repeated complete cycles.
7. Existing renderer visibility budget suspends offscreen/hidden scenes. The helper also guards hidden/demand frames and discards the first resumed delta, so paused time cannot cause a jump. Reduced motion is static. Profiling records enabled/looping/cycle and running=false during pauses.
8. Production build, typecheck, relevant lint, all 17 tests, and focused repeat/leave/re-entry/visibility/reduced-motion browser checks passed. One existing Astro hint remains. No added meshes, lights, canvases, intervals, or rendering-budget changes.

Browser checks used software SwiftShader. Platform checks used the existing low-detail tier after high-detail software stalls skipped observation samples; this is not a hardware performance benchmark. Hidden-tab behavior was exercised through a simulated visibility change. See checks.json for cycle/stage observations.
