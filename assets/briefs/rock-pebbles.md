# rock-pebbles — Phase 2

- Category: rock.
- Scale: 5 variants, 0.1–0.3 m; ground contact Y=0.
- Sole visual reference: `models and assets images/rock-pebbles.webp`.
- Image review: coherent and suitable; no regeneration required.
- Traits to reproduce: Five distinct squashed, flat-bottomed angular stones; broad terracotta facets.
- Material values: existing Mars style tokens; no other image guides this asset.
- Editable source: `assets/source/phase-2/rock-pebbles.kiln.js`.

## Functional requirements

Distinct named variants/composition suitable for instancing.

## Result

- Saved project asset: a_aae06019af344b11bc390685cca7131a / r_f8124c825db64b0cb18814e1fc4d6964.
- Program: p_e77552f628a5.
- Rendered extents X/Y/Z: 0.713 × 0.180 × 0.541 m.
- Complete source geometry: 192 placed triangles.
- Optimized game GLB: public/models/rock-pebbles.glb, 14,840 bytes, 192 unique-buffer triangles. Unique-buffer counts can be lower than placed counts because instances share geometry.
- Accepted material-faithful GPU view: assets/reviews/phase-2/rock-pebbles.png; camera and exact export receipt are beside it.
- Test placement: [-3, 0, 9], Y rotation 0 degrees, none collision.
- In-game review: models loaded without browser console errors; nearby models reviewed while walking from spawn. Decorative horizon models can be occluded by the existing basin rim from the initial view.
- Required node/variant checks pass in scripts/check-phase2-assets.mjs. Source triangle budgets pass; runtime frame-rate/draw-call budgets are not certified. Unseen surfaces are inferred from the same image.
