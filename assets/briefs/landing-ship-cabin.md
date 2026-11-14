# landing-ship-cabin

Sole visual reference: `models and assets images/landing-ship-cabin.webp`. Inspected before authoring; kept unchanged.

Cutaway crew cabin interior of the squat landing ship with four articulated landing legs reaching ground (Y=0), four dark hollow engine bell nozzles, orange faceted lower hull skirt, slate floor with inlaid orange perimeter, pilot seat facing forward/left, sloped instrument console with dark cyan landing screen (`screen_anchor`), prominent physical orange ARM button (`button_arm`), forward viewport window (`window`), aft inner airlock hatch (`hatch`) with orange border and center latch wheel, right wall emergency O2 canister (`o2_canister`), side doorway (`side_hatch`), exterior entry stairs (`stairs`), warm glowing ceiling light, and top cyan roof beacon.

Generated Mars header materials; metres, +Y up, +X forward (cutaway portal opens forward +X for interior view).

Required semantic nodes: `seat`, `window`, `screen_anchor`, `button_arm`, `hatch`, `o2_canister`, `stairs`.

## Result

Completed 2026-11-13.

- Collection `project`, asset `a_edabe4d3de794ce1b65ea8bd37864789`, revision `r_004e546201154bb5a561c3eaef8a39b3`, programRef `p_30fa62ddbca8`.
- Exact source `assets/source/phase-4/landing-ship-cabin.kiln.js`; optimized GLB `public/models/landing-ship-cabin.glb`. Default legacy converter, editable export, then Meshopt derivative.
- Measured X × Y × Z: 3.801 × 3.495 × 3.801 m; 1,296 optimized triangles (2,076 raw); 85,956 optimized bytes. Declared building budget (12,000) passes.
- Material-faithful GPU review: `assets/reviews/phase-4/landing-ship-cabin.png`; camera and receipts alongside it. Reference PNG unchanged.
- Verified through GLTFLoader/MeshoptDecoder; scale checks pass. Production build passes.
