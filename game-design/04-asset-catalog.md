# MARS LIFE LINE — Asset Catalog
## Every model, material, particle effect, light, UI element, sound and 2D image the game needs

> Companion to Parts 1–3. This is the **generation list**: everything we may need to make,
> where it's used, how big it is, its triangle budget and how to produce it.
> Nothing here exists yet unless marked ✅. Nothing here changes any existing file.
>
> **Style authority:** `docs/style/STYLE_GUIDE.md` (Terracotta Mars v2) and
> `src/style/tokens.json`. **Pipeline:** `docs/pipeline/ASSET_PIPELINE.md`: brief → Kiln →
> GPU review → save → `npm run asset:ingest`. **Brief template:**
> `docs/pipeline/ASSET_BRIEF_TEMPLATE.md`.

---

## 0. How to read this catalog

### 0.1 Columns

| Column | Meaning |
|---|---|
| **Id** | Proposed asset id = brief file name `assets/briefs/<id>.md` and game id `public/models/<id>.glb` |
| **Cat.** | Token budget category: `small-prop` 200–1,500 · `medium-prop` 1,500–6,000 · `vehicle` 3,000–9,000 · `building` 4,000–12,000 · `character` 3,000–8,000 · `rock` 40–400 triangles |
| **Size (m)** | L × H × W, resting on Y = 0, facing +X. Scale anchors: astronaut 1.8, door 2.4, crate 1.0, rover 4.5, module 8.0 |
| **P** | Priority. **P0** = needed for the MVP slice (M0 Touchdown, M1 Night Shift, M10 The Day the Sun Roared) · **P1** = full campaign "should" missions · **P2** = stretch |
| **Used in** | Missions (M0–M12), events (E1–E20) or systems |
| **Style ref** | The closest reference to open first (crops in `docs/style/references/crops/`, sheets in `references/generated/`) |
| **How** | **Kiln** = 3D model authored in Kiln · **R3F** = built in code (particles, shaders, lines) · **DOM** = HTML/CSS/SVG UI · **IMG** = generated or sourced 2D image · **SFX/MUS/VO** = audio |

### 0.2 Rules every asset follows
1. Open the category crop + the hero scene before authoring (style guide §0, §9).
2. Flat colours from the palette, **no PBR texture maps**, metalness ≤ 0.1.
3. Chamfers 6–12% of the smallest dimension; octagonal portals; thick frames.
4. White / grey / orange colour blocking per style guide §3; cyan is **rare** (1–2 per object).
5. Emissives are small strips or squares, never a whole face.
6. Anything the player clicks in Station View has **named nodes** (`roof`, `body`,
   `screen_anchor`, `interact_*`) so the game can fade roofs and attach tags.
7. Interior items get a `screen_anchor` node wherever a console screen goes.
8. Every asset needs a brief before authoring, and a GPU render with
   `materialFaithful: true` before acceptance.

### 0.3 Totals at a glance

| Group | P0 | P1 | P2 | Total |
|---|---|---|---|---|
| Characters & robot | 3 | 1 | 0 | 4 |
| Vehicles & ships | 2 | 1 | 1 | 4 |
| Base buildings & big machines | 9 | 7 | 3 | 19 |
| Interior kit & furniture | 14 | 8 | 1 | 23 |
| Props & handheld items | 8 | 17 | 4 | 29 |
| Plants | 0 | 3 (×5 stages) | 0 | 3 |
| Environment and sky | 8 | 5 | 2 | 15 |
| **3D models total** | **44** | **42** | **11** | **97** |
| New material variants | 6 | 4 | 2 | 12 |
| Particles / VFX | 7 | 8 | 4 | 19 |
| Lighting setups | 6 | 2 | 0 | 8 |
| UI elements (+ menus) | 19 | 6 | 0 | 25 |
| Sound effects + music cues | 30 | 17 | 6 | 53 |
| 2D images | 6 | 5 | 3 | 14 |

---

## 1. Already built ✅

| Id | What | Status | Changes needed |
|---|---|---|---|
| `mars-rover` | Six-wheel rover (`public/models/mars-rover.glb`) | ✅ in game | **Driver's seat or open cab** for first-person driving (T-10) · cargo bed big enough for PEBBLE and 2 ice crates · `seat_anchor` and `cargo_anchor` nodes |
| `young-astronaut` | Stylised astronaut, rigid joints, `Friendly_Wave` clip | ✅ in game | Needs **Idle, Walk, Run, Carry** clips for the tiny Station View figure (T-9); used for the arms and gloves rig too (§2) |
| `mars-landscape` | 240 m test terrain | ✅ in game | Layout per Part 3 §6: ship pad 150 m east, cliff 80 m north, ice apron at the edge |

---

## 2. Characters and the robot

| Id | Name | Cat. | Size (m) | P | Used in | Style ref | Notes |
|---|---|---|---|---|---|---|---|
| `pebble` | **PEBBLE robot** | character | 0.6 × 0.5 × 0.45 | **P0** | Everywhere; presents every decision | **`references/generated/g05-pebble-box-buddy.jpg`** (approved "Box Buddy") | The most important new asset. **Two chunky tank-tread tracks** (dark charcoal treads, orange hubs, no wheels), rounded-cube ivory chamfered body with orange side panels and a charcoal chassis, a small rounded box **head on a short neck** with orange ear discs, a dark rounded-rectangle **screen face** (`screen_face` node, a flat panel for the face texture) with cyan eyes, short antenna with **one cyan beacon**, **two small arms, both two-finger grippers (no brush)**, wrist air-puff nozzle (`nozzle_r`). Named nodes: `screen_face`, `head`, `neck`, `arm_l`, `arm_r`, `grip_l`, `grip_r`, `nozzle_r`, `antenna`, `track_l`, `track_r` |
| `pebble-clips` | PEBBLE animations | (same model) | — | **P0** | All | — | Clips: `Idle` (gentle bob), `Drive`, `TurnInPlace`, `Happy` (wiggle + antenna spin), `Worried` (shrink back), `Hide` (backs behind an object, head ducks down on its neck), `Clean` (arm sweeps along a panel with air puffs, loop), `Grip`, `HeadTilt` (curious look), `Reboot` (slump then pop up), `Charge` (settles, antenna droops), `Point` (arm points toward a target, for hints) |
| `astronaut-fp-arms` | **First-person arms and gloves** | character | 0.8 × 0.3 × 0.5 | **P0** | All 1P tasks | `crops/characters.png` | Ivory sleeves, orange elbow pads, slate gloves, a **wrist Data Pad** with a small blue screen. Clips: `Reach`, `Grab`, `HoldTask` (loop), `TurnWheel` (hatch), `PullLever`, `Brush`, `Wipe`, `Drill`, `Carry`, `CheckWrist`, `Point` |
| `astronaut-suit-rack` | Empty suit hanging on the rack | medium-prop | 0.6 × 1.8 × 0.4 | P1 | M0, every EVA | `crops/characters.png` | Same suit design as `young-astronaut`, posed hanging; the helmet sits on a shelf above |

