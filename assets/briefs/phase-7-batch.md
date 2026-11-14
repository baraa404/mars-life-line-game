# Phase 7 — hackathon station machines

Completed 2026-11-13 for the 7-sol outpost game ([hackathon MVP](../../docs/game/hackathon-mvp.md)).
These models replace the procedural drill rig and loose O₂ canisters at the stations,
and add a small lamp for the base avenue. Sources are in `assets/source/phase-7/`; review
renders (GPU, material-faithful) are in `assets/reviews/phase-7/`. All of them were saved to
the `mars-life-line` Kiln project and ingested with `npm run asset:ingest -- NAME --collider trimesh`.

| Asset | Kiln asset / revision | Triangles | Bounds (local) |
| --- | --- | ---: | --- |
| oxygen-maker | `a_6c5ba8de8d70417b9116c7514415ef6b` / `r_db03cccbdb524c6799b06e492f723c8b` | 2,196 | x ±0.81, z −1.49..1.3, h 1.7 m |
| ice-drill | `a_f147374b22cf4fc5baa884b56aa91069` / `r_e9bfb9ca836140ab917ecbcd11d30386` | 2,480 | x −1.41..1.61, z ±1.31, h 3.87 m |
| path-lamp | `a_9e4f5a5e4ce441aea487dd07f0243a14` / `r_2a69d504f33d4aefa95fb729676157f8` | 296 | post 0.76 m |
| water-recycler | `a_cfeafd320f444aabb4dbed821c7b56b0` / `r_afe908567c164a1b8fc0fd65e753a1ae` | 3,128 | x −0.76..0.75, z −0.86..0.89, h 1.8 m |

## Per-asset intent

- **oxygen-maker**: ivory cabinet with an intake grille, orange service panel, top fan,
  a water inlet on −Z and two O₂ tanks on +Z. The status-lamp housing has its lens at
  local (0.4, 1.66, −0.98); `Stations.tsx` places an emissive lens there that turns
  plant-green while the machine runs. Front is +X.
- **ice-drill**: tripod derrick with motor head, drill string at local x 0.45, water tank
  at the back, pump and hoses. Ice mounds are added by `Stations.tsx` around the bit.
- **path-lamp**: short post with amber light strips on ±X, instanced along the walkways.
- **water-recycler**: ivory filter cabinet on a slate skid, glass water tank on −Z with
  a pale water column and cyan level line, pump on +Z, two outlet pipes dropping off the
  back (−X) to ground flanges. The orange front panel holds the `filter_socket` (dark
  recess ø 0.22 m, face centre local (0.692, 1.0, 0.25), facing +X) where the player
  inserts a cartridge. The `status_lamp` housing ships a neutral lens centred at local
  (0.69, 1.40, 0.50) (front face x 0.70, r 0.065) for the game to light. Front is +X.
  Brief: [water-recycler.md](water-recycler.md).

Style: header `assets/style/mars-style.header.kiln.js`; colours and materials from the
style tokens only. Review: silhouettes read at Station View distance; no floating parts;
bases rest on the ground plane.
