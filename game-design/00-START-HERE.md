# Mars Life Line — The Whole Plan in Plain Words

Read this first. It explains everything in the three big design files, step by step, in
simple language. When you want the full detail of a step, the file and section are named.

- `01-vision-story-world.md`: the idea, the story, PEBBLE, the world
- `02-missions-events-campaign.md`: the missions and what happens in them
- `03-systems-ux-tech-production.md`: the rules, the screens, the build plan
- `04-asset-catalog.md`: every model, material, particle effect, light, UI piece, sound and image to make
- `05-implementation-checklist.md`: the step-by-step build checklist for the agent who implements the game

---

## Step 1. What are we making?

A **browser game for kids aged 7–12** for NASA Space Apps 2026 Cairo. The challenge is
called **"Build a Junior Astronaut Mission Trainer"**.

You land on Mars, alone except for a small robot called **PEBBLE**, and you keep a small
base alive. The game is about one big idea:

> **On Mars, every choice costs something.** Power, air, water, food and safety are all
> connected. If you use more of one, you have less of another.

The game never says which choice is right. It shows what each choice costs, and later shows
**why** things happened.

**Name and slogan:** *Mars Life Line: "Every watt. Every breath. Every choice."*

---

## Step 2. What does the challenge want? (and how we answer it)

NASA asked for a game where kids:

1. Manage **2–3 main resources** → we show **3 big gauges**: ⚡ Power, 🫁 Air, 💧 Water.
2. Deal with **Mars problems** → night, cold, dust, dust storms, solar storms, radiation,
   slow messages to Earth.
3. Make **real trade-offs** → every decision hasdrive the rover out with PEBBLE and drill ice for water. ￼￼Choice: at least 2 options, each with a benefit and
   a cost.
4. Use **real NASA data** → for example, the real solar storm that hit Mars on
   **20 May 2024**, from NASA's DONKI space-weather database and the Curiosity rover's
   radiation sensor.
5. See **3D and 2D** together → first person to live in the base, an overhead view to manage
   it, and 2D screens for reading and deciding.

Full detail: Part 1, sections 1–2.

---

drive the rover out with PEBBLE and drill ice for water. ￼￼Choice:## Step 3. The story in one minute

- The story is **set in the future**. The title card says so honestly: today only robots
  explore Mars, but the science in the game is real.
- **The game starts with your landing.** You sit in the ship, fall through the Martian sky,
  the heat shield glows, rockets fire, and you touch down. The ship lands **by itself**,
  because Earth is about 10 minutes away by radio and can't steer it in time.
- You walk 150 m to **Life Line Station**, a small base that robots built before you came.
  It sits at **Deuteronilus Mensae**, a real place on Mars where NASA's maps show buried ice.
- **PEBBLE** rolls out to meet you: *"Hello, Commander! I've been waiting 214 sols."*
- You are **Commander [your callsign]**, the first person to live there. You stay 60 Mars
  days ("sols").
- **No crew.** You are the only person. **Mission Control on Earth** talks to you only through
  slow, delayed radio messages.

Full detail: Part 1 sections 5–6, Part 2 mission M0.

---

## Step 4. PEBBLE, your only helper

PEBBLE is a knee-high robot on two tank treads (a bit like WALL-E, but our own design), with a
boxy body, a small head on a short neck, a screen face with cyan eyes, and two gripper hands.
Picture: `docs/style/references/generated/g05-pebble-box-buddy.jpg`.

- **It brings every decision.** It rolls up to you, its face turns into the **decision card**,
  and it explains what each choice costs. It never tells you the right answer.
- **It gives hints** to younger players.
- **It keeps watch while you sleep**, and wakes you if something needs a decision.
- **It does jobs you send it on**: clean the solar panels, scout, carry things.
- **It has limits**: it uses power, gets dusty, can get stuck in sand, and glitches during a
  solar storm (it says *"I saw snow!"*). It's never "killed": a bad day means a reboot.

Full detail: Part 1 section 6.

---

## Step 5. What you watch (the resources)