---

## 3. Vehicles and ships

| Id | Name | Cat. | Size (m) | P | Used in | Style ref | Notes |
|---|---|---|---|---|---|---|---|
| `landing-ship` | **Landing ship (exterior)** | vehicle (may need `building` budget) | ~7 × 6.6 × 7 (X × Y × Z; image proportions) | **P0** | M0, Return to Ship | `phase-2/landing-ship.png` (sole visual reference) | Squat octagonal lander on 4 thick legs with round footpads, an ivory body with grey wrap-around ribs, **big orange heat-shield underside** (scorched lower edge as a restrained darker tint), side hatch with octagonal portal and **amber inner outline**, a short ladder/ramp, 2 small windows, a cyan beacon, 4 retro-rocket nozzles (dark trim). Nodes: `hatch`, `ramp`, `nozzle_*`, `window_*` |
| `landing-ship-cabin` | **Ship cabin interior** | building | 3 × 2.4 × 3 | **P0** | M0 landing, Return to Ship | `g01-construction-details.jpg` (window strip, portal) | One seat facing a big window, a **landing screen** (`screen_anchor`), a big **ARM button**, side panels, a small emergency air tank, the inner hatch, harness straps. Low-poly, warm amber strip lights |
| `cargo-lander` | Cargo lander | vehicle | 5 × 6 × 5 | P2 | M6 (fission delivery), Continue-with-help drop | `crops/architecture.png` | A simpler cousin of the landing ship: open cargo deck, crane arm, orange crate faces |
| `rover-trailer` | Rover trailer | medium-prop | 3 × 1 × 1.8 | P1 | M6 (tow the fission unit), M3 (ice crates) | `crops/vehicles.png` | Four small chunky wheels, grey frame, orange tow bar |

---

## 4. Base buildings and big machines (exterior)

All have a **`roof` node** (separate mesh) for the Station View see-through fade and an
`info_anchor` node for the floating tag.

| Id | Name | Cat. | Size (m) | P | Used in | Style ref | Notes |
|---|---|---|---|---|---|---|---|
| `command-base` | **Connected headquarters** | building | 11.97 × 13.13 × 20.93 | **P0** | All | `assets/concepts/command-base-user-reference.png` (user-approved whole-base reference) | Complete exterior, west wing, amber octagonal entry, roof dish and twin lattice towers; placed instead of the separate small hab/airlock. Interiors remain separate future work |
| `hab-module` | **Habitat module** | building | 8 × 3.6 × 5 | **P0** | All | `phase-2/hab-module.png` (sole visual reference) | Layered chamfered blocks, big orange corner panel, small windows (amber), cyan lamp. Interior lives in a separate scene; the exterior must match its window positions |
| `hab-airlock` | **Airlock module + portal** | building | 3 × 3.2 × 3 | **P0** | M0, every EVA | `phase-2/hab-airlock.png` (sole visual reference) | Thick grey **octagonal portal**, recessed amber inner outline, grey double doors, steps. Nodes: `outer_hatch`, `inner_hatch` |
| `storm-shelter-module` | Storm shelter (exterior bump) | building | 3 × 2.8 × 3 | **P0** | M10 | `phase-2/storm-shelter-module.png` (sole visual reference) | A low, heavy block attached to the hab with visible **water-tank ribs** on its walls |
| `hab-corridor` | Connecting corridor | medium-prop | 4 × 2.6 × 2.4 | P1 | Layout | `crops/architecture-examples.png` | Capsule-box with grey end ribs and a warm window strip |
| `greenhouse-dome` | **Greenhouse dome** | building | 6 × 4 × 6 | P1 | M2, M7, M12 | `crops/architecture-hero-dome.png` | Thick white geodesic struts, broad hub plates, warm glass, alternating white/orange base panels, **magenta interior glow** (see material V-04), muted plants visible inside |
| `solar-array-row` | **Solar array row** (instanced ×4) | medium-prop | 6 × 2 × 2.5 | **P0** | M0, M1, M5, M9 | `phase-2/solar-array-row.png` (sole visual reference) | Dark blue cells with white grid bars as geometry, grey supports, a tilted frame; **dust state** by material lerp (V-01). Node `panel_*` for cleaning targets |
| `battery-bank` | **Battery bank** | medium-prop | 2.5 × 1.6 × 1.2 | **P0** | M1 | `g02-more-props.jpg` (generator) | Chunky cabinet, orange face panels, a **charge-level strip** (emissive segments driven by the game: node `charge_bar`) |
| `comms-dish` | Comms dish | medium-prop | 3 × 4 × 3 | P1 (P0 if M0 "Call Earth" is shown) | M0, M7, M11 | `crops/props.png` | Shallow white bowl on a grey lattice, heavy plinth, cyan tip light. Node `dish` (can rotate) |
| `oxygen-maker` | Oxygen Maker (MOXIE-like, fictional scale) | medium-prop | 2 × 1.8 × 1.4 | P1 | M4, M9 | `g02-more-props.jpg` (pump, generator) | Boxy unit with an intake grille (dark trim), orange bands, a small status light |
| `water-processor` | Water Processor / ice melter | medium-prop | 2.2 × 2 × 1.5 | P1 | M3, E4 | `g02-more-props.jpg` (pump) | Hopper on top for ice crates, a visible **filter cartridge bay** (node `filter_bay`), tank with an orange band |
| `pebble-dock` | PEBBLE dock (outdoor) | small-prop | ~1.23 × 1.52 × 1.17 (including charging arm) | **P0** | All | `phase-2/pebble-dock.png` (sole visual reference) | A low platform with a charging arm, amber guide strip |
| `rover-pad` | Rover pad | small-prop | 6 × 0.2 × 4 | P1 | M3 | `crops/environment.png` | Flat slab with orange corner markers |
| `landing-pad` | Ship landing pad | medium-prop | 12 × 0.3 × 12 | **P0** | M0 | `phase-2/landing-pad.png` (sole visual reference) | Slightly raised slab, orange chevrons, scorch mottling in the centre (vertex colour) |
| `cable-run` | Cable trench segments (straight, bend, T) | small-prop | 2 m centerline; 0.36 m high × 0.60 m wide cover, plus collars | **P0** | All (Station View flow lines follow them) | `phase-2/cable-run.png` (sole visual reference) | Grey covered trench; the game draws the flow line just above it |
| `cable-junction` | **Cable repair junction box** | small-prop | 0.8 × 0.8 × 0.6 | **P0** | M10 | `g02-more-props.jpg` | Open lid (node `lid`), orange face, two cable ends; repair state = cables connected |
| `fission-unit` | Fission power unit (fictional 6 kW) | medium-prop | 2 × 3 × 2 | P2 | M6 | `g02-more-props.jpg` (generator) | Cylindrical core under a chamfered octagonal shield, radiator fins, orange warning bands, a steady cyan status light |
| `keep-out-marker` | Keep-out ring marker post (instanced) | small-prop | 0.3 × 1.2 × 0.3 | P2 | M6 | `crops/props.png` | Orange-tipped post; the ring itself is an R3F ground decal |
| `ice-drill-rig` | **Ice drill rig** | medium-prop | 1.5 × 3 × 1.5 | P1 | M3, M8 | `g02-more-props.jpg` (tool cart) | Tripod frame, central drill column, a **hand crank/handle** (node `handle`), depth gauge, orange bands |
| `cable-spool` | Cable spool | small-prop | 1.2 × 1.2 × 0.8 | P2 | M6 | `g02-more-props.jpg` | Grey drum, orange cable |

