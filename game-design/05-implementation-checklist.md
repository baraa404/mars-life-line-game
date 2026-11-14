# MARS LIFE LINE — Implementation Checklist (for the implementing agent)

> **Who this is for:** the agent (or developer) who builds the game.
> **What it is:** the ordered, phase-by-phase to-do list. Every task is a checkbox. Tick it
> (`- [x]`) **only when it is finished and verified**.
> **Design source:** `game-design/00-START-HERE.md` → Parts 1–3 → `04-asset-catalog.md`.
> When this checklist and a design file disagree, the design file wins; fix this checklist.

---

## 0. Rules for the agent (read before every session)

### 0.1 Before you start any phase
1. Read the project rules: `.cursor/rules/*.mdc`, `AGENTS.md`, `docs/README.md` (docs protocol).
2. Read the design sections the phase names (each phase lists them under **Read**).
3. For visual work, read `docs/style/STYLE_GUIDE.md` and open the reference crops it names.
4. Run the **asset gate** for the phase (§0.3) before writing gameplay code.

### 0.2 How to tick things
- `- [ ]` = not done · `- [x]` = done and verified · `- [~]` = done with a placeholder or a
  known gap (write the gap on the next line, indented).
- A task is **done** only if `npm run build` passes and you checked it in the browser
  (`npm run dev`) when it's visual or interactive.
- Never tick a whole phase until all its boxes are `[x]` or `[~]` with a written reason.
- Add the date when you tick a phase's **Done when** box: `- [x] Done when … (2026-11-13)`.

### 0.3 Asset gate (every phase)
For every asset listed under **A. Assets needed**:
1. Check it exists: `npm run asset:list` and `public/models/<id>.glb` (models), or the file
   path given (UI, audio, images).
2. Check its **named nodes** (listed in `04-asset-catalog.md`) are present.
3. If it exists and is correct: tick it.
4. If it's **missing**:
   - **Either** make it through the asset pipeline (`docs/pipeline/ASSET_PIPELINE.md`) if
     asset work is part of your task,
   - **or** build a **placeholder** so gameplay isn't blocked: a chamfered box (or simple
     primitive) at the **correct real size**, token materials, the **same named nodes**, and
     `userData.placeholder = true`.
   - Then mark the asset line `- [~]` and add a line under it:
     `  - ⚠ MISSING YYYY-MM-DD: placeholder used (<what>). Logged in §Missing Assets.`
   - And add the same entry to the **Missing Assets Log** (§ at the end of this file).
5. **Never skip an asset silently.** Never replace a missing asset with an off-style model.

### 0.4 Code rules (from the project rules)
- Colours and material values come from `src/style/tokens.ts`. **Never hard-code palette hex.**
- **Per-frame data stays in refs, not Zustand.** Zustand gets throttled snapshots (≈ 4 Hz).
- Don't hand-edit generated files (`assets/style/*`, `src/game/assets/assetManifest.json`
  except placement values). Use `npm run asset:*`.
- Ecctrl 2 input goes through `setMovement` (see `docs/tech/player.md`).
- Don't edit Kiln-managed files (listed in `.cursor/rules/project-core.mdc`).
- The simulation (`src/sim/`) is **pure TypeScript**: no React, no Three.js imports.

### 0.5 After each phase
- Update every doc your change made untrue; add new docs and link them from `docs/README.md`.
- Add an entry to the top of `docs/CHANGELOG.md`.
- Run `npm run build` and `npm run lint`.

### 0.6 Routes

| Route | Phase order |
|---|---|
| **Hackathon MVP route** ⭐ | 0 → 1 → 2 → 3 → **4 (L0)** → **5 (L1)** → **14 (L10)** → 17 ⭐ items → 18 ⭐ items → 19 ⭐ items → **20** |
| **Full game route** | 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17 → 18 → 19 → 20 |

Items marked ⭐ belong to the MVP. On the MVP route, skip non-⭐ items in shared phases
(17–19) and come back to them later.

### 0.7 Phase map

| Phase | Name                                                | Level | MVP      |
| ----- | --------------------------------------------------- | ----- | -------- |
| 0     | Preflight                                           | —     | ⭐        |
| 1     | Simulation core                                     | —     | ⭐        |
| 2     | World and base layout                               | —     | ⭐        |
| 3     | Player, views, PEBBLE and HUD                       | —     | ⭐        |
| 4     | Level 0: Touchdown                                  | M0    | ⭐        |
| 5     | Level 1: Night Shift                                | M1    | ⭐        |
| 6     | Level 2: Seeds                                      | M2    |          |
| 7     | Level 3: Ice Run                                    | M3    |          |
| 8     | Level 4: Air You Can't See                          | M4    |          |
| 9     | Level 5: Dust Devil                                 | M5    |          |
| 10    | Level 6: Power Delivery                             | M6    |          |
| 11    | Level 7: Earth Is Listening… Slowly                 | M7    |          |
| 12    | Level 8: Science or Safety                          | M8    |          |
| 13    | Level 9: Storm Season                               | M9    |          |
| 14    | Level 10: The Day the Sun Roared                    | M10   | ⭐        |
| 15    | Level 11: Silence                                   | M11   |          |
| 16    | Level 12: Harvest & Signal                          | M12   |          |
| 17    | Campaign glue: skips, events, medals, endings       | —     | ⭐ (part) |
| 18    | NASA data, Sources, Live sky                        | —     | ⭐ (part) |
| 19    | Polish: audio, accessibility, performance, playtest | —     | ⭐ (part) |
| 20    | Release and submission                              | —     | ⭐        |

---

## Phase 0 — Preflight ⭐

**Read:** `00-START-HERE.md` (all), Part 1 §1.3, Part 3 §8, §15, `04-asset-catalog.md` §16.

### 0.A Decisions to confirm with the user (don't guess)
- [x] T-1: user confirmed pre-built work is allowed (2026-11-12: “1-yes”; owner confirmation, not independently checked with organisers)
- [x] Test runner: Node's built-in `node --test` adopted for Phase 1; `npm test` added without a dependency (2026-11-12)
- [~] Hosting target: explicitly deferred to Phase 20 release preparation; no provider selected
- [~] T-10: rover seat or PEBBLE driving explicitly deferred until before Phase 7; rover stays a static prop
- [~] Fonts and audio sources: font acquisition complete 2026-11-13 (Nunito/Baloo 2 local variable fonts + SIL OFL licences); audio sources remain explicitly deferred
- [~] The 5 new tokens: explicitly deferred until first use (`night-sky` before Phase 5; greenhouse/ice/plant tokens before Phase 6 or first use; aurora token before aurora work); none approved or added

### 0.B Baseline
- [x] `npm install` works (up to date; four moderate audit findings recorded)
- [x] `npm run build` passes on the received working tree (existing large-chunk warning recorded)
- [x] `npm run lint` passes (exit 0; existing warnings recorded)
- [~] `npm run dev` runs the current test world; first-person keyboard walking verified in browser
  - Mouse look remains unverified: the in-app browser rejects Pointer Lock. Normal desktop-browser verification is still needed; see `docs/game/preflight.md`.
