# mesa-distant — Phase 2

- Category: building.
- Scale: 3 variants, 60–150 m; ground contact Y=0.
- Sole visual reference: `models and assets images/mesa-distant.webp`.
- Image review: coherent and suitable; no regeneration required.
- Traits to reproduce: Three separate flat-topped mesa silhouettes with narrow stepped shelves and eroded buttresses.
- Material values: existing Mars style tokens; no other image guides this asset.
- Editable source: `assets/source/phase-2/mesa-distant.kiln.js`.

## Functional requirements

Distinct named variants/composition suitable for instancing.

## Result

- Saved project asset: a_fd6f66376db4487b93b3509153aaac10 / r_d8dbf96666dd4030a4194e9c84845aa0.
- Program: p_3d96955ea8b5.
- Rendered extents X/Y/Z: 309.223 × 31.278 × 71.513 m.
- Complete source geometry: 1,848 placed triangles.
- Optimized game GLB: public/models/mesa-distant.glb, 63,464 bytes, 1,848 unique-buffer triangles. Unique-buffer counts can be lower than placed counts because instances share geometry.
- Accepted material-faithful GPU view: assets/reviews/phase-2/mesa-distant.png; camera and exact export receipt are beside it.
- Test placement: [0, 3, -270], Y rotation 0 degrees, none collision.
- In-game review: models loaded without browser console errors; nearby models reviewed while walking from spawn. Decorative horizon models can be occluded by the existing basin rim from the initial view.
- Required node/variant checks pass in scripts/check-phase2-assets.mjs. Source triangle budgets pass; runtime frame-rate/draw-call budgets are not certified. Unseen surfaces are inferred from the same image.