---

## 5. Interior kit and furniture

Interior palette (T-5 proposal): **ivory walls, slate frames, orange safety panels, warm
amber strip lights**, small cyan/blue screens. Same materials as outside.

| Id | Name | Cat. | Size (m) | P | Used in | Notes |
|---|---|---|---|---|---|---|
| `int-wall-panel` | Wall panel kit (flat, window, vent, door frame, corner) | small-prop each | 2 × 2.6 × 0.2 | **P0** | All interiors | Modular; chamfered edges; vents in dark trim |
| `int-floor-ceiling` | Floor and ceiling tiles (+ light-strip ceiling) | small-prop | 2 × 0.1 × 2 | **P0** | All interiors | Floor grey with orange edge markings; ceiling with an amber light strip |
| `int-door-inner` | Inner hatch (hab ↔ airlock, hab ↔ shelter) | small-prop | 1.2 × 2.4 × 0.3 | **P0** | M0, M10 | Octagonal frame, a **hatch wheel** node, amber outline |
| `airlock-interior` | **Airlock interior** | medium-prop | 3 × 2.6 × 3 | **P0** | M0, EVAs | Inner and outer hatches, **cycle lever** (node `lever`), **pressure gauge** (node `gauge_needle`), suit rack, amber warning light |
| `bunk` | **Bunk (sleep)** | medium-prop | 2.1 × 1.2 × 1 | **P0** | Every night | Built-in bed with a privacy curtain, a small reading lamp (amber), PEBBLE charging nook beside it. Node `sleep_interact` |
| `galley-chair` | **Galley chair (wait)** | small-prop | 0.6 × 1 × 0.6 | **P0** | Wait | Chunky padded chair; node `wait_interact` |
| `galley-counter` | Galley counter + pantry cupboard | medium-prop | 2 × 1 × 0.7 | P1 | Food | Pantry count display (node `screen_anchor`) |
| `console-station` | **Station View console** | medium-prop | 1.2 × 1.4 × 0.8 | **P0** | All | Desk with an angled screen showing a mini base map (`screen_anchor`) |
| `console-comms` | Comms Desk | medium-prop | 1.2 × 1.4 × 0.8 | P1 | M0, M7, M11 | Screen + small dish model on the desk; headset prop |
| `console-weather` | **Space Weather Desk** | medium-prop | 1 × 1.4 × 0.7 | **P0** | M8, M10 | Screen + a radiation sensor box with a needle |
| `life-support-rack` | **Life Support rack** | medium-prop | 1.5 × 2.2 × 0.6 | **P0** | M4, M7, E3 | Scrubber **cartridge slot** (node `cartridge_slot`), **stuck valve** (node `valve`), fans, status lights |
| `electrolyser-rack` | Electrolyser rack (interior) | medium-prop | 1 × 2 × 0.6 | P1 | M4 | Water tank + O₂ line, orange bands |
| `water-tank-int` | Water tanks (wall tanks for the shelter) | small-prop | 0.8 × 2 × 0.4 | **P0** | M10 | Capsule tanks with orange bands; **fill level** node |
| `water-wall-valve` | Water-wall valve | small-prop | 0.4 × 0.5 × 0.3 | P1 | M10 | Big orange wheel valve |
| `shelter-interior` | **Storm Shelter room** | medium-prop | 3 × 2.4 × 3 | **P0** | M10 | Wall of water tanks, pantry racks, a bench, a **dose readout** screen (`screen_anchor`) |
| `pantry-rack` | Pantry rack with ration boxes | small-prop | 1.2 × 2 × 0.4 | **P0** | M10, food | Box count changes with the pantry level (instanced boxes) |
| `pebble-nook` | PEBBLE indoor charging nook | small-prop | 0.8 × 0.6 × 0.8 | **P0** | Night watch | Wall niche with a charge arm and soft amber light |
| `window-hab` | Hab window (with frost decal slot) | small-prop | 1 × 0.8 × 0.2 | **P0** | M1, sleep time-lapse | Glass material; a frost overlay layer node |
| `greenhouse-tray` | Grow tray with LED cap | medium-prop | 1.6 × 1.2 × 0.6 | P1 | M2 | Tray, 6 **growth-pillow** slots (Veggie-style), magenta LED cap, water feed |
| `greenhouse-int` | Greenhouse interior shell | building | 6 × 4 × 6 | P1 | M2, M7, M12 | Inside view of the dome; floor ring, the 3 tray positions |
| `climate-dial` | Climate / photoperiod dial | small-prop | 0.3 × 0.3 × 0.1 | P1 | M2 | Dial with 12/16/20 marks |
| `lab-bench` | Science lab bench | medium-prop | 2 × 1 × 0.8 | P1 | M1, M7, M8 | Sample holder, small analyser, test kit slot |
| `medbay-corner` | Med corner | small-prop | 1 × 2 × 0.4 | P2 | Health flavour | Medkit cabinet, small screen |

