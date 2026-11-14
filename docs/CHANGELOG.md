# Changelog

## 2026-11-14 — Survival stakes: the crew can die

- Why: choices only moved meters, and an empty supply had no effect, so decisions did not feel like they mattered.
- Food is now eaten (1 day per 120 s). Oxygen, water and food at zero start strain timers; the crew dies after 20 s / 60 s / 90 s unless the supply returns (strain recovers at 2×).
- Radiation is fatal at 600 µGy (warning at 300).
- A tray blocked for 40 s dies permanently (no food, never regrows).
- New ending `lost` with a `cause`, a Mission Lost panel (cause, the choices that led here, a tip, Try Again). Lost runs cannot be continued.
- While weakened the player cannot run or jump; the HUD shows a countdown banner and a pulsing vignette. The food meter shows consumption.
- Report food target lowered from 12 to 8 days to account for eating. Story state is now `version: 2`; older saves are ignored.
- Updated: `src/sim/story/story.ts`, `src/sim/story/script.ts`, `src/state/useStoryStore.ts`, `src/ui/StoryHud.tsx`, `src/ui/StoryHud.css`, `src/game/player/Player.tsx`, `src/game/StoryBridge.tsx`, `src/game/world/StoryWorld.tsx`, `tests/sim/story.test.mjs`.
- Docs: updated `docs/game/mission-critical.md`, `docs/tech/ui.md`, `docs/tech/player.md`.

## 2026-11-14 — Kid-Friendly Results Screen with Vibrant Colors & Science Report Toggle

- Redesigned the mission end results debrief for the Junior Astronaut Mission Trainer audience:
  - Simple, colorful, clutter-free default screen tailored for kids, avoiding dense walls of text and cognitive overload.
  - Vibrant, distinct color-coded indicators for all 5 vital systems:
    - ⚡ Power: Sunny Yellow / Solar Orange (`#FF9F1C`), thick gradient fill bar, `✓ FULL BATTERY!`, and simple solar panel tips.
    - 💧 Water: Sky Blue (`#00B4D8`), thick gradient fill bar, `✓ LOTS TO DRINK!`, and fresh water recycler tips.
    - 🫁 Oxygen: Fresh Mint (`#06D6A0`), thick gradient fill bar, `✓ FRESH & CLEAN!`, and clean air tips.
    - 🥕 Food: Garden Orange / Pink (`#F59E0B`), thick gradient fill bar, `✓ YUMMY HARVEST!`, and 3/3 tray harvest tips.
    - 🛡️ Shield: Cosmic Purple (`#7B2CBF`), thick gradient fill bar, `✓ SUPER SAFE!`, and shelter timing tips.
  - Celebratory hero banner featuring 5 big golden stars (`★ ★ ★ ★ ★`), high-contrast score badge (`5 / 5 SYSTEMS READY! 🚀`), and encouraging Junior Astronaut congratulations.
  - Simplified milestone cards highlighting player accomplishments with big emojis and colorful tags (`SOLAR HERO`, `FRESH LIFE SUPPORT`, `GREENHOUSE MASTER`, `SAFE & SOUND`).
  - PEBBLE high-five cheer card with friendly robot buddy avatar and positive reinforcement.
  - Dedicated toggle button (`[ 📋 View Full Scientific Report (NASA Citations & Detailed Telemetry) ]` / `[ ⬆️ Hide Full Science Report (Back to Simple View) ]`) that seamlessly exposes the full engineering telemetry table, tactical tradeoffs, and NASA research citations (OSDR RadLab, Mars Trek, DONKI, BVAD) on demand.
  - Tightened modal padding and element gaps so that the primary action buttons (`🚀 Play Again!` and `🏠 Main Menu`) are fully visible above the fold on standard displays without scrolling.
- Updated: `src/ui/StoryHud.tsx`, `src/ui/StoryHud.css`, `scripts/capture-ending.mjs`.
- Artifacts: updated `results_viewer.html` and `visual_results_debrief.md`.
- Docs: updated `docs/game/mission-critical.md`, `docs/tech/ui.md`.

## 2026-11-14 — Visual Mission Debrief & Results Dashboard

