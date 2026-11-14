# MARS LIFE LINE — Game Design Plan, Part 2 of 3
## Core Loop · Sleep · Campaign · All Missions · Decisions · Event Deck · Endings · Replay

> Read Part 1 first (`01-vision-story-world.md`). Simulation numbers referenced here are
> defined in Part 3 §2–3 and are **tuning assumptions** unless a NASA source is named.
> Source icons: 🛰 NASA measurement or fact · 🧮 calculated from NASA data · 🎮 game value · 📖 story.
>
> **Revision 2:** solo astronaut + PEBBLE, no crew; first person + isometric Station View +
> 2D; PEBBLE presents every decision; sleep and wait replace speed buttons; M0 is now the landing.
> **Revision 3:** one balanced difficulty, no modes, no countdown timers.

---

## 1. The decision contract (applies to every major decision)

The Agent Brief's highest-priority rule. Every major decision is a **PEBBLE card**: PEBBLE
rolls up to you (or calls on your wrist radio if it's away), the world pauses, and its round
screen face grows into the card. It has these nine fields:

| # | Field | What it means on screen |
|---|---|---|
| 1 | **Situation & info** | What PEBBLE shows you: gauges, forecast, Earth message, what it sees |
| 2 | **Options (≥ 2 viable)** | Big cards with an icon, a one-line label and a cost preview |
| 3 | **Benefit / opportunity cost** | A "you get" line plus a "you give up" line on each card |
| 4 | **Systems touched** | Small icons: ⚡ power · 🫁 air · 💧 water · 🌱 food · ☢ radiation · 📡 Earth link · 🧑‍🚀 you · 🤖 PEBBLE |
| 5 | **Delayed consequence** | A "Later…" line with a clock icon, written plainly ("Tomorrow morning the heaters may dim") |
| 6 | **Feedback & cause** | What changes in the 3D world, plus the Why Chain bead it creates |
| 7 | **Recoverability** | Whether it can be fixed later and how, so nothing is a hidden trap |
| 8 | **Science learned** | One "Mars truth" sentence PEBBLE says after the choice |
| 9 | **Source / assumption** | Source card (🛰 / 🧮 / 🎮 / 📖) |

**PEBBLE card buttons:** the options · **"What happens later?"** (expands field 5) · **"Why?"**
(the science) · **"Give me a hint"** (a question, never the answer).

**Design rules for every decision (Brief §2, Foundation §6):**
- No option is free or always best. Each option is best in *some* state of the base.
- No decision whose answer is obvious from the button styling. All options share the same
  visual weight; none is red or green. PEBBLE's face stays neutral while you choose.
- Costs are previewed **honestly but roughly**: icons and arrows first, exact numbers on hover.
- Your safety is never traded for points. No score outweighs it.
- Decisions **always pause time**, with **no countdown timers**. Urgency for "Commander's
  Call" moments comes from the story instead (PEBBLE's worried face, the alarm sound, the
  particle snow); the challenge author's "decide fast" spirit is kept without a clock.

---

## 2. Core loop, sleep and progression

### 2.1 The sol loop

```text
 ┌──────────────── ONE SOL ────────────────┐
 │                                          │
 │ 1. WAKE UP (first person, bunk)          │
 │    PEBBLE's "While you slept" report:    │
 │    battery graph, events, Earth messages │
 │            │                             │
 │ 2. PLAN (Station View, M key)            │
 │    Look over the base from above,        │
 │    switch modules, set priorities,       │
 │    send PEBBLE on a job                  │
 │            │                             │
 │ 3. DO (first person)                     │
 │    Suit up, airlock, walk, drive,        │
 │    clean, drill, repair, plant           │
 │    ↳ EVENTS → PEBBLE CARD                │
 │            │                             │
 │ 4. DUSK                                  │
 │    The sun sets, solar drops to zero.    │
 │    Set the NIGHT PLAN in Station View    │
 │            │                             │
 │ 5. SLEEP (bunk) → night time-lapse       │
 │    Battery drains, frost, PEBBLE watches.│
 │    An alarm can wake you → PEBBLE card   │
 └──────────────────────────────────────────┘
```

### 2.2 Time and sleep (Part 3 §2.1 has the full rules)
- **Normal time:** **1 real second = 1 Mars minute**. Daylight lasts about 12 real minutes.
  Walking and driving use real game time, so distance matters.
- **Sleep (like Minecraft):** at your bunk after 17:00, or any time you are very tired, press
  **E** to sleep. The night plays as a short **time-lapse (≈ 10 s)** through the hab window and
  a battery line, then you wake at 06:00. **Sleeping saves the game.**
- **PEBBLE's night watch:** if something needs a decision at night (cold dip, alarm, solar
  event), PEBBLE **wakes you** and the night stops for the PEBBLE card. Sleep never skips a
  decision.
- **Staying up is allowed:** the night then runs at normal speed (≈ 12 real minutes, dark and
  cold). Your **energy** drops; the next day, tasks take longer.
- **Wait (daytime):** sit in the galley chair and pick 1, 2 or 4 hours (waiting for crops,
  charging, a reply from Earth). PEBBLE interrupts if anything happens.
- **Time skip between missions:** a "Mission Log" card, e.g. *"Sols 3–5: PEBBLE ran your
  Standing Orders."* (§2.3).
- Decision cards, the pause menu and any open info card in Station View **pause time**.

### 2.3 The mission loop
Each mission is **1–3 sols** with one clear objective, 1–2 major decisions and 0–2 events.
Between missions the base runs on your **Standing Orders** (your Station View priority list)
during a **time skip** of 1–7 sols. Then PEBBLE's **"While You Were Away"** report shows what
happened and why. This is where delayed consequences land.

### 2.4 The progression loop

| What grows | How |
|---|---|
| **The base** | New machines arrive or unlock: greenhouse trays, ice drill, Oxygen Maker full-time, fission unit, storm-shelter water wall. Each appears in Station View as a new module |
| **Demand** | Every unlock also **adds load**. Expansion never removes the need to balance |
| **Your knowledge** | New Station View info tags, new Data Pad pages, new "Mars truths" in the Field Guide |
| **PEBBLE** | New tools: panel air nozzle (Act I), sample-core grip pads (Act II), dust-proof track skirts (after M9). PEBBLE's lines get more confident as you keep promises (narrative only, not a score) |
| **Mission badges** | Optional goals per mission (e.g. "No battery below 10%"), for replay value |

There is **no currency or shop**. The reward for good planning is margin, which buys
freedom to say yes to science and comfort.

### 2.5 Win, lose and recovery (global rules)

| State | Trigger | What happens |
|---|---|---|
| **Mission complete** | Objective done and you're safe | Mission Report + Why Chain highlights |
| **Mission complete, with strain** | Objective done, but a gauge hit red or your dose badge hit red | Same, plus PEBBLE's "What would help next time" tip |
| **Return to Ship** (the only "fail") | AIR or WATER under 0.25 sols, POWER at zero with life support at risk, or your dose at the hard limit with no shelter possible | PEBBLE: *"Commander, the base can't keep you safe right now. Let's go to the ship."* You walk to the landing ship's safe cabin (its own air). The base goes into safe mode. The **Why Chain** plays. The game menu then offers: **Try again from last sleep**, **Try again from decision X**, or **Continue with help** (an Earth cargo drop, which costs the Self-Reliance medal) |
| **Warnings** | Each gauge has a yellow line (3 sols left) and a red line (1 sol left) | PEBBLE's chime + its face icon + gauge pulse + text. Never colour alone |