- [x] `npm run asset:list` output recorded in `docs/game/preflight.md` (15 definitions; rover and astronaut present; procedural terrain and separately loaded rock kit checked)

### 0.C Docs skeleton (docs protocol)
- [x] Create `docs/game/README.md` (game design summary + link to `game-design/`)
- [x] Create `docs/tech/sim.md` (simulation module: state, step, time, save)
- [x] Create `docs/tech/views.md` (first person, Station View, 2D panels, switching)
- [x] Create `docs/tech/pebble.md` (PEBBLE actor, jobs, cards)
- [x] Create `docs/tech/ui.md` (HUD, panels, accessibility)
- [x] Create `docs/game/missions.md` (one section per level, filled as levels are built)
- [x] Link all of them from `docs/README.md`; add a CHANGELOG entry

- [~] **Done when:** all decisions are answered or explicitly deferred, the baseline builds, the docs skeleton is linked (2026-11-12).
  - Preflight complete with recorded deferrals and a mouse-look verification gap; all 11 existing regression checks pass. Full evidence: `docs/game/preflight.md`.

---

## Phase 1 — Simulation core ⭐ (pure TypeScript, no 3D)

**Read:** Part 3 §1–3 (all formulas and numbers), Part 2 §2.

### 1.A Assets needed
- None (no visuals in this phase).

### 1.B Module setup
- [x] Create `src/sim/` with `state.ts`, `step.ts`, `rng.ts` (mulberry32), `index.ts`
- [x] `SimState` type exactly as Part 3 §2.2 (version 2, no `mode` field)
- [x] `createInitialState(seed)` with the values in Part 3 §2.3
- [x] Command queue: `setPriority`, `toggleLoad`, `setLevel`, `choose`, `sleep`, `wait`, `pebbleJob`; applied at the start of the next step
- [x] Test runner set up (per Phase 0 decision) with a `test` npm script

### 1.C Subsystems (one file each, each with unit tests)
- [x] `time.ts`: clock (1,440 steps per sol), daylight `d(h)`, sunrise 06:00 / sunset 18:00
- [x] `environment.ts`: outside temperature curve (24 points, −80 °C at 05:00, −20 °C at 14:00), sky opacity τ and storm phases
- [x] `loads.ts` + `power.ts`: solar formula (16 kW peak, S(τ) lookup, dust, health), fission 6 kW flag, battery 80 kWh, charge efficiency 0.92, H = 1.0275, the load table, the priority list, **brownout shedding from the end of the list**, Life Support locked
- [x] `air.ts`: O₂ use 0.84 kg/sol, electrolyser 0.06 kg/h (uses 0.0675 L/h), Oxygen Maker 0.05 kg/h, suit fill 0.5 kg, scrubber life and CO₂ rise
- [x] `water.ts`: net use (1 L/sol you, −2 per tray, −3 wheat), electrolysis, ice → water 0.9 L/kg, processor 6 L/h (dirty: 2.1 kW, ×2 filter wear), shelter wall lock
- [x] `food.ts`: pantry −1/sol, 3 crops, growth formula with the light factor, pause on cold or dry, half rations
- [x] `radiation.ts`: DP unit, G and S location factors, Forbush factor, SEP flux profile input
- [x] `you.ts`: energy, health, spirit, dose, location; energy rules (sleep restores, drops at 02:00 and 06:00 when awake, task-speed multiplier)
- [x] `pebble.ts`: battery drain/charge, dust, jobs (clean panels, scout, carry, charge) with ETA, glitch + reboot, night watch flag
- [x] `comms.ts`: one-way delay track, blackout Sols 41–54, relay windows, outbox/inbox with send/arrival times
- [x] `causal.ts`: per-load energy ledger since sunset, `CausalEvent` log, top-2 contributor attribution on thresholds and brownouts
- [x] `events/director.ts`: seeded event drawing, cooldowns, forecast leads, max 1 negative event per sol (deck content comes in Phase 17)
- [x] Gauge helpers: "sols left" for AIR and WATER, "night covered" hours for POWER, status shapes (● ▲ ■) with the thresholds (yellow < 3 sols, red < 1, Return to Ship < 0.25)

### 1.D Time controller
- [x] Normal speed 60× (1 real s = 1 Mars min), fixed-step accumulator, max 2,000 steps per frame
- [x] `sleep()`: allowed only inside with the airlock sealed and (hour ≥ 17 or tired; daytime energy ≤1 permits a 3h nap per Part 3 §2.1); runs headless to 06:00; **stops early on any event that needs a card** (wake-up); restores energy; autosave
- [x] `wait(hours)`: 1, 2 or 4 h, daytime only, inside only, interrupted by events
- [x] `skipSols(n)`: Mission Log skip that runs Standing Orders
- [x] Pause states: card open, pause menu, Station View panel open

### 1.E Save and checkpoints
- [x] `localStorage['marslifeline.save.v2']` with `{ simState, decisionLog, checkpoints[≤20], settings }`
- [x] Autosave on every sleep and every decision; checkpoint ring buffer
- [x] Load + version migration stub
- [x] Replay: initial state + seed + decision log ⇒ identical state

### 1.F Tests (must pass)
- [x] Invariants: no negative stocks, no NaN, battery ≤ cap
- [x] Energy conservation within the efficiency loss
- [x] Determinism: same seed + same commands ⇒ same hash
- [x] Sleep equivalence: a sleeping night and an awake night with the same loads give the same resource result
- [x] Sleep never skips a pending decision
- [~] Balance check of Part 3 §3.2: a clean sunny Act I sol ≈ 125–126 kWh demand vs supply; essentials-only night budget checked against the specified heater formula

  - Measured 125.41 kWh demand / 125.59 kWh solar; night 36.65 kWh. The design's 44 kWh estimate conflicts with its −80°C minimum and heater formula (maximum possible night 39.46 kWh). Formula preserved; discrepancy logged in Known Gaps and `docs/tech/sim.md`.

### 1.G Bridge to the game
- [x] `SimRunner` held in a ref; `useFrame` drives it
- [x] `src/state/useMissionStore.ts`: view, open panel, current card, throttled snapshot (≈ 4 Hz), events (woke up, mission complete)
- [x] Dev-only debug overlay (all gauges, clock, speed, recent events), hidden in production

- [x] **Done when:** all tests pass, a headless script can run 60 sols with a dummy policy without errors, and `docs/tech/sim.md` describes the module (2026-11-12).
  - 53 tests pass; three 60-sol seeded stability runs complete. Browser checked: terrain-only display, live snapshots, pause/planning, wait, sleep, wake energy and save reload. The night-budget estimate discrepancy is the recorded `[~]` item; full evidence in `docs/game/phase-1-verification.md`.

---

## Phase 2 — World and base layout ⭐ (environment and model placement)

**Read:** Part 1 §8, Part 3 §6, `04-asset-catalog.md` §4, §8, §11, style guide §5–7.