---

## 6. Props and handheld items

| Id | Name | Cat. | Size (m) | P | Used in | Style ref | Notes |
|---|---|---|---|---|---|---|---|
| `scrubber-cartridge` | **CO₂ scrubber cartridge** | small-prop | 0.4 × 0.25 × 0.25 | **P0** | M4, E3 | `g03-small-items.jpg` | Chamfered canister, orange band, two latches |
| `data-pad` | Wrist Data Pad (close-up) | small-prop | 0.15 × 0.03 × 0.1 | **P0** | All | `g03-small-items.jpg` | Part of the arms rig; blue screen |
| `brush-tool` | Panel brush | small-prop | 1 × 0.1 × 0.2 | **P0** | M0, M5 | `g03-small-items.jpg` | Long handle, wide soft brush head. The player's tool only; PEBBLE never holds it |
| `dose-badge` | Dose badge | small-prop | 0.06 × 0.08 × 0.01 | **P0** | M8, M10 | `g03-small-items.jpg` | Clips on the suit; its fill also shows on the HUD |
| `helmet-shelf` | Helmet on shelf | small-prop | 0.4 × 0.4 × 0.4 | **P0** | M0 | `crops/characters.png` | Same helmet as the astronaut |
| `crate-supply` | Supply crate (1 m) | small-prop | 1 × 1 × 1 | **P0** | Yard dressing, M5 (PEBBLE hides behind it) | `crops/props.png` | Grey edge frame, big orange faces |
| `o2-canister` | O₂ canister | small-prop | 0.25 × 0.6 × 0.25 | **P0** | Ship cabin emergency air, airlock | `g03-small-items.jpg` | Capsule with orange bands |
| `ration-pack` | Ration pack (instanced) | small-prop | 0.2 × 0.05 × 0.15 | **P0** | Pantry | `g03-small-items.jpg` | Simple box |
| `ice-crate` | **Ice crate** (clean / dirty variants) | small-prop | 0.6 × 0.5 × 0.6 | P1 | M3 | `crops/props.png` | Open crate with ice chunks; dirty = rust-streaked chunks (V-05) |
| `ice-core-tube` | Ice/sample core tube | small-prop | 0.6 × 0.08 × 0.08 | P1 | M8 | `g03-small-items.jpg` | Clear tube with a layered core |
| `rock-sample` | Rock sample | small-prop | 0.15 × 0.1 × 0.12 | P1 | M1, M2 | `g03-small-items.jpg` | Faceted, small |
| `regolith-scoop` | Regolith scoop under a lamp | small-prop | 0.3 × 0.3 × 0.3 | P1 | M2 | `g03-small-items.jpg` | Scoop + small lamp |
| `seed-packet` | Seed packets ×3 (mizuna, wheat, pepper) | small-prop | 0.12 × 0.02 × 0.18 | P1 | M2 | `g03-small-items.jpg` | Coloured by crop icon, not by off-palette paint (icon decal) |
| `growth-pillow` | Growth-medium pillow | small-prop | 0.15 × 0.08 × 0.15 | P1 | M2 | — | Ivory fabric cube (Veggie "pillow") |
| `harvest-bin` | Harvest basket | small-prop | 0.5 × 0.3 × 0.4 | P1 | M12 | `g03-small-items.jpg` | PEBBLE carries it |
| `test-kit` | Plant test kit | small-prop | 0.3 × 0.1 × 0.2 | P1 | M7 | `g03-small-items.jpg` (medkit) | 3 vials; a count of 3 for the campaign |
| `filter-cartridge` | Perchlorate filter cartridge | small-prop | 0.3 × 0.5 × 0.3 | P1 | E4 | `g03-small-items.jpg` | Clean / clogged states (material lerp) |
| `toolbox` | Toolbox | small-prop | 0.5 × 0.3 × 0.25 | P1 | Repairs | `g03-small-items.jpg` | Orange box |
| `wrench` | Wrench | small-prop | 0.3 × 0.03 × 0.08 | P1 | Valve, heater fault | `g03-small-items.jpg` | Grey |
| `medkit` | Medkit | small-prop | 0.4 × 0.25 × 0.15 | P1 | Flavour | `g03-small-items.jpg` | Ivory with an orange cross panel |
| `storage-rack` | Outdoor storage rack | medium-prop | 2 × 2 × 0.8 | P1 | Yard dressing | `g02-more-props.jpg` | — |
| `tool-cart` | Tool cart | small-prop | 1 × 1 × 0.6 | P1 | Yard dressing | `g02-more-props.jpg` | — |
| `lamp-post` | Yard lamp / beacon tower | small-prop | 0.4 × 3 × 0.4 | P1 | Night yard | `g01-construction-details.jpg` | Orange-tipped lattice, cyan cube head |
| `railing` | Railing segments | small-prop | 2 × 1 × 0.1 | P1 | Steps, pads | `g02-more-props.jpg` | — |
| `capsule-tank` | Outdoor capsule tank | medium-prop | 2.5 × 1.2 × 1.2 | P1 | Water storage | `crops/props.png` | Orange bands, simple valves |
| `pebble-track-skirts` | PEBBLE dust-proof track skirts | small-prop | (on PEBBLE) | P2 | After M9 | `g05-pebble-box-buddy.jpg` | Upgrade variant: orange side skirts over both tracks |
| `celebration-table` | Harvest celebration table | small-prop | 1.2 × 0.8 × 0.6 | P2 | M12 | — | Plates of greens, a pepper |
| `flag-plaque` | Station plaque "Life Line Station" | small-prop | 1 × 0.6 × 0.1 | P2 | M0 (arrival) | — | No real flags or logos; station name only |
| `camera-photo-prop` | Hand camera | small-prop | 0.15 × 0.1 × 0.08 | P2 | E16 (Phobos photo) | `g03-small-items.jpg` | — |

