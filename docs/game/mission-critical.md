# Mars: Mission Critical — the 10-minute story game

The current playable game. It replaces the "7 Sols" outpost game
([hackathon-mvp.md](hackathon-mvp.md), kept as history). Target: NASA Space Apps 2026,
[Build a Junior Astronaut Mission Trainer](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/).
The player restores station ARES-7 for the next crew in about ten minutes of real time,
guided by PEBBLE and Mission Control.

## Design rules

- **Choices are physical acts.** No menu picks an outcome. You choose by doing: scrub the
  solar panels *or* throw the backup breaker; pull one lever on a priority board; hold the
  greenhouse override switch *or* pull the red Emergency lever.
- **Every choice shows both options and their consequences.** The mission card (top right)
  lists the options side by side with "OR", where to do each one, and what it gives (+) and
  costs (−). The option you start is marked; the other is dimmed.
- **PEBBLE's dialog is always visible.** The dialog box at the bottom centre types each line,
  plays a sound for every new line (Mission Control: the message chime; PEBBLE: a cue that matches
  its mood), auto-advances after a reading pause, and Enter or a click skips. When the queue
  is empty the last line stays on screen, dimmed, marked "last message".
- **M or the hab control terminal opens quick management** (the isometric station view with live subsystem statuses, solar power flows on the left, and 3D labels).

## Scenes

| # | Scene | What the player does | Choice and consequences |
| --- | --- | --- | --- |
| 1 | Arrival | Enter the hab, use the control terminal | — |
| 2 | Restore power | Hold E on each of 4 dusty panel rows, **or** hold E on the backup breaker at the battery | Clean: lots of power for the whole mission, takes time outside. Backup: +35% now, but dusty panels drain power later |
| 3 | Life support | Take a filter from the supply rack, install it in the water recycler, pull its start lever; start the oxygen generator | Oxygen needs recycled water first |
| 4 | Growing food | Walk into the greenhouse, open the water valve, switch on the grow lights, pull one priority lever (Survival / Balanced / Farming), clear blocked drip lines (red lamp), harvest all three trays | Survival: low power use, slow crops. Balanced: middle. Farming: fast crops, high power and water use |
| 5 | Your decisions matter | Review the station on the terminal (low power / low water / stable lines), optionally re-pull a lever on the hab board, confirm the plan | — |
| 6 | Radiation emergency | Pull the red Emergency lever **or** hold the greenhouse override switch; close the radiation covers on the oxygen generator and the water recycler; reach the shelter before the countdown ends | Emergency: saves power for life support, greenhouse pauses. Keep farming: crops keep growing, uses much more power. Uncovered systems are damaged (half output) |
| 7 | Mission complete | Hold E on the terminal to submit the report | Ending A (success) or B (improvements needed); ending C (Mission Lost) can happen in any scene |

Five checks grade the report: power, water, air, food and radiation (dose under 250 µGy and
no damaged systems). Success needs four checks and nothing empty (oxygen above 30%). The
ending screen presents a visual expedition debrief dashboard: overall mission certification
status with star rating (up to 5 stars) and badge, a 5-system telemetry gauge grid with safe
threshold markers (Power, Water, Oxygen, Crop Biomass, Radiation Shielding), tactical decision
analysis cards highlighting choices and consequence trade-offs (+ / −) across energy, closed loop,
crops, storm priority and bunker shielding, an autonomous PEBBLE debrief quote, authentic NASA
science data citations (OSDR RadLab, Mars Trek, DONKI, BVAD), and action controls (Play Again / New
Expedition, Return to Main Menu).

Running low has visible effects: an empty battery causes a brownout (lights and machines
stop until power returns to 8%), and PEBBLE warns when water or oxygen runs low.

## Survival and Mission Lost

The crew can die, so choices have real consequences beyond the meters.

- **Food is eaten** at 1 day per 120 s (`RATES.crewFood`). The starting 3 days last 6 minutes,
  so the greenhouse has to be running in time, and the replanted trays are worth harvesting.
- **Grace periods.** When oxygen, water or food reaches zero, a strain timer starts
  (`state.strain`). Death follows after `SURVIVAL`: oxygen 20 s, water 60 s, food 90 s. Once
  the supply returns, strain recovers at twice the rate it built up.