### 2.A Assets needed (asset gate §0.3)
- [x] `mars-landscape` ✅ (terrain) — check the layout fits
- [x] `rock-pebbles`, `rock-boulders`, `rock-cluster` — reference-matched model, export and runtime/node checks verified (2026-11-12).
- [x] `mesa-distant`, `ridge-horizon` — reference-matched model, export and runtime/node checks verified (2026-11-12).
- [x] `mesa-cliff-overhang` (nodes: `shelter_zone`) — reference-matched model, export and runtime/node checks verified (2026-11-12).
- [x] `command-base` — complete user-requested connected headquarters saved/ingested/placed; material-faithful GPU and browser review, 8,320 placed triangles, anchors/owners and reflected collision checks verified (2026-11-13). See `assets/briefs/command-base.md`. Emissive surfaces included; bloom/light spill and animated effects remain later polish.
- [x] `hab-module` (nodes: `roof`, `info_anchor`, window positions) — reference-matched model, export and runtime/node checks verified (2026-11-12).
- [x] `hab-airlock` (nodes: `outer_hatch`, `inner_hatch`, `roof`, `info_anchor`) — reference-matched model, export and runtime/node checks verified (2026-11-12).
- [x] `storm-shelter-module` (nodes: `roof`, `info_anchor`) — reference-matched model, export and runtime/node checks verified (2026-11-12).
- [x] `solar-array-row` ×4 (nodes: `panel_*`, `info_anchor`) — reference-matched model, export and runtime/node checks verified (2026-11-12).
- [x] `battery-bank` (nodes: `charge_bar`, `info_anchor`) — recreated from its own Phase 2 image; GPU and in-game visual review, export/node checks and build verified (2026-11-12).
  - Nine individually addressable charge segments; asset brief: `assets/briefs/battery-bank.md`. Gameplay binding remains separately tracked in §2.C.
- [x] `pebble-dock` — image-matched model saved/ingested; GPU/browser and node checks verified (2026-11-12).
- [x] `landing-pad`, `landing-scorch` — image-matched models saved/ingested; pad geometry and feathered vertex-alpha scorch verified (2026-11-12).
- [x] `landing-ship` (exterior; nodes: `hatch`, `ramp`, `nozzle_*`, `window_*`) — saved/ingested, populated nodes, footpad/nozzle geometry and GPU/browser checks verified (2026-11-12).
- [x] `cable-run` (straight, bend, T) — three image-matched GLBs saved/ingested; connector nodes and GPU/browser checks verified (2026-11-12).
- [x] `cable-junction` (node: `lid`) — placed at the northern repair endpoint; bounds/collision and lid ownership verified (2026-11-12). Repair interaction belongs to Phase 14.
- [x] `crate-supply` — placed at (−7,0,5); browser view, bounds and collision verified (2026-11-12).
- [x] `mars-rover` ✅ (parked on its spot)

Dock/landing/cable batch: `assets/briefs/phase-2-support-batch.md`; seven models verified, 59 tests pass. Gameplay and final placement remain separately tracked.

Batch sources, revisions, reviews and cave-size correction: `assets/briefs/phase-2-batch.md`. Model completion is separate from the gameplay/layout tasks below.

### 2.B Layout
- [x] Terrain visual refinement (2026-11-12): lightly softened rock facets and ledges matched to the Phase 2 mountain images; seven distant mesas, six blended foothills and a clear south-east basin. Browser and terrain/collision checks verified; final mission placements remain below.
- [x] Write the site layout table in `docs/tech/world.md` (positions of every module, ship pad 150 m east, shelter entrance 110 m north, M10 repair junction 150 m from the hab and 40 m from the overhang)
- [x] Adjust terrain if needed (flat pads under the base and the ship; ridge stays beyond 75 m)
- [x] Place every base module with colliders (use `npm run asset:ingest -- … --pos --rot-y --collider`)
- [x] Lay cable runs between modules; store each cable as a spline in code (needed for Station View flow lines)
- [x] Scatter rocks (instanced), keep paths clear between the hab, the array, the ship and the cliff
- [x] Place distant mesas and ridges for the horizon

  - Layout correction (2026-11-13): 80 m + 40 m < 150 m, so the three original distances cannot coexist. The overhang anchor is now 110 m north to preserve the mission's exact 40 m escape distance; documented in `docs/tech/world.md`.

### 2.C Lighting and sky driven by the sim
- [x] L-01 Day exterior from tokens (existing)
- [x] L-02 Dusk: key light angle and colour follow the sim clock
- [~] L-03 Night exterior: temporary night colours derive from existing `space-deep` / `shadow-plum`; new `night-sky` token remains deferred and logged below
- [x] Sky gradient and fog follow sky opacity τ (storms come later; wire the hook now)
- [x] Panel dust colour V-01 bound to `power.panelDust`
- [x] Battery `charge_bar` emissive segments bound to the battery %

### 2.D Verify
- [~] Player-scale placement/collision verified by GLB bounds, real Rapier capsule route checks and browser destination review; shelter-ramp walking verified. Exhaustive mouse-look traversal remains limited by embedded-browser Pointer Lock (2026-11-13)
- [~] Performance: representative base view ~189–190 draw calls including shadows; other reviewed views lower. Foreground samples ~52–60 fps; integrated-GPU median target not certified. Background browser throttling makes hidden-tab FPS unsuitable (2026-11-13)
- [x] `npm run build`, `npm run lint`

- [x] **Done when:** the whole base stands in the world, lighting follows the clock from day to night, and the layout is documented (2026-11-13).
  - Implemented and browser-tested; 67 tests pass. Night palette, exhaustive manual traversal and hardware-qualified performance remain the explicit `[~]` gaps above. See `docs/game/phase-2-verification.md`.

---


## Phase 3 — Player, views, PEBBLE and HUD ⭐

**Read:** Part 3 §4 (all), §5, Part 1 §6, `04-asset-catalog.md` §2, §5, §12.

- [-] `astronaut-fp-arms` — removed from game models and codebase per user request (2026-11-13)
- [x] `pebble` "Box Buddy", per `docs/style/references/generated/g05-pebble-box-buddy.jpg` (nodes: `screen_face`, `head`, `neck`, `arm_l`, `arm_r`, `grip_l`, `grip_r`, `nozzle_r`, `antenna`, `track_l`, `track_r`; two tank treads, two grippers, no brush)
- [x] `pebble-clips` (Idle, Drive, TurnInPlace, Happy, Worried, Hide, Clean, Grip, HeadTilt, Reboot, Charge, Point)
- [x] PEBBLE face sprite sheet P0 expressions (SVG): Neutral, Happy, Very happy, Worried, Thinking, Sleepy, Alarm, Static, Rebooting, Card mode
- [x] `young-astronaut` ✅ + Idle and Walk clips (tiny Station View figure)
- [x] Interior kit: `int-wall-panel`, `int-floor-ceiling`, `int-door-inner`, `window-hab`
- [x] `airlock-interior` (nodes: `lever`, `gauge_needle`)
- [x] `console-station` (node: `screen_anchor`)
- [x] `bunk` (node: `sleep_interact`), `galley-chair` (node: `wait_interact`), `pebble-nook`
- [x] `data-pad`
- [x] System icons U-23 and status shapes + source badges U-24 (SVG)
- [x] Font files (per Phase 0)