- Transformed the plain text end-game results modal into a comprehensive visual astronaut debriefing dashboard:
  - Overall mission evaluation banner with glowing status, star ratings (1 to 5 stars based on graded criteria), pass count chip (`X / 5 SYSTEMS NOMINAL`), and crew readiness summary.
  - 5-system telemetry gauge grid: dedicated visual meter cards for Power Grid, Water Reserves, Atmospheric Oxygen, Crop Biomass, and Radiation Safety, with calibrated progress fill bars, safe threshold indicator ticks, status badges (`✓ PASS` / `✗ DEFICIT`), and live telemetry context.
  - Tactical decision breakdown: replaced raw string bullets with structured operational cards analyzing Energy Infrastructure (manual panel scrub vs backup battery buffer), Closed-Loop Life Support (recycler & oxygen generator loops), Biosphere & Crops (cultivation regime and harvest yields), Solar CME Defense (emergency circuit priority vs greenhouse override), and Radiation & Hardware Protection (regolith bunker protection and equipment cover status), complete with positive and negative consequence trade-offs (`+` / `−`) and domain badges.
  - Autonomous PEBBLE debrief transmission card with companion avatar and contextual debrief commentary.
  - Authentic NASA science citations grid linking out to OSDR RadLab (Curiosity RAD data), Mars Trek (orbital topography and irradiance), DONKI (solar weather models), and BVAD (human life-support baseline values).
  - Prominent action controls: `New Expedition / Play Again` and `Return to Main Menu`.
- Automated visual verification: added headless browser screenshot capture script (`scripts/capture-ending.mjs`) to render and capture the full debrief dashboard.
- Updated: `src/ui/StoryHud.tsx`, `src/ui/StoryHud.css`, `scripts/capture-ending.mjs`.
- Docs: updated `docs/game/mission-critical.md`, `docs/tech/ui.md`.

## 2026-11-14 — Enlarged PEBBLE chat UI, buttons, and added always-online assistant

- Made PEBBLE chat card, face avatar, and shortcut buttons significantly larger and clearer:
  - Face avatar increased to 3.6em / ~56px with a dedicated high-contrast badge background.
  - Card text, title, and `<kbd>` badges scaled up for crisp readability from distance.
  - Shortcut buttons (`[M] Quick management`, `[P] Ask PEBBLE`) enlarged with generous padding, `cursor: pointer;`, and smooth hover/shadow effects.
  - Expanded chat modal widened to 32em with enlarged transcript bubbles, starter question buttons, and taller input/send controls.
- Replaced the offline "chat link offline" block with an always-online assistant:
  - Added built-in autonomous local responder (`src/pebble/offlineResponder.ts`) that answers player questions about current scene objectives (Scenes 1–7), power tradeoffs, solar panel dust, water recycling, oxygen, greenhouse crops, radiation shelter, controls, and real NASA data.
  - Seamlessly falls back to local intelligence if Gemini API is unconfigured, unreachable, or times out.
  - Replaced empty chat screen with welcoming prompt and quick starter buttons.
- Updated: `src/ui/PebbleChat.tsx`, `src/ui/PebbleChat.css`, `src/ui/OutpostHud.css`, `src/pebble/offlineResponder.ts`, `server/pebble/chat.ts`, `tests/world/interactions.test.mjs`.
- Docs: updated `docs/tech/pebble.md`, `docs/tech/ui.md`.

## 2026-11-14 — Restored cursor mouse clicking on all menu buttons and dialogs

- Fixed menu buttons not responding to cursor mouse clicks in menus, pause panels, Touchdown intro, and modals.
- Removed pointer and click event cancellation from `src/ui/useKeyboardMenus.ts` that erroneously intercepted all pointerdown and click events outside the home screen (`mode !== 'home'`).
- Enhanced `.oh-dialog button` with `cursor: pointer;` and visible `:hover` transition and highlighting states in `src/ui/OutpostHud.css`.
- Ensured `<dialog>` in `src/ui/Modal.tsx` retains `data-mouse=""` across all views.
- Updated: `src/ui/useKeyboardMenus.ts`, `src/ui/Modal.tsx`, `src/ui/OutpostHud.css`, `tests/world/interactions.test.mjs`.
- Docs: updated `docs/tech/ui.md`.

## 2026-11-14 — Generous interaction prompt detection and reticle aim tolerance

- Fixed interaction prompts (`[E] ...`) being difficult to trigger due to an overly strict depth-scaled view cone that penalized looking at objects at close range.
- Expanded view cone angle in `aimedTarget` from `depth * 0.24` to `depth * 0.8` (approx. 40° half-angle), eliminating pixel-hunting while still correctly resolving the nearest target along the line of sight.
- Tuned interaction `range` and `aimRadius` across all interactables:
  - Outside story targets: base range increased to 3.8m, aimRadius 1.2m.
  - Solar panels: range 4.8m, aimRadius 1.8m.
  - Hab console & report pad: range 3.8m, aimRadius 1.4m.
  - Greenhouse & shelter doors: range 3.4–4.5m, aimRadius 1.4–1.8m.
  - Hab airlock inner/outer hatches: range 3.8–4.2m, aimRadius 1.5–1.6m.
  - PEBBLE companion: range 3.8m, aimRadius 1.4m.
  - Levers: aimRadius broadened from 0.12m to 0.22m to make pulling levers responsive while keeping adjacent levers distinct.
