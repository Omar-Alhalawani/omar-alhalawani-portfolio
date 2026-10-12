# Mobile visibility and animation life pass

The mobile platform camera fit pushed hardware into the fixed desktop fog range (9–19). Mobile/coarse/low-tier hardware now uses a camera-scaled fog range, ambient 0.34, neutral fill 1.5 and environment 0.88. Exposure stays 1.02. Existing graphite, PCB and steel materials remain intact; their highlights and silhouettes are now readable. One restrained warm light follows the selected mobile dock; neighbors keep neutral fill. Desktop lighting/cameras, dock footprints, .22 lift, transitions, homepage and Contact globe are preserved.

Mobile sheet padding is smaller, tap targets remain 44px, selectors fit or scroll safely, and the selected label moves inward. Widths 320/360/390/430 show no page overflow; canvas DPR remains 1 with browser DPR 3. Initial Projects heading clears the header. Before/after desktop images retain the same lighting/composition; demonstration phases differ.

| Scene | Demonstration | Powered idle | Demo / idle seconds | Observed repeats |
|---|---|---|---|---|
| Experience | SPEC → RTL → TESTBENCH → VERIFY → PASS | Faint routes and controller pulse | 4.8 / 1.2 | 5 |
| FIFO | Write/token → memory/count → read/token → settle | Local power indicator, faint routes | 3.6 / 1.1 | 5 |
| FPGA | DIP → sync/registers → ALU → LED[7:0] | Controller power pulse | 3.5 / 1.1 | 5 |
| EMG | Sensor → acquisition → serial → processing → waveform | Low-amplitude synthetic waveform | 3.8 / 1.1 | 5 |
| LumaLink | TX → optical pulse → camera → decode → result | Controller pulse and retained decode light | 4.2 / 1.1 | 4 |
| CubeX | Approach → pass → Z shift → reverse/partial pass → settle | Heater and controller modulation | 4.6 / 1.1 | 5 |
| DAQ | CH0 → CH1 → CH2 → CH3 → acquisition/log | Local power indicator | 4 / 1.1 | 4 |

CubeX uses three continuous deterministic toolpath variants, all beginning/ending at neutral. Its observed head range was approximately -0.48 to +0.48. FIFO standalone has a separately labeled conceptual illustration; actual queue memory, COUNT, pointers and waveform evidence never change autonomously. Manual events/controls yield immediately, followed by approximately two visible seconds of inactivity before resuming (measured 1.98s).

Mobile selection persists after finger release; changing selection disables the previous strong demonstration. The platform entry bus remains one-shot. Hidden/offscreen scenes pause their existing frame loop and discard the first resumed delta. Reduced motion retains static illumination without autonomous loops. No new canvases, assets, particles, bloom, shadows or increased mobile DPR; indicators share geometry and update through existing frame callbacks.

Experience and CubeX were observed for at least 30s; the other five for at least 25s, including real frame captures, stage changes and powered idle. Chromium used software SwiftShader and touch emulation; these are not physical-device GPU measurements. Build (13 pages), typecheck, lint and all 18 tests passed, including continuous toolpath bounds/cycle seams.

[Validation data](validation.json) · [Motion observations](motion-evidence.jpg) · [Desktop before/after](desktop-comparison.jpg)

Mobile captures: [FIFO](mobile-platform-fifo.jpg), [LumaLink](mobile-platform-lumalink.jpg), [CubeX](mobile-platform-cubex.jpg), [DAQ](mobile-platform-mini-lysimeter.jpg), [standalone CubeX](mobile-standalone-cubex.jpg), [standalone LumaLink](mobile-standalone-lumalink.jpg), [standalone FIFO](mobile-standalone-fifo.jpg), [Experience](mobile-experience.jpg), [reduced motion](mobile-reduced-motion.jpg). [Desktop platform](after-desktop-platform.jpg).
