# MARS LIFE LINE — Game Design Plan, Part 1 of 3
## Vision · Learning · Story · PEBBLE · Mars Site · World

> **Junior Astronaut Mission Trainer** for NASA Space Apps Challenge 2026 (Cairo).
> Tagline: **"Every watt. Every breath. Every choice."**
>
> | Part | File | Covers |
> |---|---|---|
> | 0 | `00-START-HERE.md` | The whole plan in plain words, step by step |
> | **1** | `01-vision-story-world.md` (this file) | Decision status, vision, pillars, learning goals, audience, story, PEBBLE, Mars site, world map, the science rules |
> | 2 | `02-missions-events-campaign.md` | Whole campaign from the landing to the ending: every mission, every major decision, the random-event deck, endings, replay |
> | 3 | `03-systems-ux-tech-production.md` | Simulation maths, first-person + isometric + 2D UX, sleep and time, HUD, accessibility, assets, architecture, NASA data, MVP, 24-hour plan, risks, tests, demo |
>
> Prepared 12 Nov 2026, the day before the hackathon. This is a **plan**: no code or
> assets were produced, and no existing project file was changed.
>
> **Revision 2 (12 Nov 2026, owner feedback):** the story is now a **real mission that opens
> with the landing**, not a training simulator. There is **no crew**: the player is the only
> astronaut, with the robot **PEBBLE** as the only companion. Views are **first person +
> isometric Station View + 2D**; third person is removed. **Decision cards are presented by
> PEBBLE.** Time uses one speed plus a Minecraft-style **sleep** and a daytime **wait**.
>
> **Revision 3 (12 Nov 2026, owner feedback):** **one balanced difficulty** for ages 7–12;
> the Cadet / Commander / Flight Director modes are removed (§3.5).

---

## 0. How to read this plan

Every statement carries one of three labels, as the Agent Brief requires.

| Label | Meaning |
|---|---|
| **CONFIRMED** | Comes from the NASA challenge text, the Cairo guides, a NASA page verified while writing this plan, something already built in this repository, or a direct instruction from the project owner |
| **PROPOSED** | A design decision made here. Strong recommendation, but the team can change it |
| **NEEDS TEAM CONFIRMATION** | Information is missing or two sources conflict. A safe default is offered, but not treated as agreed |

Numbers inside the simulation are **tuning assumptions** unless a NASA source is cited next
to them. The game never shows an invented number as if NASA measured it (Part 3 §11 lists
every source-to-mechanic link).

### 0.1 Sources actually read for this plan

Local files in `Personal Projects/Docs/`, all read in full:

1. `Mars_Game_Design_Agent_Brief_EN.md`, the brief this plan answers.
2. `Mars_Junior_Astronaut_Mission_Trainer_Foundation_Constraints_2026.md` (Arabic foundation and constraints).
3. `Build a Junior Astronaut Mission Trainer challenge statement.md`.
4. `2026 Challenge Build a Junior Astronaut Mission Trainer nasa official video .md` (challenge author transcript).
5. `From Challenge to Solution Hackathon Roadmap Ep. 1.md` (choosing a challenge, writing the proposal).
6. `Your Hackathon Support System Hackathon Roadmap Ep. 2.md` (mentorship, Discord, proposal video).
7. `Judging Guidelines - NASA Space Apps Cairo 2026 (Participants).pdf`.
8. `NASA_Space_Apps_Cairo_2026_Hackathon_GUIDE26.pdf`.
9. `Participant Guidebook 2026.pdf`.

Repository docs read (not edited): `docs/README.md`, `docs/style/STYLE_GUIDE.md`, the hero
and asset-sheet references, `docs/tech/{world,player,state,rendering}.md`, `package.json`.

NASA pages and data opened while writing (Part 3 §11 maps each one to a mechanic):
Mars Facts · Humans to Mars · Fact and Fiction of Martian Dust Storms · RAD surface
measurements · RAD cruise measurements · "NASA Watches Mars Light Up During Epic Solar
Storm" (May 2024) · CCMC DONKI system page, guide, and the Sept 2026 URL-migration notice ·
**live DONKI API queries** (CME, CME Analysis, FLR, SEP, WSA-ENLIL) · SWIM ice map and
"Follow the Water" · Space Communications: 7 Things · Mars in a Minute: solar conjunction ·
**Mars Communications Disruption and Delay white paper (PDF)** · MOXIE page and "MOXIE
Completes Mars Mission" · Perseverance instruments (MEDA, MOXIE, RIMFAX) · ECLSS · Veggie ·
Growing Plants in Space · Plant Biology hardware · OSDR · Detoxifying Mars (perchlorates) ·
Fission Surface Power and the 2025 FSP design paper.

**Could not be opened:** the challenge page and its **Resources tab**
(`spaceappschallenge.org`) returned server errors. Ep. 2 says the Resources tab goes live on
**13 November**, so its contents are still **NEEDS TEAM CONFIRMATION** (see §2.4).

