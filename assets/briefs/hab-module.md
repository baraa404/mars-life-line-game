# hab-module — Phase 2

- Category: building.
- Scale: 8 × 3.6 × 5 m; ground contact Y=0.
- Sole visual reference: `models and assets images/hab-module.webp`.
- Image review: coherent and suitable; no regeneration required.
- Traits to reproduce: Long octagonal ivory pressure module; orange end hatch, slate wraparound bands, three dark side windows with amber upper strips, cyan end lamp and raised roof equipment.
- Material values: existing Mars style tokens; no other image guides this asset.
- Editable source: `assets/source/phase-2/hab-module.kiln.js`.

## Functional requirements

Separate roof and info_anchor; named window position groups. Exterior asset; interior is a separate future scene.

## Result

- Saved project asset: a_eb8446aacb8047a481ed1ae75623d25f / r_e75e68ff3b3246d4876f14723d3be7fa.
- Program: p_44df73b0bfd0.
- Rendered extents X/Y/Z: 8.055 × 3.585 × 5.430 m.
- Complete source geometry: 2,776 placed triangles.
- Optimized game GLB: public/models/hab-module.glb, 54,860 bytes, 2,476 unique-buffer triangles. Unique-buffer counts can be lower than placed counts because instances share geometry.
- Accepted material-faithful GPU view: assets/reviews/phase-2/hab-module.png; camera and exact export receipt are beside it.
- Test placement: [-7, 0, -5], Y rotation 0 degrees, cuboid collision.
- In-game review: models loaded without browser console errors; nearby models reviewed while walking from spawn. Decorative horizon models can be occluded by the existing basin rim from the initial view.
- Required node/variant checks pass in scripts/check-phase2-assets.mjs. Source triangle budgets pass; runtime frame-rate/draw-call budgets are not certified. Unseen surfaces are inferred from the same image.
