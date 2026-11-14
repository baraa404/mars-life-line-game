# MARS LIFE LINE — Game Design Plan, Part 3 of 3
## Simulation · Time & Sleep · First Person + Station View + 2D · HUD · Accessibility · Assets · Architecture · NASA Data · MVP · Production · Testing · Demo

> Parts 1 and 2 define *what* the game is. This part defines *how it works and how it
> gets built*. Every number below is a 🎮 **tuning assumption** unless a 🛰 NASA source or a
> 🧮 calculation from NASA data is named. Tune in the headless balance runner (§3.9), never by
> editing a source fact.
>
> **Revision 2:** numbers rebalanced for **one astronaut**; time = one speed + sleep + wait;
> views = first person + isometric Station View + 2D; decisions = PEBBLE cards.
> **Revision 3:** one balanced difficulty (no modes); one set of starting values and balance targets.

---

## 1. Simulation overview

**One deterministic simulation, many views.** A pure TypeScript module (no React, no
Three.js) holds the whole base state and advances it in fixed steps. The first-person world,
the Station View, the 2D panels and the HUD only **read** snapshots and **send** commands.
That is how one shared state survives every view switch (Brief §5.7).

```text
 Player input (1P tasks, Station View clicks, PEBBLE cards, sleep / wait)
          │ commands
          ▼
 ┌──────────────────────────────────────────┐
 │ SIM CORE (pure TS, seeded, fixed step)   │
 │  clock → environment → power → air →     │
 │  water → food → radiation → you →        │
 │  PEBBLE → comms → events → causal log    │
 └──────────────────────────────────────────┘
          │ snapshots (about 4 Hz to the UI; every frame via a ref for 3D)
          ▼
 First person (R3F)   Station View (R3F)   2D panels (DOM)   HUD (DOM)   Why Chain (DOM)
```

### 1.1 Dependency graph

```text
 SUN (daylight) ──┐
 DUST (panels, τ)─┼─► SOLAR ─┐
 FISSION ─────────┘          ├─► BATTERY ◄─► LOADS (priority list, auto-shed)
                             │                 │
   ┌─────────────────────────┴─────────────────┼───────────────┬─────────────┐
   ▼                 ▼                 ▼        ▼               ▼             ▼
 LIFE SUPPORT CORE  HEATERS ◄─ T_out  O₂ MAKERS GREENHOUSE    WATER PROC.   DISH / LAB
 (CO₂ scrub, air,    │                 │  │     (light, heat)  (ice → water) │
  water recovery)    │                 │  └─ uses WATER ─┐      │             │
   │                 ▼                 ▼                 ▼      ▼             ▼
   └──────────► YOU (energy, health, spirit) ◄── AIR ◄── WATER ── FOOD     EARTH LINK
                 ▲         ▲                                             (delay, windows,
               SLEEP     PEBBLE (jobs, charge 0.2 kW)                     blackout)
 SPACE WEATHER ──► RADIATION DOSE (time × location shielding)
```

---

## 2. State, time and units

### 2.1 Clock, time and sleep

| Quantity | Value | Source |
|---|---|---|
| Sol length | 24 h 39 m 35 s (88,775 s) | 🛰 Mars Facts / Foundation |
| Game "Mars hour" | Sol ÷ 24 = **61.65 Earth minutes**. Energy maths converts with **H = 1.0275** (1 kW for one Mars hour = 1.0275 kWh) | 🧮 |
| Sim step | **1 Mars minute** (fixed); 1,440 steps per sol | 🎮 |
| Sunrise / sunset | 06:00 / 18:00 (fixed season in the MVP) | 🎮 (real day length varies with season and latitude) |

**Time rules (the whole system, one table):**

| Mode | Speed | How it starts | Notes |
|---|---|---|---|
| **Normal** | **60×** (1 real s = 1 Mars min) | Default, always | Daylight ≈ 12 real min. A 150 m walk at 6 m/s ≈ 25 s real = 25 Mars min, so distance costs time |
| **Paused** | 0 | PEBBLE cards, the pause menu, an open info card in Station View | — |
| **Sleep** | Night time-lapse (≈ 10 s real for ~12 Mars h) | **E** at the bunk after 17:00, or any time energy is 0 | Runs headless steps; wakes at 06:00; **autosaves**; restores energy to 3; **PEBBLE wakes you** for any event that needs a decision |
| **Wait** | Instant jump of 1, 2 or 4 Mars hours | **E** at the galley chair (daytime) | Interrupted by any event. Not allowed outdoors |
| **Mission Log skip** | Instant, 1–7 sols | Between missions | Runs your Standing Orders; shows the "While You Were Away" report |

**Sleep rules:**
- You can sleep only inside the hab, with the airlock sealed.
- Skipping sleep is allowed. The night then runs at normal speed (≈ 12 real min of dark and
  cold), and your **energy** drops by 1 at 02:00 and again at 06:00.
- Energy 3 → 0: at 1, tasks take 1.25× longer; at 0, PEBBLE asks you to sleep and outdoor
  work is locked.
- A nap (sleep during the day) is possible when energy ≤ 1, for 3 Mars hours.
- The night plan you set before sleeping is a **decision**, so the night is never "free".
- The HUD shows a 🛏 icon once sleeping is available.

**Why one speed instead of four buttons (design reasoning):**
1. Kids 7–9 don't need to manage time speeds. They understand "day, then sleep".
2. Sleep is **realistic**: astronauts follow a sleep schedule.
3. Sleep **creates the night-power lesson**: you set the plan, sleep, and wake to the result.
4. Sleep is a natural **save point**, familiar from Minecraft.
5. PEBBLE's night watch keeps it fair: sleep never hides a decision.

### 2.2 State schema (TypeScript sketch)

```ts
type LoadId =
  | 'lifeSupport' | 'heaters' | 'oxygenMaker' | 'electrolyser' | 'waterProcessor'
  | 'trayLights1' | 'trayLights2' | 'trayLights3' | 'trayClimate'
  | 'lab' | 'dish' | 'roverCharge' | 'pebbleCharge' | 'shelterPump';

interface SimState {
  version: 2;
  seed: number; rng: number;                       // mulberry32 state
  clock: { sol: number; minute: number; sleeping: boolean };
  env: { tau: number; outsideC: number; daylight: number; stormPhase: 'none' | 'building' | 'peak' | 'clearing' };
  power: {
    batteryKWh: number; batteryCapKWh: number;     // 80
    panelDust: number; arrayHealth: number;        // 0..1
    fissionOnline: boolean;
    on: Record<LoadId, boolean>; level: Partial<Record<LoadId, number>>;
    priority: LoadId[];                            // index 0 = shed last
    ledger: Record<LoadId, number>;                // kWh used since last sunset (Why Chain attribution)
  };
  air: { o2Kg: number; co2: number; scrubberLife: number; mix: { electrolyser: number; oxygenMaker: number } };
  water: { liters: number; iceKg: number; iceDirty: boolean; filterLife: number };
  food: { pantrySols: number; trays: Tray[] };
  you: { energy: 0|1|2|3; health: 0|1|2|3; spirit: 0|1|2|3; doseDP: number; location: Location; suitO2Kg: number };
  pebble: { batteryPct: number; dust: number; job: PebbleJob | null; location: Location; glitched: boolean };
  rad: { weather: 'quiet' | 'flare' | 'sep'; sepFlux: number; gcrFactor: number; eventId?: string };
  comms: { oneWayMin: number; blackout: boolean; outbox: Msg[]; inbox: Msg[]; relayWindows: Window[] };
  science: { samples: number; labHours: number };
  rover: { batteryKWh: number; gearGrit: number };
  log: CausalEvent[];                              // Why Chain
}
type Location = 'hab' | 'shelter' | 'outside' | 'overhang' | 'rover' | 'ship';
interface Tray { crop: 'mizuna' | 'wheat' | 'pepper' | null; growth: number; photoperiod: 12 | 16 | 20; health: number; name: string }
interface PebbleJob { kind: 'cleanPanels' | 'scout' | 'carry' | 'charge'; target: string; etaMin: number }
interface CausalEvent { id: string; sol: number; minute: number; kind: string; causeIds: string[]; text: string; icon: string }
```

### 2.3 Starting values (Sol 1, the one balanced setting)