- Updated: `src/game/interaction/targeting.ts`, `src/game/world/StoryWorld.tsx`, `src/game/world/Hab.tsx`, `src/game/world/Pebble.tsx`.
- Docs: updated `docs/tech/player.md`.

## 2026-11-14 — Control terminal opens isometric station view with left-docked subsystems panel

- Interacting with the hab control terminal (E) now switches directly to the isometric Station View instead of opening the modal dialog, while triggering story progression and dialogue lines.
- In isometric Station View, the left side displays the resources meters alongside a docked Station Subsystems card showing solar generation/consumption rates, real-time status of all 6 base modules and the active operating priority, with quick navigation to objectives.
- Replaced the redundant center overlay card in isometric view with the left-docked card, leaving the 3D base unobstructed.
- Updated: `src/game/world/StoryWorld.tsx`, `src/ui/StoryHud.tsx`, `src/ui/StoryHud.css`, `tests/world/interactions.test.mjs`.
- Docs: updated `docs/game/mission-critical.md`, `docs/tech/views.md`, `docs/tech/ui.md`.

## 2026-11-13 — "Mars: Mission Critical" 10-minute story game

- Replaced the "7 Sols" outpost game with the user's 7-scene script (arrival, power, life
  support, greenhouse, review, radiation emergency, report with two endings). Old files moved
  to `archive/seven-sols/` (not built); `src/sim/outpost/data.ts` and `radlab.ts` stay in use.
- Choices are physical acts, not menus: scrub panels or throw the backup breaker, pull one
  priority lever, hold the override switch or pull the Emergency lever. The mission card shows
  both options with "OR", where to do each and its +/− consequences.
- The greenhouse is now walkable: valve wheel, grow-light switch, priority board, three trays
  that grow, block (red lamp) and are harvested by hand. The hab gets a second priority board.
- PEBBLE / Mission Control dialog box is always on screen with a sound for each new line;
  the last line stays visible. M opens quick management.
- New Kiln model `water-recycler` (socket, lamp; [brief](../assets/briefs/water-recycler.md)),
  placed at (2.5, 14.3). New props: backup breaker, filter rack, radiation covers.
- New: `src/sim/story/`, `src/state/useStoryStore.ts`, `src/game/StoryBridge.tsx`,
  `src/game/world/StoryWorld.tsx` + `storyLayout.ts`, `src/ui/StoryHud.tsx` + `.css`,
  `StoryDialog.tsx`, `Modal.tsx`; interaction holds now take a per-target `holdSeconds`.
- Verified: `npm test` 129 pass (incl. careful and risky story playthroughs and module overlap),
  `npm run build`, headless-Chrome screenshots of every scene, the greenhouse, hab, shelter
  and ending.
- Docs: new `docs/game/mission-critical.md`; updated `docs/README.md`, `docs/game/hackathon-mvp.md`
  (superseded note), `docs/tech/ui.md`, `docs/tech/world.md` (recycler row, story props, dock row
  corrected), `docs/tech/state.md`, `docs/tech/sim.md`, `assets/briefs/phase-7-batch.md`,
  `assets/briefs/water-recycler.md`.

## 2026-11-13 — Hackathon outpost: base re-layout, station models, warm HUD

- Base reorganised around one avenue (z 10.5) in front of the hab door; every station faces it.
  Shelter and greenhouse west, oxygen maker east, ice drill/rover/crates south, comms and dock
  north-east (`siteLayout.ts`, `Stations.tsx`, new `Walkways.tsx`).
- Battery moved from beside the dock to the west end of the solar rows, inline on the power
  trunk (panels → battery → hab). Dock cable now ends at the dock's back instead of its centre.
- Solar rows turned 180° so the panels face the other way (user request); feeds unchanged.
- Removed the floating oxygen pipe bridge; water and oxygen now run in buried trenches.
  Lamps cut to pairs along the ship road plus a few avenue points.
