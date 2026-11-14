# Phase 2 — Life Line Station

The game now mounts `BaseSite` with the saved Phase 2 models, preserving the
360 m terrain, seven distant natural mesas, eight shelves and instanced rock kit.
`AssetGallery` remains an optional library display; the game uses deliberate
mission placements from `src/game/world/siteLayout.ts`. The connected command-base was authored from the user’s hero reference and
ingested through the pipeline; previous library models are preserved.

## Coordinates and layout

Metres, +Y up, +X east, −Z north; rotations are degrees around Y. Model scale is
1 throughout. `siteLayout.ts` is authoritative; Y is sampled from the same
triangle-interpolated terrain used by physics, plus the listed offset.

The hackathon layout is organised around one **avenue**, a paved east–west street at
Z 10.5 (`AVENUE_Z`) in front of the hab door. Every station's working side (+X of the
model, rotation −90 faces south toward the avenue) opens onto it, so the player walks
one straight street instead of crossing open ground. Residential/life support sits
west of the door, industry (ice, rover, supplies) east and south, power north-east.

| Instance | Model | X | Z | Y offset | Rotation Y |
| --- | --- | ---: | ---: | ---: | ---: |
| Headquarters | command-base | 0 | 0 | 0 | −90 |
| Greenhouse | greenhouse-dome | −13.5 | 5.8 | 0 | −90 |
| Storm shelter | storm-shelter-module | −7.5 | 6.5 | 0 | −90 |
| Oxygen maker | oxygen-maker | 6.2 | 6.6 | 0 | −90 |
| Water recycler | water-recycler | 2.5 | 14.3 | 0 | 90 |
| Ice drill | ice-drill | 8 | 14.5 | 0 | 90 |
| Ice rocks | rock-cluster | 12.5 | 17 | 0 | 40 |
| Parked rover | mars-rover | 14 | 13 | 0 | 90 |
| Supply crates | crate-supply | −4.5, −2.2 | 14.2, 14.4 | 0 | 0, 8 |
| Solar rows 1–4 | solar-array-row | 19, 23, 27, 31 | −10 | 0 | 180 |
| Battery | battery-bank | 15.5 | −15 | 0 | −90 |
| PEBBLE dock | pebble-dock | 5 | 1.5 | 0 | 90 |
| Comms dish | comms-dish | 14.5 | 1.5 | 0 | −90 |
| Landing pad / scorch / ship | landing-* | 50 | 0 | as before | as before |
| Horizon mesas | mesa-distant | −110 | −255 | absolute Y 3 | 20 |
| Horizon ridge | ridge-horizon | 110 | −235 | absolute Y 4 | −20 |

`placementPoint(id, [x, y, z])` converts a model-local point to world space;
`STATION_POINTS` uses it so interaction points stay at each machine's front even if a
placement moves. `Walkways.tsx` draws one merged paving mesh (ship road, avenue, the
link from the road to the avenue, the door apron, solar and comms spurs) and instances
`path-lamp` in pairs along the ship road and at a few avenue points. The overhang and
repair junction are no longer placed; the section below is kept as Phase 2 history.

**Story props** ([Mission Critical](../game/mission-critical.md)): `storyLayout.ts` holds every
story interaction point, and `StoryWorld.tsx` draws the small procedural props and registers
the targets. The backup breaker stands in front of the battery (15.5, −13.6); the filter rack
is beside the supply crates (−3.35, 13.1). The water recycler's front (+X, facing north toward
the hab) has the filter socket at local (0.69, 1.0, 0.25) and the status lamp at
(0.69, 1.40, 0.50); the start lever stands at local (0.95, 0, −0.55). The greenhouse is
entered in place: the door teleports the player to local (1.7, 0.48, 0) inside the dome, the
area stays `outside`, and "inside" means within 2.75 m of the dome centre. Inside, the
dome's three built-in trays carry the crops, the valve and light switch stand at local
(1.55, 0.48, 2.1) and the priority board at (1.55, 0.48, −2.1). The dome's own foliage mesh
is hidden and its magenta grow-light mesh shows only while the lights are on. Station labels
are hidden while the player is inside the greenhouse.

The headquarters is one connected exterior with an octagonal entrance, long west
wing, rooftop dish and twin towers. Older hab/airlock models stay in the library.
Its local bounds are 11.9675 × 13.13 × 20.931923 m, rotated −90° for a south-facing
entrance. The Phase 3 hab and staged airlock are described in [views.md](views.md). The young
astronaut marks your position in Station View. Rocks use the existing five-variant instanced terrain kit rather
than displaying separate library variant sheets in the yard.

### Inconsistent design distances