**Three big gauges, always on screen:**

| Gauge | What it means | Shown as |
|---|---|---|
| ⚡ **Power** | Battery charge, from solar panels (later also a small nuclear power unit) | % plus "night covered: 9 h" |
| 🫁 **Air** | Oxygen stored for you | "sols left" |
| 💧 **Water** | Clean water stored | "sols left" |

**Five small status chips:**
🌱 Food · ☢ Sun / Radiation · 📡 Earth Link (message delay) · 🧑‍🚀 You (energy, health,
spirit) · 🤖 PEBBLE (battery).

Every warning uses **colour plus a shape plus words** (● OK, ▲ Watch, ■ Act), so colour-blind
players can read it.

Full detail: Part 3 section 4.6.

---

## Step 6. The three ways you see the game

| View | When | Why |
|---|---|---|
| **First person** (your eyes) | Always, wherever your body is: the ship, the base, outside, the rover seat, the greenhouse, the shelter | You feel like you live inside a machine that keeps you alive |
| **Station View** (press **M**) | Any time you want to manage the base | The camera rises out of your head into an **isometric "dollhouse" view** of the whole base. Roofs turn see-through, power flows glow along the cables, and you click any module to see its info and switch it on or off. You also send PEBBLE on jobs from here |
| **2D screens** | Decisions, messages, reports | PEBBLE's decision cards, the Earth message screen, the space-weather screen, the Why Chain, reports, sources |

There is **no third-person camera**. Everything shares **one game state**, so nothing resets
when you switch views.

Full detail: Part 3 sections 4.1–4.4.

---

## Step 7. Time and sleep (like Minecraft)

- **Normal time:** 1 real second = 1 Mars minute. Daylight lasts about **12 real minutes**.
  Walking takes real time, so distance matters.
- **Sleep:** after 17:00, go to your bunk and press **E**. The night plays as a 10-second
  time-lapse (stars, frost on the window, the battery going down), then you wake up at 06:00.
  **Sleeping saves the game.**
- **Before you sleep**, you choose the **night plan**: which machines stay on with the
  battery. That's a real decision, so sleep is never "free".
- **PEBBLE's night watch:** if something happens at night, PEBBLE wakes you. Sleep never
  skips a decision.
- **Wake-up report:** PEBBLE tells you what happened while you slept and why.
- **Staying up is allowed**, but the night is long, dark and cold, and you get tired (tired =
  slower tasks).
- **Wait:** during the day, sit in the galley chair to skip 1, 2 or 4 hours.

**Why this is better than speed buttons:** kids already know "day, then sleep" from
Minecraft; real astronauts sleep on a schedule; and it creates the night-power lesson on its
own: you set the plan, sleep, and wake up to the result.

Full detail: Part 2 section 2.2, Part 3 section 2.1.

---

## Step 8. How a day (a "sol") plays

1. **Wake up**: read PEBBLE's report.
2. **Plan**: open Station View, switch machines, send PEBBLE on a job.
3. **Do**: go and do it in first person (walk, drive, fix, drill, plant).
4. **Dusk**: the sun sets and solar power drops to zero. Set the night plan.
5. **Sleep**: the night time-lapse. PEBBLE watches.

Full detail: Part 2 section 2.1.

---

## Step 9. How decisions work

Every big choice comes from **PEBBLE**. The game pauses, PEBBLE's face becomes the card, and
the card has the same parts every time:

1. **Situation**: what is happening.
2. **Options**: 2–4 choices, all the same size and colour, so none looks "right".
3. **Benefit and cost** of each.
4. **Systems affected** (icons).
5. **"What happens later?"**: the delayed effect.
6. **Feedback**: what you will see change.
7. **Recovery**: how to fix it if it goes badly.
8. **Science**: the real Mars fact behind it.
9. **Source**: where that fact came from.

