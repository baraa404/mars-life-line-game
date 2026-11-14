# ridge-horizon — Phase 2

- Category: building.
- Scale: 140 m wide; ground contact Y=0.
- Sole visual reference: `models and assets images/ridge-horizon.webp`.
- Image review: coherent and suitable; no regeneration required.
- Traits to reproduce: Continuous flat-topped fractured ridge, alternating vertical gullies, angular toe slopes.
- Material values: existing Mars style tokens; no other image guides this asset.
- Editable source: `assets/source/phase-2/ridge-horizon.kiln.js`.

## Functional requirements

Distinct named variants/composition suitable for instancing.

## Result

- Saved project asset: a_34796fd35fae4cd38d91ae21a57c2680 / r_c95c9ffe8b2142cab26aa77fcd83a728.
- Program: p_22722ce87cb7.
- Rendered extents X/Y/Z: 140.000 × 20.299 × 37.579 m.
- Complete source geometry: 1,172 placed triangles.
- Optimized game GLB: public/models/ridge-horizon.glb, 36,140 bytes, 1,172 unique-buffer triangles. Unique-buffer counts can be lower than placed counts because instances share geometry.
- Accepted material-faithful GPU view: assets/reviews/phase-2/ridge-horizon.png; camera and exact export receipt are beside it.
- Test placement: [0, 6, -205], Y rotation 0 degrees, none collision.
- In-game review: models loaded without browser console errors; nearby models reviewed while walking from spawn. Decorative horizon models can be occluded by the existing basin rim from the initial view.
- Required node/variant checks pass in scripts/check-phase2-assets.mjs. Source triangle budgets pass; runtime frame-rate/draw-call budgets are not certified. Unseen surfaces are inferred from the same image.
