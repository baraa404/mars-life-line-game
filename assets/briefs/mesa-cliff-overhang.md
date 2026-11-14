# mesa-cliff-overhang — Phase 2

- Category: building.
- Scale: ~11.3 m wide × 5.47 m high × 5.40 m deep (user-requested compact correction); ground contact Y=0.
- Sole visual reference: `models and assets images/mesa-cliff-overhang.webp`.
- Image review: coherent and suitable; no regeneration required.
- Traits to reproduce: Terraced chipped apron, recessed central alcove, broad overhanging shelves, side buttresses, sample pedestal and rubble. Reference astronaut and robot establish scale only, not included geometry.
- Material values: existing Mars style tokens; no other image guides this asset.
- Editable source: `assets/source/phase-2/mesa-cliff-overhang.kiln.js`.

## Functional requirements

shelter_zone with occupant bounds and supported floor beneath a real recessed alcove; open access and accurate collision.

## Result

- Saved project asset: a_01cc57c733784023bad2048610c93984 / r_b1998f758f8c4d668fb46e9827dc9ce8.
- Program: p_d81668c528f8.
- Rendered extents X/Y/Z: 5.402 × 5.473 × 11.319 m.
- Complete source geometry: 2,146 placed triangles.
- Optimized game GLB: public/models/mesa-cliff-overhang.glb, 123,880 bytes, 2,146 unique-buffer triangles. Unique-buffer counts can be lower than placed counts because instances share geometry.
- Accepted material-faithful GPU view: assets/reviews/phase-2/mesa-cliff-overhang.png; camera and exact export receipt are beside it.
- Test placement: [-18, 0.2, -4], Y rotation -90 degrees, trimesh collision.
- In-game review: models loaded without browser console errors; nearby models reviewed while walking from spawn. Decorative horizon models can be occluded by the existing basin rim from the initial view.
- Replaced the rejected oversized striped-grid cliff with a compact irregular slab alcove. Catalog size is superseded by the user correction. Measured center headroom 2.885 m; back wall distance 0.893 m; approach clear. Low terrace is ~0.6 m high. Only the central standing location was ray-tested; samples are not an exhaustive traversal proof.
- Required node/variant checks pass in scripts/check-phase2-assets.mjs. Source triangle budgets pass; runtime frame-rate/draw-call budgets are not certified. Unseen surfaces are inferred from the same image.
