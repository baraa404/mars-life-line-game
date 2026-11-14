# Phase 1 verification — 2026-11-12

## Delivered scope

Pure TypeScript simulation core, deterministic command queue, all Phase 1
subsystems, time jumps and decision interruption, persistence/checkpoints,
replay, mission store/ref bridge and production-excluded development diagnostics.
Node's built-in test runner uses existing dependencies.

The displayed `AssetGallery` was unmounted at the owner's request. Models,
manifest, sources and saved revisions are preserved; terrain and its natural
geology/rock kit remain. No Phase 2 base placement or Phase 3 gameplay HUD was
introduced. The simulated hab is a virtual state, not a placed building.

## Automated evidence

- `npm test`: **53 passed, 0 failed**, including all 11 pre-existing terrain,
  collision and phase-2 asset checks. Tests cover each subsystem, deterministic
  replay with seeded event decks, finite/nonnegative stocks, conservation with
  efficiency/spill, priority shedding, locked Life Support, sleep/resource
  equivalence, card wake-ups, pause, waits/skips, autosaves, checkpoint limits,
  reload/rewind and malformed/unsupported storage. The suite also executes a
  full 60-sol dummy-policy run with invariants at every minute.
- `npm run sim:check`: seeds **1, 42, 2026**, **86,400 steps each**, all complete.
  The deliberately minimal policy eventually depletes stocks; this is a
  stability proof, not a campaign-survival or Phase 19 balance claim.
- `npm run build`: TypeScript and Vite production build pass. The existing
  large-chunk warning remains (about 3.76 MB minified / 1.28 MB gzip).
- `npm run lint`: passes with existing warnings in saved/draft Kiln sources,
  `Sky.tsx` and `Player.tsx`; no new simulation/test warnings remain.
- Production bundle inspected: no simulation-debug panel text or debug CSS
  included. Simulation itself remains in production.
- Documentation file links and diff whitespace checked.

## Browser evidence (development server, port 5174)

- Fresh world renders its original ground, mesas, ridges, craters and natural
  stone scatter. No buildings, rover, astronaut, solar arrays, battery or props
  from the manifest are placed.
- Backquote opens diagnostics with advancing sol/clock, gauges and subsystem
  state, updated from the runner. The runner remains in a ref.
- Pause holds the clock; a planning panel also shows Paused and disables jumps.
- Wait 2h advances to evening while changing reserves through real sim steps.
- Sleep reaches Sol 2 at 06:00, consumes overnight power/air/water/food,
  restores energy to 3 and reports wake-up. Energy stays 3 after dawn.
- Reload restores the autosaved Sol 2 dawn state and continues the clock;
  PEBBLE night watch is off after waking.
- Debug panel fits below Leva and does not overlap it. UI clicks are now
  restricted away from the pointer-lock listener by `selector="canvas"`.

## Remaining limits and explicit tuning

The existing in-app-browser Pointer Lock failure still limits mouse-look
qualification; keyboard movement and rendering were established in Phase 0.
Existing Three.js/physics deprecation warnings remain. No integrated-GPU
performance claim or new playable mission is made.

The heater-formula discrepancy is recorded in design Part 3 and checklist
§1.F: the verified night is **36.65 kWh**, versus the earlier approximate 44.
Clean Act I totals are **125.41 kWh demand / 125.59 kWh solar**. The formula
is preserved. MEDA/NASA archive curation, full event-deck content, mission
recovery presentation and campaign balancing belong to later phases.
Additional provisional tuning is listed in [the simulation guide](../tech/sim.md).