| Variable | Value |
|---|---|
| Battery | 48 / 80 kWh (60%, after standby) |
| O₂ reserve | 10 kg (≈ 12 sols) |
| Water | 60 L |
| Pantry | 50 sols |
| Panel dust | 5% (PEBBLE kept it clean, mostly) |
| Scrubber life | 100% (≈ 8 sols) |
| PEBBLE battery | 100% |

---

## 3. Systems specification

### 3.1 Environment
- **Daylight:** `d(h) = max(0, sin(π·(h − 6)/12))` for Mars hour `h`.
- **Outside temperature:** a 24-point curve, coldest about **−80 °C** at 05:00 and warmest about
  **−20 °C** at 14:00 🎮. The *shape* is normalised from a curated MEDA (Jezero) sol and
  labelled "borrowed from Jezero" 🛰. Values are clamped within NASA's −153 °C … +20 °C range 🛰.
- **Sky opacity τ:** clear ≈ 0.5; a storm builds over 2 sols, peaks at τ ≈ 4–5 for about 4
  sols, then clears over 3 🎮.

### 3.2 Power

```text
P_solar = 16 kW × d(h) × (1 − panelDust) × S(τ) × arrayHealth           [🎮 16 kW peak]
S(τ):  τ ≤ 0.5 → 1.00 | 1 → 0.80 | 2 → 0.50 | 3 → 0.30 | 4 → 0.18 | ≥5 → 0.12   [🎮 lookup]
P_fission = 6 kW if online (never affected by dust or night)               [🛰 principle, 🎮 size]

each step (Δt = 1 Mars min):
  net = P_solar + P_fission − Σ P_load(on)
  if net > 0: battery += net × Δt × H × 0.92                              [🎮 charge efficiency]
  else:       battery += net × Δt × H
  battery = clamp(battery, 0, cap)
  if battery == 0 and net < 0:
     switch off loads from the END of the priority list until net ≥ 0     (brownout)
     log CausalEvent('brownout', causes = top-2 ledger contributors since sunset)
     if sleeping: PEBBLE wakes you
```

Clean, clear-sky daily solar ≈ 16 × 12 × 2/π × H ≈ **126 kWh/sol** 🧮.

**Loads (kW)** 🎮:

| Load | kW | Notes | Shed-able? |
|---|---|---|---|
| **Life Support Core** (air circulation, CO₂ scrubber, pressure, water recovery) | 1.5 | Always first | **Locked on**. The card explains why |
| **Heaters** | `0.2 + 0.015 × (20 − T_out)`, clamp 0.4–2.5 (≈ 0.8 day, ≈ 1.7 night) | "Low" = half; the hab cools, and you sleep badly (energy −1) | Yes |
| **Oxygen Maker** (CO₂ → O₂, MOXIE-like, fictional scale) | 1.5 | 0.05 kg O₂ per Mars hour | Yes |
| **Electrolyser** (H₂O → O₂, ISS-like) | 1.0 | 0.06 kg O₂/h, uses 0.0675 L water/h 🧮 | Yes |
| **Water Processor** (melt + perchlorate cleaning) | 1.5 (2.1 with dirty ice) | 6 L/h; filter wear ×2 with dirty ice | Yes |
| **Tray lights** (each) | 1.0 | During photoperiod | Yes |
| **Tray climate** (per planted tray) | 0.2 (pepper 0.35) | Always while planted | Yes (plants stall in cold) |
| **Science Lab** | 1.5 | Lab hours → science | Yes |
| **Comms dish** | 0.8 | While uplinking (10 min per packet) | Yes |
| **Rover charging** | 2.0 | Until the rover's 30 kWh is full | Yes |
| **PEBBLE charging** | 0.2 | PEBBLE is "off duty" while charging | Yes |
| **Shelter pump** (water wall) | 0.3 | 1 h to fill the shelter wall | Yes |

**Balance check (clear, clean sol, Act I, no fission):** essentials (life support ≈ 37 +
heaters ≈ 31) ≈ **68 kWh** + electrolyser covering all your air ≈ 14 + two trays at 16 h ≈ 33
+ tray climate ≈ 10 → **≈ 125 kWh vs 126 produced**. A clean, sunny base *just* balances.
Any dust, lab hours or a rover trip means choosing. That is the intended tension.
A night on essentials only was originally estimated at ≈ 3.6 kW × 12.3 h ≈ **44 kWh**.
**Phase 1 verification (2026-11-12):** this estimate conflicts with the heater formula
above. At −80 °C heaters draw at most 1.7 kW; essentials therefore draw at most
3.2 kW, or 39.46 kWh over a 12-Mars-hour night. The provisional 24-point curve
produces **36.65 kWh**; the clean Act I full-sol check produces **125.41 kWh demand
vs 125.59 kWh solar**. Keep the formula until an explicit balance change is approved;
do not force a test to match 44 kWh. See `docs/tech/sim.md`.

### 3.3 Air (life support)

```text
o2Kg -= 0.84 / 1440 per step while you're inside            [🎮 planning value; verify vs NASA BVAD]
o2Kg += electrolyser.on × 0.06/60 + oxygenMaker.on × 0.05/60 (per Mars minute)
water.liters -= electrolyser.on × 0.0675/60                  [🧮 1 kg H₂O → 0.889 kg O₂]
EVA start: o2Kg -= 0.5 (suit fill); suit lasts 8 Mars hours  [🎮]
scrubberLife -= 1/(8 × 1440) per step while lifeSupport runs
if scrubberLife ≤ 0: co2 += 0.1 per Mars hour (yellow 0.5, red 0.8 → energy −1 per 2 h)
"AIR sols left" = o2Kg / 0.84
```

Thresholds: **yellow < 3 sols**, **red < 1 sol**, **Return to Ship < 0.25 sols**.

### 3.4 Water

```text
your use (gross) = 10 L/sol, recovery 90%  → net −1 L/sol             [🛰 ~90% ISS recovery; 🎮 10 L]
greenhouse net   = −2 L/sol per planted tray (wheat −3)               [🎮 after condensate recovery]
electrolysis     = −1.125 L per kg O₂ made                            [🧮]
ice → water      = 0.9 L per kg ice (10% residue)                     [🎮]
ice run          = the rover carries 60 kg of ice (≈ 54 L)            [🎮]
shelter wall     = moves 30 L into the wall tanks; unusable while "walled"  [🎮]
"WATER sols left" = liters / (rolling 1-sol net use)
```

A typical Act I drain is ≈ 1 + 4 + 0.95 ≈ **6 L/sol**, so 60 L lasts about 10 sols and the
M3 Ice Run (Sol 5, ≈ 30 L left) arrives naturally.

### 3.5 Food

| Crop | Real basis | Game cycle (compressed) | Yield | Needs |
|---|---|---|---|---|
| **Mizuna mustard** | 🛰 grown in Veggie | 25 sols | 1 sol of food + **health +1** for 10 sols | Standard |
| **Dwarf wheat** | 🛰 grown in the Advanced Plant Habitat | 50 sols | **6 sols of food** | +1 L water/sol; 16 h+ light ideal |
| **Chile peppers** | 🛰 grown on ISS (Plant Habitat-04) | 55 sols | 1.5 sols + **spirit +1** and a celebration bonus | Extra warmth (climate 0.35 kW) |

```text
growth += (1 / (cycleSols × 16)) × lightFactor per lit Mars hour
lightFactor: 12 h → 0.75 | 16 h → 1.0 | 20 h → 1.25
growth pauses if trayClimate is off (cold) or water is short; health −0.1/sol while paused
pantry -= 1 per sol (0.5 on half rations)
if pantry < 1 and no harvest due within 2 sols → half rations: energy −1/sol
```

The 60-sol campaign needs 60 sols of food: the pantry gives 50, so **about 10 must be grown**
(the Harvest gold line). Every crop card says plainly: *"Real plants take longer. The game
speeds up growth so you can see a whole season."*

### 3.6 Radiation

**Unit: Dose Point (DP).** **1 DP = 210 µGy absorbed dose**, about one sol of background
measured by Curiosity RAD at Gale Crater (Aug 2012 – Jun 2013) 🛰→🧮. DP is a game unit for
comparing; it is **never** shown as sieverts and **never** as a health prediction.

