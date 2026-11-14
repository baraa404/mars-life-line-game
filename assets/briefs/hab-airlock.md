# hab-airlock — Phase 2

- Category: building.
- Scale: 3 × 3.2 × 3 m; ground contact Y=0.
- Sole visual reference: `models and assets images/hab-airlock.webp`.
- Image review: coherent and suitable; no regeneration required.
- Traits to reproduce: Chunky square octagonal chamber; thick stepped slate portal, recessed amber octagonal outline, split grey doors, ivory entry steps, orange side armor, side window, low roof cap and cyan light.
- Material values: existing Mars style tokens; no other image guides this asset.
- Editable source: `assets/source/phase-2/hab-airlock.kiln.js`.

## Functional requirements

Separate roof, info_anchor, outer_hatch and inner_hatch; two leaves per hatch; real chamber opening. Gameplay hatch movement is separate work.

## Result

- Saved project asset: a_930b7c3869f647b98d17ae24842944db / r_140f4a7ebc4542ccbbaa979c28fda128.
- Program: p_1f27f196180b.
- Rendered extents X/Y/Z: 3.590 × 3.295 × 3.055 m.
- Complete source geometry: 2,436 placed triangles.
- Optimized game GLB: public/models/hab-airlock.glb, 58,604 bytes, 2,308 unique-buffer triangles. Unique-buffer counts can be lower than placed counts because instances share geometry.
- Accepted material-faithful GPU view: assets/reviews/phase-2/hab-airlock.png; camera and exact export receipt are beside it.
- Test placement: [-1.6, 0, -5], Y rotation 0 degrees, trimesh collision.
- In-game review: models loaded without browser console errors; nearby models reviewed while walking from spawn. Decorative horizon models can be occluded by the existing basin rim from the initial view.
- Both hatches and their leaves survive optimization. The pressure-shell passage is clear behind the separate hatch assemblies. Hatch movement and interior transitions remain gameplay work.
- Required node/variant checks pass in scripts/check-phase2-assets.mjs. Source triangle budgets pass; runtime frame-rate/draw-call budgets are not certified. Unseen surfaces are inferred from the same image.