Part 3 §6 originally put the cliff 80 m north, the repair 150 m from the hab,
and the repair 40 m from the overhang. These cannot all hold in Euclidean space:
80 + 40 < 150. This layout prioritises the mission's 150 m repair/40 m shelter
escape distances: `shelter_zone` is at (0, −110), repair at (0, −150). The compact
cliff shell sits at Z −110.33 because its anchor is local X +0.33. The 80 m
cliff estimate is superseded for the playable overhang; it is a documented
layout adjustment, not a silently altered scale.

## Ground and access

`siteHeight` flattens actual terrain vertices beneath the base, landing area,
overhang and junction. Smooth 14–20 m feather bands keep the surrounding hills.
A 0.615 m terrain ramp meets the overhang floor. Its model's base is positioned
against the pre-ramp datum so the floor is not lifted twice. The landing pad is
partly embedded to leave a walkable 0.11 m edge; ship footpads sit on that deck.
Scorch alpha is retained above the deck and has no collision.

`SITE_ROUTES` defines clear corridors from the yard to the ship, array, overhang
and repair spot. The repair route goes beside the overhang, through a gap between
the northern mesas. Two northern formations and one foothill were repositioned
to keep this corridor clear; major mesa edges remain beyond 75 m.
Rock exclusion includes pad footprints and route widths with extra clearance;
the deterministic remaining scatter stays GPU-instanced. The number is derived
at runtime, not hard-coded in documentation. Natural mesas/shelves retain their
actual triangle collision, and the terrain collision uses the rendered grid.

## Cables and colliders

`CABLE_ROUTES` stores control points for the power trunk (hab → battery at the array's
west end → panels), the four array feeds, the PEBBLE dock (ending at the dock's back),
and two short utility trenches: `water-line` from the ice drill to the oxygen maker
and `oxygen-line` from the oxygen maker into the hab. There are no above-ground pipes. `cablePaths.ts` turns them into named CatmullRomCurve3
splines used by the animated Station View power flows.
Cable beds are graded into the same terrain grid with blended margins.
Straight covers are instanced with length fitting; bends and tees use the saved
matching GLBs at the actual corners/branches. Straight spans trim to connector
positions. Trenches are buried 0.18 m and deliberately nonblocking. Scorch and
distant horizon decorations also have no collider. Each other site model has
one fixed Rapier triangle-mesh collider, decoded through the existing normalized
vertex/instance-transform helper. Closed doors remain solid; no enterable hab
or ship cabin is claimed at this phase.

## Materials, light and performance

See [rendering.md](rendering.md). Sun angle/intensity/colour, sky gradient and
fog read the simulation clock/opacity. Panel cell colours read panel dust;
the nine battery lamp materials read battery fraction. Instance material copies
prevent shared-cache mutation. Night uses existing space-deep/shadow-plum tokens
as a temporary derived palette; the new night-sky token remains unapproved.

Static meshes batch by material **within** semantic roof/hatch/ramp/lid/panel
owners, preserving future cutaway and movement. Geometry is decoded before
baking, including Meshopt integer normalisation and instance transforms.
Large body surfaces cast shadows; small trim, lamps and solar microgeometry do
not, reducing render-pass submission cost. The sources remain unchanged.

Development backquote → **World review** exposes day/dusk/night/storm previews,
destination visits and renderer counters. Previews do not alter/save the sim;
production always uses live state. Visits use the real player rigid body.

Original small-hab base view: about 189–190 draw calls including shadow passes, versus
307 before batching/shadow policy; array/landing/shelter views are lower.
The larger headquarters was observed at about 205–220 calls; the earlier
under-200 result does not apply to this new model. Foreground browser samples were about 52–60 fps, but this is **not integrated-GPU
qualification**. Hidden browser tabs throttle to ~1 fps and compilation produces
outliers. Hardware median FPS remains a recorded acceptance gap; no claim is
made for every device or camera. Counters report submitted triangles including
shadows (~500k at the base), not unique visible triangles or the Phase 19 budget.

## Verification and limits

`npm test` includes world layout, exact batch bounds/triangles, semantic-owner
visibility, immutable material bindings, day/night/storm formula checks and
Rapier capsule checks along the full route centres against terrain, formations
and all solid placed models. Physical route endpoints stop beside machines.
Browser checks cover base/array/ship/overhang/junction views and walking up the
shelter ramp. The in-app browser still limits pointer-lock mouse-look; exhaustive
manual traversal and integrated-GPU performance remain explicitly unqualified.

Evidence and remaining gaps: [Phase 2 verification](../game/phase-2-verification.md).
Connected headquarters: [brief and review](../../assets/briefs/command-base.md).
Asset provenance: [main batch](../../assets/briefs/phase-2-batch.md),
[support batch](../../assets/briefs/phase-2-support-batch.md),
[battery](../../assets/briefs/battery-bank.md),
[landscape](../../assets/briefs/mars-landscape.md),
[rover](../../assets/briefs/mars-rover.md).