```text
dose per Mars minute = (gcr + sep) / 1440
gcr = 1.0 × gcrFactor × G[location]          gcrFactor 1.0, or 0.9 for 1 sol after a CME (Forbush dip 🛰)
sep = sepFlux(t) × S[location]
G (galactic cosmic rays, hard to block):  outside 1.0 | overhang 0.6 | hab 0.8 | shelter 0.7 | ship 0.8
S (solar particles, easier to block):     outside 1.0 | overhang 0.3 | hab 0.35 | shelter 0.2 (0.1 with water wall) | ship 0.4
```
G and S are 🎮 assumptions encoding a **general principle** (solar particles are easier to
shield than cosmic rays). They are flagged for **science-mentor review** before any in-game
card quotes them.

**May 2024 replay (M10):** the event integrates to **39 DP outside, unshielded**
(8,100 µGy ÷ 210 µGy ≈ 38.6) 🧮, over a 🎮 profile: onset 10–40 Mars min after the X-ray
flash (seeded; NASA: "tens of minutes" 🛰), a 1-hour rise, a peak at about 2 h, then a 6-hour
tail. At normal speed (60×), that's 10–40 real seconds to react. Expected doses: hab shelter
with water wall ≈ 4–6 DP (A); overhang ≈ 9–12 DP (B); "finish repair" ≈ 10–16 DP (C).

**Your badge:** **yellow 50 DP, red 70 DP; above 90 DP, outdoor work is limited** (PEBBLE does
those jobs, slower; some jobs still need you, with a strict time cap). You are never harmed.
Background alone over 60 sols indoors is ≈ 48 DP 🧮, so careful play stays near 60–70 and
careless play crosses 90.

### 3.7 You, PEBBLE, comms, events
- **You** (pips 0–3): **energy** comes from sleep (see §2.1); **health** drops without fresh
  food for 20+ sols or after cold nights; **spirit** rises with Earth and family messages,
  harvests and wonder moments, and falls a little in the blackout and on half rations. Spirit
  affects only PEBBLE's lines and an optional "call home" moment (never a hidden penalty).
- **PEBBLE:** battery drains 5%/Mars hour on a job, 1%/h idle; charging (0.2 kW) takes it off
  duty. Dust on PEBBLE slows its jobs. A radiation glitch (SEP while outside) = a 30-min
  reboot. PEBBLE jobs: **clean panels** (3 h, panel dust ×0.5), **scout** (reveals a site's
  details), **carry** (samples, crates), **night watch** (always, while charging overnight).
- **Comms:** `oneWayMin` follows a scripted track: Sol 1 → 10 min, rising to 20 min by
  Sol 40; **blackout Sols 41–54** (≈ 13 sols 🛰 white paper); Sol 55+ → 21 min 🎮 (within
  NASA's ranges 🛰). Reply time = 2 × delay + Earth team time (20–40 min, seeded). Two orbiter
  relay windows per sol (🎮 schedule; relays are real 🛰).
- **Event Director:** seeded mulberry32 RNG; each event has `weight(state)`, a cooldown and
  `forecastLead` (≥ 1 sol for dust storms, ≥ 1 trend warning for wear faults, ≥ 10 Mars min
  for an SEP via the X-ray flash). At most one negative major event per sol; night events
  wake you.

### 3.8 Fairness and failure rules (testable)
1. Every Return to Ship condition has a **yellow warning ≥ 1 sol before** and a **red warning
   before the stop**, each with a suggested action.
2. Life Support Core can't be shed by the player and is the last load the brownout logic
   cuts. Even then a Return to Ship needs AIR < 0.25 sols.
3. Every sleep and every major decision creates a **checkpoint** (ring buffer of 20).
4. **Sleep never skips a decision**: any event with a card wakes you first.
5. No event can fire twice in a row; no two hazards from the same domain within 1 sol.
6. Random outcomes show their odds in words and numbers ("about 1 in 3 chance each sol (35%)").
7. Science points, badges and medals never offset your safety.
8. No countdown timers anywhere; every decision waits for the player.

### 3.9 Balance methodology
- **Spreadsheet first**, for the energy, water and air daily budgets per act (the numbers above).
- **Headless balance runner** (proposed `scripts/sim-balance.mjs`): 1,000 seeds × 4 bot
  policies (*Turtle*: always max reserves; *Scientist*: max science; *Gardener*: max growth;
  *Balanced*: heuristic), plus a *Careless* bot (random choices, sometimes skips sleep). The
  bots sleep every night unless stated.
- **Targets (one difficulty, tuned for ages 7–12):**

| Metric | Target |
|---|---|
| Returns to Ship per full campaign, Balanced bot | < 0.3 |
| Returns to Ship per full campaign, Careless bot | ≤ 2 (the game stays finishable for a young player who guesses) |
| Option dominance: each decision option is the best choice in ≥ 20% of seeded states | ✓ |
| No single bot wins all four medals in > 40% of seeds | ✓ |
| No gauge pinned at full for > 3 sols (no "infinite resource") | ✓ |
| Balanced bot earns ≥ 2 gold medals in ≥ 50% of seeds (good play feels rewarded) | ✓ |

- **Invariant tests** (every commit): no negative stocks; no NaN; battery ≤ cap; energy
  conservation (Σ generated − Σ used = Δbattery ± efficiency); same seed + same decision log ⇒
  identical state; sleeping and staying awake through the same night with the same loads give
  the same resource result (sleep changes only *your* energy).

---

## 4. Views and interaction (UX specification)

### 4.1 Why each view exists

| View | Used for | Why this view teaches better |
|---|---|---|
| **First person** | Everything your body does: the landing, walking inside and outside, the airlock, the rover seat, the drill, repairs, the greenhouse, the shelter, sleeping | You *live* inside the life-support machine. Hands-on tasks make abstract systems physical ("I swapped the CO₂ cartridge"). Outside, the helmet frame and breathing remind you that the air is not breathable |
| **Isometric Station View** | Managing the base: switching modules, priorities, the night plan, PEBBLE jobs, fission placement, seeing weather and dust | Shows **how the base fits together**: cables, distances, which module draws the most power. Kids see the base as one connected system, like a dollhouse |
| **2D** | PEBBLE cards, Comms Desk + Signal Tracker, Space Weather Desk, Data Pad pages, Why Chain, Mission Report, Sources | Numbers, timelines and cause-and-effect read best flat |

### 4.2 Station View specification

| Aspect | Design |
|---|---|
| Camera | Orthographic (true isometric), about 35° down and 45° around; zoom between "base yard" and "whole site"; rotate in 90° steps (Q/E); pan with WASD or right-drag |
| Open / close | **M** anywhere (wrist Data Pad) or the Station View console. 0.8 s camera rise out of your head into the view; **M** or **Esc** brings it back down to the same spot |
| What's shown | All modules with **see-through roofs** (interiors visible); **power flow lines** along cables (thickness = kW, moving dots = direction); a **small info tag** per module (icon, status shape ● ▲ ■, kW); a tiny **you** figure (the young-astronaut model) and **PEBBLE**; dust on the panels; storm haze; the 1 km fission ring |
| Click a module | Opens its **info card** (2D side panel): what it does, power use, status, health, on/off, dimmer, priority position, "Why does this matter?" |
| Priority list | A side panel with drag-to-reorder cards (top = switched off last); Life Support locked at the top |
| Night plan | At dusk the panel shows the **night forecast line** of the battery to dawn, with ■ where something would switch off |
| PEBBLE jobs | Click PEBBLE → pick a job → click a target. PEBBLE drives there in real time; a progress ring over it |
| Placement | M6: drag the fission unit's ghost along the ground; the ring and cable length update live |
| Time | Keeps running while you look around (you can watch PEBBLE work); **pauses while an info card or the priority panel is open**, so planning is never rushed |
| Story reason | "The base's live 3D map, built from its cameras and PEBBLE's scans" |

### 4.3 PEBBLE card specification
- **Trigger:** a sim event or a scripted beat raises a decision → time pauses.
- **Delivery:** if PEBBLE is within 10 m, it rolls in front of you and its face screen **grows
  into the card** (a 0.4 s transition into a 2D overlay framed like PEBBLE's screen, with its
  eyes at the top). If PEBBLE is away, the card opens on your **wrist pad** with PEBBLE's face
  in the corner ("calling from the solar array").
- **Layout:** situation line → 2–4 option tiles (same size and colour) → "What happens later?"
  → "Why?" → "Give me a hint".
- **PEBBLE's face** stays neutral while you choose; after the choice it reacts (happy,
  worried, thinking) and says the "Mars truth" line.