Asset gate verified 2026-11-13: 13 saved/ingested models (including the astronaut child revision), 23 requested new native clips, 10 SVG faces, U-23/U-24 SVG set, two local OFL fonts. Sources/revisions/limits: `assets/briefs/phase-3-batch.md`. All 76 tests and build pass. Gameplay tasks below remain separate.

### 3.B Interior and scene swap
- [x] Build the hab interior scene from the kit (bunk, galley chair, Station View console, PEBBLE nook, inner hatches)
- [x] Airlock interior; the airlock cycle (hatch wheel → lever → gauge → hatch unlock) **masks the inside ↔ outside scene swap**
- [x] Outer hatch locked until the pressure is under 1%; message "Locked. The air would rush out."
- [x] Sim location updates (`hab` / `outside`) on the swap

### 3.C First person and interaction
- [x] Keep the existing Ecctrl first-person controller; add FOV setting (default 75), no head-bob, centre dot U-05
- [x] Remove/disable any third-person camera code paths if present
- [x] `Interactable` system: look-at ray, **E** to use, **hold E** with a progress ring (U-04), hold/toggle setting
- [x] Interaction highlight X-07
- [-] First-person arms rig — removed per user request (2026-11-13)
- [x] Bunk → `sleep()`; galley chair → `wait()` picker (1/2/4 h)
- [x] Helmet frame overlay U-06 outdoors with a suit-air bar

### 3.D Station View (isometric)
- [x] `StationViewCamera`: orthographic, ≈ 35° down / 45° around, zoom range (yard ↔ whole site), rotate in 90° steps (Q/E), pan (WASD / right-drag)
- [x] Open/close with **M** (and the console): 0.8 s rise/drop transition; the first-person controller freezes while open; returns to the same pose
- [~] Roof fade V-03 on all `roof` nodes
  - The headquarters fades to a cutaway. The attached wing retains its exterior fixtures and has no furnished room.
- [x] Module info tags U-11 at `info_anchor` (icon + status shape + kW)
- [x] Click a module → module info card (what it does, kW, status, on/off, dimmer, priority position, "Why does this matter?")
- [x] Priority panel: drag-to-reorder cards; Life Support locked at the top with its reason
- [x] Power flow lines X-06 / V-10 along the cable splines (thickness = kW, dots = direction)
- [x] Tiny "you" figure and PEBBLE shown at their positions
- [x] Time keeps running while you look; **pauses while a panel or info card is open**

### 3.E PEBBLE actor
- [~] PEBBLE follows you (simple steering on the navmesh or waypoint graph), keeps ~2 m away, avoids colliders
  - Local collider avoidance and the Solar 1 route are verified. Other destinations have waypoint targets and need full browser traversal coverage.
- [x] Face texture V-09 on `screen_face` driven by an expression state
- [x] Clips play by state (idle, drive, happy, worried, hide, brush, reboot, charge, point)
- [~] Hint behaviour: after 30 s without progress, PEBBLE rolls toward the next objective and plays `Point`; **H** asks for a hint any time
  - Idle hints use movement and area changes as progress signals until mission objectives are introduced.
- [x] PEBBLE jobs from Station View: click PEBBLE → job → target; it drives there; a progress ring; sim `pebbleJob` command
- [x] Night watch: PEBBLE goes to its nook to charge at night; it triggers the wake-up when the sim stops a sleep for an event
- [x] PEBBLE speech line U-07 (bottom-left bubble with its mini face)

### 3.F PEBBLE decision card system
- [x] Card data format (the 9 fields of Part 2 §1 + options + effects as sim commands)
- [x] PEBBLE card UI U-09: PEBBLE rolls in front of you if within 10 m and its face grows into the card; otherwise the card opens on the wrist pad with PEBBLE's face in the corner
- [x] Equal-weight option tiles; "What happens later?", "Why?", "Give me a hint"
- [x] Time pauses while the card is open; **no countdown timers**
- [x] After choosing: PEBBLE reacts (expression + "Mars truth" line); a Why Chain bead is logged
- [x] Checkpoint saved on every decision

### 3.G HUD and core panels
- [x] U-01 three gauges (bar, value, trend arrow, status shape; hover = exact units)
- [x] U-02 five chips (Food, Sun/Radiation, Earth Link, You, PEBBLE)
- [x] U-03 clock (sol, hour, sun/moon, 🛏 when sleep is available)
- [x] U-08 dose badge meter
- [x] U-10 wake-up report (overnight battery graph, what switched off, events, messages)
- [x] U-13 Why Chain (list form)
- [x] Data Pad (Tab) with quick gauges and messages
- [~] Pause menu, settings (text size 100/125/150%, FOV, reduced motion, hold/toggle, volume)
  - Volume is a saved preference. Audio sources and the campaign title flow are later-phase work.
- [x] Return to Ship screen (Why Chain + "Try again from last sleep" / "from decision" / "Continue with help")
- [x] Every colour from tokens; every status has shape + colour + text

### 3.H Verify
- [x] Keyboard-only run: walk, airlock, Station View, a test card, sleep, wake report
- [x] Switching views never resets state (change a load in Station View, walk, check the HUD)
- [x] Colour-blind preview of the HUD
- [x] `npm run build`, `npm run lint`; update `docs/tech/views.md`, `pebble.md`, `ui.md`

- [x] **Done when:** you can walk the base in first person, cycle the airlock, open Station View and switch a module, receive a test PEBBLE card, sleep, and read a wake-up report. (2026-11-13)
  - Browser walkthrough and verification details are recorded in `docs/game/phase-3-verification.md`.

---

## Phase 4 — Level 0: Touchdown (M0) ⭐

**Read:** Part 2 §4 M0, §9 (script lines), Part 3 §7.4 (X-01, X-02), §11 (EDL row).

### 4.A Assets needed (asset gate §0.3)
- [x] `landing-ship` (from Phase 2) and `landing-ship-cabin` (seat, window, `screen_anchor`, ARM button, inner hatch, small airlock) — reference-matched model, export, semantic nodes and runtime checks verified (2026-11-13). See `assets/briefs/landing-ship-cabin.md`.
- [x] `sky-mars-orbit` (planet sphere for the orbit view) — reference-matched model, export, budget and runtime checks verified (2026-11-13). See `assets/briefs/sky-mars-orbit.md`.
- [x] `o2-canister` — reference-matched model, export, budget and runtime checks verified (2026-11-13). See `assets/briefs/o2-canister.md`.
- [x] `helmet-shelf` — reference-matched model, export, budget and runtime checks verified (2026-11-13). See `assets/briefs/helmet-shelf.md`.
- [x] `astronaut-suit-rack` — reference-matched model, export, budget and runtime checks verified (2026-11-13). See `assets/briefs/astronaut-suit-rack.md`.
- [x] `flag-plaque` — reference-matched model, export, budget and runtime checks verified (2026-11-13). See `assets/briefs/flag-plaque.md`.
- [x] `comms-dish` (node: `dish` elevation pivot, `info_anchor`) — reference-matched model, export, semantic nodes and runtime checks verified (2026-11-13). See `assets/briefs/comms-dish.md`.
- [x] U-19 landing screen UI · I-03 Mars site map (NASA Mars Trek, with attribution)
- [x] Audio: landing roar, heat-shield crackle, retro-rocket thrust, touchdown thud, ARM beep, ship airlock hiss · music: landing cue, base day cue

