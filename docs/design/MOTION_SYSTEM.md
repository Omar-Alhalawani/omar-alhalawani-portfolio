> Historical checkpoint before the October 10 Amber + Steel upgrade. Current repository, deployment, and final measurements are documented in `docs/upgrade/FINAL_REPORT.md`. Version names and old hosts below are archival.

# Motion system

| Family | Duration | Use |
| --- | --- | --- |
| Signal | 100–350ms | Active trace and data/state feedback |
| Mechanical | 300–900ms | Layer separation, selected module, modest material movement |
| Ambient | 4–15s | Broad shader field, slight light drift |

Canvas uses delta-aware damping `1 - exp(-rate * min(delta, 0.1))`. Scroll maps absolute section positions into normalized progress. Fast scrolling, reverse scrolling, and tab resumption converge toward the same state. No independent animation-library RAF loop is introduced.

No wheel interception, page-wide scroll snapping, magnetic controls, route delays, custom cursor, autoplay audio, spinning logo, repeated entrance gate, or content hidden awaiting animation. Small hover shifts are optional enhancements; keyboard focus has equivalent scene feedback.

Pause the R3F loop when document visibility is hidden or intersection is false. Reduced motion uses demand rendering: a still illustration plus discrete updates for user input. Dispose resources and remove listeners/observers on unmount. Full-document Astro navigation is chosen initially for deterministic scene cleanup and immediate native navigation.