- **Why Chain:** told as PEBBLE's memory tape: a strip of beads with PEBBLE's small icons.

### 4.4 Switching rules (state never resets)

| Transition | Trigger | Animation | Notes |
|---|---|---|---|
| 1P → Station View | **M** or the console | Camera rises 0.8 s | Your body stays where it was; the sim keeps running (it pauses while a panel is open) |
| Station View → 1P | **M** / **Esc** | Camera drops back | Same position and facing |
| 1P → 2D panel | Look at a console + **E**, or **Tab** for the Data Pad | Console: camera dollies to the screen (0.6 s), DOM panel fades in, pointer lock released | **Esc** reverses |
| Any → PEBBLE card | Sim event | PEBBLE rolls in, its face grows into the card; the world freezes behind a soft vignette | — |
| 1P → sleep | **E** at the bunk | Eyes close (fade), the night time-lapse through the window with the battery line | Wake-up report on opening |
| Inside ↔ outside | Airlock cycle | The airlock cycle hides the interior/exterior scene swap | — |

### 4.5 Controls

| Action | Keyboard / mouse | Touch (stretch) | Gamepad (stretch) |
|---|---|---|---|
| Move / look | WASD / mouse (click to capture, Esc releases; existing) | Left stick / drag | Sticks |
| Run / jump | Shift / Space (0.38 g) | Buttons | L3 / A |
| Interact, hold for tasks, sleep at the bunk, wait at the chair | **E** | Tap the prompt | X |
| Data Pad | **Tab** | Wrist icon | Y |
| Station View | **M** (inside: Q/E rotate, wheel zoom, right-drag pan, left-click select) | Map icon | Back |
| Ask PEBBLE for a hint | **H** | PEBBLE icon | LB |
| Pause | **Esc** / **P** | Pause icon | Start |

The Ecctrl 2 rule from `docs/tech/player.md` stands: input goes through `setMovement`, and
movement is relative to the camera. Removing third person keeps the existing first-person
setup; the rover seat uses a fixed seated camera.

