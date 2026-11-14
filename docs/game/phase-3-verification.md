# Phase 3 runtime verification

Phase 3 connects the existing interior kit, actor GLBs, icons and fonts to the
shared game world. The phase uses the approved closed exterior plus a masked
airlock transfer to a staged pressure chamber. The hab room sits within the
headquarters footprint and is visible in Station View.

## Automated checks

- Run `npm test` for the existing simulation, site, and asset gates plus
  Phase 3 regressions for hatch pressure, paused choices and checkpoint rewind,
  saved wake reports, and PEBBLE job arrival.
- Run `npm run build` and `npm run lint`. The large Vite chunk warning remains.

## Browser walkthrough

1. From the hab, use WASD and I/J/K/L to move and look, or F to cycle nearby
   tasks. Hold E at the airlock wheel. Try the outer hatch before pulling the
   lever. Check the lock message, cycle the chamber, enter the yard, then
   repeat in reverse.
2. Press M, open Modules → Heaters, switch the load, and close the panel.
   Confirm the clock paused while editing and the load change survives view
   switching.
3. Open the Data Pad and ask PEBBLE about night power. Check the pause and
   both equally styled choices, then choose an option and open the Why Chain.
4. Wait at the galley until after 17:00, then use the bunk. Check the battery
   graph and time stamp in the wake-up report.
5. In Station View, select PEBBLE → Clean panels → Solar 1. Check the robot's
   approach, travel label, and job progress after arrival.

Desktop pointer lock, visual checks and walkthrough results are recorded below.

## Results — 2026-11-13

- 80 automated tests passed. The three seeded 60-sol stability runs completed.
  Production build and lint passed, with the bundle-size and lint warnings.
- Chrome keyboard walkthrough verified hab movement, the complete airlock
  round trip and pressure interlock, a persistent heater change, paused
  practice choice, galley wait, bunk sleep and the wake battery graph.
- Station View browser run dispatched PEBBLE to Solar 1 and confirmed that
  cleaning began after arrival. The other jobs and routes are wired; they
  did not receive the same end-to-end browser coverage.
- The production preview acquired Chrome Pointer Lock, opened the
  headquarters cutaway, rendered the HUD under deuteranopia and protanopia
  emulation, and saved a practice decision without a page error.
- The nearby PEBBLE card opens from the projected screen position. The wing has no furnished interior,
  audio is deferred, and hardware frame-rate qualification remains open.
