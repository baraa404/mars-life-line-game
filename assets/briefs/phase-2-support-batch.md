# Phase 2 — dock, landing and cable assets

Completed 2026-11-12. Sole visual references are the matching PNGs in `models and assets images/phase-2/`; inspected and kept unchanged. The cable image repeats a straight-looking form, so the required 90-degree elbow is derived from the same covered-trench design.

Seven editable Kiln assets are saved in collection `project` with authoring project `mars-life-line`, then exported with the default legacy converter/editable GLB profile and optimized through the existing Meshopt pipeline. Exact IDs, revisions, source/artifact hashes and measured sizes are in `assets/reviews/phase-2-support/progress.json`.

- [pebble-dock](pebble-dock.md): `1,444` placed triangles, `37,256` optimized bytes.
- [landing-pad](landing-pad.md): `1,968` placed triangles, `27,164` optimized bytes.
- [landing-scorch](landing-scorch.md): `1,472` placed triangles, `7,268` optimized bytes.
- [landing-ship](landing-ship.md): `4,376` placed triangles, `60,876` optimized bytes.
- [cable-run-straight](cable-run-straight.md): `532` placed triangles, `16,156` optimized bytes.
- [cable-run-bend](cable-run-bend.md): `452` placed triangles, `12,500` optimized bytes.
- [cable-run-t](cable-run-t.md): `596` placed triangles, `12,096` optimized bytes.

The ship and dock preserve the supplied image proportions rather than the old catalog's tall ship/short dock dimensions. Cables preserve the chunky reference section; their older thin dimensions are superseded in the catalog. No source images were changed or borrowed from another asset.

Review sheet: `assets/reviews/phase-2-support/completed-models.png`. Browser review: run `npm run dev`, then open `/assets/reviews/phase-2-support/preview.html`; it uses the actual optimized GLBs, game AssetModel loader, Lighting and Sky. It is a review page, not a mission layout. The main game keeps terrain/geology without placed props.

Verification: `npm test` passes all 59 checks, including five new tests for these seven assets: finite grounded geometry and dimensions, populated semantic groups, texture-free scorch RGBA/alpha, footpad contact/open nozzle mouths and cable connector transforms. `npm run build` passes with the existing bundle-size warning. Targeted lint has no errors; the isolated preview entry has Fast Refresh export warnings. No performance target is certified.

The pipeline now skips global instancing for native animations and named hatch/ramp, nozzle/window, connector and charging-arm targets. This fixes the observed loss of nozzle/window/connector parents in the initial optimized derivatives. Catalog reads also allow up to 64 MiB output instead of failing at Node's 1 MiB default as saved asset records grow.

Charging behavior, animations, enterable ship cabin, cable flow/routing, terrain conformance for the scorch and final mission placements remain separate work.
