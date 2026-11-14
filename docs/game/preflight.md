# Phase 0 — Preflight record

Checked 2026-11-12. Scope: read the design, verify the existing project and add
the documentation skeleton. No gameplay, models or palette changes were made.
Existing uncommitted asset and design work was preserved. “Baseline” below means
the working tree as received, not a clean Git revision.

## Decisions and explicit deferrals

- **T-1 — pre-built work:** owner answered “1-yes” on 2026-11-12. Record as owner
  confirmation that pre-built work is allowed. This is not independent verification
  with the organisers; no external message was sent.
- **Test runner — deferred to Phase 1:** Node's built-in runner already executes
  the existing asset checks. No new dependency or `test` npm script was added.
  Choose Node or Vitest when implementing simulation tests.
- **Hosting — deferred to release preparation (Phase 20):** no provider chosen,
  account linked or deployment created.
- **T-10 rover driving — deferred before Phase 7:** the rover is currently a
  static prop. A first-person seat or PEBBLE driving still needs an owner choice.
- **Fonts and audio sources — deferred before adding those assets:** retain the
  existing system font stack. No external font or audio source was selected or
  licence claimed. Record licences and credits when files are acquired.
- **Five new tokens — deferred:** `night-sky` before Phase 5; `grow-magenta`,
  `ice-pale` and `plant-green` before Phase 6 or their first use; `aurora-violet`
  before aurora work. No new token is approved or added by this preflight.
  Follow the existing style-change workflow before use.

The owner requested completing the checklist after confirming item 1. Remaining
choices above are explicitly deferred rather than treated as approvals.
Phase 0 permits completion with recorded deferrals.

## Baseline verification

- `npm install`: exit 0; up to date, 316 packages audited. Reports four moderate
  vulnerabilities. No force upgrade or dependency change was applied;
  `package.json` and `package-lock.json` have no task diff.
- `npm run build`: exit 0 (TypeScript and production bundle). Existing warning:
  minified JS chunk approximately 3,741 kB (1,273 kB gzip), above Vite's 500 kB
  warning threshold. No chunking change is required by this phase.
- `npm run lint`: exit 0, 455 existing warnings, no errors. Most are unused
  helpers in Kiln source/revision/draft files; `Sky.tsx` has a React `use-memo`
  warning. Generated assets and unrelated source were left intact.
- `node --test scripts/check-mars-landscape.mjs scripts/check-asset-colliders.mjs
  scripts/check-phase2-assets.mjs`: **11 passed, 0 failed**. Covers terrain
  placement, deterministic scatter, compressed geometry, collision bounds,
  required asset nodes, solar materials, shelter clearance and airlock passage.
  The existing phase-2 check also refreshes `shelter-clearance.json` deterministically.
- `npm run dev -- --host 0.0.0.0`: starts successfully. Port 5173 was already
  occupied, so the verification server used **5174**. This is Vite's normal fallback.
- Browser at `http://localhost:5174/`: terrain, rover, astronaut and the 15-entry
  asset display render. Holding D moves the first-person camera sideways,
  visibly changing the view. **Keyboard walking verified.**
- Browser limitation: clicking the canvas reports `THREE.PointerLockControls:
  Unable to use Pointer Lock API` and a Chromium `UnknownError` in the in-app
  browser. **Mouse-look remains unverified in a normal desktop browser.**
  Also observed existing deprecation warnings for `THREE.Clock`, physics
  initialisation parameters and `PCFSoftShadowMap` falling back to `PCFShadowMap`.
  This preflight records the limitation; it does not claim a fully clean console.

## Asset inventory

The manifest lists 15 asset definitions. `mars-rock-kit.glb` is present and is
loaded separately by the landscape, so it is not an `asset:list` entry. Terrain
is procedural in `src/game/world/Terrain.tsx`, with geology in
`src/game/world/MarsLandscape.tsx`. The rover and astronaut GLBs are present.
This is an inventory baseline, not completion of Phase 2 layout or interaction.

Recorded `npm run asset:list` output:

```text
> mars-life-line@0.0.0 asset:list
> node scripts/asset-pipeline.mjs list

battery-bank  /models/battery-bank.glb  2884 tris  124104 B  kiln:a_e98ced26f5bf4fe1b21c08b4d9c34430@r_e3967df424964d8da20080f1bbddd15c
cable-junction  /models/cable-junction.glb  428 tris  25428 B  kiln:a_8f4acad3b6604dd4b21b8f172dceb6b8@r_e14dc5e466c941b087bf53eb97ee3eda
crate-supply  /models/crate-supply.glb  396 tris  27836 B  kiln:a_3e11361ff41a4960b2c0d009a746eaea@r_e8bb260fcc5542958b020a1ba4de3cf8
hab-airlock  /models/hab-airlock.glb  2308 tris  58604 B  kiln:a_930b7c3869f647b98d17ae24842944db@r_140f4a7ebc4542ccbbaa979c28fda128
hab-module  /models/hab-module.glb  2476 tris  54860 B  kiln:a_eb8446aacb8047a481ed1ae75623d25f@r_e75e68ff3b3246d4876f14723d3be7fa
mars-rover  /models/mars-rover.glb  2416 tris  120964 B  kiln:a_eac1488d74df494ab758c428b135bf26@r_05ff953285274000a6bbee144c793b68
mesa-cliff-overhang  /models/mesa-cliff-overhang.glb  2146 tris  123880 B  kiln:a_01cc57c733784023bad2048610c93984@r_b1998f758f8c4d668fb46e9827dc9ce8
mesa-distant  /models/mesa-distant.glb  1848 tris  63464 B  kiln:a_fd6f66376db4487b93b3509153aaac10@r_d8dbf96666dd4030a4194e9c84845aa0
ridge-horizon  /models/ridge-horizon.glb  1172 tris  36140 B  kiln:a_34796fd35fae4cd38d91ae21a57c2680@r_c95c9ffe8b2142cab26aa77fcd83a728
rock-boulders  /models/rock-boulders.glb  148 tris  12184 B  kiln:a_3b4ba2e9a9c84ce9a35d84476255224e@r_b72b8f1ec1924113b604d8669ffe5761
rock-cluster  /models/rock-cluster.glb  428 tris  36564 B  kiln:a_36c367d1881f46caa96679c5412d7f84@r_2e9a0354bf174942ad69f0720b1cbf69
rock-pebbles  /models/rock-pebbles.glb  192 tris  14840 B  kiln:a_aae06019af344b11bc390685cca7131a@r_f8124c825db64b0cb18814e1fc4d6964
solar-array-row  /models/solar-array-row.glb  4448 tris  46852 B  kiln:a_c865ca4405c94355b7d82ff82e0407c9@r_8133f738972c4ed5ba9527c804e61433
storm-shelter-module  /models/storm-shelter-module.glb  1836 tris  45384 B  kiln:a_c648370eada24991bd11591353aff813@r_d7c20e639055451bbd80f54f9bdda726
young-astronaut  /models/young-astronaut.glb  3236 tris  83732 B  kiln:a_aac4382a07df4b248de3463ab18da0ae@r_819a2302d3e94039b493787f87f8f8b1
```

## Documentation skeleton

Created [game summary](README.md), [missions](missions.md),
[simulation](../tech/sim.md), [views](../tech/views.md),
[PEBBLE](../tech/pebble.md), and [UI](../tech/ui.md).
All distinguish existing behaviour from future contracts and are linked in
[the docs index](../README.md). The [changelog](../CHANGELOG.md) and
[Phase 0 checklist](../../game-design/05-implementation-checklist.md) record this work.

## Next phase boundary

Phase 1 simulation work has not started. Confirm the test runner before adding
its tests. Revisit each deferred decision before its stated phase. A normal
browser check is still needed to close the mouse-look verification gap.

## Subsequent Phase 1 resolution

The original record above is historical. Phase 1 adopted Node's built-in test
runner and added `npm test` without a new dependency. See
[the Phase 1 verification record](phase-1-verification.md) for current behaviour.

## Font acquisition update — 2026-11-13

The Phase 3 asset request authorizes acquisition now: Nunito variable body font and
Baloo 2 variable heading font are bundled under public/fonts with their upstream
SIL OFL 1.1 licences and source/hash manifest. src/index.css uses local font faces
with swap/fallbacks. The earlier font deferral is resolved; audio remains deferred.
