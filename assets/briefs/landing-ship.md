# landing-ship

Sole visual reference: `models and assets images/landing-ship.webp`. Inspected before authoring. Reference is clear and unchanged.

Squat faceted ivory hull, two thick grey wrap ribs, orange underside skirt, four splayed thick legs with round feet, four hollow dark nozzle bells, octagonal amber hatch, short ladder, two inset navy windows and a small cyan roof beacon.

Scale: Image-proportioned squat exterior, around 7 m footprint and 6.5 m tall; the old 6 × 9 × 6 m column-like proportions conflict with the supplied image.

Materials: generated Mars style header and token material values. Metres, +Y up, +X forward, ground at Y=0. Save to Kiln collection project, authoring project mars-life-line. Preserve semantic groups; optimized GLB derivative through the existing ingest pipeline. Current world remains terrain-only.

Required nodes: `hatch`, `ramp`, `nozzle_1`–`nozzle_4`, `window_1`–`window_2`.

## Result

Completed and verified 2026-11-12.

- Kiln collection `project`, asset `a_931773a4be5745adabe7d48ece3be07c`, revision `r_9ac953cf2b77427f860cd34ff816f9e6`, programRef `p_8bcf652883dc`.
- Exact editable source: `assets/source/phase-2-support/landing-ship.kiln.js`. Optimized model: `public/models/landing-ship.glb`.
- Measured X × Y × Z: 6.987 × 6.591 × 6.987 m. Full placed triangles: 4,376; optimized GLB: 60,876 bytes. All fit the declared budgets.
- Material-faithful GPU hero: `assets/reviews/phase-2-support/landing-ship-hero.png`; camera and render receipt alongside it. Compared against the sole matching PNG; no image regeneration was needed.
- Actual optimized GLB reviewed in the browser with the game AssetModel loader, Lighting and Sky. Named groups survive optimization; finite grounded geometry checks pass.
- Four footpads reach Y=0; four open nozzle mouths reach recessed throats. Hatch, ladder (`ramp`), nozzle_1–4 and window_1–2 are populated nodes. Hollow bell winding was corrected and re-reviewed from below. Exterior only: hull is closed behind the hatch; cabin, opening animation, enterability and mission wiring are not implemented.
- Five focused support-asset checks and the full 59-test suite pass; production build passes. Main gameplay world remains terrain-only.