Fairness: **no Return to Ship can happen without at least one warning and one decision
point first** (Part 3 §3.8).

---

## 3. Campaign map

| # | Mission | Act | Sol(s) | Main view | Core lesson | Major decision | MVP? |
|---|---|---|---|---|---|---|---|
| M0 | **Touchdown** | Prologue | 1 | 1P ship → 1P outside → 1P hab → first sleep | Landing is automatic; airlock, gravity, 3 gauges, waking the base | What wakes up first | **MVP** |
| M1 | **Night Shift** | I | 2 | Station View + 1P + sleep | Solar = 0 at night; storage | The night plan | **MVP** |
| M2 | **Seeds** | I | 3 | 1P | Food takes time and inputs; no raw soil | Which crops in 2 trays | Should |
| M3 | **Ice Run** | I | 5–6 | 1P rover + 1P drill | Water from ice; perchlorates; recycling | Near dirty ice vs far clean ice | Should |
| M4 | **Air You Can't See** | I | 8 | 1P + Station View | Air must be made or recycled with power and inputs | O₂ from water vs from CO₂ | Should |
| M5 | **Dust Devil** | I | 11 | 1P + Station View (PEBBLE job) | Dust cuts solar; wind can't wreck the base | Clean it yourself vs PEBBLE vs wait | Should |
| M6 | **Power Delivery** | II | 14–15 | Station View placement + 1P | Fission is steady but must be far away | Placement and timing | Stretch |
| M7 | **Earth Is Listening… Slowly** | II | 18 | 2D comms + 1P | Light-speed delay; local autonomy | Ask Earth vs test locally | Should |
| M8 | **Science or Safety** | II | 23 | 1P EVA | Dose = time outside × shielding × space weather | Long EVA vs short vs postpone | Stretch |
| M9 | **Storm Season** | III | 31–34 | Station View + 1P | Dust storm = power and visibility hazard | Stockpile vs keep science going | Should |
| M10 | **The Day the Sun Roared** ⭐ | III | 37 | 1P outside → 1P shelter | Real 20 May 2024 solar storm; shelter; local call | Run to shelter vs cliff overhang vs finish task | **MVP** |
| M11 | **Silence** | III | 41–54 | 2D + Station View | Conjunction blackout; autonomy; to-do lists | Last upload; Standing Orders | Stretch |
| M12 | **Harvest & Signal** | Finale | 60 | 1P | All consequences pay off | Celebrate vs bank vs save seeds | Stretch |

Full campaign: about **90–120 min**. **MVP vertical slice (hackathon): M0 → M1 → M10, about
15 min**, with a short Mission Log card bridging Sol 2 to Sol 37 (Part 3 §9).

---

## 4. Missions in full

Each mission lists: Objective · Setup · View · Interactions · PEBBLE card(s) · Hazards ·
Win / lose / recovery · Teaching point · Duration · Evidence.

---

### M0 — TOUCHDOWN (Prologue, Sol 1) · MVP

**Objective:** Land on Mars, walk to the base, wake it up, and get through your first night.

**Part A: the landing (first person, ≈ 60–90 s, skippable on replay).**
1. **In orbit.** You sit in the landing ship's seat. Through the window: the orange planet.
   The ship's screen zooms the Mars map to Deuteronilus Mensae (pins: our base, Curiosity at
   Gale, Perseverance at Jezero).
2. **Earth is too far.** A message arrives: *"Mission Control: Good luck, Commander. By the
   time you hear this, you'll already be down."* The screen shows **"Signal delay: 10 min"**
   and **"Landing time: ~7 min"**. Pop-up: *"Earth can't steer your landing. The ship has to
   land itself."* (L9; 📖 values, landing facts **to verify** on NASA EDL pages before the card
   cites them as 🛰)
3. **Entry.** Heat-shield glow on the window, shaking (gentle; reduced-motion option), the
   speed readout drops fast.
4. **Retro-rockets.** You press and hold the big **ARM** button when the ship asks (the only
   input: kids feel involved, but the ship flies itself). Dust blasts up around the window.
5. **Touchdown.** Silence, then a soft thud. *"Touchdown. Message to Earth sent. They'll know
   in 10 minutes."* The Signal Tracker shows your "We landed" dot crossing to Earth (first
   taste of the delay).

**Part B: the first walk.**
6. Suit check on the ship's wall screen: **AIR** in your suit tank, *"Your suit's air came
   from the ship. At the base, it will come from the base."*
7. The ship's small airlock cycles: pressure 100% → under 1%: *"That's how thin Mars air is."*
8. You step out in first person. Try a **jump**: 0.38 g makes it floaty. *"You weigh about a
   third of your Earth weight here."*
9. 150 m away, the base lights up. **PEBBLE** rolls out to meet you, beeping, its face
   drawing a big smile: *"Hello, Commander! I've been waiting 214 sols. I kept everything
   clean. Mostly."*
10. Follow PEBBLE to the base airlock (hatch wheel, cycle lever, pressure gauge). Trying to
    open the outer hatch early: *"Locked. The air would rush out."*

**Part C: waking the base.**
11. Inside, PEBBLE opens the **Station View** for the first time (M key): the camera rises
    out of your head into the dollhouse view of the base. Modules are grey (standby). The
    **three gauges** appear: POWER, AIR, WATER.
12. Life Support wakes automatically, locked on (*"This one always runs first. It's your air."*).

**PEBBLE card: what wakes up next?**

| Field | Content |
|---|---|
| Situation | PEBBLE: "The battery's at 60% after months of standby. Life Support is on. What do we wake up next? Sunset is in 3 hours." |
| Options | **A. Call Earth** (dish on, send a video) · **B. Warm the hab** (heaters to full) · **C. Start the greenhouse** (seed trays warm up) |
| Benefit / cost | A: Earth hears you're safe (your **spirit +1**); costs dish power and 20 min of your time; Earth's reply comes much later · B: a warm first night (**energy** stays full tomorrow); costs the most battery · C: food grows sooner (harvest ETA −2 sols); the hab stays cool tonight |
| Systems | ⚡ 📡 🧑‍🚀 🌱 |
| Delayed | A: Earth's reply arrives tomorrow morning in PEBBLE's report · B: tomorrow starts with less battery · C: the greenhouse load stays on the night plan |
| Feedback | The chosen module lights up in Station View; the power flow line shows it drawing |
| Recovery | You can wake the others later today. Tiny stakes |
| Science | "A base can't run everything at once. You choose what comes first." |
| Source | 🎮 game values |

**Part D: the first sleep.** At dusk PEBBLE says: *"The Sun's going down, so the panels will
stop. Time to sleep. I'll watch the base."* Walk to the bunk, press E. The night time-lapse
plays: stars, frost on the window, the battery line going down slowly. Wake-up: PEBBLE's
first **"While you slept"** report.

**Win:** the base is awake and you slept through the night. **Lose:** impossible (prologue).
**Teaching point:** landing is automatic (L9); no breathing outside; the airlock; Mars
gravity; the 3 gauges; the sleep loop.
**Duration:** 6–8 min. **Evidence:** 🛰 atmosphere < 1% of Earth's (SWIM page), 0.38 g
(Humans to Mars), 4–24 min delay (Comms 7 Things); 📖 the landing ship and the base's history.

