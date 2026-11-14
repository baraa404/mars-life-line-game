# Simulation core — Phase 1

Implemented in `src/sim/`, pure TypeScript with no React or Three.js imports.
The source contract is [design Part 3 §§1–3](../../game-design/03-systems-ux-tech-production.md).
The running world contains the Phase 2 base and an invisible first-person player.
The pure virtual simulation remains independent of placed models; lighting,
sky/fog, panel dust and battery lamps now read its snapshot.

**Story game:** the playable game runs a separate, smaller pure simulation in
`src/sim/story/` ([mission-critical.md](../game/mission-critical.md)). `tick(state, dt)` advances
resources, crops and the storm in real seconds; `act(state, action)` applies one player act
and returns new lines from `script.ts`; `brief(state)` builds the mission card and
`grade(state)` the ending. Both return new state objects and never mutate their input.
`StoryBridge.tsx` fills the Phase 1 snapshot from it (clock, battery, dust, dose) so the
sky, lighting and lamps keep working. Tests: `tests/sim/story.test.mjs`.

## Ownership and API

`createInitialState(seed)` returns the version-2 schema, without a `mode` field.
Initial stocks: 48/80 kWh, 10 kg O₂, 60 L water, 50 pantry sols, 5% panel dust,
full scrubber and PEBBLE battery. Unspecified defaults: Sol 1 at 15:00, hab,
three empty trays, full astronaut pips, healthy array, full 30 kWh rover,
Life Support and heaters on, other loads off. Seed/rng use uint32 mulberry32.

`SimRunner` owns mutable state, runtime, queued commands, input log and checkpoints.
`step(state, runtime, commands, deck)` advances one atomic Mars minute in the
specified subsystem order. Commands apply first. `enqueue` validates and copies
inputs; no command mutates the simulation before its next step. The input log
records commands with their step index, including rejected attempts.

Commands: `setPriority`, `toggleLoad`, `setLevel`, `choose`, `sleep`, `wait`,
`skipSols`, `pebbleJob`. Integration actions also support location/suit filling,
airlock seal, planting/harvest, scrubber replacement, wall-water pump,
messages, storms, SEP onset, Forbush dip and mission-complete notices. These are
simulation hooks, not implemented mission interactions. Invalid numeric inputs
throw; unavailable actions leave the relevant state unchanged. Priorities must
include each load once; Life Support is forced to first and ignores player
on/off/dimmer commands. In emergency shedding it is the last cut and retried
each step. Working load states, rather than requested loads, drive production.

## Subsystems

- `time.ts`, `environment.ts`: 1,440 steps/sol; sunrise 06:00, sunset 18:00;
  interpolated 24-point temperature and nine-sol storm build/peak/clear curve.
- `loads.ts`, `power.ts`: all 14 loads, scheduled tray lights, conditional
  charging/processing/uploads, dimmers, interpolated opacity lookup, solar,
  fission, battery efficiency, cap/spill accounting and reverse-priority shedding.
  Shedding occurs before an unfundable minute; no load gets free production.
- `air.ts`, `water.ts`: inside oxygen, eight-hour suit supply, powered oxygen
  makers, stoichiometric water use, scrubber/CO₂, tray water, dirty ice processing,
  filter wear and the powered one-hour 30 L water-wall lock. Rolling net water
  consumption is retained for one sol; before that it is scaled from elapsed
  samples, with an initial planned-demand estimate. Wall transfers are not use.
- `food.ts`, `you.ts`: crops, photoperiod factors, cold/dry stalls, harvest,
  half rations, astronaut pips, fatigue, sleep recovery and outdoor-work gates.
- `radiation.ts`: DP absorbed-dose comparison unit; G/S shielding, Forbush,
  seeded 10–40 minute SEP onset, 1h rise + 1h plateau + 6h tail integrating to
  39 DP outside excluding background. Not a medical model or a live NASA feed.
- `pebble.ts`: idle/job drain, charge, dust-slowed job ETAs, clean/scout/carry,
  30-minute radiation reboot and night-watch state. Scout completion logs the
  target; carry adds one sample. Future missions supply richer job effects.
- `comms.ts`: two relay windows, powered ten-minute upload, seeded 20–40 minute
  Earth handling, timestamped round-trip reply and Sol 41–54 blackout.
- `causal.ts`, `gauges.ts`: sunset ledger, real causal IDs for the two largest
  energy contributors, reserve warnings, status words/shapes and night hours.
  AIR/WATER Return-to-Ship notices require yellow, red, a decision and at least
  one sol since yellow. The playable ship-recovery flow belongs to Phase 17.
- `events/director.ts`: weighted seeded selection, cooldowns, forecast lead,
  no consecutive same event, domain separation and at most one negative major
  event per sol. Default deck is empty; mission scripts/Phase 17 supply content.

## Time control and pause

