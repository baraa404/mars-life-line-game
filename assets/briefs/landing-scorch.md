# landing-scorch

Sole visual reference: `models and assets images/landing-scorch.webp`. Inspected before authoring. Reference is clear and unchanged.

A flat diffuse dark plum scorch patch with irregular feathered boundary; vertex RGBA only, no raster texture or baked ground background.

Scale: Approximately 15 m diameter at Y=0; no physical thickness.

Materials: generated Mars style header and token material values. Metres, +Y up, +X forward, ground at Y=0. Save to Kiln collection project, authoring project mars-life-line. Preserve semantic groups; optimized GLB derivative through the existing ingest pipeline. Current world remains terrain-only.

Required nodes: `scorch_patch` vertex-colour mesh.

## Result

Completed and verified 2026-11-12.

- Kiln collection `project`, asset `a_bd83777697be402cb34d61c89451ab42`, revision `r_322a549836ec4d79803f9918e63ecd2a`, programRef `p_9faa6e177a17`.
- Exact editable source: `assets/source/phase-2-support/landing-scorch.kiln.js`. Optimized model: `public/models/landing-scorch.glb`.
- Measured X × Y × Z: 15.502 × 0.000 × 15.001 m. Full placed triangles: 1,472; optimized GLB: 7,268 bytes. All fit the declared budgets.
- Material-faithful GPU hero: `assets/reviews/phase-2-support/landing-scorch-hero.png`; camera and render receipt alongside it. Compared against the sole matching PNG; no image regeneration was needed.
- Actual optimized GLB reviewed in the browser with the game AssetModel loader, Lighting and Sky. Named groups survive optimization; finite grounded geometry checks pass.
- RGBA vertex colours retain zero-alpha perimeter and dark center; BLEND material, no texture or collision. Flat patch: final terrain projection/placement remains a layout task.
- Five focused support-asset checks and the full 59-test suite pass; production build passes. Main gameplay world remains terrain-only.