---

## 7. Plants (5 growth stages each)

| Id | Crop | Stages | P | Notes |
|---|---|---|---|---|
| `plant-mizuna` | Mizuna mustard | seedling · small · leafy · full · harvest-ready | P1 | Feathery leaf clusters, low-poly; **muted green** (V-06) |
| `plant-wheat` | Dwarf wheat | sprout · tillering · green stalks · heading · golden | P1 | Tight clump of thin blades; ears turn pale gold in stage 5 (`regolith-light`) |
| `plant-pepper` | Chile pepper | seedling · bushy · flowering · green fruit · ripe fruit | P1 | Small bush; ripe fruit uses `accent-orange` (peppers are the one bright plant) |
| (state) | **Sick** variant for each | yellowed leaves (E5 fungus, M7) | P1 | Material lerp toward `regolith-light` |

Budget: `small-prop`, ≤ 600 triangles per stage (many on screen). Generate the 5 stages as one
Kiln asset with 5 named child nodes (`stage_1`…`stage_5`) so the game toggles visibility.

---

## 8. Environment and sky

| Id | Name | Cat. | Size | P | Used in | Style ref | Notes |
|---|---|---|---|---|---|---|---|
| `rock-pebbles` | Pebble set (5 variants, instanced) | rock | 0.1–0.3 m | **P0** | Everywhere | `phase-2/rock-pebbles.png` (sole visual reference) | Squashed, irregular, flat-bottomed |
| `rock-boulders` | Boulder set (4 variants) | rock | 0.8–2.5 m | **P0** | Everywhere | `phase-2/rock-boulders.png` (sole visual reference) | 10–30 broad faces, half-buried |
| `rock-cluster` | Rock cluster kit | rock ×n | 3 m | **P0** | Yard, ice apron | `phase-2/rock-cluster.png` (sole visual reference) | One big + 2–4 small + pebbles |
| `mesa-cliff-overhang` | **Mesa cliff with overhang** | building budget | ~11.3 wide × 5.5 high × 5.4 deep | **P0** | M10 | `phase-2/mesa-cliff-overhang.png` (sole visual reference) | Layered slab, chipped edges, a **recessed overhang** big enough for one astronaut and PEBBLE (`shelter_zone` node), a sample outcrop  User requested compact scale on 2026-11-12, superseding 30 × 15 × 12 m. |
| `mesa-distant` | Distant mesas (3 variants) | building budget | 60–150 m | **P0** | Horizon | `phase-2/mesa-distant.png` (sole visual reference) | Low-detail silhouettes that fade into haze |
| `ridge-horizon` | Eroded ridges | building budget | 100+ m | **P0** | Horizon | `phase-2/ridge-horizon.png` (sole visual reference) | — |
| `landing-scorch` | Landing scorch ground patch | decal | 15 m | **P0** | M0 | `phase-2/landing-scorch.png` (sole visual reference) | Vertex-colour darkening, not a texture |
| `ice-apron-patch` | **Glacier apron** (debris-covered ice ground) | building budget | 40 × 40 m | P1 | M3, M8 | `crops/environment.png` | Smooth ground with pale exposed ice spots (V-05) |
| `crater-ice` | **Ice-exposing crater** | building budget | 12 m wide | P1 | M8 | `g04-terrain-variety.jpg` (crater) | Shallow bowl, raised rim, **bright ice in the inner wall** |
| `crater-small` | Small craters (3 variants) | rock | 2–6 m | P1 | Dressing | `g04-terrain-variety.jpg` | Stepped faceted walls |
| `rover-tracks` | Rover/PEBBLE tracks | decal | — | P1 | Yard, M3 | — | Faint darker tint trail |
| `dust-drift` | Dust drift piles | rock | 1–3 m | P1 | After M9 | — | Soft smooth mounds |
| `sky-mars-orbit` | Mars seen from orbit (landing) | IMG / R3F sphere | — | **P0** | M0 | — | A stylised low-poly planet sphere in terracotta + a thin peach limb glow; **no NASA photo needed** |
| `phobos` | Phobos (tiny, rare) | rock | — | P2 | E16 | — | A faceted grey potato |
| `site-variants` | Jezero / Arcadia terrain layouts | — | — | P2 | Replay variant | — | Layout-only changes |

---

## 9. Materials

### 9.1 Existing token materials (use as-is)

| Role | Colours | Roughness / metalness | Used for |
|---|---|---|---|
| `matte-environment` | regolith-mid, regolith-light, shadow-plum | 0.95 / 0 | Rocks, cliffs, craters, ground |
| `smooth-structure` | structure-white, structure-gray | 0.55 / 0.05 | Buildings, PEBBLE body, ship, suits, interiors |
| `accent-paint` | accent-orange | 0.6 / 0 | Panels, pads, hubs, bands |
| `dark-trim` | trim-dark | 0.85 / 0 | Tyres, vents, nozzles, recesses |
| `emissive-warm` | accent-orange (1.6) | 0.5 / 0 | Doors, windows, strip lights, charge bars, heat glow |
| `emissive-cool` | accent-cyan / accent-blue (1.4) | 0.5 / 0 | Beacons, screens, PEBBLE's face |
| `glass` | glass-tint, opacity 0.35 | 0.15 / 0 | Dome, windows, the ship window |
| `visor` | space-deep | 0.12 / 0.1 | Helmet, rover windshield |
| `solar-cell` | cell-blue | 0.35 / 0.1 | Panels |