**Not yet verified on a NASA page (needed before an in-game card cites them):** the landing
facts used in M0 (the "seven minutes of terror", autonomous landing because of the signal
delay, Terrain-Relative Navigation on Perseverance, and retro-rockets for heavy landers).

---

## 1. Decision status at a glance

### 1.1 CONFIRMED

| Item | Source |
|---|---|
| Interactive working game for **ages 7–12**, managing a lunar **or Martian** outpost; the learning goal is **engineering trade-offs** | Challenge statement |
| Five named domains: **life support, radiation shielding, power budgeting, food production, communication delay** | Challenge statement |
| Track **2–3 core resources**; no free safe choice; real NASA data encouraged and attributed in the tool; archived data allowed if not shown as live | Challenge statement |
| Stand-out ideas: link shielding decisions to **real space weather data**, replayability, a short explanation of the datasets used | Challenge statement |
| Spirit: "not a quiz, not a slideshow, a living simulation where every choice costs something"; DONKI named as the key dataset | Challenge author video |
| **Mars**, a fictional future human outpost, not a real NASA base | Agent Brief, Foundation |
| **Owner decision (rev. 2):** the story is a *real* (in-story) mission that **opens with the ship landing on Mars**; **no crew members**, only a **small robot helper**; views are **first person + isometric (station management) + 2D**; **decision cards are tied to the robot**; a **sleep** mechanic like Minecraft; **one balanced difficulty** for the target age, no difficulty modes (rev. 3) | Project owner |
| **Stack already in this repo:** TypeScript, React 19 + Vite 8, Three.js 0.187, React Three Fiber 9, Drei 10, Rapier physics (gravity −3.71 m/s²), **Ecctrl 2** first-person controller, Zustand 5, Kiln for assets, glTF Transform for optimisation | `package.json`, `docs/tech/*` |
| **Art direction already approved:** "Stylized low-poly 3D, Terracotta Mars": ivory machinery, slate frames, bold orange panels, dusty peach sky, faceted rocks, small cyan beacons | `docs/style/STYLE_GUIDE.md` |
| **Assets already built:** six-wheel Mars rover and an animated young astronaut on a test terrain | `docs/tech/world.md` |
| Judging: **Impact, Creativity, Validity, Relevance, Presentation**; no official weights | Cairo judging guidelines |
| Submission: **30-second video or 7 slides**, public links with no login, project summary, list of resources; **no images, names or voices of anyone under 18**; disclose AI use; team leader submits; English (or Arabic with English subtitles) | Cairo guide, Guidebook |
| Cairo schedule: hackathon starts **Fri 13 Nov, 1:00 PM**; submission **Sat 14 Nov, 1:00 PM** (organisers say to confirm the final deadline) | Cairo guide |
| Planning before the start is allowed; **building the project before the start is not**; the challenge and idea cannot be changed after registering | Guidebook Q&A |

**Note on the Agent Brief.** The brief asked for "3D third-person + 3D first-person + 2D".
The owner replaced third person with an **isometric Station View**. That view is still a 3D
outside-the-body camera, so it keeps the brief's goal (seeing how the base fits together)
while being easier to manage with.

### 1.2 PROPOSED by this plan (main choices)