### 4.B Environment and placement
- [x] Ship on its pad 150 m east of the hab, on the scorch patch
- [x] Ship cabin interior scene (separate, lazy-loaded)
- [x] Orbit sky scene for the landing start (planet sphere + peach limb glow)
- [x] A clear walking path from the ship to the hab airlock

### 4.C Features
- [x] Mission framework: `missions/m0.ts` with objectives, scripted beats, triggers, completion (reused by every level)
- [x] Landing sequence state machine: orbit → message from Earth → entry → retro-rockets (hold ARM) → touchdown → "message sent" (skippable on replay)
- [x] Landing screen U-19: map zoom with 3 pins, "Signal delay: 10 min", "Landing time: ~7 min" (mark landing facts 📖 until verified, Part 3 §11)
- [x] First Signal Tracker taste: the "We landed" dot crossing to Earth (simple version)
- [~] Ship airlock cycle (reuse the Phase 3 airlock logic)
  - Reuses the interlock rule in the staged cabin. Exit places the player on the pad approach.
- [x] Jump hint (0.38 g) on first jump

### 4.D Level script
- [x] Title card: "This story is set in the future. Today, only robots explore Mars. The science is real."
- [x] Callsign + suit-pad colour picker → straight into the ship's seat
- [x] PEBBLE meets you outside ("I've been waiting 214 sols…") and leads you to the hab airlock
- [~] Inside: PEBBLE opens Station View for the first time; modules shown grey (standby); Life Support wakes, locked on
  - Opens Station View and raises the startup decision. Standby uses existing Off labels.
- [x] PEBBLE card "What wakes up next?" (Call Earth / Warm the hab / Start the greenhouse) with the effects of Part 2 M0
- [x] Dusk: PEBBLE's "Time to sleep" line → bunk → night time-lapse → first wake-up report
- [x] M0 can't fail

### 4.E VFX, lighting and audio
- [x] X-01 heat-shield glow + shake (reduced-motion: no shake)
- [x] X-02 retro-rocket dust blast
- [x] X-03 airlock depressurisation puff
- [x] X-05 sleep night time-lapse (first version)
- [x] L-06 landing cabin lighting
- [~] Landing audio set; touchdown → silence → soft music
  - Procedural effects and short landing/touchdown cues. A looping surface score is pending.

### 4.F Verify
- [ ] Play M0 from the title to the first wake-up report without help (6–8 min)
- [x] `?demo=landing` URL flag plays only the landing
- [x] Update `docs/game/missions.md` (M0); CHANGELOG

- [ ] **Done when:** M0 plays start to finish and ends with the first wake-up report.

---

## Phase 5 — Level 1: Night Shift (M1) ⭐

**Read:** Part 2 §4 M1, Part 3 §3.2 (balance), §2.1 (sleep).

### 5.A Assets needed (asset gate §0.3)
- [x] `solar-array-row`, `battery-bank` (from Phase 2)
- [x] `greenhouse-dome` (P1: placeholder allowed; Tray 1 can be a Station View tag only)
- [x] `lab-bench` (P1: placeholder allowed)
- [x] `window-hab` with the frost overlay node
- [ ] Night lighting L-03 (needs `night-sky`)
- [ ] Audio: cold-night creak, yellow warning chime, wake-up chime, sleep lullaby

### 5.B Environment and placement
- [ ] Greenhouse dome (or placeholder) and lab corner placed; their loads registered in Station View
- [ ] A hab window with a view of the array for the sunset beat

### 5.C Features
- [ ] **Night plan panel** in Station View: night loads (heaters full/low, greenhouse lights, lab, PEBBLE charging)
- [ ] **Night forecast line**: battery % to dawn, ■ markers where a module would switch off
- [ ] Sleep wake-up event at 02:00 (cold dip) when the plan is tight → small card (turn off one more / accept the risk)
- [ ] Frost overlay V-02 grows during the night; heaters dimming visible in the wake report
- [ ] Mission badge "Dawn with ≥ 20% battery"

### 5.D Level script
- [ ] Setup: late afternoon, battery 70%, Tray 1 seedlings planted by PEBBLE, lab samples waiting
- [ ] Sunset beat: solar flow line shrinks to zero in Station View; PEBBLE line "Solar's at zero…"
- [ ] PEBBLE card "What runs tonight?" (A/B/C/D, effects as Part 2 M1)
- [ ] Sleep → (optional wake at 02:00) → wake report with the Why Chain bead
- [ ] Win/strain evaluation; no Return to Ship possible (Life Support locked)

### 5.E Verify
- [ ] Each option A–D produces the expected dawn battery: A ≈ empty before dawn, B ≈ nearly empty, C ≈ low + cold, D ≈ 15%
- [ ] Update `docs/game/missions.md` (M1); CHANGELOG

- [ ] **Done when:** all four night plans play out correctly and the wake report explains why.

> **MVP route:** go to **Phase 14** next.

---

## Phase 6 — Level 2: Seeds (M2)

**Read:** Part 2 §4 M2, Part 3 §3.5.

### 6.A Assets needed (asset gate §0.3)
- [x] `greenhouse-dome` (real model now), `greenhouse-int`, `greenhouse-tray` ×3 (6 pillow slots, LED cap)
- [ ] `plant-mizuna`, `plant-wheat`, `plant-pepper` (nodes `stage_1`…`stage_5`, sick variant)
- [ ] `growth-pillow` (done), `seed-packet` (mizuna & wheat done, pepper next), `regolith-scoop` (done), `climate-dial` (done)
- [x] Material V-04 greenhouse magenta (token `grow-magenta`), V-06 plant green (token `plant-green`)
- [ ] L-08 greenhouse lighting · I-08 Veggie data card image (credited)
- [ ] Audio: greenhouse fan + drip

### 6.B Environment and placement
- [ ] Greenhouse interior scene reachable from the hab (corridor or airlock-free connector)
- [ ] Trays placed; plants spawn by tray state

### 6.C Features
- [ ] Planting interaction (pick packet → press into pillow); raw-regolith block with PEBBLE's line
- [ ] Photoperiod dial (12/16/20) → load + growth factor
- [ ] Growth stages switch visibly; harvest ETA tag in Station View
- [ ] Plant naming (PEBBLE names them; the player can rename)
- [ ] Greenhouse info panel U-17