---

### M1 — NIGHT SHIFT (Act I, Sol 2) · MVP

**Objective:** Get yourself and the base through the night with a battery that can't do
everything.

**Setup:** Late afternoon. Battery 70%. PEBBLE has just planted seedlings in Tray 1 (they
need light). The Science Lab has your first rock samples waiting. The sunset is shown in 3D
through the window as long shadows, and in Station View the solar flow line shrinks to zero.

**View:** first person at the window → **Station View** (the **Night Plan** panel opens on the
side) → bunk → sleep time-lapse → wake-up report.

**Interactions:**
- In Station View, click modules to switch them on or off for the night, and drag the
  **priority list** (top = last to be switched off). Locked at the top: **Life Support Core**
  (air, CO₂ scrubber, pressure, water recovery). It can't be switched off, with the reason
  shown.
- Night options: **Heaters (full / low)**, **Greenhouse lights**, **Science Lab**, **PEBBLE
  charging**.
- The **night forecast line** shows the battery through the night. Where it would hit zero,
  a ■ marker shows which module would switch off first.

**PEBBLE card: what runs tonight?**

| Field | Content |
|---|---|
| Situation | Battery 70% (about 56 of 80 kWh). Night is ~12 Mars hours. Essentials need ~3.6 kW (~44 kWh). PEBBLE: "Tray 1 wants light. The lab wants 6 hours. The battery can't give everything." |
| Options | **A. Greenhouse lights on all night** · **B. Science Lab runs 6 h** · **C. Heaters on low, then lights and lab half each** · **D. Essentials only** (save the battery for tomorrow) |
| Benefit / cost | A: crops grow ~30% faster this sol; battery empties just before dawn, so heaters dim at 5:00 · B: +1 science sample processed; the battery nearly empties and the cold dip makes heaters dim · C: plants and lab half done; the hab is cooler, so you sleep badly (energy −1) · D: battery ~15% at dawn and you're rested; no growth, no science tonight |
| Systems | ⚡ 🌱 🧑‍🚀 (and science) |
| Delayed | A/B: a brownout before dawn, heaters drop, **your energy −1** tomorrow (outdoor tasks take longer). D: tomorrow starts with more energy budget for the drill |
| Feedback | The sleep time-lapse shows frost creeping across the window and the battery line; PEBBLE wakes you if the heaters cut out. Why Chain bead: "Greenhouse lights → battery empty at 5:00 → heaters off → you slept cold." |
| Recovery | Fully recoverable next sol. No Return to Ship is possible: the locked Life Support Core always runs first |
| Science | "Solar panels make zero power at night. A base lives on what it stored during the day." |
| Source | 🛰 solar zero at night, cold nights (Mars Facts); 🎮 battery size, kW values |

**Night event (scripted):** at 02:00, the outside temperature reaches its lowest (shown
−80 °C 🎮, curve shape borrowed from MEDA at Jezero 🛰, labelled). If the plan is tight, PEBBLE
**wakes you**: *"It's getting really cold, Commander. The heaters want more power."* A small
card: **turn off one more module** or **go back to sleep and accept the risk**. Teaching:
*"Cold nights cost extra power."*

**Win:** reach dawn with Life Support never interrupted (guaranteed) and your energy not red.
**Strain:** a brownout happened. **Badge:** "Dawn with ≥ 20% battery".
**Teaching point:** storage, priorities, night (L1).
**Duration:** 5–6 min. **Evidence:** see the PEBBLE card.

---

### M2 — SEEDS (Act I, Sol 3)

**Objective:** Plant two greenhouse trays so you have fresh food before the pantry runs low.

**Setup:** The pantry holds **50 sols** of packaged food for one person (🎮). The campaign is
60 sols, so food must be grown. PEBBLE brings a scoop of raw regolith under a lamp and
explains perchlorates.

**View:** first person inside the dome (magenta LED light, as in Veggie 🛰).

**Interactions:**
- Inspect the **regolith sample** (data card: perchlorates are toxic and corrosive 🛰).
  Trying to plant in raw regolith: PEBBLE blocks the tray, *"Not without cleaning it first!"*
- Pick seed packets and press them into **clean growth-medium pillows** (Veggie-style 🛰).
- Set the **photoperiod** dial (12 / 16 / 20 light-hours) per tray. More hours means faster
  growth and more power. PEBBLE names each plant (you can rename them).

**PEBBLE card: what to grow (choose 2 of 3 trays)**

| Field | Content |
|---|---|
| Situation | Two trays available (the third unlocks with fission power in M6). Pantry: 50 sols |
| Options | **Mizuna mustard** (fast greens) · **Dwarf wheat** (calories, slow, thirsty) · **Chile peppers** (vitamin C, slowest, "celebration" crop) |
| Benefit / cost | Mizuna: harvest ≈ Sol 28, small calories, boosts your **health** (fresh food) · Wheat: harvest ≈ Sol 53, **+6 sols of food**, uses the most water and light · Peppers: harvest ≈ Sol 58, modest calories, big **spirit** and health boost; needs warmth (heater load) |
| Systems | 🌱 💧 ⚡ 🧑‍🚀 |
| Delayed | Choices echo for **50+ sols**: the harvest size at the finale (M12) and whether the pantry runs short (half rations → energy −1) |
| Feedback | Plants grow visibly each sol (5 growth stages per crop). A "harvest ETA" tag over each tray in Station View shifts when light, water or heat change |
| Recovery | One tray can be replanted later (resets its timer). No Return to Ship from food alone; the worst case is half rations |
| Science | "Food on Mars needs light, water, warmth, nutrients, clean growing medium… and time." |
| Source | 🛰 Veggie grew mizuna; APH grew dwarf wheat; PH-04 grew chile peppers on ISS; Veggie's magenta LEDs; 🎮 **growth times compressed** for play (stated on the card) |

**Win:** two trays planted, watered and lit. **Teaching point:** L5.
**Duration:** 4–5 min. **Evidence:** Veggie and Growing Plants in Space pages; Detoxifying Mars.

---

### M3 — ICE RUN (Act I, Sols 5–6)

**Objective:** Bring back ice and turn it into clean water before WATER drops to 3 sols.

**Setup:** WATER at 5 sols. The base recycles about 90% of used water (🛰 ISS figure), but
some is always lost, and the greenhouse and oxygen-making use more. You take the rover to the
glacier apron; PEBBLE rides in the cargo bed.

**View:** first person from the rover seat (T-10) → first person at the drill rig (drill
handle, depth gauge) → back home, the **Water Processor** info panel in Station View.

**Interactions:** Drive (speed vs battery shown live on the dashboard); position the drill
rig; hold to drill (depth meter: debris layer, then ice); PEBBLE loads the ice crates; drive
back; feed the melter; watch the perchlorate filter bar.

**PEBBLE card: where to drill**