| Decision | Proposal | Where |
|---|---|---|
| Game title | **Mars Life Line** (matches the repo); subtitle *Junior Astronaut Mission Trainer* | §3 |
| Frame | A **story set in the future**: the player is **Commander [Callsign]**, the **first person to live at Life Line Station**. Robots built the base before you arrived. The opening title card says plainly that today only robots explore Mars | §5 |
| Companion | **PEBBLE**, a small robot on two tank treads, the only character at the base. It guides, presents every decision card, keeps watch while you sleep, and does outdoor jobs | §6 |
| Earth | **Mission Control on Earth** speaks only through **delayed text and voice messages**. It is not a crew member and is never at the base | §6 |
| Site | **Deuteronilus Mensae**, northern mid-latitudes: mesas, buried glacier ice and natural cliff shelter (fallback: Arcadia Planitia) | §7 |
| Three core resources on the HUD | **POWER** (battery + live flow), **AIR** (oxygen reserve, shown as "sols left"), **WATER** ("sols left") | §8, Part 3 |
| Slower conditions shown as status chips | **Food** (pantry + greenhouse), **Sun / Radiation** (your dose badge), **Earth Link** (delay or blackout), **You** (energy, health, spirit), **PEBBLE** (battery, wear) | §8 |
| Views | **First person** wherever your body is (inside, outside, rover seat). **Isometric Station View** to manage the base. **2D** for cards, messages and data | §8.2, Part 3 §4 |
| Time | One normal speed (1 real second = 1 Mars minute), **Sleep** in your bunk to skip the night, **Wait** to pass daytime hours | Part 3 §2.1 |
| Power architecture | Solar + batteries first; a **small fission unit** arrives mid-campaign. Labelled fictional, based on NASA's 40 kW-class fission concept | Part 2 M6 |
| Campaign | **13 missions** (M0 landing → M12 finale) across 3 acts (~90–120 min), ending with solar-conjunction silence, the first harvest and Earth's voice returning | Part 2 |
| Real-data hero mission | **"The Day the Sun Roared"**: a replay of the **real 20 May 2024 solar storm at Mars** using DONKI records and the Curiosity RAD measurement | Part 2, M10 |
| Learning hook | The **Why Chain** (PEBBLE's "memory tape" of cause and effect) and the **Signal Tracker** that shows light-speed delay | §3.6, Part 3 |
| Hackathon MVP | **Touchdown** + **Night Shift** + **The Day the Sun Roared** (≈ 15 min of play) | Part 3 §9 |

### 1.3 NEEDS TEAM CONFIRMATION

| # | Question | Safe default in this plan |
|---|---|---|
| T-1 | **Pre-built work.** The repo already contains a test world, a rover and an astronaut made before 13 Nov. The Guidebook bans submitting work done before the start | Ask organisers on Discord **before** the start, in writing. If not allowed, rebuild during the event using the same pipeline and style guide |
| T-2 | **Real working time.** Ep. 2 says about 36 h; the Cairo guide says 1 PM Fri to 1 PM Sat (24 h) | Plan for **24 h** (Part 3 §10) |
| T-3 | **Resources tab** contents (published 13 Nov) | DONKI, Mars surface data, OSDR and Artemis are named in the challenge text itself. Re-check at H+0 |
| T-4 | Team size, roles and skills | Plan written for 4–6 people (Part 3 §10) |
| T-5 | Interior and ship-cabin art. The style guide covers exteriors only | Same palette inside: ivory walls, slate frames, orange safety panels, warm amber lights (Part 3 §7) |
| T-6 | Languages | English first; Arabic UI as a stretch goal (RTL layout cost) |
| T-7 | PEBBLE's voice and Mission Control's voice | Text first; optional adult text-to-speech or adult voice actors |
| T-8 | Final site (ADR-MARS-SITE-001) | Deuteronilus Mensae (§7) |
| T-9 | Player body. In first person you rarely see yourself; the existing **young-astronaut** model appears as the tiny figure in Station View and in your hands/arms | Yes. It is stylised and not a real child, so it does not touch the under-18 rule. Needs walk/run clips for Station View |
| T-10 | Rover driving in first person. The existing rover may have no seat or cabin | Add an open driver's seat to the rover in Kiln, or let PEBBLE drive the rover while you ride |
| T-11 | Keep Mission Control as a voice from Earth? (It's not crew, but it is a second voice) | Yes: the communication-delay lesson needs someone on Earth to talk to |

---

## 2. The challenge, read three times

Ep. 1 recommends reading a challenge three ways (scan, deep read, resources) to answer
four questions. Here are the answers for this challenge.

### 2.1 Problem
Space content for kids is either too abstract to teach trade-offs or too technical to hold
attention. Children see mission *outcomes*, never the *decision logic* behind them.

### 2.2 Target users
Primary: **children 7–12**. Secondary (challenge "consider" list): older siblings,
parents and **classrooms**. Tertiary: the **judges**, who need to understand it within
30 seconds.

### 2.3 Required outcome
A **working, browser-playable prototype** where a young player makes real decisions
about the five domains and watches consequences unfold over a simulated mission,
then **walks away understanding a real constraint** of deep-space survival.

### 2.4 Resources
Named in the challenge text: **DONKI**, **OSDR**, **Artemis** environmental data and **Mars
surface mission** data. The Resources tab is not yet published (T-3). This plan builds on
DONKI (radiation and space weather), Curiosity RAD (measured surface dose), SWIM
(site and water), MOXIE and ECLSS (life support), Veggie and the Advanced Plant Habitat
(food), the NASA comms white paper (delay and blackout), Fission Surface Power and the dust
storm article (power), and MEDA (weather reference).

### 2.5 How this design scores on the five judging criteria

| Criterion | How Mars Life Line answers it |
|---|---|
| **Impact** | Kids learn *why* astronauts make hard choices, not just facts. Works at home and in class, free in a browser, no account |
| **Creativity** | A landing you live through in first person; an isometric "dollhouse" view of your own base; a robot friend who brings every decision; the Why Chain; the Signal Tracker; a replay of a *real* solar storm that hit Mars |
| **Validity** | One deterministic simulation; every number labelled real, derived or game; source cards in game; fixed science rules (§9) |
| **Relevance** | All five domains are linked in one system; DONKI and RAD drive the hero mission; 3 core resources as NASA suggests |
| **Presentation** | The landing makes a strong first 10 seconds for the video; the demo flow is designed from day one (Part 3 §14) |

---

## 3. Vision

### 3.1 Elevator pitch
> *Your ship drops through the Martian sky and lands beside a quiet base that robots built
> for you. Now you live there, alone except for PEBBLE, a small robot who has waited months
> to meet you. Every watt, every breath of air and every drop of water depends on **your**
> choices. Earth is 20 minutes away at the speed of light, so when the Sun roars or the dust
> rolls in, it's your call.*

### 3.2 Player fantasy
**"I am the first person to live on Mars, and I keep this place alive."** Not a superhero
fighting Mars: a calm commander who plans, fixes, grows and sleeps in a tiny home on another
planet, with a loyal robot friend. The fantasy is **competence and care**: real
responsibility, and seeing your planning pay off at the harvest.

### 3.3 Design pillars

1. **Every choice costs something.** No free button. Each major decision has at least two
   options, each with a visible benefit *and* cost (the 9-part decision contract in Part 2 §1).
2. **Mars sets the rules.** Physics and planetary facts are fixed (§9). The design adapts to
   Mars, never the reverse.
3. **See the cause, feel the effect.** Consequences show up in the 3D world (panels darken,
   plants droop, frost forms) and are explained in 2D (the Why Chain).
4. **Real sky, real data.** Space weather comes from DONKI; radiation magnitudes from
   Curiosity RAD; with honest labels every time.
5. **Mistakes are lessons, not punishments.** No deaths, no gore, no punishing timers by
   default. When things go badly, PEBBLE calls a **Return to Ship** and you try again.
6. **Small base, deep links.** Few systems, tightly connected, so a 7-year-old can follow
   them and a 12-year-old can master them.
7. **You are never alone.** PEBBLE is always close: in your room, on the radio, on your
   wrist. A lonely mission is never a scary one.

### 3.4 Learning objectives
After one full playthrough a player can explain, in their own words:

| # | Objective | Domain | Measured by (Part 3 §13) |
|---|---|---|---|
| L1 | Solar power stops at night and drops with dust; energy must be **stored** to get through the night | Power | Post-play question + Night Shift outcome |
| L2 | Power, air, water and food are **linked**: saving power now can cost oxygen or crops later | All | Why Chain read-back |
| L3 | Air on Mars must be **made or recycled with machines that use power and inputs** (water or CO₂) | Life support | Mission 4 choice explanation |
| L4 | Water comes from **underground ice**, must be **cleaned of perchlorates**, and is recycled | Life support / food | Mission 3 |
| L5 | Food **takes time to grow**, needs light, water, warmth and clean growing medium, never raw Mars soil | Food | Harvest result |
| L6 | **Dust storms** and **solar storms** are **different** hazards: one threatens power and sight, the other radiation | Radiation / power | M9 vs M10 comparison |
| L7 | Radiation exposure depends on **time outside** and **shielding**; suits are not shelters; a space-weather alert is not the same as a dose | Radiation | Dose-badge debrief |
| L8 | Messages to Earth take **minutes** each way, and during **solar conjunction** they stop for about two weeks, so the astronaut must decide locally | Comms | Signal Tracker task |
| L9 | Landing on Mars must happen **automatically**, because Earth is too far away to steer in time | Comms / landing | M0 question |

Stretch objectives (ages 10–12, "Explain more" layer): kW vs kWh; one-way vs round-trip
delay; why low-latitude sites are warmer but drier; why galactic cosmic rays are harder to
block than solar particles.

### 3.5 Audience and age fit: one balanced difficulty

**Owner decision (rev. 3): there is one difficulty only**, balanced for ages 7–12. No mode
menu. Instead of modes, the game uses **layered information**, so the same screen works for a
7-year-old and a 12-year-old:

| Layer | Who it's for | What it shows |
|---|---|---|
| **First look** (always) | Everyone | Icons, short sentences (≤ 12 words), "sols left" and "%" instead of kg or kWh, a status shape (● ▲ ■), one decision at a time |
| **Hover / tap** (optional) | Curious players, often 10–12 | Real units (kWh, kg, L, minutes), exact numbers, the forecast line |
| **"Why?" / "Explain more"** (optional) | Anyone who wants depth, parents, teachers | The science sentence, the source card, the stretch objectives |

**Fixed balance rules (one setting for everyone):**
- **No countdown timers.** Every decision waits for you.
- **PEBBLE hints:** PEBBLE rolls toward the next thing to do after 30 s of no progress, and
  **H** asks for a hint at any time (a question, never the answer).
- At most **one negative event per sol**, always with a warning first.
- Odds are shown in words and numbers: *"about 1 in 3 chance each sol (35%)"*.
- **"Continue with help"** is available to everyone after a Return to Ship (costs the
  Self-Reliance medal).
- Target: a careful player rarely sees a Return to Ship; a careless one sees one or two per
  campaign (Part 3 §3.9).

Content: no violence, no aliens, no injury images, no death. The worst outcome is "PEBBLE
calls a Return to Ship: you go back to the landing ship's safe cabin". Loneliness is handled
gently: PEBBLE, family messages and Earth's voice keep the mood warm. Every term is
explained in context: *sol*, *radiation dose*, *perchlorate*, *conjunction*.

### 3.6 Unique selling points
1. **You land on Mars yourself.** The game opens inside the ship during the landing, in first
   person, and teaches why the ship must land on its own.
2. **A replay of a real solar storm at Mars**, 20 May 2024, with real DONKI event IDs and the
   biggest radiation surge Curiosity has recorded, so judges and kids can verify it.
3. **PEBBLE brings every decision.** The robot rolls up, its screen face turns into the
   decision card, and it explains the costs. It never says which choice is right.
4. **A dollhouse view of your base.** Press **M** and the camera rises into an isometric
   **Station View**: roofs turn see-through, power flows glow along cables, and you click any
   module to see its info.
5. **Sleep like Minecraft, wake to consequences.** Set the night plan, sleep in your bunk,
   and wake to PEBBLE's report of what your battery did overnight.
6. **The Why Chain.** Every success or failure ends with a short cause-and-effect strip from
   PEBBLE's memory: "Greenhouse lights on → battery empty at 4:00 → heaters dimmed → you
   slept cold."
7. **Signal Tracker.** Your message is a visible dot of light travelling across a 2D solar
   system. When an alarm needs fixing in 10 minutes and Earth's reply needs 40, the kid
   *sees* why astronauts must decide locally.
8. **Honest science layer.** Every number in the game has a badge: 🛰 *NASA measurement*,
   🧮 *calculated from NASA data*, 🎮 *game value*, 📖 *story*.

---

## 4. The core idea in one picture

```text
                 MARS SETS THE RULES
   (night · dust · cold · thin CO₂ air · radiation · distance)
                          │
                          ▼
     ┌──────────── POWER (battery + live flow) ────────────┐
     │           │                │               │        │
     ▼           ▼                ▼               ▼        ▼
  AIR maker   WATER from ice   GREENHOUSE      HEAT      EARTH LINK
  (CO₂→O₂ or   (drill, clean    (light, water,  (cold     (dish power,
  H₂O→O₂)      perchlorates)    time)           nights)   delay, blackout)
     │           │                │               │        │
     └─────┬─────┴────────┬───────┘               │        │
           ▼              ▼                       ▼        ▼
         YOU (energy · health · spirit · dose)  ◄── RADIATION
           ▲      ▲                                (time outside ×
        SLEEP   PEBBLE (helps, but uses power)      shielding × space weather)
           │
     MISSION GOALS: stay safe → self-reliance → science → harvest
```

Decisions push this web. The **Why Chain** replays the path any consequence took through it.

---

## 5. Story framework

### 5.1 Framing: a real mission, set in the future
Inside the story, everything is real: you really landed, the base really keeps you alive.
Honesty is kept *outside* the story, on the title screen and the Sources page:

> *"This story is set in the future. Today, only robots explore Mars. But the science in
> this game is real: it comes from NASA missions, and every number tells you where it came
> from."*

The year is never stated, so no date can be mistaken for a real NASA plan.

**Why the base already exists.** Before you launched, cargo ships landed the habitat, solar
array, greenhouse dome and PEBBLE. Robots set everything up and kept it on standby for
months. You are the first person to arrive. 📖 (This matches the general idea of sending
equipment ahead of people; the details are fiction.)

**Why you can try again.** A "Return to Ship" is a real in-story safety move: your landing
ship has a small safe cabin with its own air. *Trying again* from your last sleep or an
earlier decision is a **game feature**, shown in the game menu, not in the story.

### 5.2 Setting
**Life Line Station**: a small outpost built for **one person**, at the foot of a flat-topped
mesa in **Deuteronilus Mensae**, Mars. It has a habitat module with a bunk, a galley and
consoles, an airlock, a small storm shelter, a greenhouse dome, a solar array, a battery bank
and a comms dish. Your **landing ship** stands 150 m away, your ride home and your safe haven.

Why "Life Line": the base's **life support line** (air, water, power) and its **radio line**
to Earth. Both can thin or break. The finale restores both.

### 5.3 Player role
**Commander [Callsign]**. The player picks a callsign (no real names stored, no account) and
a suit-pad colour. You are the only person on Mars. You do the outdoor work, the planning and
the decisions. PEBBLE helps but never decides.

### 5.4 Stakes
- **Your safety** comes first and can't be traded for points.
- **Self-reliance:** can the base make its own water and some of its own air before Earth
  goes silent at conjunction?
- **Science:** you came to study buried glacier ice, a record of Mars's climate.
- **The first harvest:** fresh food after weeks of packets, and the station proving it can
  support the people who will come next.

### 5.5 Tone
Warm, curious, calm under pressure. Mars is "not our enemy, just Mars". Humour comes from
PEBBLE (it names the plants, hides from dust devils, beeps proudly after a clean panel). When
the stakes rise, the music drops to a low pad and PEBBLE talks slower. **No villain.** The
antagonists are **physics, distance and time**.

### 5.6 Story arc (three acts)

| Act | Title | Sols (compressed) | Emotional beat | Systems introduced |
|---|---|---|---|---|
| Prologue | **Touchdown** | 1 | Awe | Landing, the airlock, Mars gravity, waking the base, the 3 gauges, sleep |
| **I** | **Settle In** | 2–12 | Curiosity → "oh, it's all connected" | Night power, greenhouse, ice water, air making, dust, Station View |
| **II** | **Mars Pushes Back** | 13–30 | Responsibility | Fission unit, Earth delay, science vs safety, space weather |
| **III** | **On My Own** | 31–60 | Courage → pride | Dust storm season, real solar storm, conjunction blackout, harvest |
| Finale | **Harvest & Signal** | 60 | Celebration | Mission Report, endings, certificate |

The full mission-by-mission plan, with every decision, is in **Part 2**.

### 5.7 Narrative delivery rules
- **One cinematic only: the landing** (≈ 60–90 s, interactive in places, skippable on replay).
  Every other briefing is at most 3 PEBBLE lines or 20 seconds of Earth radio.
- Story comes through **PEBBLE, Earth messages, your Data Pad and the environment**
  (frost on windows, the dust wall on the horizon, magenta greenhouse light).
- Earth messages are **always timestamped** with their send time and delay:
  *"Sent 14 min ago · Mission Control, Earth"*.
- After every major decision, PEBBLE reacts in one line, which shows that choices matter.

---

## 6. Characters

There is **one character at the base: PEBBLE**. There is no crew. All voices are adults or
synthetic (submission rule: no under-18 likeness or voice).

| Character | Role | Personality | Gameplay function |
|---|---|---|---|
| **You, Commander [Callsign]** | The only person on Mars | Whatever the player brings | All outdoor work, all decisions |
| **PEBBLE** | Small helper robot on two tank treads, built to keep the base and keep you company | Cheerful beeps, curious, names every plant, scared of dust devils, proud of clean panels | **Presents every decision card** on its screen face · hint system · **night watch** while you sleep, wakes you for alarms · outdoor jobs you send it on from Station View (clean panels, scout, carry samples) · **no Earth delay**: it's right here · narrates the Why Chain from its memory |
| **Mission Control (Earth)** | Voice on the radio. Not a crew member, never at the base, no face | Warm, careful, always minutes behind | Delayed messages, advice that costs time, the "last to-do list" before the blackout, the final "do you read?" |

**PEBBLE's rules (so it stays a helper, not the player):**
1. It never says which option is right. It says what each option **costs**.
2. It can give a "think about" hint ("What does the battery do at night?").
3. It can be busy: if you send it to clean panels, it isn't home to watch the hab.
4. It uses power (charging 0.2 kW) and can get dusty, stuck or glitched by radiation.
5. It is never in danger of being "killed". A bad day for PEBBLE means a reboot or a track
   repair, with a funny beep.

**PEBBLE's look ("Box Buddy", approved):** about knee height. A rounded-cube ivory body with
orange side panels and a charcoal chassis, riding on **two chunky tank-tread tracks** with
orange hubs (no wheels). A small rounded box **head on a short neck**, with orange ear discs
and a dark **screen face** showing cyan eyes, emotions and the decision card. A short antenna
with one cyan beacon. **Two small arms, both two-finger grippers (no brush).** It cleans
solar panels with a **puff-air nozzle** in its wrist. Reference sheet:
`docs/style/references/generated/g05-pebble-box-buddy.jpg`. Style per
`docs/style/STYLE_GUIDE.md`.

---

## 7. Mars location: Deuteronilus Mensae (ADR-MARS-SITE-001)

### 7.1 Recommendation (PROPOSED)

```text
Site decision ID: ADR-MARS-SITE-001
Selected region:  Deuteronilus Mensae, northern mid-latitudes of Mars
                  (mesa-and-valley terrain with ice-rich lobate debris aprons)
Status:           PROPOSED, needs team confirmation (T-8)
```

**Why this region**

| Criterion (Foundation §9) | Evidence | Status |
|---|---|---|
| **Water access** | NASA/JPL "Where Should Future Astronauts Land on Mars? Follow the Water" names **Arcadia Planitia and the glacier-filled valleys of Deuteronilus Mensae** as where most scientists would point for accessible subsurface ice (SWIM project, MRO + Odyssey + MGS data) | 🛰 NASA (SWIM) |
| **Landing plausibility** | The same article: the northern mid-latitudes offer **favourable low elevations** (more atmosphere to slow a heavy lander) | 🛰 NASA |
| **Temperature** | Mid-latitudes: "far enough toward the pole for water ice to be plentiful, but close enough to the equator to avoid the coldest temperatures" | 🛰 NASA (SWIM page) |
| **Natural radiation shelter** | Curiosity RAD lead Don Hassler, NASA May 2024: **"Cliffsides or lava tubes would provide additional shielding"**. Mesa cliffs make that a gameplay place | 🛰 NASA quote → 🎮 mechanic |
| **Matches the approved art** | The hero scene shows **distant eroded mesas**, which is literally what *mensae* means | Art fit |
| **Educational value** | Ice, cliffs, cold nights and dust create readable trade-offs | Design judgement |

**What is borrowed from other places (shown in-game as "Data from another place" cards)**

| Data | Real location | How we use it |
|---|---|---|
| Surface radiation dose (RAD, ~210 µGy/day, 2012–13; 8,100 µGy on 20 May 2024) | **Gale Crater** (Curiosity), about 5°S | Sets the *scale* of radiation units. Card says: "Measured at Gale Crater, not at our base" |
| Weather and dust (MEDA) | **Jezero Crater** (Perseverance), about 18°N | Shape of the day/night temperature curve and dust behaviour, labelled "borrowed from Jezero" |
| Oxygen-from-CO₂ demonstration (MOXIE) | Jezero, on Perseverance | Technology fact only |
| Ice distribution | **Deuteronilus Mensae / Arcadia** (SWIM maps) | Site choice and ice-drill mission |

**Fallback:** **Arcadia Planitia** (same SWIM evidence; shallow ice estimated at tens of cm at
candidate sites AP-1/8/9, per a USGS-catalogued study). Flatter terrain means fewer cliff
mechanics.
**Rejected for the base:** Jezero (data-rich but not a SWIM ice region; Foundation §9 warns
against picking it just because a rover is there); polar caps (plenty of ice but far too
cold).

**What remains fictional:** the exact coordinates, the outpost, every machine size, the
local terrain layout, the base's own sensors, the landing ship.

### 7.2 The site in-game
During the landing, the ship's screen shows a NASA Mars map (Mars Trek imagery, used with
attribution) zooming in to the site, with pins for **our base**, **Curiosity at Gale** and
**Perseverance at Jezero**, so kids *see* why some data is borrowed. Stretch (Part 2 §8): a
replay variant lets players land at Jezero or Arcadia instead, to feel how the site changes
the trade-offs.

---

## 8. World structure

### 8.1 Areas

| Zone | View(s) | Purpose | Key interactables |
|---|---|---|---|
| **Landing ship cabin** | First person | The opening landing; later the safe haven for a Return to Ship | Seat, window, landing screen, hatch, small emergency air supply |
| **Habitat interior** (Hab Core) | First person | Your home: planning, close-up tasks, sleeping | **Bunk (Sleep)**, Station View console, Comms Desk, Space Weather Desk, Life Support rack (scrubber cartridge, filters), galley (pantry count), Data Pad dock, PEBBLE's charging nook |
| **Airlock** | First person | The pressure-safe way between inside and outside | Hatch wheel, cycle lever, pressure gauge, suit rack (suit O₂ refill) |
| **Storm Shelter** | First person | Small room ringed by water tanks and the pantry, the best radiation shelter | Shelter door, water-wall valve, dose readout |
| **Greenhouse Dome** | First person inside; seen from above in Station View | Food production | 3 grow trays, LED light cap (magenta), water feed, climate dial, harvest bins |
| **Base Yard** | First person on foot; **Station View** from above | How the base fits together | Solar array (cleanable panels), battery bank, comms dish, Oxygen Maker unit, water processor, cable runs, PEBBLE dock, rover pad |
| **Mesa Cliff & Overhang** | First person | Natural shelter, scenic anchor | Overhang shelter spot, sample outcrop |
| **Glacier Apron (ice field)** | First person (rover seat, drill) | Water source, science | Ice drill rig, debris layer, ice-exposing crater (science target) |
| **Power Site** (from Act II) | Station View (placement), first person (setup) | Fission unit about 1 km out | Fission unit, cable spool, "keep-out" ring markers |
| **Landing Pad** | First person | Your ship and later cargo arrivals | The ship, cargo lander, crates |

Map scale: the existing terrain is 240 m square with a ridge beyond 75 m. Proposed layout:
the base in the centre, the ship 150 m east, the playable overhang entrance 110 m north (Phase 2 correction: preserves the 40 m escape from the 150 m repair point), the ice apron
reached by rover through a **level loading cut** (a ~1 km drive compressed into about 30 s),
and the power site at the edge of the map, shown 1 km away on the map and through a fog
horizon.

### 8.2 One shared world, three ways to see it
- **First person** is your body: inside, outside, on the rover. You feel the base from
  inside: the hum of fans, frost on the window, the airlock hiss.
- **Isometric Station View (M)** is your manager's view: the camera rises out of your head
  into an angled overhead view of the whole base, like a dollhouse. Roofs turn see-through,
  power flows glow, and each module shows a small info tag. You click modules to switch
  things on and off, set priorities, and send PEBBLE on jobs. You appear as a tiny astronaut
  figure. In the story it's the base's live 3D map, built from its cameras and PEBBLE's
  scans.
- **2D** covers decision cards (on PEBBLE's face), the Comms Desk and Signal Tracker, the
  Space Weather Desk, the Why Chain, reports and Sources.

All three read and write the **same simulation state** (Part 3 §4).

---

## 9. Mars rules the game never breaks (CONFIRMED science, design consequence)

| Mars fact | Source | Fixed game rule |
|---|---|---|
| Atmosphere under 1% of Earth's sea-level pressure, about 96% CO₂ | SWIM page; Humans to Mars | **No breathing outside, ever.** Helmet always on outdoors. The airlock is the *only* door to outside, and it must cycle |
| Gravity about 0.38 × Earth ("100 lb → 38 lb") | Humans to Mars | Rapier gravity −3.71 m/s² (already in the repo). Floaty but real jumps; crates feel lighter but still have mass |
| Sol = 24 h 39 m 35 s; year = 687 Earth days | Mars Facts; Foundation | One consistent sol clock: 24 "Mars hours" per sol, each a little longer than an Earth hour (and the game says so) |
| Temperatures range about −153 °C to +20 °C | Mars Facts | Cold nights raise heater load; frost visuals; the hab needs active heating |
| Weaker sunlight; dust coats panels; dust devils deposit dust | Dust-storm article | Solar output = daylight × panel cleanliness × sky clarity. **Zero at night** |
| Strongest storm winds about 60 mph in air ~1% as dense as Earth's; global storms about every 3 Mars years; storms last weeks to months | Dust-storm article; Humans to Mars | **Dust storms never blow the base away.** They cut power and visibility, and grit gets into gears |
| Dust storms ≠ solar radiation events | Foundation; RAD | Two separate hazard systems, with different warnings, shelters and lessons |
| No global magnetic field; RAD sees galactic cosmic rays (steady) plus solar particle events (sudden) | Mars Facts; RAD | Background dose is always on; solar events add spikes; shielding and time outside matter |
| A DONKI event is **not** a dose at a base | Foundation; DONKI disclaimer ("prototyping quality, research context") | The game shows a DONKI alert as "the Sun did something", and the **local dose** comes from our base sensor model, labelled as a game model |
| Water ice is underground at mid-latitudes; liquid water isn't stable on the surface | SWIM | Water must be **drilled, melted, cleaned and stored**. No lakes |
| Martian water and regolith contain **perchlorates**: toxic, corrosive | NASA "Detoxifying Mars" | Ice water must be **cleaned** (power + filter wear); crops grow in **clean growth medium**, never raw soil |
| Oxygen can be made from CO₂ (MOXIE: 122 g total, up to 12 g/h, ≥98% pure); a crew system must be about 100× larger | MOXIE pages | The Oxygen Maker is labelled "a future, scaled-up MOXIE-like machine (fiction)". It costs a lot of power |
| ISS life support recycles about 90% of water; makes O₂ by **electrolysing water**; removes CO₂ with sieves | ECLSS | Electrolysis trades **water** for **air**; recycling loses about 10% of used water |
| One-way delay **4–24 min**; crewed missions up to **21–23 min**; **conjunction** every ~26 months; blackout **about 13 days** for a long-stay mission, about 100 days into the stay | Comms 7 Things; NASA white paper | Earth replies are always late. **PEBBLE has no Earth delay.** **The landing can't be steered from Earth.** One blackout chapter of about 13 sols |
| Fission power runs regardless of dust or night; NASA concept: 40 kW class for 10 years; design requirement **< 5 rem/yr at 1 km** | FSP page and 2025 paper; Humans to Mars | The fission unit gives steady power, unaffected by dust, and **must be placed far from the habitat** |
| Humans are not on Mars yet | Mars Facts ("inhabited entirely by robots") | The title card says the story is set in the future. Never "NASA's Mars base" |

---

## 10. Glossary shown in game (kid language)

| Word | Pop-up explanation (first look) | "Explain more" (optional) |
|---|---|---|
| **Sol** | A day on Mars. A bit longer than an Earth day. | 24 h 39 m 35 s. A Mars year is 687 Earth days. |
| **Regolith** | Mars dirt: dust, sand and broken rock. | It can contain perchlorates, so it isn't safe for growing food without cleaning. |
| **Perchlorate** | A salt in Mars dirt and ice that's bad for people and machines. | A strong oxidiser that corrodes equipment and is harmful at low levels. |
| **Airlock** | A small room that lets you go outside without letting the air out. | It pumps air out before the outer hatch opens, and back in before the inner one opens. |
| **Radiation dose** | How much invisible energy your body soaked up. | The game uses Dose Points. 1 DP ≈ one sol of normal background measured by Curiosity at Gale Crater (~210 µGy). |
| **Solar storm** | The Sun throws out a burst of fast particles. | DONKI logs flares (FLR), mass ejections (CME) and particle events (SEP). |
| **Dust storm** | Wind lifts dust that blocks sunlight. | It reduces solar power for weeks; it doesn't change radiation much. |
| **Signal delay** | Radio takes minutes to travel between Earth and Mars. | It moves at light speed: 4–24 min one way, depending on where the planets are. |
| **Conjunction** | The Sun is between Earth and Mars, so no radio for about two weeks. | It happens about every 26 months. NASA plans ahead with simple to-do lists. |
| **kW vs kWh** | How fast power flows vs how much is stored. | A 2 kW heater for 3 hours uses 6 kWh. |
| **Station View** | The base seen from above, like a dollhouse. | A live 3D map from base cameras and PEBBLE's scans. |

---

*Continue to **Part 2: `02-missions-events-campaign.md`** for the full campaign.*
