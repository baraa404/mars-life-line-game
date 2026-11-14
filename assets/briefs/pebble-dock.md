# pebble-dock

Sole visual reference: `models and assets images/pebble-dock.webp`. Inspected before authoring. Reference is clear and unchanged.

Low chamfered ivory platform, four chunky slate feet, amber front guide, orange side panel, small cyan indicator and two ivory arm links with octagonal hinge cheeks. Keep the bent-arm silhouette and broad charging head.

Scale: 1.2 m platform footprint; preserve the image arm proportions (total height around 1.4 m), superseding the old 0.8 m total catalog height.

Materials: generated Mars style header and token material values. Metres, +Y up, +X forward, ground at Y=0. Save to Kiln collection project, authoring project mars-life-line. Preserve semantic groups; optimized GLB derivative through the existing ingest pipeline. Current world remains terrain-only.

Required nodes: `charging_arm`, `shoulder`, `charging_head`.

## Result

Completed and verified 2026-11-12.

- Kiln collection `project`, asset `a_55f5c701fd7748749c5de09e1d7a0a3b`, revision `r_661bef8a864d47d090394f550130221b`, programRef `p_6d7543e9eb88`.
- Exact editable source: `assets/source/phase-2-support/pebble-dock.kiln.js`. Optimized model: `public/models/pebble-dock.glb`.
- Measured X × Y × Z: 1.229 × 1.515 × 1.169 m. Full placed triangles: 1,444; optimized GLB: 37,256 bytes. All fit the declared budgets.
- Material-faithful GPU hero: `assets/reviews/phase-2-support/pebble-dock-hero.png`; camera and render receipt alongside it. Compared against the sole matching PNG; no image regeneration was needed.
- Actual optimized GLB reviewed in the browser with the game AssetModel loader, Lighting and Sky. Named groups survive optimization; finite grounded geometry checks pass.
- Arm foot/platform, shoulder/foot, head/wrist assembly and contact pad/head surface checks all measure contact (zero unsigned surface distance). This is static contact evidence, not an articulated motion or charging simulation test.
- Five focused support-asset checks and the full 59-test suite pass; production build passes. Main gameplay world remains terrain-only.
