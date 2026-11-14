# solar-array-row — Phase 2

- Category: medium-prop.
- Scale: 6 × 2 × 2.5 m; four world placements; ground contact Y=0.
- Sole visual reference: `models and assets images/solar-array-row.webp`.
- Image review: coherent and suitable; no regeneration required.
- Traits to reproduce: Five tilted ivory panel frames, each with 2 columns × 4 rows of dark blue tiles, fine bus lines, grey end pivots and angled braces, ivory/orange base and right-end cube beacon.
- Material values: existing Mars style tokens; no other image guides this asset.
- Editable source: `assets/source/phase-2/solar-array-row.kiln.js`.

## Functional requirements

Five panel_N groups and info_anchor; four world copies. Cleaning and power simulation remain separate.

## Result

- Saved project asset: a_c865ca4405c94355b7d82ff82e0407c9 / r_8133f738972c4ed5ba9527c804e61433.
- Program: p_d587aa02e2f2.
- Rendered extents X/Y/Z: 1.980 × 2.384 × 5.950 m.
- Complete source geometry: 4,928 placed triangles.
- Optimized game GLB: public/models/solar-array-row.glb, 46,852 bytes, 4,448 unique-buffer triangles. Unique-buffer counts can be lower than placed counts because instances share geometry.
- Accepted material-faithful GPU view: assets/reviews/phase-2/solar-array-row.png; camera and exact export receipt are beside it.
- Test placement: [6, 0, -3], Y rotation -90 degrees, hull collision.
- In-game review: models loaded without browser console errors; nearby models reviewed while walking from spawn. Decorative horizon models can be occluded by the existing basin rim from the initial view.
- Five cleaning targets retain distinct cell materials; four copies stand at (6,0,-3), (6,0,-6), (6,0,-9), (6,0,-12).
- Required node/variant checks pass in scripts/check-phase2-assets.mjs. Source triangle budgets pass; runtime frame-rate/draw-call budgets are not certified. Unseen surfaces are inferred from the same image.