Then the **Why Chain** (PEBBLE's "memory tape") shows what caused what, for example:
"Greenhouse lights on → battery empty at 5:00 → heaters off → you slept cold."
You can tap a bead and **try again** from that decision.

Full detail: Part 2 section 1, Part 3 section 4.3.

---

## Step 10. Winning and losing (kid-friendly)

- **Nobody dies.** If things get really bad, PEBBLE calls a **"Return to Ship"**: you walk back
  to the landing ship's safe cabin, which has its own air. Then you can **try again** from
  your last sleep or from an earlier decision.
- **Fairness rule:** there is always a yellow warning, then a red warning, and a chance to
  choose before any Return to Ship.
- The ending gives **4 medals** (gold, silver or bronze), not one score:
  - 🧑‍🚀 **Safe Commander** (required for a good ending): keep your radiation low
  - 🔁 **Self-Reliance**: make your own air and water
  - 🔬 **Science**: finish your sample goals
  - 🌱 **Harvest**: grow your own food
- **Endings:** *Golden Season*, *Lean but Safe*, *Science Hero*, *Back from the Ship*. The best
  ending: *"The next crew is coming, to the home you built."*

Full detail: Part 2 sections 2.5 and 7.

---

## Step 11. The missions, in order

There are 13 missions over 60 sols, in 3 acts. ⭐ marks the 3 missions we build first at the
hackathon.

### Prologue
- **M0 Touchdown ⭐ (Sol 1):** the landing, the first walk on Mars, meeting PEBBLE, the airlock,
  waking up the base, the first sleep. *Choice: what wakes up first: call Earth, warm the
  hab, or start the greenhouse?*

### Act I: Settle in
- **M1 Night Shift ⭐ (Sol 2):** the sun sets and solar power becomes zero. *Choice for the
  night plan: greenhouse lights, science lab, a bit of both, or save the battery.* Then you
  sleep, and PEBBLE may wake you when it gets very cold. Lesson: a base lives on stored
  energy at night.
- **M2 Seeds (Sol 3):** plant mizuna, dwarf wheat or chile peppers, crops astronauts have
  really grown in space. PEBBLE names the plants. Lesson: Mars soil is toxic (perchlorates),
  and food takes time.
- **M3 Ice Run (Sols 5–6):** drive the rover out with PEBBLE and drill ice for water. *Choice:
  near dirty ice or far clean ice.*
- **M4 Air You Can't See (Sol 8):** make oxygen from water (uses water) or from Mars air (uses
  lots of power). Inspired by MOXIE, a real NASA machine that made oxygen on Mars.
- **M5 Dust Devil (Sol 11):** a dust whirl coats the panels. *Choice: clean them yourself, send
  PEBBLE from Station View, or wait.* Lesson: Mars wind is weak and can't knock things down,
  but dust blocks sunlight.

### Act II: Mars pushes back
- **M6 Power Delivery (Sols 14–15):** place a small nuclear power unit on the Station View map,
  far from the base. It works day and night, through dust storms.
- **M7 Earth Is Listening… Slowly (Sol 18):** your wheat is sick. Ask Earth and wait 20+ minutes
  for the reply, or test it yourself now. Meanwhile an alarm goes off that can't wait for
  Earth. Lesson: light takes minutes to reach Earth.
- **M8 Science or Safety (Sol 23):** a long trip outside means more science and more radiation.
  *Choice: long, short or postpone.*

### Act III: On my own
- **M9 Storm Season (Sols 31–34):** a big dust storm darkens the sky for days. *Choice:
  stockpile power or keep doing science.*
- **M10 The Day the Sun Roared ⭐ (Sol 37):** the **real 20 May 2024 solar storm**. You're
  outside fixing a cable with PEBBLE when the alarm goes off. *Choice: run to the base
  shelter, hide under the cliff, or finish the repair first.* Lesson: solar storms and dust
  storms are different dangers, and you must decide fast because Earth is too far away.
- **M11 Silence (Sols 41–54):** the Sun sits between Earth and Mars, so there is no radio for
  about 13 sols. Choose which 3 messages to send before it starts, and set your "Standing
  Orders". PEBBLE keeps you company.