- **Body effects.** While any strain is above zero, or the dose is over half the lethal dose,
  the commander is `weakened`: no running or jumping. The HUD shows a countdown ("NO WATER: 18 s
  until the crew collapses") and a pulsing vignette that closes in as the timer runs down.
  PEBBLE warns when a supply hits zero and again at half the grace period.
- **Radiation is lethal** at 600 µGy (`RATES.lethalDose`); a warning plays at 300. Standing
  outside for about 20 s of the 28 s storm is fatal. Skipping a cover to reach the shelter is
  the survivable trade.
- **Permanent losses.** A tray whose drip line stays blocked for 40 s (`RATES.witherAt`) dies:
  it shows dry stalks, yields no food and never regrows. Uncovered machines still lose half
  their output for the rest of the mission.
- **Mission Lost ending** (`ending: 'lost'`, `cause`). Control and PEBBLE speak, then the
  `Lost` panel shows the cause, the last six decisions ("the choices that led here"), a tip
  for next time, and Try Again / Main Menu. Death is permanent: a lost save cannot be
  continued.

## Interactions

All use E (or a left click) at the centre dot; long actions are holds with a ring.

| Object | Where | Action |
| --- | --- | --- |
| Control terminal | Hab, front wall | Opens the isometric station view with the subsystems and solar power panel on the left; in scene 7 hold 2 s to submit the report |
| Hab priority board | Hab, right of the terminal | Levers (scene 5 adjust) |
| Solar rows 1–4 | Solar field | Hold 2.2 s to scrub dust |
| Backup breaker | In front of the battery bank | Hold 1.5 s |
| Filter rack | Beside the supply crates | Take the filter (a chip shows you carry it) |
| Water recycler | South of the hab door | Hold 1.6 s at the socket to install; pull the start lever; scene 6 hold to close the cover |
| Oxygen generator | East of the door | Hold 1.4 s to start it; scene 6 hold to close the cover |
| Greenhouse door | Dome front | Walk in and out (a short fade) |
| Valve wheel, light switch | Greenhouse, left of the door | Hold to open the valve; press for lights; scene 6 hold for the override |
| Priority board | Greenhouse, right of the door | One lever per mode: green Survival, blue Balanced, orange Farming, red Emergency |
| Trays 1–3 | Greenhouse | Check, hold to clear a blocked drip line, hold to harvest |
| Radiation shelter | West of the door | Enter during the storm |

Floating "!" markers sit over the next places the story needs. When a target is inside the
hab or greenhouse and you are outside, the marker points at the door instead. PEBBLE drives
toward the next place on its own.

## Tuning

Rates are in `RATES` in `src/sim/story/story.ts` (per real second). Start: power 40%, water
60 L, oxygen 70%, food 3 days (eaten at 1 day per 120 s). Crops take 40 s at Balanced. The
storm warning lasts 55 s and the storm 28 s; outside it adds 30 µGy/s, in the shelter
1.5 µGy/s, and 600 µGy is fatal. Survival grace periods are in `SURVIVAL`. The food target in
the report is 8 days (`LIMITS.food`). The careful test playthrough takes about 7.5 minutes and
ends with power 100%, water 42 L, food 11 days and success.

## Ending Mission Debrief (Junior Astronaut Trainer)

The ending debrief (`End` in `StoryHud.tsx`) is designed specifically for young astronauts:
- **Kid-Friendly Simple View (Default)**:
  - 5-Star celebratory banner with golden stars and high-contrast pass chip (`5 / 5 SYSTEMS READY! 🚀`).
  - 5 vibrant color-coded indicator cards: Power ⚡ (`#FF9F1C`), Water 💧 (`#00B4D8`), Oxygen 🫁 (`#06D6A0`), Food 🥕 (`#F59E0B`), and Shield 🛡️ (`#7B2CBF`), each with thick gradient progress tracks, status badges, and simple maintenance tips.
  - Simplified accomplishment milestones with big emojis and achievement tags (`SOLAR HERO`, `FRESH LIFE SUPPORT`, `GREENHOUSE MASTER`, `SAFE & SOUND`).
  - PEBBLE high-five cheer card with encouraging feedback.
  - Compact padding ensuring `🚀 Play Again!` and `🏠 Main Menu` buttons stay visible above the fold on standard displays without scrolling.
- **Scientific Report Toggle**:
  - `[ 📋 View Full Scientific Report (NASA Citations & Detailed Telemetry) ]` button opens the detailed engineering table (exact numbers and safe targets), tactical tradeoff analysis (gains vs. costs per decision domain), and research citations.
  - Toggles back to simple view on click.

## NASA data used

- **BVAD**: crew oxygen and water needs shown on the terminal.
- **DONKI**: the 20 May 2024 CME the storm is modelled on (shown in the shelter).
- **OSDR RadLab**, **Mars Trek**: listed on the ending screen with the site choice.

## Implementation map

| Area | Files |
| --- | --- |
| Script (every line) | `src/sim/story/script.ts` |
| Pure story simulation | `src/sim/story/story.ts` (`createStory`, `tick`, `act`, `brief`, `grade`) |
| Store and save | `src/state/useStoryStore.ts` (key `marslifeline.story.v1`, state `version: 2`; older saves are ignored) |
| World bridge | `src/game/StoryBridge.tsx` ticks the story and fills the visual snapshot |
| Story props and targets | `src/game/world/StoryWorld.tsx`, `src/game/world/storyLayout.ts` |
| Station labels | `src/game/world/Stations.tsx` |
| Water recycler model | [water-recycler brief](../../assets/briefs/water-recycler.md) |
| UI | `src/ui/StoryHud.tsx` + `.css`, `src/ui/StoryDialog.tsx`, `src/ui/Modal.tsx` |
| Tests | `tests/sim/story.test.mjs` (careful run succeeds, risky run gets ending B, idle run starves, grace periods and recovery, fatal storm, dead tray) |

The previous outpost game files are in `archive/seven-sols/` (not built). The shared data
in `src/sim/outpost/data.ts` and `radlab.ts` is still used.

## Known gaps

- Headless browser checks run at about 1 frame per second (software WebGL), so they verify
  placement and panels by setting the story state; holds and walking were checked by the
  simulation tests, not by a timed play session.
