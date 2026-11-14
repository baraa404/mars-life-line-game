# Mars landscape and rock kit

Request: enrich the Mars terrain, scattered objects and mountains using the approved visual style.

References: `docs/style/references/01-hero-scene.png`, `references/generated/g04-terrain-variety.jpg`, `references/crops/environment-board.png`. Preserve smooth matte dusty ground, irregular flat-base faceted rocks, terracotta/ochre strata, broad flat-topped mesas and peach atmospheric depth.

Kiln kit: five reusable irregular stone shapes, up to 400 triangles each; shared matte-environment palette. Save in project collection under mars-life-line. Scene layout, terrain height field, erosion, scatter and collision belong in the runtime. Retain rover and astronaut placements and an open approach from spawn.

Runtime targets: deterministic clustered instancing, pebble/stone/boulder size variation, low rocky shelves, large layered mesas, distant ridges, crater rims, shallow washes and subtle wind-ripple bump detail. No vegetation or detailed photorealistic rock textures. Collide with terrain and major obstacles; small pebbles remain decorative.

## Result

Concepts approved explicitly before implementation: `assets/concepts/mars-landscape-concept-01.png` and `assets/concepts/mars-terrain-details-01.png`.

- Rock kit: programRef `p_2ab8c149e425`, saved collection `project`, asset `a_9041bfc9b7bc436eae64c882e1527190`, revision `r_e3274a234225415ea85c84c7dd6eb011`. Five irregular flat-base variants, 276 total source triangles. Canonical source `assets/source/mars-rock-kit.kiln.js`; exact export `assets/exports/mars-rock-kit-raw.glb`; optimized runtime kit `public/models/mars-rock-kit.glb`, 14,564 bytes.
- Kit GPU fidelity and accepted export QA: `assets/reviews/mars-rock-kit-render.json`; sheet `mars-rock-kit.png`. Separated pieces intentionally do not touch; the connectivity warning concerns the preview lineup, not failed ground contact.
- Runtime: 360 m, 240×240 terrain cells, four craters, shallow wash and neutral wind-ripple detail. Seven mesas and eight shelves use irregular eroded height fields with broad caps, changing strata counts, gulches and fractured top surfaces. This replaces the first blocky layered implementation after user feedback.
- Scatter: 4,674 stones, 690 at least 0.72 m wide. Ten instanced groups, five shared geometries and one shared matte vertex-colour material. Cliff-toe scree, varied sizes/proportions, foreground clusters and clear asset/landing areas. Major stones and formations share one exact static collision mesh; small gravel has no collision.
- Preserved the existing asset transforms and 16 m flat pad. Spawn moved from Z=8 to Z=14 to show the landscape around the display.
- Checked in the actual browser and compared the evolving silhouette/ground against the approved images. Broad top surfaces, broken rock, wind-shaped ground, varied cliff profiles and peach atmospheric depth match the intended direction. This is a procedural interpretation of the composition, not an exact reconstruction of every reference rock.
- In-game review image: `assets/reviews/mars-landscape-in-game.jpg`.
- Six focused ground/mesh/collision regressions pass, including the existing rover checks. Production build passes. Targeted lint has no errors; Player has its existing mixed-export Fast Refresh warning.
- Limits: finite landscape; no physical sand, detailed microscopic pits, dust simulation, rover tracks, exhaustive traversal testing or established frame-rate target. Individual summit caps and every possible traversable seam have not been visually qualified.


## Terrain refinement — 2026-11-12

The user requested smoother mountains, natural placement and hills, then rejected the
fully smoothed draft. The final pass follows only `models and assets images/mesa-distant.webp`
and `ridge-horizon.png`: retain angular rock planes and ledges with modest edge smoothing.
Seven lower, broader mesas sit along northern/western high ground beyond 75 m; an open
south-east and six physical foothills replace the uniform ring. Eight low shelves bridge
the scale from stones to distant cliffs. Flat landing ground, deterministic scatter and
shared mesh/collider heights remain intact. No saved GLBs were changed.

Review: `assets/reviews/mars-landscape-refined.png`, checked in the browser with no console
errors. Five landscape regressions and two existing asset collision checks pass; build
and lint pass (existing repository warnings remain). Full mission/base layout and
exhaustive traversal remain separate work.