- **M12 Harvest & Signal (Sol 60):** the first harvest, then Earth's voice returns: *"Life Line
  Station, do you read? …We missed you."* *Choice: celebrate, store the food, or save seeds
  for the next crew.*

**Random events** (20 of them) keep each playthrough different: dust devils, a clogged
filter, plant fungus, PEBBLE stuck in sand, a delayed family video, an aurora PEBBLE wakes you
to see, and more.

Full detail: Part 2 sections 3–6.

---

## Step 12. One difficulty for everyone

There are **no difficulty modes**. Every player aged 7–12 plays the same balanced game:

- **Simple first, details if you want them.** Screens show icons, bars and "sols left".
  Hover or tap to see exact numbers. Press "Why?" for the science.
- **No countdown timers.** Every decision waits for you.
- **PEBBLE helps** if you're stuck for 30 seconds, or when you press **H**.
- **At most one bad event per sol**, always with a warning first.
- **"Continue with help"** is there for anyone after a Return to Ship.
- **Older kids get their challenge from optional badges**, like "Night Shift with 20% battery
  left", not from a harder mode.

Full detail: Part 1 section 3.5, Part 2 section 5.

---

## Step 13. How we keep the science honest

Every number in the game wears a small **badge** showing where it came from:

- 🛰 **Real NASA fact** (for example: 8,100 micrograys measured during the May 2024 storm)
- 🧮 **Calculated from NASA data**
- 🎮 **Game choice**, picked to make it playable (for example: battery size)
- 📖 **Story** (fiction, like the landing ship and PEBBLE)

Radiation is counted in **Dose Points**. 1 Dose Point = one normal day of radiation that
Curiosity measured on Mars. It is a comparison unit only, **never a medical number**.

Plants grow faster than in real life, and the game says so on screen.

Full detail: Part 1 section 9, Part 3 sections 3.6 and 11.

---

## Step 14. The NASA sources used