### 6.D Level script
- [ ] Perchlorate data card → PEBBLE card "What to grow (choose 2 of 3 trays)" → planting
- [ ] Win: two trays planted, watered and lit

- [ ] **Done when:** crops grow over sols with correct timing and the harvest ETA reacts to light and power.

---

## Phase 7 — Level 3: Ice Run (M3)

**Read:** Part 2 §4 M3, Part 3 §3.4.

### 7.A Assets needed
- [ ] `mars-rover` ✅ with a driver's seat (`seat_anchor`, `cargo_anchor`) per T-10
- [ ] `ice-apron-patch`, `ice-crate` (clean/dirty), `ice-drill-rig` (node `handle`)
- [ ] `water-processor` (node `filter_bay`), `filter-cartridge`, `rover-pad`, `rover-trailer` (optional)
- [ ] Material V-05 water ice (token `ice-pale`) · I-09 SWIM map image (credited)
- [ ] VFX X-11 drilling debris, X-12 wheel dust · Audio: rover motor, drill, ice crack, processor gurgle

### 7.B Environment and placement
- [ ] Ice apron area at the map edge + level-loading cut for the ~1 km drive
- [ ] Two drill sites (near edge / deep apron) with markers
- [ ] Water processor placed in the yard; rover pad

### 7.C Features
- [ ] First-person rover driving (seat camera), speed vs battery on the dashboard, PEBBLE rides in the cargo bed
- [ ] Drilling mini-task (hold, depth meter, debris then ice)
- [ ] Crate loading (PEBBLE carries), unloading into the hopper
- [ ] Processor: dirty ice = +40% power and faster filter wear; filter bar

### 7.D Level script
- [ ] WATER at 5 sols → PEBBLE card "Where to drill" → drive → drill → return (a sleep between Sols 5 and 6) → process
- [ ] Win: WATER ≥ 10 sols

- [ ] **Done when:** both drill choices work end to end and change processor power and filter wear.

---

## Phase 8 — Level 4: Air You Can't See (M4)

**Read:** Part 2 §4 M4, Part 3 §3.3.

### 8.A Assets needed
- [ ] `life-support-rack` (nodes `cartridge_slot`, `valve`), `scrubber-cartridge`
- [ ] `oxygen-maker` (exterior), `electrolyser-rack` (interior)
- [ ] I-07 MOXIE data card image (credited) · VFX X-14 stuffy-air haze · Audio: cartridge latch

### 8.B Environment and placement
- [ ] Oxygen Maker in the yard (cabled); electrolyser rack in the hab

### 8.C Features
- [ ] Cartridge swap mini-task (unlatch, pull, insert, latch)
- [ ] O₂ source mix control (Station View) + vent airflow animation + water tank level
- [ ] CO₂ yellow/red feedback; energy drop if not fixed in 2 Mars hours

### 8.D Level script
- [ ] MOXIE data card → PEBBLE card "This week's oxygen source" (A/B/C) → cartridge swap
- [ ] Win: cartridge swapped and a plan set

- [ ] **Done when:** both machines change AIR, WATER and POWER as specified.

---

## Phase 9 — Level 5: Dust Devil (M5)

**Read:** Part 2 §4 M5.

