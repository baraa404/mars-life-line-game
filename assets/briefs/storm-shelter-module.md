# storm-shelter-module — Phase 2

- Category: building.
- Scale: 3 × 2.8 × 3 m; ground contact Y=0.
- Sole visual reference: `models and assets images/storm-shelter-module.webp`.
- Image review: coherent and suitable; no regeneration required.
- Traits to reproduce: Low reinforced ribbed body, large orange corner armor, separate thick roof, small armored door with amber lamp, left octagonal service connector, cyan beacon.
- Material values: existing Mars style tokens; no other image guides this asset.
- Editable source: `assets/source/phase-2/storm-shelter-module.kiln.js`.

## Functional requirements

Separate roof and info_anchor; visible water-wall ribs. Gameplay shielding/interior separate.

## Result

- Saved project asset: a_c648370eada24991bd11591353aff813 / r_d7c20e639055451bbd80f54f9bdda726.
- Program: p_14bb36f02e08.
- Rendered extents X/Y/Z: 3.247 × 2.935 × 3.470 m.
- Complete source geometry: 1,836 placed triangles.
- Optimized game GLB: public/models/storm-shelter-module.glb, 45,384 bytes, 1,836 unique-buffer triangles. Unique-buffer counts can be lower than placed counts because instances share geometry.
- Accepted material-faithful GPU view: assets/reviews/phase-2/storm-shelter-module.png; camera and exact export receipt are beside it.
- Test placement: [-7, 0, 0], Y rotation 180 degrees, cuboid collision.
- In-game review: models loaded without browser console errors; nearby models reviewed while walking from spawn. Decorative horizon models can be occluded by the existing basin rim from the initial view.
- Required node/variant checks pass in scripts/check-phase2-assets.mjs. Source triangle budgets pass; runtime frame-rate/draw-call budgets are not certified. Unseen surfaces are inferred from the same image.