- New Kiln models: oxygen-maker, ice-drill, path-lamp ([phase-7 batch](../assets/briefs/phase-7-batch.md)).
- Landing cabin: helmet shelf moved off the suit rack (it clipped the suit's helmet).
- Warm HUD (`OutpostHud.css`), site picker (`SitePicker.tsx/.css`), pointer-lock controls.
- `useEnergy` renamed `spendEnergy` (hooks lint rule). World tests updated for the new layout.
- Verified: `npm test` 128 pass, `npm run build`, `npm run lint` (existing warnings only),
  browser Station View and cabin checks.
- Docs: `docs/tech/world.md`, `docs/game/hackathon-mvp.md`, `docs/tech/ui.md`, `docs/README.md`,
  `assets/briefs/phase-7-batch.md`.

## 2026-11-13 — Homepage start screen, background artwork, and 3D Asset Catalog

- Replaced game start screen with full-screen custom Mars illustration background (`assets/background main menu.png` copied to `public/ui/background-main-menu.png`).
- Created dedicated Homepage (`MainMenu.tsx`, `MainMenu.css`):
  - Displays primary actions: **Continue Game** (when saved expedition exists), **New Game**, and **Catalog**.
  - On first run (no save): presents exactly 2 buttons: **New Game** and **Catalog**.
  - New Game setup modal allows configuring Commander callsign and suit-pad colour with options to launch the Touchdown descent mission or deploy directly to the surface.
  - Removed "Free play" mode and button in favor of unified campaign gameplay.
- Added interactive 3D Asset Catalog (`Catalog.tsx`, `Catalog.css`):
  - Showcases all 50 procedural Kiln models registered in `assetManifest.json`.
  - OrbitControls turntable inspection with dynamic bounding-box auto-framing, auto-rotate, wireframe toggle, search filter, and category pills (Base & Habitat, Vehicles & Bots, Power & Tech, Station Interior, Environment, Expedition & Bio).
  - Displays asset metadata, polygon triangle count, compressed/raw file sizes, colliders, and material tokens.
  - Includes a "Walk Test Grounds" first-person mode using `AssetGallery` and player controls on the Martian surface.
- Updated `src/App.tsx`, `src/ui/TouchdownIntro.tsx`, and `src/ui/MissionPanels.tsx` (added Main Menu option in pause menu).
- Updated docs: `docs/tech/ui.md`, `docs/game/phase-4-touchdown.md`, `docs/CHANGELOG.md`.

- Upgraded onboarding cabin landing scene (`src/game/missions/LandingScene.tsx`):
  - Enabled canvas shadows, directional sun shadow mapping with optimal frustum and bias, and `castShadow`/`receiveShadow` across cockpit room, window frame, and cabin props.
  - Added outer space starfield (`<Stars />` with 4,000 twinkling stars) and deep space background during orbit and atmospheric entry.
  - Tuned cockpit lighting with realistic high-contrast directional sunbeams streaming through the window, gentle cyan terminal/console glow, amber indicator lights, and reduced ambient flood.
  - Added dynamic entry plasma lighting with animated fire flicker and retro-rocket thrust flare.
  - Added Mars surface ground, landing pad, scorch stain, and rock formations outside the cockpit window with atmosphere horizon and fog when landed.
  - All 84 tests and production build pass cleanly.
- Updated `docs/CHANGELOG.md`.

## 2026-11-13 — Removal of first-person arms

- Removed first-person astronaut arms model and rig per user request:
  - Removed `public/models/astronaut-fp-arms.glb` and deleted its entry from `src/game/assets/assetManifest.json` via `npm run asset:remove -- astronaut-fp-arms`.
  - Deleted `src/game/player/FirstPersonArms.tsx` and removed its import and component mount from `src/game/Game.tsx`.
  - Removed `ArmClip`, `arm` state, and `playArm()` from `src/state/useMissionStore.ts`.
  - Removed interaction arm clip triggers from `src/game/interaction/Interaction.tsx`, `src/game/world/Hab.tsx`, `src/ui/Hud.tsx`, and `src/ui/useGameShortcuts.ts`.
  - Updated `scripts/check-phase3-assets.mjs` test suite (12 models, 15 clips, and ground test).
  - All 84 tests, build, and lint pass cleanly.
- Updated `docs/CHANGELOG.md`, `game-design/05-implementation-checklist.md`.

## 2026-11-13 — Phase 5 and Phase 6 3D game models and tokens

- Created, verified, saved in Kiln, and ingested into game manifest (`public/models/*.glb`):
  - Phase 5: `greenhouse-dome` (exterior geodesic-ribbed glass dome, 5,180 tris), `lab-bench` (science analysis bench, 464 tris).
  - Phase 6: `greenhouse-tray` (Veggie tray with 6 pillow slots, water feed, LED cap, 324 tris), `greenhouse-int` (interior geodesic greenhouse shell, floor ring, and 3 tray positions, 3,296 tris), `growth-pillow` (Veggie pillow cushion with port, vent, and slit, 356 tris), `climate-dial` (wall-mounted photoperiod dial with 12/16/20 scale and rotatable knob, 440 tris), `regolith-scoop` (faceted sampling scoop with rock clods, arch frame, work lamp, and handle, 464 tris).
  - Seed packet variants: `seed-packet-mizuna` (280 tris, green leaf), `seed-packet-wheat` (232 tris, golden wheat ear).
- Added new style color tokens in `src/style/tokens.json`: `grow-magenta` (`#E040FB`, V-04), `plant-green` (`#5A9E58`, V-06), and `ice-pale` (`#D8EEF8`, V-05); synced via `npm run style:sync`.
- Rendered GPU material-faithful review images into `assets/reviews/phase-5/` and `assets/reviews/phase-6/`. Authored matching asset briefs in `assets/briefs/`.
- All 76 project tests and production build pass cleanly.
- Updated `docs/CHANGELOG.md`, `game-design/05-implementation-checklist.md`.
## 2026-11-13 — Touchdown mission

- Added the cabin and orbit sequence, ARM interaction, Mars Trek map, landing effects and sound, suit check and pressure-gated ship exit.
- Connected the pad walk, PEBBLE guide, station startup choices and first dawn report. Added separate campaign saves and the landing demo.
- Updated the docs index, game summary, mission status, UI and Touchdown docs, and implementation checklist.

## 2026-11-13 — Unified HUD readouts

- Restyled the gauges, clock and status chips to match the command bar. Grouped readings into compact controls and improved wrapping for narrow screens and larger text. Updated `docs/tech/ui.md`.

## 2026-11-13 — Playable Phase 3 station

- Added the hab and pressure-gated airlock, keyboard and pointer interactions, first-person arms, and a shared Station View with module controls and cable flows.
- Integrated PEBBLE steering, faces, jobs and decision cards. Added the resource HUD, Data Pad, settings, Why Chain, wake reports and checkpoint recovery so the base loop can be played before campaign missions.
- Updated the implementation checklist, docs index, game summary and mission status, Phase 3 verification, and the views, PEBBLE, HUD, player, physics, rendering, world, state and simulation docs.
## 2026-11-13 — Individual references for the remaining game objects

- Generated separate images for missing catalog objects, including greenhouse exterior/interior and matching grow tray, crop growth states, ice equipment, air machines, power delivery, shelter, harvest and support props.
- Saved outputs directly in `models and assets images/phase-N/`; retained original phase references and archived rejected new attempts. Added per-object prompts/provenance and a catalog-to-image modeling index.
- This delivery supplies visual references for later 3D modeling. It does not complete 3D assets, gameplay, UI, audio or NASA-source imagery tasks in the implementation checklist.
- Updated the reference library README, style generation record, docs index and image progress record.

Newest first. One entry per change to features, style, pipeline or tooling.
Format: `## 2026-11-13 — Phase 3 character, interior and UI asset gate

- Delivered 13 saved/ingested models: Box Buddy and twelve native clips, first-person arms and nine clips, astronaut Idle/Walk child revision, five-variant wall kit, two-tile floor/ceiling kit, inner door/window/airlock, console, bunk/chair/nook and Data Pad.
- Added ten SVG face expressions and U-23/U-24 icons/badges/tags, local Nunito/Baloo 2 variable fonts and original SIL OFL licences. Preserved all matching reference images. Fixed screen UV pruning and preserved Phase 3 semantic anchors.
- Reviewed GPU model/clip samples, browser model/face/first-person views and SVG/font inventory. All 76 tests/build pass; existing bundle and preview Fast Refresh warnings remain. Gameplay scene/controllers/interaction wiring remain separate.
- Updated asset briefs/batch index, catalog, checklist, preflight font record, docs index, PEBBLE/UI/pipeline/style docs. Existing base/command-center work preserved.

## YYYY-MM-DD — title`, then what changed, why, and which docs were updated.

## 2026-11-13 — Antigravity project setup

- Added Google Antigravity workspace rules in `.agents/rules/` and the Kiln MCP config `.agents/mcp_config.json`. Rules inline the existing `.cursor/rules/*.mdc` files so Cursor, Codex and Antigravity share one source.
- Updated `docs/tech/agents.md`, `docs/README.md`, `.cursor/rules/project-core.mdc`, and the comment above `developer_instructions` in `.codex/config.toml`.

## 2026-11-13 — Complete connected headquarters

- Built the user’s whole-base reference as a saved 8,320-triangle model with connected wing, octagonal entry, dish and twin towers; placed it on the existing terrain. Older library assets remain available.
- Preserved functional anchors/owners through optimization and corrected reflected render/collider winding. Added two regressions; 69 tests pass, with GPU and in-game visual review. Emissive surfaces are included; playable interiors and lighting effects remain future work.
- Updated README, asset brief/catalog/checklist, docs index, world/rendering/pipeline guidance and Phase 2 verification. Larger-model base view is about 205–220 draw calls, superseding the earlier small-base under-200 observation.

## 2026-11-12 — Dock, landing and cable model batch

- Created and saved seven reference-matched assets: PEBBLE dock, landing pad/scorch/ship and straight/bend/T cable covers. Preserved the images unchanged and followed their proportions; updated the old dock/ship/cable catalog dimensions.
- Preserved required nodes through optimization by skipping global instancing for semantic targets; increased catalog subprocess output capacity after a reproduced ENOBUFS failure. Corrected lander nozzle winding and checked open mouths/grounded feet.
- Verified material-faithful GPU renders, browser previews with game loader/lighting, 59 passing tests and production build. Existing bundle warning and preview Fast Refresh warnings remain.
- Updated asset briefs/index and current image paths, catalog, implementation checklist, docs index, world/rendering/pipeline/style guidance and asset-creation rule. Final mission placements and gameplay bindings remain pending.

## 2026-11-12 — Phase 2 concepts for dock, pad, scorch, ship, cables

- Kept the existing PEBBLE dock, landing pad, and cable-run (straight, bend, T) images in `models and assets images/phase-2/`. They already match the catalog parts.
- Replaced the landing ship so the upright lander shows four underside rocket bells, and replaced the scorch so it is a flat plum ground stain. Previous images are in `models and assets images/phase-2/archive/`.
- No 3D yet, and the Phase 2 checkboxes stay open until these designs are approved. Docs: this changelog only.

## 2026-11-12 — Mountain placement and foothills

- Lowered/broadened distant mesas and grouped them along northern/western high ground, with an open south-east basin and six physical foothills. Kept flat landing ground and aligned collision/scatter heights.
- After feedback on an overly smooth draft, restored reference-style facets and stepped ledges with modest edge smoothing. Followed the matching mesa/ridge PNGs now located inside the project.
- Verified browser appearance, terrain/collision checks, build and lint; existing warnings remain. Review: `assets/reviews/mars-landscape-refined.png`.
- Updated world/rendering docs, landscape brief and the Phase 2 terrain-refinement checklist item. Final mission layout remains pending.

## 2026-11-13 — Phase 2 base layout and simulation-driven exterior

- Composed the saved base, four solar rows, dock, rover, landing ship/pad, supply crate, overhang and repair junction on the existing landscape. Added flattened pads, cleared routes, a shelter approach ramp and instanced buried cables with bends/tees and saved splines.
- Added clock-driven sun/sky/night colours, opacity-driven fog, panel dust and nine battery lamps. Batches preserve source materials and semantic motion/cutaway owners; shadow policy reduces representative base submissions below 200 calls.
- Added eight world regression checks, including actual Rapier capsule routes, GLB bounds/triangle fidelity, anchor ownership, material isolation and unintended overlaps. Build/lint and 67 tests pass; browser site and appearance views reviewed. Hardware-qualified FPS and exhaustive mouse-look traversal remain explicit gaps.
- Corrected impossible 80/150/40 m layout estimates to a 110 m shelter entrance and 150 m repair point. Night colours temporarily derive from existing tokens pending night-sky approval.
- Updated world/rendering/simulation/state/player/UI docs, README/index/game summary, pipeline guidance, Phase 2 verification/checklist, design layout notes and project-core guidance. Existing saved assets/revisions are preserved.

## 2026-11-12 — Phase 1 simulation and fresh terrain world

- Unmounted displayed props while preserving the asset library and natural terrain/geology. Added the pure deterministic simulation, resource subsystems, priority shedding, time jumps/cards, saves/checkpoints, replay and ref-based game bridge.
- Added Node test and 60-sol stability scripts plus development-only diagnostics. Fixed immediate post-sleep fatigue and restricted pointer-lock activation to canvases so debug buttons remain usable.
- Verified 53 tests, three 60-sol seeded runs, build/lint and browser pause/wait/sleep/reload. Recorded the formula-based 36.65 kWh night versus the design's inconsistent 44 kWh estimate.
- Updated README, docs index, game summary/preflight/verification, simulation/state/UI/world/rendering/player docs, pipeline guidance, project-core rule and Phase 1 checklist/design note.

## 2026-11-12 — Phase 0 preflight and game documentation skeleton

- Read the design and project rules; recorded owner confirmation for pre-built work and explicit deferrals for the remaining preflight choices.
- Verified install, build, lint, 11 existing regression checks, asset inventory, browser rendering and first-person keyboard walking. Recorded existing bundle/lint/deprecation warnings, install audit findings and an in-app-browser Pointer Lock limitation.
- Added `docs/game/{README,missions,preflight}.md` and `docs/tech/{sim,views,pebble,ui}.md`, linked from `docs/README.md`; updated Phase 0 in the implementation checklist. Planned features are labelled as unimplemented. Phase 1 remains untouched.

## 2026-11-12 — PEBBLE design approved ("Box Buddy")

- Added the user-approved PEBBLE reference sheet `docs/style/references/generated/g05-pebble-box-buddy.jpg`, chosen from three tracked concepts. PEBBLE now rides on two tank-tread tracks (no wheels), has a small head on a short neck, and has two gripper arms (no brush; it cleans panels with a wrist air nozzle).
- Updated docs: `docs/style/STYLE_GUIDE.md` (supplementary sheet table), `docs/style/REFERENCE_GENERATION.md` (prompt and provenance). Game design files `game-design/00`–`05` updated to match (look, nodes, clips, track-skirt upgrade).

## 2026-11-12 — Phase 2 image-matched environment and base models

- Added the requested pebble/boulder variants, cluster, three distant mesas, ridge, compact cliff shelter, habitat, airlock, storm shelter and solar row. Each follows only its own Phase 2 PNG.
- Corrected the cave after feedback: a smaller irregular rock alcove replaces the oversized striped-grid cliff. Updated the catalog scale.
- Saved editable revisions, ingested optimized GLBs, retained semantic nodes, placed four solar copies, and reviewed the running world. Seven asset/collision checks pass; build and lint complete.
- Updated Phase 2 asset checkboxes, per-asset briefs, catalog references, world/pipeline/style guidance, persistent asset rule and docs index. Gameplay/layout items remain independent.

## 2026-11-12 — Battery recreated from its own reference

- Rebuilt the battery bank from phase-2/battery-bank.png only: chamfered housing, wraparound end frames, sloped gauge, roof hatches and mounting feet.
- Saved a child Kiln revision and replaced the optimized game model. Verified all nine lamp nodes and both required anchors; visually checked the model near spawn.
- Checked off the Phase 2 battery asset; charge-state gameplay binding remains open in 2.C. Added its asset brief and documentation link.

## 2026-11-12 — Phase 2 asset samples

- Added Kiln supply crate, battery bank and cable junction to the asset test world; final site placement and interactions remain.

## 2026-11-12 — Image-guided Mars landscape

- Implemented the approved landscape/detail images as a 360 m basin with eroded
  mesas, fractured shelves, four crater bowls, shallow washes and wind-rippled dust.
- Replaced the initial repeated stacked-block cliffs after user feedback with
  irregular domain-warped height fields, gullies, wider cap rock and varied strata.
- Saved/optimized five Kiln rock shapes and placed 3,836 deterministic stones in ten
  instance batches, including cliff-toe scree and composed foreground clusters.
- Preserved rover/astronaut placements and the flat pad; moved spawn back to Z=14
  for a clearer landscape view. Ground and major geology use matching collision
  geometry; small gravel remains decorative.
- Added landscape grounding/geometry regressions. Docs: world, physics, rendering,
  optimization, player, docs index, landscape brief and approved concept record.

## 2026-11-12 — Mars landscape concepts for approval

- Generated a rich landscape concept and matching six-part terrain detail sheet from
  the approved Mars references, following the user's image-first workflow.
- Images and prompts are saved in assets/concepts; awaiting approval before 3D/game
  integration. Existing game terrain is unchanged.
- Docs: landscape asset brief and concept provenance record.

## 2026-11-12 — Approved young astronaut in game

- Built the approved concept as a 1.8 m ivory/slate/orange astronaut with opaque navy
  visor, chest controls, backpack and cyan screen: 6,088 placed triangles, 16 rigid joints.
- Saved the exact Kiln revision and ingested an 83,732-byte Meshopt GLB in front of the
  rover. Added independent `Friendly_Wave` playback per model clone with cleanup.
- Reviewed GPU material views and seven wave phases. Display-only character; no
  skin deformation, player controls or dynamic limb collision.
- Docs: tech/world, tech/rendering, pipeline/ASSET_PIPELINE, approved concept record
  and astronaut brief.

## 2026-11-12 — First Mars rover in game

- Built and saved a six-wheel rover matching the approved vehicle references: ivory
  chamfered hull, slate fenders, orange hubs/panels, dark windshield, roof cargo/antenna
  and restrained amber/cyan lights. 7,252 triangles; 4.4915 × 2.63 × 2.433 m.
- Exported the exact saved Kiln revision and ingested a ~121 KB Meshopt/GPU-instanced GLB
  at the origin, rotated −55° for a front/side presentation from spawn. Static prop only.
- The first compressed-model integration exposed a Rapier crash on normalized integer
  position buffers, plus missing per-instance collision transforms. Added explicit
  Float32 collision geometry, keeping the visual model compressed and instanced.
- Added focused regression checks for normalized accessors, nested instance transforms
  and all 193 placed parts of the actual rover. Fixed the JSON tuple type assertion once
  the previously empty manifest gained its first asset.
- Docs: README, tech/world, tech/rendering, tech/physics and the rover asset brief.

## 2026-11-12 — Terracotta Mars, style v2

- User approved the Mars asset preview and requested the complete setting/style conversion.
- Renamed active game text/package to Mars Life Line. The installed workspace directory
  stays at its existing path; setup files and historical revisions remain valid.
- Replaced all three primary references and regenerated all four supplementary sheets:
  construction details, utility props, small equipment and terrain kit. Archived the v1
  originals outside the active library. Updated crop regions for the new layouts/resolutions.
- Tokens v2: rust-red soil, ochre highlights, ivory/slate machinery, orange paint, cyan
  indicators, muted plum shadows and dusty peach atmosphere. Generated a Mars style header
  and the `mars-life-line` Kiln profile with current reference hashes. No saved models or
  inventory links existed to migrate; the prior project history is retained.
- World: atmospheric gradient sky replaces the previous celestial backdrop; smooth normals
  and continuous mottling replace random terrain triangle shading. Gravity is −3.71 m/s².
- HUD, browser title and shared Codex/Cursor rules now use the Mars direction.
- Docs updated: README, docs index, STYLE_GUIDE, KILN_STYLE_BRIEF, REFERENCE_GENERATION,
  ASSET_PIPELINE, tech/world, rendering, physics, player and kiln. Existing world gaps
  remain documented; references are not implemented 3D models.

## 2026-11-12 — Codex support

- Why: the project should work the same in Codex as in Cursor.
- `kiln-init --adopt --harness codex` added the `kiln_workspace` MCP block to
  `.codex/config.toml` and the `codex.mjs` launcher, and updated `START.md`. Harnesses are now
  `codex` and `cursor-agent`.
- `.codex/config.toml` `developer_instructions` points Codex at the existing
  `.cursor/rules/*.mdc` files, so the rules stay in one place. Kiln skills come from `.agents/skills/`.
- Verified: `codex mcp list` shows `kiln_workspace` enabled, and `kiln-init --check` reports `current`.
- Docs: new `docs/tech/agents.md`; updated docs/README, ASSET_PIPELINE, STYLE_GUIDE (image
  generation wording), README; rule project-core.

## 2026-11-12 — Style guide re-derived from the reference images

- Why: the written guide was partly generic or wrong compared with the images (timid
  bevels, orange as "5–15 % pinstripe", cool key light, no visor or solar materials).
- Images are now the authority. `scripts/crop-references.mjs` (`npm run style:crops`, adds
  dev dependency `sharp`) cuts 14 category crops into `docs/style/references/crops/`.
- 4 supplementary sheets generated from the originals in `docs/style/references/generated/`
  (construction details, more props, small items, terrain variety), ranked below the
  originals, with their drift noted.
- `STYLE_GUIDE.md` rewritten: reference library table, observed colour blocking per object
  type, category sheets, side-by-side review. The user's principles are kept and condensed.
- Tokens: key light `#FFEADF` (warm), bevel ratio 0.06–0.12, new `cell-blue` colour,
  new `visor` and `solar-cell` materials (header: `M.visor`, `M.solarCell`).
- Kiln project `lunar-life-line` at r_0000000004: new image-led style text, 21 references.
- Workflow: open the category crop before authoring, name it in the brief, and compare the
  render side by side before accepting.
- Docs: STYLE_GUIDE, KILN_STYLE_BRIEF, ASSET_PIPELINE, ASSET_BRIEF_TEMPLATE, tech/world,
  docs/README; rules asset-creation, visual-style.

## 2026-11-12 — Project initialised

- Vite + React 19 + TypeScript app with Three.js, React Three Fiber 9, Drei 10, Rapier 2.2,
  Ecctrl 2, Zustand 5, Leva, glTF Transform 4.5.
- Kiln 1.7.0 installed in `~/Developer/kiln-install` and adopted into this project for
  Cursor (`kiln_workspace` MCP, skills incl. compose-scene). GPU rendering verified.
- Style: `src/style/tokens.json` (style v1), `STYLE_GUIDE.md`, `KILN_STYLE_BRIEF.md`,
  reference images. Kiln project `lunar-life-line` created from tokens via `npm run style:sync`.
- Style correction: ground is smooth mottled regolith, faceting is for rocks/mountains/assets.
- Pipeline: `scripts/asset-pipeline.mjs` (Kiln export → glTF Transform → manifest), tested
  end to end on a throwaway asset (not kept).
- Test world: terrain, sky, Earth, lighting, first-person Ecctrl player, asset gallery, HUD.
  Terrain look is a known gap (see `docs/tech/world.md`).
- Docs and `.cursor/rules/` created.
