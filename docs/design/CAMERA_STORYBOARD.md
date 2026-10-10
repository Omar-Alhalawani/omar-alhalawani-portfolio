# Camera storyboard

Coordinates are world units. Canvas FOV 36°, except project-floorplan FOV 40°. Positive Z points toward the viewer. Targets are damped; normal browser scroll sets a target state, never the wheel delta.

| State | Scroll range | Camera / target | Object / light | Transition |
| --- | --- | --- | --- | --- |
| Material | Hero top → 45% of sequence | `(0,1.35,7.5)` → `(0,0,0)`, FOV36 | Broad wafer; rotation `(0.28,-0.35,-0.12)`; cyan left, violet rear | Subtle ≤0.12-unit pointer response; slow material drift |
| Routing | 45% → 65% | `(0.2,1.7,7.1)` → `(0,0,0)` | Rounded die forms on same topology; trace intensity rises | Smoothstep geometry interpolation, delta-aware exponential damping |
| Layers | 65% → sequence bottom | `(0.3,2.0,7.6)` → `(0,-0.1,0)` | Primary at `y0.72`; four plates toward `y-1.2`; cyan active layer | Gradual separation, no free orbit or abrupt cuts |
| Verification | Experience scene visible | `(0,2.7,6.8)` → origin, FOV36 | Four blocks on substrate, routed pulse | Stable camera; small signal motion only |
| Floorplan | Projects scene visible | `(0,3.8,6.3)` → origin, FOV40 | Oblique module grid; active module slightly raised | State changes illuminate selected region without camera travel |
| Project detail | Case-study visual visible | `(0,2.7,6.2)` → origin, FOV36 | Project-specific geometry with shared materials | State changes follow accessible HTML controls |

Reduced motion: fixed material pose/time, fixed camera, no pointer influence or automatic pulses. Discrete interactive data states still update. Mobile: stable camera, lower geometry/DPR, constrained canvas below copy. Resize recomputes aspect through R3F; camera always uses a finite, bounded target.