### 9.2 New material variants needed
Variants that only **lerp existing tokens** can be made in code. Variants marked
**NEW TOKEN** need a colour that the palette doesn't have; add them through
`STYLE_GUIDE.md` §10 (images → tokens → `npm run style:sync` → docs → changelog) before use.

| # | Variant | Based on | P | How | Used for |
|---|---|---|---|---|---|
| V-01 | **Dusty solar cell** | solar-cell → lerp toward regolith-mid by `panelDust` | **P0** | R3F uniform | M5, M9 |
| V-02 | **Frost overlay** | glass-tint at low opacity + a soft noise alpha | **P0** | R3F shader / decal | M1 windows, sleep time-lapse |
| V-03 | **Station View roof fade** | smooth-structure with animated opacity | **P0** | R3F (transparent, depthWrite off) | Station View |
| V-04 | **Greenhouse magenta light** | **NEW TOKEN** `grow-magenta` (suggest a soft pink-magenta, kept low intensity) | P1 | Token + emissive | Greenhouse LEDs (🛰 Veggie's magenta glow) |
| V-05 | **Water ice** | **NEW TOKEN** `ice-pale` (a pale cool white-blue) + matte | P1 | Token | Ice apron, crater, ice crates |
| V-06 | **Plant green** | **NEW TOKEN** `plant-green` (muted, as the style guide allows "muted greenhouse plants") | P1 | Token | All plants |
| V-07 | **Heat-shield glow** | emissive-warm at high intensity on the ship's window frame | **P0** | R3F animated intensity | M0 landing |
| V-08 | **Clogged filter / sick leaf** | lerp toward regolith-light / shadow-plum | P1 | R3F uniform | E4, E5, M7 |
| V-09 | **PEBBLE face screen** | emissive-cool + a canvas/sprite texture (face sheet, §12.2) | **P0** | Canvas texture | PEBBLE (the one allowed texture) |
| V-10 | **Power flow line** | emissive-warm (solar/battery) and emissive-cool (fission) dashed, animated | **P0** | R3F line material | Station View |
| V-11 | **Night sky** | **NEW TOKEN** atmosphere `night-sky` (deep navy-plum) | P2 (P0 if night is shown outside) | Token | Night exterior, sleep time-lapse |
| V-12 | **Aurora band** | **NEW TOKEN** atmosphere `aurora-violet`, very soft | P2 | Token + shader | M10 night |

---

## 10. Particles and visual effects

All VFX are **R3F code** (instanced points or meshes, small shaders), never baked into models.
Colours come from tokens. Each must have a **reduced-motion** version (Part 3 §4.8).

| # | Effect | P | Trigger | Technique | Budget / notes |
|---|---|---|---|---|---|
| X-01 | **Heat-shield entry glow + shake** | **P0** | M0 | Window-frame emissive ramp + camera shake (reduced-motion: no shake) | 8–12 s |
| X-02 | **Retro-rocket dust blast** | **P0** | M0 touchdown | Instanced billboards bursting outward from below the window, regolith colours | ≤ 400 particles, 4 s |
| X-03 | **Airlock depressurisation puff** | **P0** | Every airlock cycle | Short white vapour puff + gauge needle motion | ≤ 60 particles |
| X-04 | **Particle "snow"** on the visor and PEBBLE's face | **P0** | M10 SEP | Screen-space random white specks/streaks (🛰 Curiosity navcam effect) | Intensity follows the dose rate |
| X-05 | **Sleep night time-lapse** | **P0** | Every sleep | Stars wheel across the window, frost grows (V-02), sky darkens then dawns, the battery line drains | ≈ 10 s |
| X-06 | **Station View power flows** | **P0** | Station View | Animated dashed lines along cables; thickness = kW; dot speed = flow | ≤ 30 lines |
| X-07 | **Interaction highlight** | **P0** | Looking at an interactable | Soft rim/outline in accent-orange | — |
| X-08 | **Dust devil** column + shadow | P1 | M5, E1 | Rotating particle cone (ochre), ground shadow decal | ≤ 500 particles |
| X-09 | **Dust storm haze** | P1 | M9 | Fog density + sky gradient lerp + slow drifting dust sheets | Fog only on low-end GPUs |
| X-10 | **Panel brushing dust** | P1 | M0, M5 | Small puff where the player's brush or PEBBLE's air nozzle passes | ≤ 50 particles |
| X-11 | **Drilling debris + ice chips** | P1 | M3, M8 | Short bursts from the drill head | ≤ 100 particles |
| X-12 | **Wheel dust kick-up** | P1 | Rover and PEBBLE driving | Low puffs behind the rover's wheels and PEBBLE's tracks | ≤ 80 particles |
| X-13 | **Signal light dot** (3D) | P1 | Comms dish sending | A small cyan pulse leaving the dish upward | — |
| X-14 | **CO₂ "stuffy air" haze** | P1 | M4, M7 (CO₂ yellow/red) | Slight screen vignette + faint haze | — |
| X-15 | **Cold breath / frost on visor edge** | P1 | Night EVA, cold nights | Edge frost vignette | — |
| X-16 | **Aurora** | P2 | M10 night | Wavy sky band shader, very soft (card: "shown in visible colours for you") | — |
| X-17 | **Phobos transit** | P2 | E16 | Tiny dark disc crossing the Sun | — |
| X-18 | **Harvest sparkle** | P2 | M12 | A few warm motes over the trays | ≤ 30 |
| X-19 | **Fission keep-out ring** | P2 | M6 | Ground decal ring, faint orange pulse | — |

---

## 11. Lighting setups

Base values from `tokens.json` (`lighting`: key, hemisphere, ambient, fog, ACES).

| # | Setup | P | Change from base |
|---|---|---|---|
| L-01 | **Day exterior** | **P0** | Token defaults |
| L-02 | **Dusk / sunset** | **P0** | Key lower and warmer, longer shadows, sky toward `sky-horizon`; solar flow lines shrink |
| L-03 | **Night exterior** | **P0** (M1 window view, sleep) | Key off, cool dim fill, yard lamps and window strips carry the scene; needs V-11 |
| L-04 | **Hab interior** | **P0** | Warm amber strips, soft ivory bounce, screens as small cool sources |
| L-05 | **Storm shelter / alarm** | **P0** | Dimmer, a slow orange alarm pulse, the dose screen as the brightest cool source |
| L-06 | **Landing cabin** | **P0** | Window-lit, then heat-glow orange flood, then the dust-dim touchdown |
| L-07 | **Dust storm** | P1 | Key intensity down, fog up, sky toward deep ochre |
| L-08 | **Greenhouse interior** | P1 | Magenta grow light (V-04) mixed with warm amber |

Station View reuses the current outdoor light with cheaper shadows (Part 3 §8.6).

---

## 12. UI elements

All UI is **DOM** (React + CSS/SVG), colours from tokens, status shapes always paired with
colour. Fonts: one rounded, very readable sans for body text and one chunky display face for
titles. Delivered fonts (2026-11-13): local Nunito body and Baloo 2 headings, both
SIL OFL 1.1; source/hash/license inventory in `public/fonts/manifest.json`.

### 12.1 HUD

| # | Element | P | Notes |
|---|---|---|---|
| U-01 | **3 resource gauges** (Power, Air, Water) | **P0** | Bar + value ("74%", "9.5 sols") + trend arrow + status shape ● ▲ ■; hover shows exact units |
| U-02 | **5 status chips** (Food, Sun/Radiation, Earth Link, You, PEBBLE) | **P0** | Icon + shape + short text; click opens detail |
| U-03 | **Clock** | **P0** | Sol, Mars hour, sun/moon icon, 🛏 when sleep is available |
| U-04 | **Interaction prompt** | **P0** | "[E] Clean panel (hold)" with a hold-progress ring |
| U-05 | **Centre dot** | **P0** | Small, soft; reduces motion sickness |
| U-06 | **Helmet frame overlay** (outside) | **P0** | Soft rounded visor edge + suit-air bar |
| U-07 | **PEBBLE speech line** | **P0** | Bottom-left bubble with PEBBLE's mini face |
| U-08 | **Dose badge meter** | **P0** | Thermometer fill with 50 / 70 / 90 lines |

### 12.2 PEBBLE face sprite sheet (texture on the `screen_face` node and in the UI)

| P | Expressions |
|---|---|
| **P0** | Neutral · Happy · Very happy (big smile) · Worried · Thinking (dots) · Sleepy · Alarm (wide eyes + "!") · Static/glitch (M10) · Rebooting (loading ring) · Card mode (eyes shrink to the top) |
| P1 | Proud (after a clean panel) · Scared (dust devil) · Curious · Sad (soft, for the blackout) · Wink · Heart (harvest) |

Simple shapes in accent-cyan/accent-blue on space-deep; drawn as SVG so they stay crisp.

### 12.3 Panels and screens

| # | Element | P | Notes |
|---|---|---|---|
| U-09 | **PEBBLE decision card** | **P0** | Framed like PEBBLE's screen; situation line, 2–4 equal option tiles, "What happens later?", "Why?", "Give me a hint" |
| U-10 | **Wake-up report** | **P0** | Overnight battery graph, what switched off and when, events, Earth messages |
| U-11 | **Station View overlays** | **P0** | Module info tags (icon + shape + kW), the module info card, the **priority list** (drag cards), the **night plan** forecast line, the PEBBLE job picker |
| U-12 | **Space Weather Desk** | **P0** | DONKI event list, FLR/CME/SEP icons, archived/LIVE label, base sensor graph |
| U-13 | **Why Chain** | **P0** | PEBBLE's memory tape: beads with icons; list form in the MVP |
| U-14 | **Mission Report** | **P0** | Medal strip, Why Chain highlights, best decision, one "what if?", sources |
| U-15 | **Sources & Credits page** | **P0** | Provenance cards, DONKI acknowledgement, AI-use note, asset credits |
| U-16 | **Comms Desk + Signal Tracker** | P1 | 2D orbit diagram (Sun, Earth, Mars), light-dot animation, timeline, outbox/inbox, relay windows |
| U-17 | **Greenhouse info panel** | P1 | Trays, growth stage, harvest ETA, photoperiod dial, plant names |
| U-18 | **Data Pad pages** | P1 | Gauges, messages, Field Guide, map |
| U-19 | **Landing screen** (in the ship) | **P0** | Mars map zoom with 3 pins, "Signal delay: 10 min", "Landing time: ~7 min", the ARM prompt |
| U-20 | **Data cards** (science facts) | **P0** | Card template with source badge, optional NASA image |
| U-21 | **Field Guide** | P1 | Unlocked "Mars truths" |
| U-22 | **Standing Orders board** | P1 | M11 rule toggles |

### 12.4 Icons and badges (SVG set)

| # | Set | P | Items |
|---|---|---|---|
| U-23 | **System icons** | **P0** | ⚡ power · 🫁 air · 💧 water · 🌱 food · ☢ radiation · 📡 Earth link · 🧑‍🚀 you · 🤖 PEBBLE · 🔬 science · 🛏 sleep · ⏸ pause |
| U-24 | **Status shapes + source badges** | **P0** | ● OK · ▲ Watch · ■ Act · 🛰 NASA fact · 🧮 calculated · 🎮 game value · 📖 story · "ARCHIVED" / "LIVE" tags |
| U-25 | **Medals and certificate** | P1 | 4 medals (Safe Commander, Self-Reliance, Science, Harvest) × gold/silver/bronze; mission badges; the Commander's Certificate (callsign only) |

Plus menus: title screen, callsign + suit-colour picker, pause menu, settings
(text size, FOV, reduced motion, hold/toggle, volume), loading screen, Return to Ship screen
(P0 for all).

---

## 13. Audio

Sources: generate or use free-licence libraries; credit everything on the Sources page.
**No child voices** (submission rule).

### 13.1 Sound effects

| P | Sounds |
|---|---|
| **P0** | Landing roar (rumble), heat-shield crackle, retro-rocket thrust, **touchdown thud then silence**, ARM button beep · airlock: hatch wheel, lever clunk, pump-down hiss, pressure-equal chime · footsteps inside (metal) / outside (muffled crunch) · suit breathing (subtle) · **PEBBLE beep vocabulary** (happy, worried, thinking, proud, alarm, sleepy, glitch) · UI click, card open, option select · gauge warning chime (yellow), red alert (soft, never harsh) · sleep: lights-down tone, wake-up chime · hab ambience (life-support fan hum) · cold-night creak · solar event alarm · dose ticks (stylised) |
| P1 | Rover motor + crunch · drill whirr + ice crack · brush on panels · cartridge latch · valve squeak · water processor gurgle · dish motor + data chirp · dust devil whoosh · storm wind (muffled through the hab) · greenhouse fan + water drip · harvest pluck · Earth message arrival tone · Signal Tracker "ping" |
| P2 | Fission hum (very low) · cargo lander descent · Phobos photo shutter · aurora shimmer · celebration jingle · PEBBLE stuck (track spin) |

Outside sounds are quieter and muffled (thin air), heard through the helmet; inspiration:
Perseverance's real microphone recordings of Mars 🛰.

### 13.2 Music cues

| P | Cue |
|---|---|
| **P0** | Title theme (warm, hopeful) · landing (rising tension → silence → soft wonder) · base day (calm warm pads) · night / sleep lullaby · alarm tension layer (M10) · mission complete sting |
| P1 | Dust storm (low, steady) · blackout (quiet, lonely but warm) · signal returns (bright motif) · harvest / ending theme |

### 13.3 Voice
Text first (T-7). Optional: **PEBBLE** as processed beeps + an adult or synthetic voice;
**Mission Control** as an adult voice with a light radio filter. Subtitles always on.

---

## 14. 2D images

| # | Image | P | How | Notes |
|---|---|---|---|---|
| I-01 | **Title key art** (base at sunset, PEBBLE beside the astronaut at the window) | **P0** | IMG (generated in the style, reviewed against the hero scene) | Also the video's last frame |
| I-02 | **Game logo / wordmark** "Mars Life Line" | **P0** | IMG / SVG | No NASA logo (media rules) |
| I-03 | **Mars site map** for the landing screen | **P0** | NASA Mars Trek imagery, **with attribution** | Pins: base, Curiosity (Gale), Perseverance (Jezero) |
| I-04 | **Curiosity / RAD data card image** | **P0** | NASA/JPL-Caltech image, credited | M10 debrief |
| I-05 | **DONKI event illustration** (Sun → CME → Mars diagram) | **P0** | SVG diagram | Shows "Earth on the far side" |
| I-06 | **Loading screen art** | **P0** | IMG | Can reuse I-01 |
| I-07 | MOXIE data card image | P1 | NASA image, credited | M4 |
| I-08 | Veggie / plant habitat data card image | P1 | NASA image, credited | M2 |
| I-09 | SWIM ice map image | P1 | NASA/JPL image, credited | M3 site card |
| I-10 | Act cards (Act I, II, III) | P1 | IMG in the style | Between acts |
| I-11 | Signal Tracker orbit diagram art | P1 | SVG | Sun, Earth, Mars |
| I-12 | Fission concept data card image | P2 | NASA image, credited | M6 |
| I-13 | Ending cards (4) | P2 | IMG in the style | One per ending |
| I-14 | Video thumbnail + slide backgrounds | P2 | IMG | Submission |

NASA images: follow NASA media usage guidelines; credit "NASA/JPL-Caltech" (or as listed on
the source page); never imply NASA endorsement.

---

## 15. Build order (MVP first)

1. **PEBBLE** (`pebble` + face sheet + clips): every decision depends on it.
2. **First-person arms** (`astronaut-fp-arms`): every interaction.
3. **Hab exterior + airlock + interior kit + bunk + Station View console**.
4. **Solar array row + battery bank + cable runs + PEBBLE dock** (the M1 night plan).
5. **Landing ship + cabin + landing pad + scorch** (M0).
6. **Mesa cliff with overhang + cable junction box + storm shelter + water tanks** (M10).
7. **Rocks, distant mesas, ridges** (dressing).
8. Materials V-01, V-02, V-03, V-07, V-09, V-10; VFX X-01 to X-07; lighting L-01 to L-06.
9. UI U-01 to U-15, U-19, U-20, U-23, U-24; menus.
10. P0 audio and music; P0 2D images.

Then P1 by mission order: greenhouse (M2) → ice kit (M3) → air machines (M4) → dust devil
(M5) → comms (M7) → EVA science (M8) → storm (M9) → blackout UI (M11) → harvest (M12).

---

## 16. Before generating anything

- [ ] Confirm T-1 (pre-built work eligibility) with the organisers; if needed, these assets
      are made **during** the event.
- [ ] Approve the 5 **new tokens** (`grow-magenta`, `ice-pale`, `plant-green`, `night-sky`,
      `aurora-violet`) through `STYLE_GUIDE.md` §10.
- [ ] Generate **supplementary reference sheets** for the categories the library doesn't
      cover yet (asset pipeline §2): **interiors**, **PEBBLE**, **the landing ship**,
      **plants**.
- [ ] Decide fonts and the audio sources (licences).
- [ ] Write one brief per asset from `docs/pipeline/ASSET_BRIEF_TEMPLATE.md`.

## Phase 3 asset delivery record — 2026-11-13

The requested Phase 3 asset gate is delivered separately from gameplay integration.
Matching phase-3 images govern the visual form; PEBBLE follows g05 Box Buddy.
PEBBLE measured height is ~0.73 m including its antenna; nook height ~1.05 m follows
the upright niche image. Arms include the nine requested P0 clips; catalog-only Drill
and Carry are outside this batch. Exact dimensions, saved revisions, native clip list,
SVG/font locations and limitations: `assets/briefs/phase-3-batch.md`.
