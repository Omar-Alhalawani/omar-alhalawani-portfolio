> Historical checkpoint before the October 10 Amber + Steel upgrade. Current repository, deployment, and final measurements are documented in `docs/upgrade/FINAL_REPORT.md`. Version names and old hosts below are archival.

# Content audit

Audit date: 2026-10-10. V1 snapshot: `743a055d707521ecbd031f85cec06022260d2cca`.

Read V1 `README.md`, `index.html`, `experience.html`, `projects.html`, `project-details.html`, `about.html`, `resume.html`, `contact.html`, `robots.txt`, and `sitemap.xml`; inspected the image directory, PDF, links, and metadata. V1 stores imagery in `assets/img`, rather than `assets/images`.

| Content | Decision | Evidence / limitation |
| --- | --- | --- |
| Ciena ASIC Engineer I Co-op | Lead the experience story, Summer 2026, Ottawa | V1 experience and the supplied public-safe summary. PyUVM/cocotb, self-checking testbenches, fault injection, methodology research, recommendations. No internal measurements. |
| Synchronous FIFO | Flagship case study | Public `rtl/fifo_sync.sv`, `tb/tb_fifo_scoreboard.sv`, README. Single clock; active-low **synchronous** reset; registered read output; count-based readiness. |
| FIFO depth | Explain the actual constraint | Binary pointer overflow requires power-of-two depth ≥2 in the current RTL. The default is 16; the public testbench uses 4. Do not claim arbitrary-depth support. |
| FIFO simultaneous traffic | Separate supported RTL behavior from tested coverage | RTL handles both accepted operations without changing count. The published stimulus alternates read/write during wrap-around; it does **not** explicitly drive simultaneous transfers. V1's case-study description overstates that test coverage. |
| FIFO output protocol | Describe the registered response precisely | `rd_valid` indicates non-empty availability; `dout` updates after an accepted read edge. The scoreboard compares on the next edge. Do not advertise a fall-through FIFO. |
| FPGA arithmetic | Secondary digital-design case study | Public `RTL_File` and `XDC_File`. ZedBoard XC7Z020, DIP switches, 5 pushbuttons, two-stage synchronization, rising-edge detection, 8-bit operands, 9-bit intermediate, low 8 result bits on LEDs. |
| FPGA FSM / debounce | Omit incorrect implications | There is no controller FSM or seven-segment display. Synchronization and edge detection are not full mechanical debouncing. V1 README's FSM tag is unsuitable for this project. |
| EMG | Instrumentation case study with bounded detail | V1 supports MyoWare → Arduino/microcontroller → serial → Python processing/plotting. The current public repository contains only a one-line `Curve-Fitting-App` README; no sampling rate, filter order, or clinical claims are justified. |
| LumaLink | Real-time optical case study | Public README, C camera callback, Python transmitter and local processing server. Raspberry Pi 5, Camera Module 3 Wide, QNX, screen flashes, Morse, local Qwen summary. No throughput or reliability benchmark claims. |
| CubeX | **In-progress** hardware restoration | Current public README and Marlin configuration. SKR V1.4 Turbo, TMC2209, Marlin, working axis motion and heater testing. Permanent carriage, Z homing, calibration, and first print remain pending. V1's completed-conversion wording is stale. |
| Research instrumentation | Retain separate experience | V1: Sept 2025–Apr 2026, sensors/ADCs/microcontrollers, Python, repeatable acquisition/debugging. Mini-lysimeter source is unavailable; present a bounded public summary. |
| Teaching | Retain separate experience | V1: Sept 2025–May 2026, programming and digital systems, RTL/FSM/simulation/waveform support. |
| About | Retain identity and supported recognition | V1: Carleton BEng 2024–2029, CGPA 10.80/12, Ontario Professional Engineers Scholarship, Dean's Honour List, BioCARE. |
| Contact | Preserve functional channels | `omar.alhalawani2006@gmail.com`, GitHub, LinkedIn, Formspree `xkgekqrw`. Never submit actual test messages. |
| Resume | Copy PDF byte-for-byte | `assets/resume/Resume_Omar_Alhalawani.pdf`, 89,116 bytes. No content edits. |

## Assets
Preserve Omar's supplied profile photo. V1's FPGA illustration shows a seven-segment display and an FSM, contradicting the published RTL. Exclude that image and the other unneeded illustrative project thumbnails from V2; they cannot serve as implementation evidence. Use original procedural scenes and clearly labeled conceptual diagrams. Create an original code-native wafer fallback, project-specific static SVGs, and dedicated 1200×630 OG image. Do not copy V1's styles, scripts, game, stock person photos, or heavy favicon.

## Content problems resolved
V1 repeats the same identity on many pages and mixes accurate case studies with stale README tags. V2 uses structured data once, gives each project its own route, and distinguishes design behavior, implemented tests, ongoing work, and conceptual visuals. No fictitious telemetry belongs in the UI.

## Source references
- https://github.com/Omar-Alhalawani/omar-portfolio
- https://github.com/Omar-Alhalawani/sync-fifo-rtl-verification
- https://github.com/Omar-Alhalawani/FPGA-Based-Arithmetic-Display-System
- https://github.com/Omar-Alhalawani/EMG-Signal-Acquisition-and-Processing
- https://github.com/Omar-Alhalawani/lumalink
- https://github.com/Omar-Alhalawani/CubeX-Trio-Revival
