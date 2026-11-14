# Asset brief: Mars Rover

- **Id:** `mars-rover`
- **Request:** "okay can u make the rover and put it in the game to see it also show me it in the game"
- **Category:** vehicle
- **Triangle budget (LOD0):** 3,000–9,000
- **Overall size target (m):** approximately 4.5 long × 2.6 high (antenna included) × 2.4 wide; rests at Y=0; +X forward
- **User references:** approved Mars game style references
- **Style reference:** `docs/style/references/crops/vehicles.png`, `vehicles-hero.png`, and full `01-hero-scene.png`
- **Traits to copy:** six fat treaded wheels, orange inset hubs; wedge-front ivory body and thick slate fenders; sloped navy windshield; recessed amber headlights; cyan roof bar, roof cargo, short antenna
- **Colour blocking:** ~45% ivory, ~25% slate chassis/frames, ~10% orange hubs/panels, ~20% dark tyres and windows; rare cyan light

## Parts

| Part | Shape | Material role | Notes |
| --- | --- | --- | --- |
| Hull/cabin | Faceted chamfered wedge and rear capsule block | smooth-structure | Neutral ivory, layered silhouette |
| Chassis/fenders | Heavy chamfered blocks and angular open arches | smooth-structure:structure-gray | Preserve wheel clearance |
| Wheels | Six broad low-poly tyres, raised block treads, nested rim/hub discs | dark-trim, smooth-structure, accent-paint | Three axles, solid ground contact |
| Windows | Sloped opaque windshield and two side windows | visor | Dark opaque navy, fitted to hull |
| Lamps | Recessed front strip/blocks, small roof bar | emissive-warm, emissive-cool | Small controlled emissives |
| Roof/side details | Cargo blocks, rail feet, side hatch, orange panel, antenna | style roles | Restrained detail density |

## Functional requirements

Static, parked display asset. Walk-around collision; no driving controls, wheel animation,
interior, opening doors or vehicle simulation requested. Named wheel assemblies remain
editable. Place on the flat test pad with a 3/4 presentation toward the spawn point.

## Result

- **Program:** `p_6fb31ca31b32`; initial draft is `p_abe04647ca38`.
- **Kiln collection / asset / revision:** `project` / `a_eac1488d74df494ab758c428b135bf26` / `r_05ff953285274000a6bbee144c793b68`.
- **Source:** `assets/source/mars-rover-final.kiln.js`, exact SHA-256 `6fb31ca31b32912a298df31babc075a94a06dfd1dceb397ae63eb8c0f9957aa0`. Initial draft retained under `assets/source/drafts/`.
- **Dimensions (L × H × W):** 4.4915 × 2.63 × 2.433 m, min Y = 0.
- **Geometry:** 7,252 total placed triangles, under 9,000 budget. 7 materials. GPU-instanced derivative has 48 visual mesh submissions before shadows, 193 placed parts, 120,964 bytes (canonical GLB 195,440 bytes).
- **Game id / placement:** `mars-rover`; origin `(0,0,0)`, Y rotation −55°, scale 1, fixed convex-hull collision per part.
- **GPU review:** front/side/rear/front-3/4 views, `materialFaithful: true`. Matched the six large treaded wheels, sloped dark windshield, broad ivory chamfers, thick slate arches, orange hubs/panels and small cyan roof lamp. No new reference image was needed.
- **Targeted interfaces:** front wheel/fender gap 0.023003 m on both sides. Both cargo boxes contact rack surfaces; front axle/rim and windshield/frame contacts measured. Zero distance indicates contact/crossing, not mechanical fit strength.
- **Preservation:** refinement saved 3,072 triangles via tread simplification and lowered cargo; total measured dimensions unchanged. Geometry changes were intentional. No animation was authored.
- **Destination check:** actual Meshopt GLB loaded in the browser, materials and six wheels visible, ground contact/shadow reviewed, player walked up to and along the fixed body. No runtime errors after the collision fix. Screenshot: `assets/reviews/mars-rover-in-game.jpg`.
- **Integration repair:** compressed normalized integer positions initially crashed Rapier's automatic hulls. The collision builder now decodes Float32 vertices and bakes every GPU instance transform; rendering stays compressed/instanced. Regression tests cover this fixture and all 193 real rover parts.
- **Validation:** `node --test scripts/check-asset-colliders.mjs` (2 pass), `npm run build` (pass), `npm run lint` (warnings only), `git diff --check` (pass).
- **Known limitations:** static prop, no driving/interior/wheel animation; game bloom is not implemented. Intentional nested solid/detail overlaps remain; general Kiln overlap coverage is partial (64/588 candidate pairs), not a full mechanical or motion audit. Manifest statistics currently count 2,416 unique mesh-buffer triangles rather than instance-weighted geometry.
