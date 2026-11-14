# rock-boulders — Phase 2

- Category: rock.
- Scale: 4 variants, 0.8–2.5 m; ground contact Y=0.
- Sole visual reference: `models and assets images/rock-boulders.webp`.
- Image review: coherent and suitable; no regeneration required.
- Traits to reproduce: Low round slab, tall block, asymmetrical wedge and elongated low boulder; flat bases and broad irregular facets.
- Material values: existing Mars style tokens; no other image guides this asset.
- Editable source: `assets/source/phase-2/rock-boulders.kiln.js`.

## Functional requirements

Distinct named variants/composition suitable for instancing.

## Result

- Saved project asset: a_3b4ba2e9a9c84ce9a35d84476255224e / r_b72b8f1ec1924113b604d8669ffe5761.
- Program: p_2b675bc28639.
- Rendered extents X/Y/Z: 8.469 × 2.100 × 1.672 m.
- Complete source geometry: 148 placed triangles.
- Optimized game GLB: public/models/rock-boulders.glb, 12,184 bytes, 148 unique-buffer triangles. Unique-buffer counts can be lower than placed counts because instances share geometry.
- Accepted material-faithful GPU view: assets/reviews/phase-2/rock-boulders.png; camera and exact export receipt are beside it.
- Test placement: [6, 0, 5], Y rotation 0 degrees, hull collision.
- In-game review: models loaded without browser console errors; nearby models reviewed while walking from spawn. Decorative horizon models can be occluded by the existing basin rim from the initial view.
- Required node/variant checks pass in scripts/check-phase2-assets.mjs. Source triangle budgets pass; runtime frame-rate/draw-call budgets are not certified. Unseen surfaces are inferred from the same image.