`update(realSeconds)` accumulates one Mars minute per real second (60×).
At most 2,000 steps run per frame, preserving remaining accumulator/jump work.
Pause and pending-card time never accumulate for later catch-up. Choosing a card
can process at the next step while the card has paused normal advancement.

`sleep()` queues then headlessly executes to 06:00, only in the hab with a sealed
airlock, after 17:00 or while tired. The design's fuller §2.1 rule allows a
three-hour daytime nap at energy ≤1; this takes precedence over the checklist's
shorter “energy 0” summary. Sleep restores energy to 3 (2 for a cold night),
and the next 06:00 step does not immediately undo that restoration.
`wait(1|2|4)` requires inside, sealed airlock, daytime and no crossing sunset.
`skipSols(1..7)` runs the current Standing Orders/load plan. Cards interrupt all
jumps, wake sleeping players and clear the jump target. Existing cards cannot
be overwritten or skipped. `sleep`, `wait` and `skipSols` convenience methods
run synchronously headlessly; UI-queued versions use the per-frame cap.

## Save, reload and replay

Storage is injected through a `StoragePort`; the pure core accesses no browser
APIs. Browser integration uses `localStorage['marslifeline.save.v2']`:
`{ simState, decisionLog, checkpoints, settings }`. `settings.runtime` stores
serializable continuation state (rolling water, card, sleep target, event
schedules, wall lock, warning/director history, etc.). This preserves the exact
public SimState schema. Runtime is required for a valid v2 save.

Sleep start/completion/interruption and every chosen decision checkpoint and
autosave. The ring holds at most 20 full state/runtime checkpoints.
`rewind(index)` restores a checkpoint and truncates its future input history.
`readSave`/`migrateSave` validate the envelope, state and continuation structures;
old/future versions are explicitly rejected until a real migration is written.
Corrupt or denied storage starts fresh with a notice; write failures report a
notice without crashing. Snapshots and exports are deep copies.

`replay(seed, decisionLog, totalSteps, deck)` reproduces state with the same
seed, commands and deck. Replaying custom setup requires expressing it as inputs
or using the same initial fixture. Direct developer mutation is not logged.

## Game bridge and diagnostics

`src/game/Simulation.tsx` holds the runner in a ref. `useFrame` advances it;
`useMissionStore` gets copied snapshots at ~4 Hz, immediately on card changes
or notices. The store owns view, openPanel, pause, card, command queue and recent
wake-up/mission/save notices. Opening a panel or pause menu pauses the runner.
Phase 3 Station View and the HUD use the same snapshots and command queue. Optional v2 runtime fields retain in-progress sleep samples, the latest wake report and PEBBLE travel. Checkpoints immediately before sleep and choice let recovery replay those actions.

Backquote opens the development-only `SimDebug` overlay: all resource gauges,
clock/speed, astronaut, PEBBLE, weather, comms, maintenance, loads, recent causes,
pause, a planning-panel pause probe, sleep, waits and pending-card choices.
It is excluded from production bundles. No later-phase gameplay HUD is claimed.

## Explicit tuning and design discrepancy

The temperature curve is provisional game data, **not** a curated MEDA curve;
Phase 18 must supply/credit that dataset. Additional unspecified values are
labelled tuning: four-hour PEBBLE charge, 300 L clean filter capacity (dirty
wear ×2), +1% PEBBLE dust/hour of jobs, two-hour scout/carry, rover shielding
G=0.9/S=0.5, relay windows 08:00–09:00 and 16:00–17:00. Fresh-food health decays
by one pip every ten sols after 20 without fresh food; blackout spirit drops
weekly. Mizuna adds one health pip for ten sols when below the cap; pepper adds spirit.
Celebration presentation is future mission work.

Measured clear/clean Act I: **125.41 kWh demand / 125.59 kWh solar**, with two
16h trays and electrolysis at 14/24 duty. Essentials-only night is **36.65 kWh**.
Part 3's approximate 44 kWh night conflicts with its heater formula: with
outside temperature ≥−80°C, heaters ≤1.7 kW, so essentials ≤3.2 kW and a
12-Mars-hour night cannot exceed 39.46 kWh. The implementation preserves the
specified formula rather than silently increasing demand. Night-covered hours
are an estimate at −72°C with the currently active loads, not a full forecast.

## Verification

`npm test` runs Node's built-in runner: per-subsystem tests plus existing asset
regressions. Coverage includes bounds/finiteness, energy accounting including
spill/loss, reverse-priority brownouts, seeded replay hashes, sleep/resource
equivalence, wake interruption, pause, checkpoint ring/reload and malformed saves.
`npm run sim:check` executes 60 sols (86,400 steps) for seeds 1, 42 and 2026,
checking invariants every step without injecting supplies. The dummy policy
exhausts reserves; this proves stability, not campaign survivability or Phase 19
medal balance. Final build/lint and browser evidence are in
[the Phase 1 verification record](../game/phase-1-verification.md).