| Topic | NASA source |
|---|---|
| Mars basics (day length, cold, thin air) | Mars Facts, Humans to Mars |
| Landing on its own (to verify before the game cites it) | NASA landing ("EDL") pages |
| Dust and dust storms | "Fact and Fiction of Martian Dust Storms" |
| Radiation | Curiosity RAD measurements, the "Mars Light Up" May 2024 article |
| Solar storm data | DONKI (NASA's space-weather database) |
| Where the ice is | SWIM ice map, "Follow the Water" |
| Toxic soil | "Detoxifying Mars" (perchlorates) |
| Making oxygen | MOXIE |
| Recycling air and water | Space station life support (ECLSS) |
| Growing food | Veggie, Advanced Plant Habitat, chile peppers on the space station |
| Messages to Earth | Space Communications articles, the communication-delay white paper |
| Nuclear power | Fission Surface Power |

Part 3 section 11 lists every link, and which game rule each one became.

---

## Step 15. How it gets built

- **Same tools the project already uses:** TypeScript, React, Three.js (React Three Fiber),
  Rapier physics with Mars gravity, Ecctrl for the first-person player, Zustand for state,
  and Kiln for 3D models.
- **A new "simulation" folder** (`src/sim/`): plain code that runs the base (power, air,
  water, food, radiation, messages, you, PEBBLE, sleep). The 3D world and the screens only
  read from it and send it commands.
- **Station View** is the same 3D world seen through a second, isometric camera, so nothing is
  built twice.
- **Saves** go in the browser, on every sleep (no accounts, no personal data).
- **NASA data** is downloaded once and stored inside the game, so it **works offline**. An
  optional "Live sky" shows today's real space weather when online.
- **Already made:** the Mars terrain, the rover and the astronaut. **Still needed first:**
  **PEBBLE**, the landing ship, the base exterior and airlock, the interior with the bunk and
  consoles, the solar panels, the battery, the cliff overhang and the shelter room.

Full detail: Part 3 sections 7–8.

---

## Step 16. What we build at the hackathon (the first playable)

**Build first (must have):**
- Missions **M0 → M1 → a skip card → M10** (about 15 minutes of play)
- PEBBLE presenting decisions, sleep with the wake-up report, the night plan in Station View,
  the 3 gauges, the space-weather screen with real May 2024 data, and a Sources page

**Only if time is left:** Dust Devil with PEBBLE jobs, the message-delay screen, live space
weather.

**Later (after the hackathon):** the full 13-mission campaign, nuclear power, Arabic, touch
and gamepad.

**If we fall behind, cut in this order:** the long landing (→ 20 seconds) → the 3D shelter
(→ a 2D card) → the fancy Why Chain → animated power lines → see-through roofs.
**Never cut:** the night plan + sleep, the real solar-storm decision, PEBBLE's cards, the
Sources page, the 3 gauges.

Full detail: Part 3 section 9.

---

## Step 17. The 24-hour plan (team of about 5)

| Hours | What happens |
|---|---|
| 0–1 | Check the rules with the organisers, read NASA's Resources tab, lock the plan |
| 1–6 | Simulation basics + sleep; player controls; Station View camera; gauges; PEBBLE model |
| 6–10 | Radiation and messages; clicking modules; PEBBLE cards; the interior with the bunk; prepare the NASA data |
| 10–14 | M0 and M1 playable; landing ship; ask the mentors for feedback |
| 14–18 | M10 solar storm playable; Sources page; test with players |
| 18–21 | Fix bugs, speed up, accessibility checks, record gameplay |
| 21–23 | Publish the game online, test it offline, make the 30-second video or 7 slides |
| 23–24 | **Team leader submits, both locally and on the global site** |

Full detail: Part 3 section 10.

---

## Step 18. Testing with kids

- Only with **parent permission**, with a parent present. **No photos, video or voice
  recordings** of children.
- After 10–15 minutes of play, ask four questions:
  1. "Why did the power go down at night?"
  2. "What did you give up when you chose ___?"
  3. "Why couldn't Earth help with the alarm?"
  4. "Who flew the ship when it landed, and why?"
- **Goal:** most testers can explain at least one real trade-off in their own words.

Full detail: Part 3 section 13.

---

## Step 19. The demo for the judges

**30-second video:**
1. First person in the ship: the glow, the touchdown thud. "You just landed on Mars."
2. The hatch opens; PEBBLE rolls up smiling.
3. The camera rises into Station View; the night plan; the sleep time-lapse.
4. "20 May 2024": particle snow on the visor; PEBBLE's face turns into the decision card.
5. The Why Chain and the real NASA data card.
6. Title over the base at sunset: *"Mars Life Line. Every watt. Every breath. Every choice."*

**Submission checklist:** a public video or slides, a public game link, a public code repo,
a short summary, the list of NASA resources, a note about AI use, **no images or voices of
anyone under 18**, submitted by the team leader before the deadline.

Full detail: Part 3 section 14.

---

## Step 20. Things to decide before we start

1. **Most urgent:** we already built a test world and assets before the event. Ask the
   organisers **in writing** if that is allowed.
2. Real working time: 24 or 36 hours? (The plan assumes 24.)
3. Check NASA's **Resources tab** when it opens on 13 Nov.
4. Team size and who does what.
5. Art style for the base interior and the ship cabin (proposed: same colours as outside).
6. Languages (English first, Arabic later?).
7. PEBBLE's voice and Mission Control's voice (text first?).
8. Confirm the base location (Deuteronilus Mensae).
9. Walking animations for the small "you" figure in Station View.
10. Rover in first person: add a driver's seat, or let PEBBLE drive while you ride?
11. Keep Mission Control as a voice from Earth? (It's not crew, but it's needed for the
    message-delay lesson.)
12. Ask a science mentor to check the radiation and oxygen numbers that are game estimates,
    and check NASA's landing pages before the game quotes landing facts.

Full detail: Part 1 section 1.3, Part 3 section 15.

---

*That's the whole plan. When you want the exact numbers, formulas and mission scripts, open
the three numbered files.*