| Field | Content |
|---|---|
| Situation | PEBBLE shows an orbital map with two spots and a rover battery round-trip estimate for each |
| Options | **A. Near edge:** 400 m, thin debris cover, **dirtier ice** · **B. Deep apron:** 1.1 km, thicker cover to dig through, **cleaner ice** |
| Benefit / cost | A: quick, low rover energy, short EVA (low dose); **more perchlorate cleaning** means +40% processor power and faster filter wear · B: cleaner water, less processor power; long drive, **+1 Dose Point**, more suit air |
| Systems | 💧 ⚡ ☢ 🫁 🧑‍🚀 |
| Delayed | A: the filter-clog event (§6) becomes more likely in Act II · B: the higher EVA dose adds up toward the M8 and M10 limits |
| Feedback | Ice-crate colour (dirtier = rust-streaked); the processor's filter bar; your dose badge ticks |
| Recovery | Either path refills WATER; repeat runs are possible later |
| Science | "Mars has lots of water, frozen underground, and it must be cleaned before anyone drinks it." |
| Source | 🛰 SWIM ice regions; 🛰 perchlorates in Martian water (NASA NIAC); 🛰 ISS ~90% recycling; 🎮 distances, cleaning costs |

**Win:** WATER ≥ 10 sols. **Lose:** unlikely; WATER can't hit zero within the mission window.
**Teaching point:** L4. **Duration:** 8–10 min (a sleep between Sols 5 and 6).

---

### M4 — AIR YOU CAN'T SEE (Act I, Sol 8)

**Objective:** Choose how the base makes oxygen this week, and swap a full CO₂ scrubber cartridge.

**Setup:** AIR at 7 sols. You breathe about 0.84 kg of O₂ per sol (🎮 nominal planning value;
science reviewer to confirm against NASA BVAD). Two machines can make oxygen:
- **Electrolyser** (like the ISS Oxygen Generation System 🛰): splits **water** into O₂ and
  H₂. Moderate power. **Uses water**.
- **Oxygen Maker** (a fictional, larger descendant of **MOXIE** 🛰): splits Mars **CO₂**.
  **High power**, no water.

**View:** first person at the Life Support rack (cartridge swap mini-task: unlatch, pull,
insert, latch) → Station View (both machines highlighted, with their info tags).

**Data card (before the choice):** *"On Mars, MOXIE made 122 grams of oxygen in total, at up
to 12 g per hour, at 98% purity. A base needs a machine many times bigger."* 🛰

**PEBBLE card: this week's oxygen source**

| Field | Content |
|---|---|
| Situation | WATER 11 sols, AIR 7 sols; solar is fine; Earth forecasts dust season ahead |
| Options | **A. Electrolyser first** · **B. Oxygen Maker first** · **C. Half and half** |
| Benefit / cost | A: cheaper on power; **WATER drains ~1 L more per sol** (about 15% faster), so the next ice run comes 2 sols sooner · B: water stays for crops and drinking; **~26 kWh per sol**, a fifth of your sunny-day solar, so greenhouse light hours may drop · C: balanced, but both gauges drift down a little |
| Systems | 🫁 💧 ⚡ 🌱 |
| Delayed | A: WATER hits yellow around Sol 15 · B: in the M9 dust storm the Oxygen Maker is the first big load you'll have to cut |
| Feedback | Air-flow animation in the vents; the water tank level in 1P; the power flow lines in Station View |
| Recovery | Switchable every morning in Station View |
| Science | "Air on Mars is *made*, from water or from the Mars atmosphere, and it always costs energy." |
| Source | 🛰 ECLSS (electrolysis, CO₂ sieves, ~90% water recovery); 🛰 MOXIE figures; 🧮 electrolysis mass balance (1 kg water gives 0.89 kg O₂); 🎮 machine sizes |

**Mini-event:** skipping the cartridge swap turns the CO₂ chip yellow: PEBBLE, *"The air
feels stuffy. Scrubbers remove the CO₂ you breathe out."* Fix within 2 Mars hours or your
energy drops.

**Win:** cartridge swapped and an O₂ plan set. **Teaching point:** L3, L2.
**Duration:** 5–6 min.

---

### M5 — DUST DEVIL (Act I finale, Sol 11)

**Objective:** Restore solar output after a dust devil coats the array.

**Setup:** Through the hab window, a towering dust devil crosses the yard (a spinning column
plus its shadow, inspired by HiRISE images 🛰). Panels go from 5% to 30% dusty; solar flow
drops by a quarter. PEBBLE hides behind a crate (comic beat). **Nothing breaks**: PEBBLE,
*"Mars wind is thin. It moves dust, not buildings."* 🛰

**View:** first person (window, then outside) or **Station View** (click a panel row, then
"Send PEBBLE": PEBBLE drives there and puffs the dust off with its air nozzle while you watch from above).

**PEBBLE card: how to clean the array**

| Field | Content |
|---|---|
| Situation | Dust 30%. Solar output −25%. The battery won't reach full by dusk at this rate |
| Options | **A. Clean it yourself** (EVA with a brush) · **B. Send PEBBLE** (a Station View job) · **C. Wait for a cleaning breeze** |
| Benefit / cost | A: back to ~3% dust in 1 Mars hour; costs **suit air**, **+0.3 DP**, and your day's time (no lab work today) · B: no risk to you, and you can do other jobs meanwhile; cleans only to ~15% and takes 3 hours; PEBBLE's charge comes from the base, and it **isn't home** to warn you about anything inside · C: no cost now; **35% chance per sol** that wind clears ~10% of the dust (🎮), otherwise power stays low |
| Systems | ⚡ 🫁 ☢ 🧑‍🚀 🤖 |
| Delayed | C: a run of low-power sols can cut greenhouse light hours, pushing the harvest ETA later |
| Feedback | Panel colour (blue to rust); the live flow line in Station View; the harvest ETA tag shifts |
| Recovery | All options recoverable. Cleaning can be redone any sol |
| Science | "Dust sticks to panels like packing peanuts. Less sunlight in means less power out." |
| Source | 🛰 NASA dust article (electrostatic dust, dust devils, solar problem, Spirit/Opportunity survival mode); 🛰 local robot control isn't delayed (the Earth–Mars delay applies only to Earth); 🎮 percentages; cleaning breezes 🎮 (**needs a source before the in-game card cites it**) |

**PEBBLE teaching beat:** while you give PEBBLE orders in Station View, a corner tooltip:
*"PEBBLE obeys instantly because it's right here. Engineers on Earth can't drive rovers like
this; their commands take minutes to arrive."* (L8 seed)

**Act I wrap-up:** an Act Card plus a Field Guide page: *How the base fits together* (Part 1
§4 web diagram, animated in Station View with your own Act I numbers).
**Duration:** 5–6 min.

---

### M6 — POWER DELIVERY (Act II, Sols 14–15)

**Objective:** Deploy the newly landed **fission power unit** and connect it to the base.