### 9.A Assets needed
- [ ] `brush-tool` (the player's tool only; PEBBLE has no brush), `crate-supply` (PEBBLE hides behind it)
- [ ] PEBBLE `Clean` clip + air-puff VFX from `nozzle_r` (reuse X-10 with a puff shape)
- [ ] VFX X-08 dust devil, X-10 brushing dust · Audio: dust devil whoosh, brush, PEBBLE scared beep
- [ ] PEBBLE face P1: Scared, Proud

### 9.B Environment and placement
- [ ] Dust devil path across the yard; a crate for PEBBLE to hide behind

### 9.C Features
- [ ] Panel dust jump (5% → 30%), solar −25%
- [ ] Clean-it-yourself EVA (brush each `panel_*`)
- [ ] PEBBLE "clean panels" job from Station View (3 h, cleans to ~15%; PEBBLE not home)
- [ ] Wait-for-breeze option (35% per sol, odds shown in words and numbers)
- [ ] "PEBBLE obeys instantly" tooltip
- [ ] Act I wrap-up card + Field Guide page

- [ ] **Done when:** all three cleaning choices work and change the harvest ETA through power.

---

## Phase 10 — Level 6: Power Delivery (M6)

**Read:** Part 2 §4 M6.

### 10.A Assets needed
- [ ] `cargo-lander`, `fission-unit`, `keep-out-marker`, `cable-spool`, `rover-trailer`
- [ ] VFX X-19 keep-out ring · I-12 fission data card image (credited) · Audio: cargo lander descent, fission hum

### 10.B Environment and placement
- [ ] Cargo lander landing spot; three fission sites (plain 1 km, behind the mesa spur 1.3 km, or delayed)

### 10.C Features
- [ ] Station View placement mode: drag the ghost, live ring + cable length
- [ ] Towing with the rover; cable laying from the spool (PEBBLE follows with the cable end)
- [ ] Fission 6 kW online → steady FISSION flow line (cool colour)
- [ ] Unlocks: Tray 3, Oxygen Maker full-time, more lab hours (each adds a load)

- [ ] **Done when:** fission works in all three branches with their side costs.

---

## Phase 11 — Level 7: Earth Is Listening… Slowly (M7)

**Read:** Part 2 §4 M7, Part 3 §3.7 (comms).

### 11.A Assets needed
- [ ] `console-comms`, `comms-dish` (node `dish`), `test-kit`, `wrench`
- [ ] U-16 Comms Desk + Signal Tracker · I-11 orbit diagram (SVG)
- [ ] VFX X-13 signal light dot · Audio: dish motor, data chirp, message arrival tone, tracker ping

### 11.C Features
- [ ] Signal Tracker: Sun/Earth/Mars diagram, the light dot, "arrives Earth" and "reply could arrive" times
- [ ] Send packets (dish power during upload), timestamped inbox
- [ ] Test kit (3 per campaign; 50% "light or nutrients" uncertainty)
- [ ] Scrubber valve stuck event during the wait (yellow 10 min, red 25 min) + valve mini-task
- [ ] Late Earth reply arrives after the fix

### 11.D Level script
- [ ] Yellow wheat ("Goldie") → PEBBLE card "How to diagnose" → valve twist → late reply → PEBBLE's line

- [ ] **Done when:** the tracker visibly shows the reply arriving after the red line.

---

## Phase 12 — Level 8: Science or Safety (M8)

**Read:** Part 2 §4 M8, Part 3 §3.6.

### 12.A Assets needed
- [ ] `crater-ice`, `crater-small`, `ice-core-tube`, `rock-sample`
- [ ] `console-weather` (from MVP), U-12 Space Weather Desk with curated DONKI flare week

### 12.C Features
- [ ] EVA duration choices with dose accumulation; dose badge fill
- [ ] Over 90 DP: outdoor work limited (PEBBLE does jobs, time caps)
- [ ] Forbush decrease event (cheaper EVA window)
- [ ] Sample coring mini-task; science samples counter

- [ ] **Done when:** the three EVA choices give the expected doses and science.

---

## Phase 13 — Level 9: Storm Season (M9)

**Read:** Part 2 §4 M9.

### 13.A Assets needed`rock-pebbles`, `rock-boulders`, `rock-cluster`
- [ ] `mesa-distant`, `ridge-horizon`
- [ ] `mesa-cliff-overhang` (nodes: `shelter_zone`)
- [ ] `hab-module` (nodes: `roof`, `info_anchor`, window positions)
- [ ] `hab-airlock` (nodes: `outer_hatch`, `inner_hatch`, `roof`, `info_anchor`)
- [ ] `storm-shelter-module` (nodes: `roof`, `info_anchor`)
- [ ] `solar-array-row` ×4 (nodes: `panel_*`, `info_anchor`)
- [ ] `battery-bank` (nodes: `charge_bar`, `info_anchor`)
- [ ] `pebble-dock`
- [ ] `landing-pad`, `landing-scorch`
- [ ] `landing-ship` (exterior; nodes: `hatch`, `ramp`, `nozzle_*`, `window_*`)
- [ ] `cable-run` (straight, bend, T), `cable-junction` (node: `lid`)
- [ ] `crate-supply`
- [ ] `dust-drift`, `rover-tracks`
- [ ] VFX X-09 storm haze · L-07 dust storm lighting · Audio: storm wind, dust storm music
- [ ] `pebble-track-skirts` (P2: optional upgrade)

### 13.C Features
- [ ] Storm forecast 2 sols ahead with an opacity strip in the wake report
- [ ] τ curve: build 2 sols, peak 4 sols, clear 3 sols; sky and fog follow
- [ ] Daily shed decision moments in Station View
- [ ] Grit event (rover and PEBBLE): repair or no driving for 2 sols

- [ ] **Done when:** the base survives the storm with and without fission and the wake reports show the effects.

---

## Phase 14 — Level 10: The Day the Sun Roared (M10) ⭐

**Read:** Part 2 §4 M10, Part 3 §3.6 (SEP profile), §8.4 (DONKI), §11.

### 14.A Assets needed (asset gate §0.3)
- [ ] `mesa-cliff-overhang` (node `shelter_zone`) — from Phase 2
- [ ] `cable-junction` (node `lid`) at the repair spot — from Phase 2
- [ ] `storm-shelter-module` + `shelter-interior` (water tanks, pantry racks, bench, dose screen `screen_anchor`)
- [ ] `water-tank-int` (fill node), `pantry-rack`, `ration-pack`
- [ ] `water-wall-valve` (P1: placeholder allowed)
- [ ] `dose-badge`, `console-weather`
- [ ] U-12 Space Weather Desk (archived DONKI) · U-20 data card · I-04 Curiosity/RAD image (credited) · I-05 Sun → CME → Mars diagram
- [ ] VFX X-04 particle snow (visor + PEBBLE face) · X-16 aurora (P2, optional)
- [ ] L-05 shelter/alarm lighting
- [ ] PEBBLE face: Alarm, Static, Rebooting
- [ ] Audio: solar event alarm, dose ticks, PEBBLE glitch, alarm tension music

### 14.B Environment and placement
- [ ] Repair junction 150 m from the hab, 40 m from the overhang (match the layout doc)
- [ ] Shelter interior scene reachable from the hab (inner hatch)
- [ ] Overhang `shelter_zone` trigger volume for the dose model location `overhang`

### 14.C Features
- [ ] Curated DONKI data loaded (Phase 18 file; MVP can start from a minimal JSON with the CME record and provenance)
- [ ] SEP event: X-ray flash → seeded onset 10–40 Mars min → rise 1 h → peak ~2 h → 6 h tail; integrates to 39 DP outside
- [ ] Location shielding factors G and S applied live (outside / overhang / hab / shelter / water wall)
- [ ] Particle snow intensity = dose rate
- [ ] Water-wall valve: moves 30 L to the walls (S 0.2 → 0.1), locks that water
- [ ] PEBBLE glitch + reboot when hit outside
- [ ] Debrief data card with the 8,100 µGy ÷ 210 µGy ≈ 39 sols calculation and "[N] DP" from the sim

### 14.D Level script
- [ ] Banner "This mission uses real space weather from 20 May 2024."
- [ ] Repair task outside with PEBBLE holding the cable (70% done)
- [ ] Flash → PEBBLE's alarm line → **PEBBLE card: Commander's Call** (A run to the hab shelter / B overhang / C finish the repair), no timer
- [ ] Each branch plays: A run + tonight's power cut; B wait out the peak, then finish the repair (suit air drain); C finish then run, highest dose, outdoor limit later
- [ ] Shelter scene, PEBBLE reboot line, debrief
- [ ] Win: inside or under the overhang before the peak; strain: badge > 70 DP

### 14.E Verify
- [ ] Expected doses per branch match Part 3 §3.6 within tolerance across 20 seeds
- [ ] `?demo=1` starts M10 from a prepared state
- [ ] Update `docs/game/missions.md` (M10); CHANGELOG

- [ ] **Done when:** all three branches play and the debrief shows the real-data numbers with correct labels.

> **MVP route:** continue with the ⭐ items of Phases 17, 18 and 19, then Phase 20.

---

## Phase 15 — Level 11: Silence (M11)

**Read:** Part 2 §4 M11.

### 15.A Assets needed
- [ ] U-22 Standing Orders board · PEBBLE face P1: Sad, Curious · blackout music cue

### 15.C Features
- [ ] Last upload: pick 3 of 5 packets; benefits scheduled after the blackout
- [ ] Blackout Sols 41–54: inbox closed, Signal Tracker flat behind the Sun
- [ ] Standing Orders (priorities, light hours, O₂ mix, EVA rule) drive the sleep-to-sleep run
- [ ] 3–4 event cards drawn during the blackout; PEBBLE company lines (plant names, saved family messages, sol countdown)

- [ ] **Done when:** the blackout runs on Standing Orders with events and no Earth contact.

---

## Phase 16 — Level 12: Harvest & Signal (M12)

**Read:** Part 2 §4 M12, §7.

### 16.A Assets needed
- [ ] `harvest-bin`, `celebration-table` (P2) · PEBBLE face: Heart · VFX X-18 harvest sparkle · harvest/ending music · signal-returns music

### 16.C Features
- [ ] Harvest interaction (pick, bag, weigh) with PEBBLE holding the basket
- [ ] Early wake-up at 06:12 when the signal returns; the timestamped first message
- [ ] M11 packets pay off (fix list, plant advice, doctors' notes)
- [ ] PEBBLE card "What to do with the harvest" (celebrate / bank / seed saving)
- [ ] Station View dawn fly-around → Mission Report → ending → certificate

- [ ] **Done when:** the campaign can be finished end to end.

---

## Phase 17 — Campaign glue (skips, events, medals, endings)

**Read:** Part 2 §2.3–2.5, §6, §7, §8.

- [ ] ⭐ Mission Log skip card between levels ("Sols 3–5: PEBBLE ran your Standing Orders") with a "While You Were Away" report
- [ ] ⭐ MVP bridge: Sol 2 → Sol 37 skip card with a prepared base state
- [ ] ⭐ Mission Report U-14 (medal strip, ≤ 5 Why Chain beads, best decision, one "what if?", Try again)
- [ ] ⭐ Return to Ship flow end to end (walk to the ship, Why Chain, try-again options, Continue with help)
- [ ] Event deck E1–E20 content (each with ≥ 2 responses, forecasts where real)
- [ ] Night events wake you through PEBBLE
- [ ] Medals: Safe Commander, Self-Reliance, Science, Harvest (gold/silver/bronze thresholds of Part 2 §7) · U-25 art
- [ ] Endings: Golden Season, Lean but Safe, Science Hero, Back from the Ship
- [ ] Mission badges (optional goals per level)
- [ ] Seed code option for classrooms
- [ ] Act cards (I-10)

- [ ] **Done when:** a full campaign run produces medals and an ending; the MVP run produces a Mission Report.

---

## Phase 18 — NASA data, Sources and Live sky

**Read:** Part 3 §8.4, §11.

- [ ] ⭐ `scripts/fetch-donki.mjs` against the new base URL `https://ccmc.gsfc.nasa.gov/DONKI-API/get/…`; output `src/sim/data/spaceweather-2024-05.json` with the provenance record
- [ ] ⭐ `rad-gale.json` (210 µGy/sol, 8,100 µGy) with source URLs
- [ ] ⭐ Source badges (🛰 🧮 🎮 📖) on every on-screen number (acceptance A4)
- [ ] ⭐ Sources & Credits page U-15 (provenance cards, DONKI Rules of the Road acknowledgement + disclaimer, AI-use note, NASA image credits, asset and audio credits)
- [ ] ⭐ ARCHIVED / LIVE labels everywhere DONKI data appears
- [ ] `meda-temp-shape.json` (24-point normalised curve, labelled "borrowed from Jezero")
- [ ] `comms-track.json`, `site.json`
- [ ] Live sky (optional): browser fetch of the last 7 days, 1 h cache, offline fallback banner; test CORS first
- [ ] Verify the landing facts on NASA EDL pages before switching the M0 card from 📖 to 🛰
- [ ] Find a source for "cleaning breeze" before calling it a NASA fact

- [ ] **Done when:** every dataset has a provenance record and the Sources page lists them all.

---

## Phase 19 — Polish: audio, accessibility, performance, playtest

**Read:** Part 3 §4.8, §8.6, §8.7, §13.

### 19.A Audio
- [ ] ⭐ P0 SFX set and P0 music cues (catalog §13) wired and mixed; outside sounds muffled
- [ ] P1/P2 audio
- [ ] Subtitles for every line; no audio-only information

### 19.B Accessibility
- [ ] ⭐ Text size 100/125/150%, reduced motion (no shake, shorter transitions), FOV slider, centre dot, hold/toggle
- [ ] ⭐ Colour-blind check of HUD, cards and Station View tags
- [ ] Remappable keys (stretch) · Arabic UI (stretch)

### 19.C Performance
- [ ] ⭐ ≥ 50 fps median on an integrated GPU in first person and Station View; ≤ 200 draw calls; ≤ 300k triangles visible
- [ ] ⭐ Initial download ≤ 15 MB (interiors and ship cabin lazy-loaded)
- [ ] ⭐ Fresh-profile, offline run from title to M10 debrief

### 19.D Balance and tests
- [ ] `scripts/sim-balance.mjs` (5 bots incl. Careless, 1,000 seeds); targets of Part 3 §3.9 met
- [ ] ⭐ All acceptance criteria A1–A14 (Part 3 §13.2) checked; record results

### 19.E Playtest
- [ ] ⭐ Proxy test (7-year-old reading level) of the MVP route; fix wording
- [ ] Child playtests only with parent consent, no recordings; the 4 questions of Part 3 §13.1

- [ ] **Done when:** acceptance criteria pass (or gaps are written down) and the MVP route plays smoothly offline.

---

## Phase 20 — Release and submission ⭐

**Read:** Part 3 §14, Part 1 §1.1 (rules).

- [ ] ⭐ `npm run build` and `npm run lint` pass
- [ ] ⭐ Deploy the static build; the public link opens logged-out on another device
- [ ] ⭐ `?demo=landing` and `?demo=1` work on the public build
- [ ] ⭐ Record gameplay; produce the 30 s video (Part 3 §14.1) or the 7 slides (§14.2); adult or synthetic voice only; no under-18 likeness
- [ ] ⭐ Project summary (problem, solution, impact, challenge fit)
- [ ] ⭐ Resources list with every dataset URL (Part 3 §11)
- [ ] ⭐ AI-use disclosure (in the submission and on the Sources page)
- [ ] ⭐ No NASA logo; "Created for NASA Space Apps Challenge 2026" credit line
- [ ] ⭐ Public GitHub repo link
- [ ] ⭐ Team leader submits locally and on the global site before the confirmed deadline
- [ ] ⭐ Final docs pass: `docs/README.md` links, CHANGELOG entry, `docs/game/missions.md` current

- [ ] **Done when:** the submission is confirmed received.

---

## Missing Assets Log

Add one line per missing asset as you find it. Don't delete lines; tick them when the real
asset replaces the placeholder.

Format:
`- [ ] <asset-id> — needed by Phase <n> §<section> — placeholder: <what> — found YYYY-MM-DD — notes`

<!-- Example (delete when the first real entry is added):
- [ ] pebble-track-skirts — needed by Phase 13 §13.A — placeholder: none (optional upgrade skipped) — found 2026-11-14 — P2
-->

---

## Known Gaps Log

Things that were finished with a compromise (`[~]` items) and still need work.

- [ ] Phase 2 §2.C: night palette uses existing token-derived colours — night-sky approval deferred; no new token silently introduced — 2026-11-12
- [ ] Phase 2 §2.D: exhaustive first-person manual traversal and integrated-GPU ≥50 fps median remain unverified — real capsule/route checks and representative browser/render counters pass, but embedded Pointer Lock and hardware qualification limit proof — 2026-11-12

- [ ] Phase 1 §1.F: the stated 44 kWh essentials-night estimate conflicts with the specified heater formula — formula preserved and verified at 36.65 kWh for the provisional temperature curve; revise the estimate or explicitly retune the formula before balancing missions — 2026-11-12

- [ ] Phase 0 §0.A: test runner, hosting, rover driving, font/audio sources and five new colour tokens explicitly deferred — owner requested checklist completion without further selections; revisit at the phase boundaries in `docs/game/preflight.md` — 2026-11-12
- [ ] Phase 0 §0.B: mouse look in a normal desktop browser remains unverified — in-app browser rejects Pointer Lock; rendering and keyboard walking passed — 2026-11-12

Format:
`- [ ] Phase <n> §<section>: <what's missing> — reason — YYYY-MM-DD`
