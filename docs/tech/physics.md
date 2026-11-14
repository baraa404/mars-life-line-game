# Physics: Rapier (`@react-three/rapier` 2.2)

- `<Physics gravity={[0, MARS_GRAVITY, 0]}>` with `MARS_GRAVITY = -3.71` m/s² (`src/game/Game.tsx`).
- Fixed 60 Hz step (library default).
- Toggle collider wireframes with **Shift+P** in development (`useWorldStore.physicsDebug`).

## Colliders

| Body | Collider |
| --- | --- |
| Terrain | `TrimeshCollider` built from the same indexed height grid as the visual mesh |
| Landscape | One fixed `TrimeshCollider` from the actual eroded formations and stones ≥0.72 m wide; small gravel is decorative |
| Ingested assets | Fixed `RigidBody` with explicit colliders from decoded geometry; policy from manifest `placement.collider` (default `hull`) |
| Player | Ecctrl capsule (see `player.md`) |

Choosing an asset collider: `hull` for compact props, `cuboid` for boxy ones, `trimesh`
when you must walk into/under it (exact but heavier), `none` for decoration.
Set with `npm run asset:ingest -- "<name>" --collider trimesh`.

`terrainHeight(x, z)` in `src/game/world/landscape.ts` defines the terrain grid;
`surfaceHeight(x, z)` interpolates its actual triangles and is used for grounding
scatter. The landing pad stays at Y=0. The player spawns on the hab floor. The staged airlock has a separate collision enclosure. The interaction ray and PEBBLE steering query fixed colliders.

## Compressed and instanced models

`src/game/assets/colliders.ts` reads normalized positions through Three.js accessors,
converts them to Float32 and bakes the node and per-instance transforms into asset-local
vertices. `AssetGallery` builds explicit convex hulls/trimeshes or per-part AABB cuboids.
This avoids passing quantized integer buffers into Rapier and gives every GPU instance
its own collision shape. Visual meshes keep their compressed/instanced rendering path.
`none` skips both collision generation and the fixed body.

Regression check: `node --test scripts/check-asset-colliders.mjs` tests normalized vertices,
nested/instance transforms, and the real compressed rover GLB.

`node --test scripts/check-mars-landscape.mjs` also verifies triangle-interpolated
ground contact, the clear asset/spawn areas, deterministic scatter, decoded Kiln stone
geometry, broad mesa caps and valid geology collision indices.