### 4.6 HUD layout (first person)

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ ⚡ POWER  ███████░░ 74%  ▲+6 kW  "Night covered: 9 h"   SOL 12 · 14:20 ☀ │
│ 🫁 AIR    ██████░░░ 9.5 sols ▼                                   🛏 18:00 │
│ 💧 WATER  ████░░░░░ 5.0 sols ▼  ▲ Watch                                  │
│                                                   🌱 Food  ● OK  48 sols │
│                                                   ☢ Sun    ● Quiet       │
│                                                   📡 Earth ● 12 min      │
│                                                   🧑‍🚀 You   ▲ Tired       │
│                          ·                        🤖 PEBBLE ● 82%        │
│                     [ E ] Clean panel  (hold)                           │
│ 🤖 "Panels look dusty!"                                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Three big gauges only** (NASA's 2–3 core resources). Each shows a bar, a human-language
  value, a trend arrow and a **status shape**: ● OK / ▲ Watch / ■ Act. **Never colour alone.**
- **Five status chips**; clicking one opens its detail.
- The clock shows sol, Mars hour, sun or moon, and 🛏 when sleep becomes available.
- Outside, the HUD sits inside a **helmet frame** (soft edges) with a suit-air bar.
- **Layered numbers (one setting for everyone):** the first look shows bars, %, "sols left"
  and arrows; hovering or tapping a gauge shows exact units (kWh, kg, L); "Why?" opens the
  science and the source.

### 4.7 2D screens

| Screen | Content | Interaction |
|---|---|---|
| **PEBBLE card** | 9-part contract (Part 2 §1), 2–4 option tiles | Choose; "What happens later?"; "Why?"; hint |
| **Wake-up report** | Overnight battery line, what switched off and when, events, Earth messages | Read; tap a bead to open the Why Chain |
| **Comms Desk + Signal Tracker** | Orbit diagram (Sun, Earth, Mars), light-dot message animation, arrival times, relay windows, outbox, inbox | Compose packets, send in a window, read timestamped replies |
| **Space Weather Desk** | DONKI event list (archived or live), type icon (FLR / CME / SEP), the base sensor graph | Read cards; "Why is an alert not a dose?" |
| **Greenhouse info** (from Station View or in the dome) | Trays, growth stage, harvest ETA, water and light use | Plant, photoperiod dial, harvest, rename plants |
| **Why Chain** | PEBBLE's memory tape of causal events | Scrub, expand, "Try again from here" |
| **Mission Report** | Medals, 3 Why Chain highlights, best decision, one "what if?", sources used | Replay, continue |
| **Sources & Credits** | Every dataset with its provenance card, the DONKI acknowledgement, AI-use disclosure, asset credits | Links open NASA pages |

### 4.8 Writing, feedback and accessibility

| Area | Rule |
|---|---|
| Reading level | Written for a 7-year-old reader: ≤ 12 words per sentence, no unexplained jargon; key terms underlined and tappable; depth only behind "Why?" |
| Feedback triad | Every consequence shows in **3D** (visual change) + **2D** (gauge or chip) + **text** (PEBBLE's one line), plus an optional sound |
| Colour | Palette from `src/style/tokens.json` only (project rule). Status shape and icon always go with colour; checked against deuteranopia and protanopia |
| Text size | Scale 100 / 125 / 150%; minimum 16 px body text; high-contrast HUD panels |
| Audio | All lines subtitled; no information is audio-only; alarms also flash a shape |
| **Motion (first person only, so this matters)** | FOV slider (default 75), a centre dot, no head-bob by default, reduced-motion toggle (no landing shake, shorter transitions); Station View is a calm alternative for long planning |
| Time pressure | None: no countdown timers; decisions always pause the game |
| Input | Hold-to-interact can be switched to toggle; remappable keys (stretch) |
| Language | English first; Arabic UI and subtitles (RTL) as a stretch goal |
| Privacy | No account, no personal data. The callsign is stored only in `localStorage` |

---

## 5. Additional UX flows

### 5.1 Boot to play
Title (the future/real-science card) → **Play** → callsign + suit-pad colour (2 taps) → **you're in the ship's
seat above Mars** (M0). There is no difficulty menu.

### 5.2 Pause menu
Resume · Settings (accessibility) · Field Guide (unlocked Mars truths) · Sources · Try again
from last sleep · Quit to title.

### 5.3 Mission Report (end of every mission)
Medal strip · "What happened" (≤ 5 Why Chain beads) · "Mars truth you learned" (one sentence)
· badges · **Try again from a decision** · Continue.

---

## 6. World layout (3D)

| Zone | Real-world scale | Contents | Built from |
|---|---|---|---|
| Landing ship | 150 m east of the hab | Exterior (lander on legs) + a small cabin interior (seat, window, screen, hatch, small airlock) | New assets |
| Base yard | ~60 m radius | Hab, airlock, greenhouse dome, solar array (4 rows), battery bank, dish, Oxygen Maker, water processor, PEBBLE dock, rover pad, cable trenches | Existing 240 m terrain + new assets |
| Mesa cliff and overhang | Shelter entrance 110 m north; repair 150 m north (40 m escape distance) | Faceted cliff face, a recessed overhang | New terrain asset |
| Ice apron | Map edge (~110 m), "1 km" by map scale | Dusty debris-covered ice, drill site, ice-exposing crater | New terrain patch + crater |
| Power site | Beyond the fog line | Fission unit, cable spool, ring markers | New assets (stretch) |
| Habitat interior | Separate scene, loaded behind the airlock cycle | Bunk, galley chair, consoles, Life Support rack, PEBBLE nook, Storm Shelter | New interior kit |
| Greenhouse interior | Small scene | 3 trays, magenta LEDs, climate dial | Dome asset + tray kit |
| Sky for the landing | Skybox / sky shader | Mars from orbit, then the peach sky | New |

---

**Phase 2 layout correction (2026-11-12):** the former 80 m cliff estimate cannot coexist with a 150 m hab-to-repair distance and a 40 m repair-to-shelter distance (80 + 40 < 150). The runtime puts the shelter entrance 110 m north, preserving the mission escape distance. See `docs/tech/world.md`.

## 7. Art and asset breakdown

Style follows `docs/style/STYLE_GUIDE.md` (Terracotta Mars, v2). All new assets follow the
Kiln pipeline in `docs/pipeline/ASSET_PIPELINE.md` and the real-world scale rules (astronaut
1.8 m, door 2.4 m, crate 1 m, rover 4.5 m, module 8 m). The list comes **from the missions**;
nothing here is claimed to exist unless marked ✅.

### 7.1 P0 (needed for the MVP slice: M0, M1, M10)

| Asset | Used in | Notes |
|---|---|---|
| ✅ Six-wheel Mars rover | M3 (later), Station View | Exists (`public/models/mars-rover.glb`); needs a driver's seat for 1P (T-10) |
| ✅ Young astronaut | The tiny "you" figure in Station View; arms/gloves in 1P | Exists, rigid-jointed, `Friendly_Wave` clip; needs walk clips (T-9) |
| **PEBBLE robot** | Every mission (it presents every decision) | ~0.5 m, two tank-tread tracks, boxy body, head on a short neck, screen face with cyan eye and emotion states, two gripper arms (no brush; wrist air nozzle for panels), antenna beacon. Reference: `g05-pebble-box-buddy.jpg`. **Now P0** |
| **Landing ship** (exterior + small cabin interior) | M0, Return to Ship | Seat, window, screen, ARM button, hatch |
| Habitat module (exterior) + **airlock portal** | All | Octagonal amber-lit portal as in the hero scene |
| **Airlock interior** (hatches, lever, pressure gauge, suit rack) | M0, every EVA | Hides the scene swap |
| **Hab interior kit** (wall panels, consoles with screen anchors, **bunk**, **galley chair**, PEBBLE nook) | M0, M1 | Ivory walls, slate frames, orange safety panels, amber strips (T-5) |
| **Storm Shelter room** (water tanks, pantry racks) | M10 | Small; shares the interior kit |
| **Solar array** (rows; dust states) | M0, M1, M5 | Dust is a material colour lerp, not a texture map (style rule) |
| **Battery bank** | M1 | Chunky cabinet |
| **Mesa cliff with overhang** | M10 | Faceted, matte, with a flat buried base |
| **Cable run + repair junction box** | M10 | Simple |
| **Roof-cutaway variants** of modules | Station View | Roofs as separate meshes, so they can fade |
| Dose badge, Data Pad, helmet frame (UI) | All | From the g03 small-items sheet / UI art |

### 7.2 P1 (full Act I–III "should" missions)
Greenhouse dome (exterior + interior trays, magenta LEDs) · comms dish · Oxygen Maker unit ·
electrolyser rack · water processor + ice crates · ice drill rig · scrubber cartridge prop ·
test kit · ice apron terrain patch · ice-exposing crater · instanced scattered rocks ·
PEBBLE tool variants (sample-core grip pads, track skirts).

### 7.3 P2 (stretch)
Fission unit + keep-out ring markers · cargo lander · sample cores · celebration table ·
Phobos in the daytime sky · Jezero and Arcadia site variants.

### 7.4 VFX

| Effect | Mission | Approach |
|---|---|---|
| Landing: heat-shield glow, retro-rocket dust blast | M0 | Window-frame glow shader + particle burst; reduced-motion version |
| Dust devil column + shadow | M5 | Rotating particle cone, ochre, soft |
| Storm haze | M9 | Fog density and sky gradient lerp from tokens |
| Dust on panels | M5, M9 | Material colour lerp toward `regolith-mid` |
| **Particle "snow"** | M10 | Screen-space white specks on the visor and on PEBBLE's face (🛰 real Curiosity navcam effect) |
| Aurora | M10 night | A faint purple band (🛰 MAVEN). The card says "shown in visible colours for you" (it was UV) |
| Frost on windows | M1, sleep time-lapse | Decal / alpha overlay |
| Night time-lapse | Every sleep | Stars wheel past the window, frost grows, the battery line drains |
| Station View power flows | All | Animated dashed lines along cable splines; thickness = kW |
| Greenhouse magenta light | M2 | Small coloured point light inside the dome (🛰 Veggie glows magenta pink) |
| Airlock depressurisation | M0 | A short vapour puff + gauge needle |

### 7.5 Audio
- **Outside is quieter and muffled** (thin air), heard through your helmet. Inspiration:
  Perseverance's microphones really recorded Mars, including MOXIE's compressor 🛰. Inside:
  the hum of life-support fans.
- Suit breathing (subtle), airlock hiss, soft alarm chimes (never harsh), dose ticks
  (stylised), rover crunch, **PEBBLE's beeps** (a small "voice" vocabulary: happy, worried,
  thinking, proud), the landing roar then silence.
- Music: calm warm pads; a low tension layer during storms; a bright motif at harvest and when
  the signal returns; a soft lullaby motif for sleep.

---

## 8. Technical implementation proposal (on the existing stack)

**The stack is not replaced** (CONFIRMED in Part 1 §1.1). New packages are listed as
NEEDS TEAM CONFIRMATION.

### 8.1 Proposed source layout

```text
src/
  sim/                         # NEW: pure TypeScript, no React/Three
    state.ts  step.ts  loads.ts  air.ts  water.ts  food.ts  radiation.ts  comms.ts
    you.ts  pebble.ts  time.ts (sleep, wait, skips)
    events/director.ts  events/deck.ts
    causal.ts                  # Why Chain attribution (ledger → causes)
    rng.ts                     # mulberry32
    missions/m0.ts m1.ts m10.ts ...   # scripted setup, objectives, PEBBLE cards
    data/                      # curated NASA data + provenance (JSON)
      spaceweather-2024-05.json  rad-gale.json  meda-temp-shape.json  comms-track.json  site.json
  state/
    useMissionStore.ts         # NEW Zustand: discrete UI state (mode, view, open panel, snapshot @4 Hz, card)
    useWorldStore.ts           # existing
  game/
    world/ (existing terrain, sky, lighting) + Habitat.tsx Interior.tsx Shelter.tsx Cliff.tsx Ship.tsx
    player/ (existing Ecctrl, first person) + Interactable.tsx RoverSeat.tsx
    camera/ (existing first person) + StationViewCamera.tsx (orthographic) ConsoleDolly.tsx
    station/ FlowLines.tsx ModuleTags.tsx RoofCutaway.tsx Placement.tsx
    pebble/ Pebble.tsx PebbleFace.tsx PebbleJobs.ts
    vfx/ Landing.tsx DustDevil.tsx ParticleSnow.tsx Aurora.tsx SleepTimelapse.tsx
  ui/
    Hud.tsx (existing → 3 gauges + 5 chips + clock) PebbleCard.tsx WakeReport.tsx ModuleInfo.tsx
    PriorityPanel.tsx NightPlan.tsx CommsDesk.tsx SignalTracker.tsx SpaceWeatherDesk.tsx
    WhyChain.tsx MissionReport.tsx SourceCard.tsx DataPad.tsx Settings.tsx
scripts/
  fetch-donki.mjs              # NEW: builds the curated archive from the DONKI API (run once, commit JSON)
  sim-balance.mjs              # NEW: headless 1000-seed balance runner
```

### 8.2 Runtime loop
- `SimRunner` (a ref, not React state) owns the `SimState`. `useFrame` accumulates real time ×
  60 and calls `step()` in fixed 1-Mars-minute steps. Sleep, wait and skips run their steps in
  a loop **outside** rendering (a whole night ≈ 740 steps, trivial), and stop early on any event
  that needs a card.
- The 3D reads values directly from the runner ref each frame (panel dust colour, sky τ, flow
  line thickness). This follows the project rule that **per-frame data stays in refs, not
  Zustand**.
- `useMissionStore` receives a **throttled snapshot (≈ 4 Hz)** for the DOM HUD and panels, plus
  discrete events (card opened, mission complete, woke up).
- UI commands (`setPriority`, `toggleLoad`, `choose(cardId, optionId)`, `sleep()`,
  `wait(hours)`, `pebbleJob(kind, target)`) are queued and applied at the start of the next
  step, which keeps the sim deterministic and replayable.
- **Station View** is the **same scene** with a second camera: drei `OrthographicCamera` +
  limited `MapControls`. Pointer events on module meshes open info cards. Roof meshes fade by
  material opacity, using values from tokens. The first-person controller is frozen while it's
  open.

### 8.3 Save and state flow
- `localStorage['marslifeline.save.v2']` = `{ simState, decisionLog, checkpoints[≤20], settings }`.
- **Autosave on every sleep** and every decision. Save versioning with a migration stub.
- **Replay** = initial state + seed + decision log → identical results (rewinds and tests).

### 8.4 NASA data ingestion

| Dataset | How | File | Live? |
|---|---|---|---|
| **DONKI** (CME, CMEAnalysis, FLR, SEP) for 14–21 May 2024, plus a quiet week | `scripts/fetch-donki.mjs` calls `https://ccmc.gsfc.nasa.gov/DONKI-API/get/{type}?startDate=…&endDate=…` (the **new base URL** after the 30 Sep 2026 migration 🛰), trims fields, adds provenance | `spaceweather-2024-05.json` | Archived (default) |
| DONKI live (optional) | Browser fetch of the last 7 days; cached 1 h; on failure, the archive with a banner "Offline: showing recorded data" | runtime | **Live, labelled** |
| Curiosity RAD values | Two constants (210 µGy/sol 2012–13; 8,100 µGy on 20 May 2024) with source URLs | `rad-gale.json` | Static |
| MEDA temperature shape | A 24-point normalised curve from one curated Jezero sol (small subset, not the full archive; Foundation §7.3 warning) | `meda-temp-shape.json` | Static |
| SWIM site facts | Text + map attribution | `site.json` | Static |
| Comms track | The scripted delay and blackout curve citing the white paper and Comms 7 Things | `comms-track.json` | Static |

**Provenance record (Foundation §10.2), stored with each dataset:**

```yaml
id: donki-cme-2024-05-20
name: "Fast halo CME, 20 May 2024"
producer: "NASA CCMC / Moon to Mars Space Weather Analysis Office (DONKI)"
source_url: "https://ccmc.gsfc.nasa.gov/DONKI/view/CME/31034/-1"
api: "https://ccmc.gsfc.nasa.gov/DONKI-API/get/CMEAnalysis?startDate=2024-05-20&endDate=2024-05-20&mostAccurateOnly=true"
challenge_resources_listed: "unverified"   # check the Resources tab on 13 Nov
retrieved_at: "2026-11-12"
processing_level: "curated"
fields_used: [activityID, startTime, note, speed (2678 km/s shock; 1927 km/s bulk), type (R), longitude (~172-176, far side)]
game_mapping: "Triggers the M10 solar particle event; the dose profile is a GAME MODEL scaled to RAD's 8,100 µGy"
uncertainties: ["DONKI data is prototyping-quality research information", "A CME record is not a dose at any site"]
ui_attribution: "Space weather data: NASA CCMC DONKI. Radiation scale: NASA/JPL-Caltech/SwRI Curiosity RAD."
```

The DONKI "Rules of the Road" acknowledgement and disclaimer go on the Sources page 🛰.

### 8.5 Offline fallback and resilience
- Everything except "Live sky" works **offline**. No backend, no account (Cairo Wi-Fi is shared
  and congested; the guide says to bring a backup connection).
- Static hosting (any public static host; the link must open without login, per Cairo rules).
- `?demo=1` starts at M10 with a prepared state; `?demo=landing` plays only the M0 landing
  (for the video).

### 8.6 Performance targets
60 fps on an integrated-GPU laptop at 1080p · ≤ 200 draw calls · ≤ 300k visible triangles ·
initial download ≤ 15 MB (the interior and ship cabin lazy-load behind the airlock and the
landing) · GLBs optimised with the existing glTF Transform pipeline · instanced rocks · one
shadow-casting sun (existing); Station View uses a cheaper shadow setting.

### 8.7 Testability

| Layer | Test |
|---|---|
| Sim | Unit tests per subsystem; invariants (§3.9); golden-replay tests (seed + log ⇒ hash); sleep-equivalence test |
| Balance | `sim-balance.mjs` report before submission |
| UI | Manual checklist per screen; keyboard-only run-through; colour-blind preview |
| Build | `npm run build` (typecheck + bundle) and `npm run lint` before any merge (project rule) |
| Browser | Chrome, Firefox and Edge on a judges'-style laptop; fresh-profile test (no cache) |

Test runner: **Vitest** (NEEDS TEAM CONFIRMATION: new dev dependency) or Node's built-in
`node --test`.

### 8.8 Project conventions to keep during implementation
- Colours and materials come from `src/style/tokens.ts`; never hard-code palette hex.
- Don't hand-edit generated files (`assets/style/*`, `assetManifest.json`; placement values excepted).
- Follow the docs protocol: when gameplay work starts, add docs for `sim/`, missions, Station
  View and PEBBLE, link them from `docs/README.md`, and add a CHANGELOG entry. *(This plan
  deliberately touched no existing file, as requested.)*

---

## 9. Scope: MVP vs stretch

### 9.1 MVP vertical slice ("must", the hackathon build)

| Feature | Detail |
|---|---|
| Sim core | Clock, solar (daylight + dust), battery, loads with priority and brownout, Life Support Core, heaters, O₂ reserve, water reserve, 1 tray of simple growth, DP radiation with location factors, scripted comms delay, causal log, **sleep** and **wait** |
| HUD | 3 gauges + 5 chips + clock with 🛏 |
| Station View | Orthographic camera, module info cards, priority panel, night plan, flow lines (simple), roof fade |
| PEBBLE | Model, face states, follows you, **presents cards**, night watch wake-up |
| 2D | PEBBLE card, wake-up report, Why Chain (list form), Space Weather Desk (archived DONKI), Mission Report (simple), Sources page |
| 3D | Exterior yard (existing terrain + hab + solar array + cliff overhang + ship); first person inside the ship, the hab and the shelter |
| Missions | **M0 Touchdown** (short landing) → **M1 Night Shift** → Mission Log card → **M10 The Day the Sun Roared** |
| Data | Curated DONKI May 2024 + RAD values + provenance cards |
| Difficulty | One balanced setting (no modes); hover numbers and "Why?" layers |

### 9.2 Should (if ahead of schedule)
M5 Dust Devil (PEBBLE jobs) · M7 Signal Tracker · water-wall valve · Live sky toggle.

### 9.3 Stretch (post-hackathon roadmap)
Full campaign M2–M12 · fission placement · greenhouse interior · event deck · Arabic UI ·
touch and gamepad · site variants · classroom seeds · printable Mission Log · Field Guide.

### 9.4 Deliberately not built
Crew members · third-person camera · difficulty modes · countdown timers · multiplayer · open world · crafting trees · combat or
aliens · a chatbot companion (PEBBLE's lines are scripted) · a backend · physically accurate
radiation transport · full-archive PDS downloads · ML.

### 9.5 Cut list, in order (if behind schedule)
1. The landing → a 20-second version (window glow, thud, hatch opens).
2. 3D shelter interior → a 2D shelter card (keep the first-person run).
3. Why Chain bead UI → a plain list.
4. Station View flow-line animation → static coloured cables.
5. Roof cutaway → modules shown with labels only.
6. **Never cut:** the night plan + sleep, the M10 real-data decision, PEBBLE presenting cards,
   the Sources page, the 3 gauges.

---

## 10. Production plan (24 hours, Cairo schedule)

Team of 5: **Systems Dev** (sim, time, sleep), **Gameplay Dev** (first person, Station View,
interactions), **UI Dev** (HUD, PEBBLE card, 2D panels), **Artist** (Kiln assets),
**Design/Science/Story** (writing, data, balancing, video). Adjust per T-4.

| Hours from 13 Nov 1:00 PM | Systems | Gameplay | UI | Art | Design / Science |
|---|---|---|---|---|---|
| **H0–1** | Confirm T-1, T-2, T-3 with organisers; read the Resources tab; lock the MVP | ← | ← | ← | Re-map datasets if the tab lists better ones |
| **H1–6** | `sim/` state, step, power, battery, loads, air, water; sleep + wait | Interactions (E-hold), airlock trigger, Station View camera | HUD gauges, clock, chips | **PEBBLE** + hab exterior + airlock | Write M0/M1/M10 scripts, PEBBLE lines, glossary |
| **H6–10** | Radiation DP, comms, causal log, card API, night-watch wake-up | Module picking, info cards, priority panel; console dolly | PEBBLE card, wake-up report | Solar array, battery, interior kit with bunk | Curate the DONKI JSON (`fetch-donki`), provenance cards |
| **H10–14** | M0, M1 logic | M0 playable end-to-end (short landing) | Why Chain list, Mission Report | Landing ship, cliff overhang, shelter | **Mentor check** (science/data + game design) |
| **H14–18** | M10 logic, SEP profile, balancing pass | M10 run, particle-snow VFX, PEBBLE glitch | Space Weather Desk, Sources page | Roof cutaways, polish | Playtest with proxies; fix wording |
| **H18–21** | Bug fixing, determinism tests | Performance pass, sleep time-lapse polish | Accessibility pass | Final GLB optimisation | Record gameplay for the video |
| **H21–23** | `npm run build`, static deploy, offline test | Fresh-browser test | — | — | **30 s video / 7 slides**, summary, resource list, AI-use disclosure |
| **H23–24** | **Team leader submits locally and globally**; all links checked logged-out | | | | |

Mentorship tips (Ep. 2): ask early, with a specific question ("we're building X, our goal is
Y, we tried Z, it failed because W, what do you recommend?"); one ticket at a time.

---

## 11. Source-to-mechanic mapping

| NASA source | Observed fact / data | Simplified game rule | Player decision | In-game disclosure |
|---|---|---|---|---|
| [Mars Facts](https://science.nasa.gov/mars/facts/) | Sol 24.6 h; −153 °C … +20 °C; thin CO₂ air; no global magnetic field; Mars "inhabited entirely by robots" | Sol clock; cold-night heater load; no breathing outside; radiation always on; "set in the future" title card | M1 night plan; M0 airlock | Glossary + "Mars truth" lines |
| [Humans to Mars](https://www.nasa.gov/humans-in-space/humans-to-mars/) | 0.38 g; 96% CO₂; storms can last months, making fission more reliable; power, food, water, shelter, comms challenges | Rapier gravity; fission unaffected by dust | M6 deployment; M9 prep | Data card M6 |
| NASA EDL pages (**to verify** before citing) | Landing takes about 7 minutes, shorter than the signal delay, so landers land themselves | M0: "Earth can't steer your landing" | — (M0 is a lesson, not a choice) | Landing card (🛰 only after verifying) |
| [Dust storms: fact and fiction](https://www.nasa.gov/solar-system/the-fact-and-fiction-of-martian-dust-storms/) | Winds ≤ ~60 mph in ~1% density air; electrostatic dust; dust devils coat panels; global storms ~ every 3 Mars years; rovers in survival mode in 2007; dust in gears | Dust lowers solar; storms never damage structures; grit event | M5 cleaning; M9 stockpile vs science | "Thin wind" line; storm forecast |
| [RAD surface](https://science.nasa.gov/resource/radiation-measurements-on-mars/) | ~210 µGy/day from cosmic rays at Gale (2012–13); Forbush decreases from CMEs | **1 DP = 210 µGy**; background dose; Forbush good-news event | M8 EVA length; E7 | "Measured at Gale, not our base" |
| [Mars Light Up (May 2024)](https://www.nasa.gov/solar-system/planets/mars/nasa-watches-mars-light-up-during-epic-solar-storm/) | 8,100 µGy ≈ 30 chest X-rays; X12; Earth on far side; particles in tens of minutes; cliffs and lava tubes shield; navcam "snow"; MAVEN aurora | M10 total 39 DP outside; onset 10–40 min; overhang shelter; snow VFX on the visor and PEBBLE; aurora | **M10 Commander's Call** | Real-event banner + data card |
| [DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/) + API (live queries) | CME `2024-05-20T05:36:00-CME-001`, fast halo, backsided source, 2,678 km/s shock, type R; flare and SEP catalogs; prototyping-quality data | Space Weather Desk archive; event triggers; alert ≠ dose | M8, M10, E8, E9 | Event IDs shown; DONKI acknowledgement |
| [CCMC Sept 2026 updates](https://ccmc.gsfc.nasa.gov/news/major-updates/) | New DONKI-API base URL; **Mars CME and Mars SEP scoreboards (beta)** | Use the new endpoints; Mars scoreboards as a stretch "Mars forecast" link | — | Sources page |
| [SWIM ice map](https://www.jpl.nasa.gov/images/pia26045-swim-map-shows-subsurface-water-ice-on-mars/) + [Follow the Water](https://www.nasa.gov/centers-and-facilities/jpl/where-should-future-astronauts-land-on-mars-follow-the-water/) | Subsurface ice at mid-latitudes; Arcadia and **Deuteronilus Mensae**; low elevations; ice-exposing craters | Landing site; ice-drill mission; crater science target | M3 drill site; M8 crater | Landing map in M0 |
| [Detoxifying Mars](https://www.nasa.gov/general/detoxifying-mars/) | Martian ice water contains perchlorates: toxic, corrosive | Processor cleaning cost; filter wear; no raw-soil farming | M3 near vs far ice; M2 regolith | PEBBLE's sample card |
| [MOXIE](https://www.nasa.gov/space-technology-mission-directorate/tdm/mars-oxygen-in-situ-resource-utilization-experiment-moxie/) + [results](https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/) | 122 g total, ≤ 12 g/h, ≥ 98% purity, 16 runs, 300 W; a crew system ~100× larger | Oxygen Maker = fictional scaled-up machine with a high power cost | M4 O₂ source | "Real MOXIE vs our machine" card |
| [ECLSS](https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/) | ~90% water recovered on ISS; O₂ by electrolysing water; CO₂ removed by sieves | Electrolyser uses water; 90% recovery; scrubber cartridge | M4; E3 | Life-support card |
| [Veggie](https://science.nasa.gov/mission/veggie/) / [Growing Plants](https://www.nasa.gov/exploration-research-and-technology/growing-plants-in-space/) / [Plant hardware](https://science.nasa.gov/biological-physical/focus-areas/plant-biology/hardware/) | 6-plant garden, clay "pillows", magenta LEDs; mizuna, lettuces, kale grown; APH with 180 sensors, dwarf wheat; chile peppers (PH-04); fungus from overwatering and low airflow | Crop roster; growth medium; LED look; fungus event | M2 crop choice; E5 | "Growth sped up for play" card |
| [OSDR](https://science.nasa.gov/biological-physical/data/osdr/) | Space life-science data, including plants, microbes, radiation biology | Earth's plant team "consults OSDR-style data" (narrative), no invented findings | M7 ask Earth | Sources page (narrative use only) |
| [Comms 7 Things](https://www.nasa.gov/centers-and-facilities/goddard/space-communications-7-things-you-need-to-know/) | 4–24 min one way; relays via orbiters; solar interference | Delay track; relay windows; Signal Tracker; the M0 "we landed" message | M7; E15 | Signal Tracker labels |
| [Comms white paper](https://www.nasa.gov/wp-content/uploads/2024/01/mars-communications-disruption-and-delay.pdf) | Conjunction every ~26 months; one-way up to 21–23 min; long-stay blackout ≈ 13 days ~100 days in; autonomy needed | 13-sol blackout chapter; Standing Orders | M11 upload + orders | Blackout card |
| [Conjunction: Mars in a Minute](https://science.nasa.gov/resource/mars-in-a-minute-what-happens-when-the-sun-blocks-our-signal/) | A few weeks; controllers send simple to-do lists | Mission Control's last to-do list | M11 | Narrative |
| [Fission Surface Power](https://www.nasa.gov/exploration-systems-development-mission-directorate/fission-surface-power/) + [2025 FSP paper](https://ntrs.nasa.gov/api/citations/20250000841/downloads/Mason%20NETS%20paper%202025c.pdf) | 40 kW class, 10 years, ~30 households; 1 km cable; < 5 rem/yr at 1 km | 6 kW fictional unit, steady, far from the hab | M6 placement in Station View | "Scaled down from NASA concept" card |
| [Perseverance instruments](https://science.nasa.gov/mission/mars-2020-perseverance/science-instruments/) | MEDA measures temperature, wind, dust at Jezero; RIMFAX radar sees > 10 m below; MOXIE specs | Temperature curve shape (borrowed, labelled); a radar "scan" PEBBLE job could find ice in a stretch version of M3 | M1 cold night; M3 (stretch) | "Borrowed from Jezero" |

---

## 12. Risk register

| ID | Risk | Impact | Mitigation | Status |
|---|---|---|---|---|
| G-01 | **Pre-hackathon work** (existing test world and assets) may break the "no pre-made project" rule | Disqualification | Ask organisers in writing at H0; disclose; rebuild if told to (T-1) | **Urgent** |
| G-02 | Scope too big for 24 h (the landing + Station View are new) | Unfinished demo | MVP = 3 missions; cut list §9.5; short landing first | Open |
| G-03 | Kids misread DP as a medical dose | Science error | Never show sieverts; "a game unit for comparing"; science-mentor review | Open |
| G-04 | Shielding factors are assumptions | Validity | Flag 🎮; ask the mentor; show as estimates | Open |
| G-05 | DONKI live API: CORS or outages | Live mode fails | Archived default; live optional; test at H0 | Open |
| G-06 | A "real" story may suggest people live on Mars today | Validity | Title card "set in the future; today only robots explore Mars"; Sources page | Open |
| G-07 | First-person motion sickness (now the only body view) | Accessibility | FOV slider, centre dot, no head-bob, reduced motion, Station View as a calm alternative | Open |
| G-08 | A solo astronaut feels lonely or scary for young kids | Wellbeing | PEBBLE always near, warm writing, family messages, no danger imagery | Open |
| G-09 | Sleep used to skip consequences | Weak teaching | Night plan is a decision; PEBBLE wakes you for events; the wake-up report shows the result | Open |
| G-10 | Judges' laptops are slow | Bad first impression | Performance budgets; `?demo=1`; the video covers the demo | Open |
| G-11 | Video or slides include minors | Rule breach | Adult or synthetic voices only, no child footage; stylised avatar | Open |
| G-12 | AI-use disclosure missing | Rule breach | An AI-use note in the submission and on the Sources page (including that this plan was AI-assisted) | Open |
| G-13 | Hidden dominant strategy | Weak trade-off teaching | Balance-runner dominance test (§3.9) | Open |
| G-14 | Asset licensing / NASA logo use | Rights | NASA imagery with credits per media guidelines; **no NASA logo**; "Created for NASA Space Apps Challenge 2026" | Open |
| G-15 | Landing facts cited without checking | Validity | Verify the NASA EDL pages before the card uses 🛰 | Open |

---

## 13. Playtesting and acceptance criteria

### 13.1 Playtesting with children (ethics first)
- Only with **parent or guardian consent** and a parent present; **no photos, video or voice
  recordings** of minors; notes only, anonymised by age band (7–9, 10–12).
- If no children are available: **proxy tests** with team members reading at a 7-year-old level, plus
  scripted "confused player" walkthroughs.
- Each session: 10–15 min of play, then 4 questions:
  1. "Why did the power go down at night?" (L1)
  2. "What did you give up when you chose ___?" (L2)
  3. "Why couldn't Earth help with the alarm?" (L8)
  4. "Who flew the ship when it landed, and why?" (L9)

### 13.2 Measurable acceptance criteria (MVP)

| # | Criterion | Target |
|---|---|---|
| A1 | Every major decision is a PEBBLE card with ≥ 2 options, each with a visible benefit and cost | 100% |
| A2 | Players can explain ≥ 1 real trade-off in their own words after 10 min | ≥ 4 of 5 testers |
| A3 | Players can say why a solar storm and a dust storm are different after M10 | ≥ 3 of 5 |
| A4 | Every on-screen number has a source badge (🛰 / 🧮 / 🎮 / 📖) | 100% |
| A5 | DONKI data is labelled archived or live correctly | 100% |
| A6 | Offline run from a fresh browser profile completes M0 → M10 | Pass |
| A7 | Time to first interaction from page load | ≤ 20 s on venue-like Wi-Fi; ≤ 5 s cached |
| A8 | Frame rate (first person and Station View) | ≥ 50 fps median on an integrated GPU |
| A9 | No Return to Ship without a prior yellow warning | 100% (sim test) |
| A10 | Same seed + decision log ⇒ same end state | 100% (golden test) |
| A11 | Sleep never skips a pending decision | 100% (sim test) |
| A12 | Players find Station View and use it to switch a module without help | ≥ 4 of 5 |
| A13 | All links in the submission open logged-out | 100% |
| A14 | `npm run build` and `npm run lint` pass | Pass |

### 13.3 GDD acceptance gate (Brief §7) self-check

| Gate | This plan |
|---|---|
| (a) No cosmetic or free decisions | Every PEBBLE card has a cost; wonder moments are explicitly non-decisions |
| (b) Science consistent with Mars | Part 1 §9 fixed rules |
| (c) Five systems linked and manageable | One sim, 3 gauges + 5 chips, dependency graph §1.1 |
| (d) The views are not a gimmick | §4.1: first person = living in it, Station View = managing it, 2D = reading it |
| (e) Missions have objectives, interactions and consequences | Part 2 §4, the full template for every mission |
| (f) Data honesty | Source badges, provenance YAML, borrowed-data cards, the "set in the future" title card |
| (g) Stack and style not invented | Read from the repo and kept unchanged |
| (h) Buildable prototype | A 3-mission MVP, a 24-hour plan, a cut list |

---

## 14. Final demo flow and submission

### 14.1 30-second video storyboard (adult voice-over, English, subtitles)

| Time | Picture | Voice-over / text |
|---|---|---|
| 0–5 s | First person in the ship: heat-shield glow, then the thud of touchdown | "You just landed on Mars. Earth is ten minutes away at light speed." |
| 5–9 s | The hatch opens; PEBBLE rolls up with a smiley face | "Your only helper is PEBBLE." |
| 9–15 s | Station View rise over the base; flow lines; the night plan; the sleep time-lapse | "Power, air, water, food, radiation. Every choice costs something." |
| 15–21 s | "20 May 2024" → particle snow on the visor; PEBBLE's face turns into the decision card | "This solar storm really hit Mars. Now it's your call." |
| 21–26 s | Why Chain beads; the source card with the DONKI CME ID + Curiosity RAD 8,100 µGy | "Built on real NASA data: DONKI, Curiosity RAD, SWIM, MOXIE." |
| 26–30 s | Title over the base at sunset, PEBBLE beside you at the window | "Mars Life Line. Every watt. Every breath. Every choice." |

### 14.2 Seven-slide alternative
1. **Problem:** kids see space outcomes, not trade-offs. 2. **Solution:** land on Mars and
keep a base alive (landing screenshot). 3. **How it plays:** first person + Station View +
PEBBLE cards + sleep. 4. **Real data:** the May 2024 storm, DONKI + RAD. 5. **What kids
learn:** L1–L9 + Why Chain. 6. **Science honesty:** source badges + borrowed-data cards.
7. **Impact and next steps:** classrooms, Arabic, full campaign; links.

### 14.3 Live demo (People's Choice, about 3 min)
`?demo=landing` (40 s) → M1 night plan + sleep + wake-up report (60 s) → `?demo=1` M10 storm
call (60 s) → Why Chain + Sources (20 s).

### 14.4 Submission checklist (Cairo + Global)
☐ Demo (30 s video **or** 7 slides) public, no login · ☐ Project link + GitHub repo public ·
☐ Summary: problem, solution, impact, challenge fit · ☐ Resources list: every dataset with a URL
(§11) · ☐ AI-use disclosure · ☐ No under-18 images, names or voices · ☐ English (or Arabic with
English subtitles) · ☐ Submitted by the **team leader** before the confirmed deadline, **locally
and on the global site** · ☐ All links tested logged-out on another device.

---

## 15. Open inputs

T-1 pre-built work eligibility · T-2 real hours · T-3 Resources tab · T-4 team roles · T-5
interior and ship-cabin style · T-6 languages · T-7 PEBBLE and Mission Control voices · T-8
site · T-9 player body · T-10 rover seat · T-11 keep Mission Control's voice. Plus: the
**Vitest dependency**, **hosting choice**, **science-mentor review of the shielding factors
and the 0.84 kg O₂ planning value**, **verifying the landing facts**, and a **source for
"cleaning breeze"** before it is called a NASA fact.

*End of the Game Design Plan.*
