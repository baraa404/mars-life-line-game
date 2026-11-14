# Rendering: Three.js, React Three Fiber, Drei

| Package | Version | Role |
| --- | --- | --- |
| `three` | 0.187 | Renderer, materials, lights |
| `@react-three/fiber` | 9.8 | React renderer for Three.js (requires React ≥19 <19.4) |
| `@react-three/drei` | 10.7 | Helpers: `useGLTF`, `KeyboardControls`, `Html`, `Stats` |

## Canvas and world

`Game.tsx` mounts Simulation → Sky → Lighting → Physics (Terrain, MarsLandscape,
BaseSite, Hab, Player and actors) → shared first-person and Station View camera control. Shadows use one directional light, dpr 1–2
and ACES exposure from tokens. BaseSite uses explicit mission placements, not
AssetGallery's automatic library row. See [world.md](world.md) for coordinates.

## Simulation appearance

`appearance.ts` derives sun position, warm dusk key, daylight/night fill,
background/sky gradient and opacity-dependent fog from simulation snapshots.
`Lighting` updates Three light refs; `Sky` updates a small gradient shader and
fog without rebuilding geometry. Colours come from the shared tokens.
Night temporarily derives from space-deep/shadow-plum pending token approval.
Development world-review presets override appearance only; production follows
live simulation state. The previous Leva lighting tuners were replaced by these
simulation bindings.

`siteModel.ts` decodes normalized geometry and instances before batching static
meshes by material within motion/visibility owners. Roofs, hatch/ramp/lid groups,
panels and charge_bar stay independent. Cached GLB buffers/materials remain
unchanged. Instance-owned cell material colours follow `panelDust`; nine lamp
materials follow battery fraction. Source anchors remain queryable. Animated
assets should use AssetModel; this static batch helper does not play clips.

Cast-shadow policy retains large body surfaces while avoiding per-trim/lamp
shadow submissions. Cable straight spans are instanced; bends/tees are batched.
`WorldDiagnostics` publishes renderer calls/triangles and sampled FPS once per
second in development. Counts include shadow passes and do not certify hardware.

## Loading assets (`src/game/assets/`)

- `AssetModel` uses drei `useGLTF`, which registers the Meshopt decoder by default.
- Each placement is a deep clone with shadows enabled.
- `AssetModel` plays a clip named `Friendly_Wave` when present, using an independent
  Three.js animation mixer per clone. Effect cleanup stops and uncaches actions so
  development StrictMode and remounts restart correctly. Assets without that clip stay static.
- `AssetGallery` places each manifest entry inside a fixed Rapier body and generates
  explicit Float32 colliders from normalized vertices and per-instance transforms.
  Visual geometry remains quantized; static assets can be GPU-instanced. The optimizer
  skips GPU instancing for animated models and named hatch/ramp, nozzle/window,
  connector, charging-arm, roof, door-leaf, dish and antenna targets, preserving their independently addressable hierarchy. Empty functional anchors survive pruning.
- Static batching and triangle colliders reverse triangle winding for reflected transforms,
  preserving outward faces without modifying the cached source buffers.
- `assetManifest.json` is written by `scripts/asset-pipeline.mjs`.

## Landscape

`MarsLandscape` loads the saved five-shape rock kit directly (not as a gallery entry),
decodes compressed positions before baking transforms, and builds ten stone instance
batches sharing one vertex-colour matte material. Tiny stones receive shadows but do
not cast them; larger rocks and the 15 irregular formations cast/receive shadows.
`Terrain` adds continuous vertex mottling and low-contrast procedural sand relief.
All palette colours, roughness and metalness come from the existing style tokens.

Mountain normals retain 65% face direction and 35% shared-vertex direction, keeping
reference-style facets with softened edges. Slopes use continuous token colours and
subdued strata; separate scattered stones retain flat face normals.