**Setup:** A cargo lander arrives (watch it descend from the window or Station View). Inside:
a compact fission unit (🎮 6 kW, fictional, explicitly *"scaled down from NASA's
40-kilowatt-class Fission Surface Power concept"* 🛰). PEBBLE: *"It runs day and night and
doesn't care about dust. But it has to live far away from you."*

**View:** **Station View** zoomed out to the site map for placement (the 1 km ring is drawn
on the ground) → first person: tow the unit with the rover, lay the cable from a spool,
PEBBLE follows with the cable end.

**PEBBLE card: where and when to deploy**

| Field | Content |
|---|---|
| Situation | The Station View map with the **1 km ring** marked. NASA's concept design was required to give **less than 5 rem per year at 1 km** 🛰 |
| Options | **A. Standard site, 1 km out on the plain** · **B. Behind the mesa spur** (the rock blocks the line to the base; 1.3 km cable) · **C. Delay deployment one week** (finish the ice-crater science first) |
| Benefit / cost | A: online by Sol 15; two EVA sols (+DP, suit air), no ice run this week · B: online by Sol 16; extra cable work, but the shortcut to the ice apron stays clear of the keep-out zone, so ice runs stay short all game · C: the science sample comes early (a mission goal); one more week of solar-only power with dust season approaching |
| Systems | ⚡ ☢ 🧑‍🚀 💧 (science) |
| Delayed | A: future ice runs detour around the keep-out ring (+20% rover energy) · B: more work now, cheaper runs later · C: if dust arrives early (event deck), you face it without fission |
| Feedback | Station View gains a steady orange **FISSION** flow line that never dips at night or in dust; the keep-out ring glows faintly on the ground |
| Recovery | Fission comes online in all branches; only timing and side costs differ |
| Science | "Some power sources don't need the Sun, but they bring their own safety rules, like distance." |
| Source | 🛰 FSP page and 2025 design paper (40 kW, 10 yr, 1 km cable, <5 rem/yr at 1 km); 🛰 Humans to Mars ("dust storms can last months, making fission more reliable"); 🎮 6 kW size, cable lengths |

**Unlocks:** Greenhouse Tray 3 (plant now: choose any crop; its harvest may land before the
finale), the Oxygen Maker full-time option, more Science Lab hours. **Every unlock adds a
module and load to Station View** (the progression rule).
**Duration:** 8–10 min.

---

### M7 — EARTH IS LISTENING… SLOWLY (Act II, Sol 18)

**Objective:** Find out why your wheat leaves are yellowing, while handling a separate
urgent alarm.

**Setup:** Earth one-way delay today: **12 minutes** (🎮 scripted value within NASA's 4–24 min
range 🛰). Earth plant scientists could help (NASA's OSDR holds plant spaceflight data 🛰).
PEBBLE is worried: it named this wheat "Goldie".

**View:** 2D **Comms Desk** with the **Signal Tracker** (Sun, Earth and Mars on a 2D orbit
map; a glowing dot crosses at light speed; a timeline shows "arrives Earth" and "reply could
arrive") → 1P greenhouse → 1P Life Support rack.

**PEBBLE card: how to diagnose the wheat**

| Field | Content |
|---|---|
| Situation | Yellow leaves; the cause could be light, nutrients or too much water. Earth link open, 12 min one way |
| Options | **A. Ask Earth's plant team** (send photos) · **B. Run a local test kit** (you + lab time) · **C. Both** |
| Benefit / cost | A: expert answer, but no reply for **at least 24 min plus Earth's thinking time** (~40–60 game-min); the dish uses power during upload; the plants keep stressing meanwhile · B: an answer in ~20 game-min; uses lab power, a test kit (only 3 for the campaign) and your time; may be less certain (50% chance it says "light *or* nutrients") · C: best answer, highest cost (power, kit, time) |
| Systems | 📡 ⚡ 🌱 🧑‍🚀 |
| Delayed | A: the wheat harvest shrinks a little if the fix comes late · B: fewer test kits for the M11 blackout, when Earth can't help at all |
| Feedback | Signal Tracker animation; leaf colour; Earth's reply arrives with a timestamp |
| Recovery | Any path fixes the wheat eventually |
| Science | "Radio waves travel at the speed of light, and it still takes minutes to cross to Earth." |
| Source | 🛰 NASA comms (4–24 min one way; relays via orbiters); 🛰 OSDR exists as plant data; 🎮 Earth response time, kit odds |

**Twist event (scripted, during the wait):** the **CO₂ scrubber valve sticks**. CO₂ climbs:
yellow in 10 game-min, red in 25. PEBBLE offers "Ask Earth", and the Signal Tracker plainly
shows the reply would arrive **after** red. You fix it yourself (1P valve mini-task). Then
Earth's late advice arrives: *"Mission Control: Try the valve reset… Sent 31 min ago."*
PEBBLE: *"They were right. And 20 minutes too late. That's why we decide here."*

**Teaching point:** L8. **Duration:** 6–8 min (a Wait in the galley chair is useful here).

---

### M8 — SCIENCE OR SAFETY (Act II, Sol 23)

**Objective:** Collect ice-core samples from a fresh ice-exposing crater (your science goal).

**Setup:** The crater is 2 km out (orbital image pin; NASA SWIM maps ice-exposing impact
craters 🛰). The Space Weather Desk shows **recent flare activity** from a curated DONKI
week (🛰 real flare records with IDs, labelled "archived"). PEBBLE explains Dose Points:
*"1 DP is about one sol of normal background radiation, as measured by Curiosity at Gale
Crater."* 🧮

**View:** first person EVA (rover drive + walk) → 1P sample coring, PEBBLE holding the core tubes.

**PEBBLE card: how long to stay out**

| Field | Content |
|---|---|
| Situation | Flares recently seen on the Sun (DONKI). **A flare alert is not a dose**: particles may or may not reach Mars. Base sensor: normal. Your badge: X DP |
| Options | **A. Full EVA** (3 samples, 4 Mars hours) · **B. Short EVA** (1 sample, 1.5 h) · **C. Postpone** (wait for a calmer Sun) |
| Benefit / cost | A: science goal met in one trip; **+4 DP**; the longest time away from shelter if particles arrive · B: low dose (+1.5 DP); needs another trip later · C: zero dose now; **risk**: Storm Season (M9) may close the window, and the science goal could be missed |
| Systems | ☢ 🫁 🧑‍🚀 (science) |
| Delayed | Doses **add up** across the campaign; over 90 DP, PEBBLE does your outdoor jobs instead (slower, and some jobs need you) |
| Feedback | Your dose badge fills like a thermometer; samples glow on the Data Pad |
| Recovery | Postponed science can be done in M9's pre-storm window or M11 |
| Science | "Radiation adds up with time outside. Suits keep air in, but they're not radiation shelters." |
| Source | 🛰 RAD ~210 µGy/day background at Gale; 🛰 DONKI FLR records; 🧮 DP unit; 🎮 EVA durations |

**Optional good-news event:** **Forbush decrease**. If a CME passed recently, background
dose drops for ~1 sol (🛰 RAD saw dips caused by CMEs). PEBBLE: *"Funny thing: a passing solar
storm cloud can briefly shield us from cosmic rays."* A window for a cheaper EVA.
**Duration:** 8–10 min.

---

### M9 — STORM SEASON (Act III, Sols 31–34)

**Objective:** Get the base through a regional dust storm without losing air, water or crops.

**Setup:** Earth and an orbiter forecast a regional storm 2 sols out (warning first, as the
fairness rule requires). Sky opacity climbs over 3 sols; the sky goes from peach to deep
ochre; visibility drops; in Station View the solar flow lines shrink to a sliver.

**View:** wake-up report with an **opacity forecast strip** → Station View prep → first person
yard prep (tie down, cover) → a short Station View plan each storm sol.

**PEBBLE card (pre-storm, Sol 31): how to prepare**

| Field | Content |
|---|---|
| Situation | Two sols of normal sunlight left. The storm lasts ~4 sols at "heavy" (🎮), solar down to ~15% |
| Options | **A. Stockpile:** fill the battery, run the electrolyser hard (AIR up), top up WATER, pause science · **B. Science sprint:** use the last clear sols to finish samples and lab work · **C. Grow-light boost:** extra light hours now so the crops are ahead before you cut light in the storm |
| Benefit / cost | A: big margins in the storm; the science goal may slip; WATER spent on air · B: science goal met; you enter the storm with thin margins · C: harvest ETA protected; less battery and air margin |
| Systems | ⚡ 🫁 💧 🌱 (science) |
| Delayed | Felt over the next 4 storm sols and in the M12 harvest size |
| Feedback | 3D: darkening sky, dust layering on the array; storm nights are long, and PEBBLE wakes you more often |
| Recovery | Strong. Fission (if deployed) holds a floor of power. Without fission, storm sols need hard load-shedding, but Life Support always runs |
| Science | "Dust storms steal sunlight for days or weeks. They don't blow bases away, and they don't bring radiation." |
| Source | 🛰 NASA dust-storm article; 🛰 Humans to Mars (storms can last months); 🛰 Spirit/Opportunity went into survival mode in 2007; 🎮 opacity curve and durations |

**Each storm sol:** a short Station View moment: which module to shed (Oxygen Maker, grow
lights, lab, heaters low). **Delayed effects show in the next wake-up report:** crops slower,
AIR drifting, a colder night. **Event:** grit in the rover gears and PEBBLE's tracks (🛰 "it
gets into gears"): a repair task, or no driving for 2 sols.

**Win:** reach Sol 35 (storm clearing) with no Return to Ship. **Teaching point:** L6, L2.
**Duration:** 8–10 min.

---

### M10 — THE DAY THE SUN ROARED ⭐ (Act III, Sol 37) · MVP hero mission

> **Real event.** On **20 May 2024**, a huge solar eruption hit Mars. NASA reported that an
> astronaut standing next to Curiosity would have received **8,100 micrograys**, *"equivalent
> to 30 chest X-rays… the biggest surge measured by Curiosity's RAD since the rover landed 12
> years ago."* The flare was later estimated as **X12**. **Earth was on the other side of the
> Sun**, while Mars was in the line of fire. Particles reached Mars **"in just tens of
> minutes."** NASA's Moon to Mars Space Weather Analysis Office **flagged the possibility of
> incoming particles**. In DONKI, the eruption is logged as
> **CME `2024-05-20T05:36:00-CME-001`**: a *fast halo CME* with a **backsided source**, with a
> measured shock speed of **2,678 km/s** (bulk 1,927 km/s), type **R** on the SCORE scale.
> (All 🛰, verified on the NASA article and the live DONKI API, 12 Nov 2026.)

**Objective:** Keep your dose as low as possible when a real-scale solar particle event
strikes during an outdoor repair.

**Setup:** A banner: *"This mission uses real space weather from 20 May 2024."* You are 150 m
from the hab repairing a power cable (from M6; in the MVP slice, the solar array's cable).
PEBBLE is with you holding the cable. The Space Weather Desk (on your wrist) shows a fast
halo CME from the Sun's far side.

**View:** first person outside → sudden **sensor "snow"** across your visor display and on
PEBBLE's face (🛰 real Curiosity navigation cameras showed white streaks from particle hits)
→ PEBBLE card → run (first person) → first person inside the Storm Shelter (dose readout
ticks slow down).

**Sequence:**
1. **00:00:** a soft flash on the horizon and a visor alert: *"X-rays detected"* (they arrive
   at light speed). PEBBLE's face flickers: *"Solar event! Particles may follow within tens of
   minutes."*
2. **PEBBLE card: Commander's Call** (pauses; no timer. PEBBLE's worried face and the alarm
   carry the urgency).

| Field | Content |
|---|---|
| Situation | Particles likely within tens of minutes. You are 150 m from the hab, 40 m from the mesa cliff overhang. Cable 70% repaired. Earth's latest message is **40 minutes old** and can't help |
| Options | **A. Abort, run to the hab** (seal into the Storm Shelter) · **B. Shelter under the cliff overhang** (closer) · **C. Finish the repair first** (about 20 more Mars minutes) |
| Benefit / cost | A: the best protection once inside (lowest expected dose); the longest run (floaty 0.38 g bounds), risky only if the particles come very early; the cable stays broken, so **tonight's power is reduced** · B: the shortest run; the rock blocks much of the sky, partial shielding (a medium, predictable dose); you're stuck outside until the peak passes (suit air drain), **then you can finish the repair** · C: cable fixed, **power safe tonight**; the highest dose (your badge jumps), and your outdoor work is limited for the rest of the campaign |
| Systems | ☢ ⚡ 🫁 🧑‍🚀 🤖 |
| Delayed | A: a power-tight night (a mini Night Shift) · B: suit air gets low, so a careful timed walk home after the peak · C: over the dose line, PEBBLE does most outdoor jobs for M11–M12 (slower) |
| Feedback | Your dose badge fills in real time; the cliff overhang casts a "shield shadow" on the visor dose map; that night, an aurora glows (🛰 MAVEN saw planet-wide aurora during this event) |
| Recovery | No path causes a Return to Ship on its own; all are survivable. The lesson is **how much** dose and **what else** it costs |
| Science | "Solar storms and dust storms are different. Shelter and time matter, and only you, here on Mars, can decide fast enough." |
| Source | 🛰 NASA "Mars Light Up" article (8,100 µGy, 30 chest X-rays, X12, Earth on far side, tens of minutes, cliffsides/lava tubes give shielding, camera snow, MAVEN aurora); 🛰 DONKI CME record; 🧮 dose-points conversion; 🎮 shielding factors (labelled, science review requested) |

3. **Inside the Storm Shelter (1P):** the small room ringed with water tanks and pantry stores.
   PEBBLE rolls in after you. Optional: open the **water-wall valve** (moves stored water into
   the wall tanks: better shielding, but that water is locked from use for a while: 💧 vs ☢).
4. **PEBBLE reboots** (it got a radiation glitch): its face shows static, then a sleepy smile,
   *"I saw snow! Is that normal?"*
5. **Debrief data card:** *"Outside, unshielded, Curiosity's RAD measured 8,100 µGy from this
   one event. Normal background there was about 210 µGy per sol. So this one storm ≈ 39 sols
   of normal radiation in about a day."* 🧮 (8,100 ÷ 210 ≈ 38.6) *"Inside our shelter, the game
   estimates you got about [N] DP. That shelter number is a game model, not a NASA
   measurement."* 🎮
6. **"Live sky" bonus (online only):** *"Want to see what the Sun is doing today?"* Opens the
   Space Weather Desk with today's DONKI events, labelled **LIVE · NASA DONKI ·
   prototyping-quality research data** (Part 3 §8).

**Win:** inside the shelter or under the overhang before the particle peak. **Strain:** your
badge over 70 DP. **Teaching point:** L6, L7, L8.
**Duration:** 4–5 min (MVP: the main judging moment).

---

### M11 — SILENCE (Act III, Sols 41–54)

**Objective:** Prepare for and get through the **solar conjunction blackout**: about 13 sols
with no contact with Earth.

**Setup:** The Signal Tracker shows Earth sliding behind the Sun. The delay has grown to
**20 min** (🎮 scripted; NASA: crewed delays up to 21–23 min 🛰). NASA's white paper: a
long-stay mission sees a blackout of **about 13 days**, around **100 days into the stay** 🛰.
Mission Control sends the "last to-do list" (🛰 mission controllers send simple to-do lists
before conjunction).

**View:** 2D Comms Desk (last upload) → Station View **Standing Orders** → sleep-to-sleep
time-lapse sols with first-person moments for events.

**PEBBLE card 1: the last upload (limited bandwidth and dish power)**

| Field | Content |
|---|---|
| Situation | One final orbiter relay window. The dish can send **3 of 5** packets before the window closes |
| Options (pick 3) | **Science data** (counts toward the science goal) · **Health report** (Earth doctors' review arrives after conjunction) · **Family messages** (your spirit during the silence) · **Greenhouse photos** (Earth's plant team returns advice afterwards) · **Equipment telemetry** (Earth's engineers return a fix list that prevents one fault afterwards) |
| Benefit / cost | Each packet's benefit arrives **after** the blackout (delayed by design); what you don't send can't be helped from Earth |
| Systems | 📡 ⚡ 🧑‍🚀 🌱 (science) |
| Delayed | Paid back in M12 |
| Recovery | Not resendable this window, which is the point; everything else stays recoverable locally |
| Science | "During conjunction, the Sun blocks the radio, so astronauts plan ahead and work on their own." |
| Source | 🛰 "Mars in a Minute: conjunction" (to-do lists, weeks long); 🛰 NASA comms white paper (13-day blackout, crew autonomy) |

**PEBBLE card 2: Standing Orders (the autonomy test).** You set Station View priorities,
greenhouse light hours, the O₂ source mix and an EVA rule ("EVAs only if the sky is clear and
the space-weather light is green"). Then the **blackout runs**: 13 sols as a series of short
sleeps (≈ 2–3 min in total), with **3–4 event cards** from the deck (§6). The Signal Tracker
shows a flat line behind the Sun. PEBBLE keeps you company: it reads the plant names aloud,
plays your saved family messages (if you sent that packet), and counts down the sols.

**Win:** reach Sol 54 without a Return to Ship. **Teaching point:** L8 (a blackout is not
just a long delay). **Duration:** 6–8 min.

---

### M12 — HARVEST & SIGNAL (Finale, Sol 60)

**Objective:** Harvest, decide how to use it, and reconnect with Earth.

**Setup:** The trays are ripe (or not; their size reflects everything since M2). At 06:12,
PEBBLE wakes you early: the Signal Tracker lights up. Earth is back. The first message,
*timestamped 20 minutes earlier*: *"Life Line Station, do you read? …We missed you."*

**View:** 1P harvest in the dome (pick, bag, weigh, PEBBLE holding the basket) → Station View
fly-around of the whole base at dawn → 2D **Mission Report**.

**PEBBLE card: what to do with the harvest**

| Field | Content |
|---|---|
| Situation | Harvest = N sols of food (from your earlier choices). Pantry = M sols left. The next crew will launch from Earth soon and land at your base |
| Options | **A. Fresh-food celebration** (eat it now, send Earth the video) · **B. Bank it** (store it and replant every tray today) · **C. Seed saving** (keep part as seed stock for the next crew) |
| Benefit / cost | A: big health and spirit boost, but less food margin for the next season · B: the strongest food reserve, but a quiet celebration · C: the next crew's greenhouse starts faster; less food now |
| Systems | 🌱 🧑‍🚀 ⚡ (replanting = light load) |
| Delayed | Shapes the **epilogue card** ("Season 2" teaser) |
| Science | "A base becomes more independent when it grows and makes what it needs, and that takes planning months ahead." |
| Source | 🛰 NASA food research for long missions (Humans to Mars; Growing Plants in Space) |

**Then:** the packets you sent in M11 pay off (Earth's fix list, plant advice, doctors'
notes) → **Mission Report** (Part 3 §5.3) → **Ending** (§7) → a **Commander's Certificate**
with the callsign only.
**Duration:** 5–6 min.

---

## 5. Onboarding and tutorial design

| Principle | How |
|---|---|
| **Learn by doing, one thing at a time** | M0 teaches moving, the airlock, the 3 gauges, Station View and sleep; M1 adds the night plan; M2 adds the greenhouse; each mission adds at most **one new panel** |
| **The first 60 seconds** | Title → Play → callsign → you're in the ship's seat. The landing *is* the "wow" shot. A gauge is visible within 4 minutes |
| **PEBBLE as the hint system** | PEBBLE rolls toward the next thing to do after 30 s of no progress; **H** asks for a hint at any time |
| **No text walls** | Max 2 sentences per PEBBLE line; "Why?" for depth |
| **Safe failure in tutorial** | M0 can't fail; M1 can't Return to Ship (Life Support is locked on) |
| **Skip for returning players** | "Already landed? Skip to Night Shift" |

### One balanced difficulty

There are **no difficulty modes** (owner decision, rev. 3). One setting, tuned for ages 7–12:
no timers, one negative event per sol at most, warnings before every problem, PEBBLE hints,
real numbers on hover, "Why?" for depth, and "Continue with help" for anyone who needs it
(Part 1 §3.5). Older players get their challenge from **optional mission badges** (§8), not
from a harder mode.

---

## 6. Random event deck (replayability)

Drawn by a seeded **Event Director** (Part 3 §3.7) during time skips, nights, storm sols and
the blackout. Rules: at most 1 negative major event per sol; every hazard that could be
forecast in reality **is** forecast in-game; each event has at least 2 responses; **night
events wake you** through PEBBLE.

| # | Event | Trigger | Responses (at least 2) | Systems | Science basis |
|---|---|---|---|---|---|
| E1 | **Dust devil** | Afternoon, dry season | Clean now (yourself / PEBBLE) · wait | ⚡ | 🛰 dust article (dust devils deposit dust on panels) |
| E2 | **Cleaning breeze** (good news) | Random, low odds | Bank the extra power · run the lab | ⚡ | 🎮 (cite a rover source before naming it NASA fact) |
| E3 | **Scrubber cartridge saturating** | Every ~8 sols of use | Swap now (your time) · stretch it (CO₂ yellow risk) | 🫁 🧑‍🚀 | 🛰 ECLSS (CO₂ removal) |
| E4 | **Perchlorate filter clog** | More likely after dirty-ice runs | Replace filter (spares count) · run slow (less water per sol) | 💧 ⚡ | 🛰 perchlorates |
| E5 | **Greenhouse fungus** | Overwatering + low airflow | Remove the sick plants (smaller yield) · boost fans (power) | 🌱 ⚡ | 🛰 real Veggie zinnia fungus (overwatering, low airflow), Scott Kelly nursed them back |
| E6 | **Heater fault on a cold night** (wakes you) | Cold-season night | Repair it now in the dark · shift heat from the greenhouse until morning (crops slower) | ⚡ 🌱 🧑‍🚀 | 🛰 cold nights (Mars Facts) |
| E7 | **Forbush decrease** (good news) | After a CME passes | Schedule an EVA now (cheaper dose) · ignore | ☢ | 🛰 RAD saw CME-caused dips |
| E8 | **Flare alert (DONKI archive)** | Curated DONKI flare | Pause EVAs (lose work time) · keep working, watch the sensor | ☢ 🧑‍🚀 | 🛰 DONKI FLR; **flare ≠ dose** card |
| E9 | **Solar particle event** | Curated DONKI SEP or CME | Shelter (lose a work block) · overhang · partial | ☢ | 🛰 DONKI and RAD |
| E10 | **Delayed family video** | Earth link open | Watch it (spirit up, dish power) · save it for the blackout | 📡 🧑‍🚀 | 🛰 delay |
| E11 | **Late Earth advice** | After you solve a problem yourself | Reflect (a Why Chain bonus bead) | 📡 | 🛰 delay |
| E12 | **Grit in the rover gears** | After dust storms or many drives | Maintenance sol · drive carefully (slower) | ⚡ 🧑‍🚀 | 🛰 dust article ("gets into gears") |
| E13 | **Frost morning** | Cold season | Wait for the sun (late start) · heat the airlock (power) | ⚡ | 🛰 cold; 🎮 frost visual |
| E14 | **Battery cell ageing in cold** | Late game, many deep discharges | Replace a cell (spares) · lower the max charge | ⚡ | 🎮 general battery behaviour |
| E15 | **Relay pass missed** | Orbiter geometry (🎮 schedule) | Wait for the next pass · send direct (more dish power) | 📡 ⚡ | 🛰 relays via orbiters (Comms 7 Things) |
| E16 | **Wonder moment: Phobos crosses the Sun** | Rare, daytime | Photo (no gameplay effect, explicitly labelled a *wonder moment*, not a decision) | — | 🛰 Mars has two moons (Mars Facts) |
| E17 | **Wonder moment: global aurora** | Night after an SEP | PEBBLE wakes you to look (spirit +) | 🧑‍🚀 | 🛰 MAVEN global aurora |
| E18 | **You're tired** | You skipped sleep, or energy low two sols running | Nap now (lose daylight hours) · push on (tasks slower, a small mistake chance) | 🧑‍🚀 | 🎮 |
| E19 | **PEBBLE stuck in sand** | After a PEBBLE job in loose ground | Walk out and free it (EVA) · let it dig itself out (3 hours, its battery) | 🤖 ⚡ 🫁 | 🛰 Spirit got stuck in soft soil (to verify before citing) |
| E20 | **PEBBLE low battery** | Many jobs in a row | Charge now (0.2 kW, it's off duty) · one more job (risk it stops in the yard) | 🤖 ⚡ | 🎮 |

Wonder moments may have no cost because they offer no choice; they exist for awe, never as
fake decisions (Brief §2).

---

## 7. Endings

The ending is a **combination of four medals**, not one score. **Safe Commander is required**
for any "success" ending; the other medals can never replace it.

| Medal | Gold | Silver | Bronze |
|---|---|---|---|
| 🧑‍🚀 **Safe Commander** (required) | Your badge never over 70 DP, no red health | Under 90 DP | Completed with a Return to Ship or help |
| 🔁 **Self-Reliance** | Made ≥ 70% of your air and water locally in Act III | ≥ 40% | Below 40% |
| 🔬 **Science** | All 5 sample goals | 3–4 | 1–2 |
| 🌱 **Harvest** | ≥ 10 sols of food grown | 5–9 | Under 5 |

| Ending | Condition | Final card (short) |
|---|---|---|
| **Golden Season** | Safe Commander gold + 2 other golds | "Life Line Station stands on its own. The next crew is coming, to the home you built." |
| **Lean but Safe** | Safe Commander gold/silver, other medals mixed | "You're safe, and the base is still standing. Next season, it can grow." |
| **Science Hero** | Science gold, Safe Commander silver | "You brought home Mars's climate story. It cost a lot. Was it worth it?" (a reflection prompt, not a judgement) |
| **Back from the Ship** | Completed with a Return to Ship or Earth's help | "Mars was hard this time. Try again from any decision to see a different future." |

All endings show **3 Why Chain highlights**, your best decision and one **"what if?"**
branch: *"If you'd deployed fission behind the mesa, ice runs would have cost 20% less."*
The last shot: PEBBLE beside you at the window, watching the sunset.

---

## 8. Replayability

| Feature | What it adds |
|---|---|
| **Seeded event deck** | Different event orders and dust timing per run; a class code for shared seeds |
| **Try again from any decision** | The Why Chain links let you jump back and branch |
| **Mission badges** | Optional goals per mission (e.g. "Night Shift with ≥ 20% battery", "Ice Run with zero filter clogs", "Sun Roared under 10 DP", "A full night's sleep every sol") |
| **Different crops, sites and power choices** | Big strategy shifts. Stretch: **Site Select** variant, land at **Arcadia Planitia** (flatter, no cliff shelter) or **Jezero** (warmer, less ice, longer ice runs), each with a source card |
| **Real-sky replays (stretch)** | A menu of curated real space-weather weeks (e.g. May 2024, plus a quiet week for contrast) |
| **Live sky (optional, online)** | Today's DONKI events tint the Space Weather Desk, labelled LIVE (never inflates dose by itself) |

---

## 9. Narrative script beats (key lines)

| Moment | Speaker | Line |
|---|---|---|
| Title | Card | "This story is set in the future. Today, only robots explore Mars. The science is real." |
| M0 orbit | Mission Control | "Good luck, Commander. By the time you hear this, you'll already be down." |
| M0 touchdown | Ship | "Touchdown. Message to Earth sent. They'll know in 10 minutes." |
| M0 meeting | PEBBLE | "Hello, Commander! I've been waiting 214 sols. I kept everything clean. Mostly." |
| M0 airlock | PEBBLE | "Pressure 1%. Outer hatch unlocked. Helmet on, always!" |
| M0 first sleep | PEBBLE | "The Sun's going down, so the panels will stop. Sleep. I'll watch the base." |
| M1 sunset | PEBBLE | "Solar's at zero. Until morning, we live on what's in the battery." |
| M1 decision | PEBBLE | "I won't tell you what's right. I'll tell you what each choice costs." |
| M1 night | PEBBLE | "Sorry to wake you. It's getting really cold." |
| M2 regolith | PEBBLE | "Mars dirt has perchlorates. Not for salads. Not yet." |
| M3 ice | PEBBLE | "Ancient ice, older than any city on Earth. And you're going to drink it, after we clean it." |
| M4 data card | PEBBLE | "MOXIE made oxygen on Mars. Real! Small. We need a much bigger one." |
| M5 dust devil | PEBBLE | "It moves dust, not buildings. Thin air, remember? …I'm still hiding." |
| M7 late reply | PEBBLE | "Earth was right. And 20 minutes too late. That's why we decide here." |
| M10 alert | PEBBLE | "Solar event! Particles may follow within tens of minutes." |
| M10 debrief | PEBBLE | "That storm really happened, on 20 May 2024. Curiosity felt it. Now you have too." |
| M11 blackout | Mission Control | "See you on the other side of the Sun, Life Line. You've got this." |
| M12 signal | Mission Control | "Life Line Station, do you read? …We missed you." |
| Ending | PEBBLE | "You weren't lucky, Commander. You planned." |

---

*Continue to **Part 3: `03-systems-ux-tech-production.md`** for the simulation, UX,
assets, technology and production plan.*
