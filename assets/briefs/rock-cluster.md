# rock-cluster — Phase 2

- Category: rock.
- Scale: 3 m composition; ground contact Y=0.
- Sole visual reference: `models and assets images/rock-cluster.webp`.
- Image review: coherent and suitable; no regeneration required.
- Traits to reproduce: One large angular boulder behind two medium stones and one small foreground rock, with sparse chips.
- Material values: existing Mars style tokens; no other image guides this asset.
- Editable source: `assets/source/phase-2/rock-cluster.kiln.js`.

## Functional requirements

Distinct named variants/composition suitable for instancing.

## Result

- Saved project asset: a_36c367d1881f46caa96679c5412d7f84 / r_2e9a0354bf174942ad69f0720b1cbf69.
- Program: p_30f1354c1b8e.
- Rendered extents X/Y/Z: 2.789 × 1.700 × 2.179 m.
- Complete source geometry: 428 placed triangles.
- Optimized game GLB: public/models/rock-cluster.glb, 36,564 bytes, 428 unique-buffer triangles. Unique-buffer counts can be lower than placed counts because instances share geometry.
- Accepted material-faithful GPU view: assets/reviews/phase-2/rock-cluster.png; camera and exact export receipt are beside it.
- Test placement: [-8, 0, 5], Y rotation 0 degrees, hull collision.
- In-game review: models loaded without browser console errors; nearby models reviewed while walking from spawn. Decorative horizon models can be occluded by the existing basin rim from the initial view.
- Required node/variant checks pass in scripts/check-phase2-assets.mjs. Source triangle budgets pass; runtime frame-rate/draw-call budgets are not certified. Unseen surfaces are inferred from the same image.
