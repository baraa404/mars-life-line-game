# Asset brief: Water recycler

- **Id:** `water-recycler`
- **Request:** "A compact Mars-base WATER RECYCLER station machine (the station's water recovery system; it filters used water back to drinkable water). Ivory/structure-white cabinet body with a large vertical clear-ish water tank cylinder showing a pale blue water level, a front (+X) service panel in accent orange with a round FILTER HOUSING socket (~0.22 m) where the player inserts a filter cartridge, a small status lamp housing on the front face whose lens the game lights, pipes leaving the back (−X) toward the ground, and a small pump on one side. Chunky, stylized, low-poly faceted like the oxygen maker."
- **Category:** medium-prop (same budget as the oxygen maker)
- **Triangle budget (LOD0):** 6,000 declared; target ~2–3k to match `oxygen-maker`
- **Overall size (m):** fits x ±0.8, z ±0.9, height 1.6–1.9; rests on Y = 0, faces +X
- **User references:** none; the request text defines the parts
- **Style reference (required):** sibling `assets/source/phase-7/oxygen-maker.kiln.js` and its review `assets/reviews/phase-7/oxygen-maker-v1.png`; `docs/style/references/01-hero-scene.png`
- **Traits to copy from it:** slate skid with dark feet; ivory chamfered cabinet wrapped by grey top/bottom bands and grey corner posts; large orange octagonal service panel on the front; grey cage and orange band on the tank; grey pipe runs with orange collars and flanges
- **Colour blocking target:** ivory ~45 %, grey ~30 %, orange ~12 %, dark trim ~8 %, pale water/cyan level ~5 %

## Parts

| Part | Shape | Material role | Notes |
| --- | --- | --- | --- |
| Skid + feet | chamfered slab, two feet | smooth-structure:structure-gray, dark-trim | x −0.55..0.72, z ±0.86 |
| Filter cabinet | chamfered box, wrap bands, corner posts | smooth-structure (+ grey) | x −0.45..0.6, z −0.1..0.62, top y 1.54 |
| Service panel | octagonal plate on +X face | accent-paint | centred on the filter socket |
| Filter socket (`filter_socket`) | grey collar, dark round recess, 4 bolts | structure-gray, dark-trim | recess ø 0.22 m, centre (0.656, 1.0, 0.25), face x 0.692, faces +X |
| Intake grille | dark recess + grey slats | dark-trim, structure-gray | below the socket |
| Status lamp (`status_lamp`) | grey housing + hood, neutral lens disc | structure-gray, dark-trim | lens centre (0.69, 1.40, 0.50), r 0.065, front face x 0.70, faces +X; game lights it |
| Water tank (`water_tank`) | glass cylinder, water column, cyan surface, dark standpipe, ivory dome, orange band, grey cage | glass, `water:ice-pale`, `water:accent-cyan`, dark-trim | centre (0.04, z −0.45), r 0.31, water level y ≈ 1.10 |
| Clean water line | tube tank cap → cabinet top | structure-gray | |
| Back outlet pipes | two tubes off −X face down to ground flanges | structure-gray, accent-paint | flanges at x −0.68 rest on Y = 0 |
| Pump (`pump`) | horizontal motor, ribs, orange volute and end cap, feed line into cabinet side | smooth-structure, accent-paint | on the +Z end |
| Top vent + spare cartridges | grey box with dark slots, two orange cartridges | structure-gray, accent-paint | |

## Functional requirements

- Player interacts from +X: the filter socket recess faces +X at local (0.692, 1.0, 0.25).
- The game places/lights an emissive lens over `Status lamp lens` at local (0.69, 1.40, 0.50); the model ships it neutral (dark trim).
- Footprint stays within x ±0.8, z ±0.9; base on Y = 0.

## Style notes

Water uses two non-token roles built from palette tokens only: `water:ice-pale` (opaque column, roughness 0.25) and `water:accent-cyan` (thin surface disc) so the level reads through the warm `glass` shell.

## Result (filled in after saving)

- **Kiln asset / revision:** `a_cfeafd320f444aabb4dbed821c7b56b0` / `r_afe908567c164a1b8fc0fd65e753a1ae` (program `p_35aef3efa0ef`, collection `project`, project `mars-life-line`)
- **Measured size / triangles:** bounds x −0.761..0.745, y 0..1.800, z −0.860..0.890; 3,128 triangles, 22 meshes, 7 distinct materials; Kiln QA accepted, budget pass
- **Game id:** `water-recycler` (`npm run asset:ingest -- water-recycler --collider trimesh`); `public/models/water-recycler.glb`, 68,060 bytes, 3,128 tris; not placed (`position: null`)
- **Side-by-side review:** `assets/reviews/phase-7/water-recycler.png` (GPU, material-faithful, front-right and front-left 3/4) vs `assets/reviews/phase-7/oxygen-maker-v1.png`. Matched: skid, grey wrap bands and corner posts, orange front panel, grey tank cage with orange band, pipe collars. The first draft's water level did not read against the empty glass; a cyan surface disc and a dark standpipe fixed it.
- **Known limitations:** the socket is a flat dark disc 2 mm proud of its collar (reads as a hole, no real cavity); the water column is opaque.
