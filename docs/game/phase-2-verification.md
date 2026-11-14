# Phase 2 verification — 2026-11-13

Implemented the world/base layout using existing saved/optimized models.
No source asset regeneration or new palette token was needed.

## Checks

- `npm test`: 67 tests pass in the final gate (59 prior + 8 world checks).
  World tests load the actual Meshopt GLBs and verify required placements,
  mission distances, flat pads, clear scatter/routes, batch bounds and exact
  triangle coverage, owner-preserved roofs/doors, independent dust/charge lamps,
  day/dusk/night/storm appearance and real Rapier capsule clearance on each route.
- `npm run build`: TypeScript and production bundle pass; the existing large
  chunk warning remains. `npm run lint`: no errors; existing Kiln/helper and
  Fast Refresh warnings remain. Final gates complete successfully.
- Browser: inspected the base, solar array, landing ship/pad, overhang and repair
  junction at first-person eye height. Walked up the terrain ramp into the
  shelter approach. Day/night/storm presets visibly change sky, lighting and
  haze. Panel dust and battery lamp segment logic also have direct material tests.
- Renderer: base-view submission reduced from 307 to about 189–190 draw calls,
  including shadows. Other reviewed views are lower. Foreground samples about
  52–60 fps; background throttling is ~1 fps. This is not a hardware median or
  integrated-GPU certification. Rendered triangle counters include shadows.
- The optional public Kiln `@instruktlabs/kiln/render` inspection subpath is not
  exported by the installed runtime. Integration inspection therefore uses the
  game's actual GLTFLoader/Meshopt decoder, decoded bounds, semantic-node and
  collision tests; no private engine source was consulted.

## Deliberate adjustments and gaps

- Inconsistent 80/150/40 m design distances resolved by placing the overhang
  shelter anchor 110 m north and the repair 150 m north. The ship stays 150 m east.
  The mission's repair-to-shelter escape distance remains exactly 40 m.
- Night palette derives from existing space-deep/shadow-plum tokens pending
  approval of a new night-sky token. No source token was silently approved.
- Player-scale route checks pass and browser shelter walking is verified;
  exhaustive manual traversal/mouse-look remains limited by the embedded
  browser's Pointer Lock failure.
- Integrated-GPU ≥50 fps median remains unverified. The draw-call target was
  measured in representative views, not asserted for every possible camera.
- Hab/ship interiors, airlock operation, rover driving, repair interaction,
  PEBBLE actor and Station View flows belong to later phases. Source anchors and
  static colliders are retained for those tasks. No replacement placeholders.

Coordinates, routes, intentional embedding and runtime contracts:
[world.md](../tech/world.md). Phase 1 simulation behaviour remains unchanged.

## Connected headquarters follow-up — 2026-11-13

The user requested the entire base from their hero image. `command-base` now
replaces the small hab and airlock placements, retaining both older library
assets. The new model has 8,320 placed triangles and six materials. GPU material
review and actual game/browser review passed; no console errors observed.
Two additional regression checks cover named functional owners/empty anchors
and reflected render/collider winding. All 69 tests pass. Bounds checks compare
actual transformed vertices; overlap checks refine L-shaped broad bounds to
per-part bounds. Renderer observed 205–220 calls at the base, superseding the
earlier under-200 observation for this larger model. Interiors and lighting
polish remain pending. See [asset brief](../../assets/briefs/command-base.md).
