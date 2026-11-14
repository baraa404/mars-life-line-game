# Phase 4 — Touchdown

Start at the Homepage (`MainMenu`) displaying the Mars base illustration. The menu
presents Continue Game (if save exists), New Game, and Catalog. Starting a new game
allows configuring a callsign and suit-pad colour, with the choice of running the
Touchdown cabin descent sequence or deploying directly to the surface. Free play mode
has been removed in favor of the unified expedition game. `/?demo=landing` runs the
landing through the signal tracker, and `/?catalog` opens the 3D Asset Catalog.

The cabin and orbit GLBs load in a separate canvas during the descent sequence. The flight
waits for ARM, then plays automatic descent and touchdown. The suit check and ship pressure
cycle reuse the Phase 3 interlock rule. The transition places the player at the existing pad
approach, with ship-supplied suit air. Follow PEBBLE west, cycle the hab airlock, choose a
startup plan and sleep. The campaign saves to `marslifeline.touchdown.v2`. The first wake
report marks Touchdown complete.

The landing console uses an offline composite of Mars Trek Viking VIS Global
Color Mosaic tiles 0/0/0 and 0/0/1, with NASA/JPL attribution. The Life Line
pin is a fictional site in Deuteronilus Mensae. The 10-minute signal delay is
a story value. NASA's Mars 2020 mission overview confirms that Perseverance
landed autonomously and that atmospheric entry through touchdown took about
seven minutes.

- [Mars Trek WMTS documentation](https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars)
- [NASA/JPL Mars 2020 landing press kit](https://www.jpl.nasa.gov/news/press_kits/mars_2020/landing/mission/)

The flight effects, beeps, pressure hiss and short musical cues are generated
locally. There is no recorded dialogue. Reduced motion removes camera shake.
The introductory outdoor objectives and first-night startup use the existing
station HUD and choice panels. The first-night clock runs at twice the
ordinary surface rate while awake. The call-Earth option runs a scripted
20-minute station upload and schedules the reply for the first wake report.
The introductory walk holds the clock at 16:50 if the player explores longer.
This keeps the first-night lesson available without putting a timer on the walk.

## Verification

- Four automated regressions cover the flight stages and all three startup
  branches through dawn, including deterministic replay and Earth's reply.
- The production preview passed the landing-only route using keyboard ARM.
- The browser walkthrough reached the startup decision from the title, including
  the ship pressure interlock, the surface walk and the hab airlock. A separate
  browser run resumed at the first night and verified the bunk, dawn report and
  mission completion. The uninterrupted 6–8 minute playtest remains open.
- Build and lint pass with the repository's existing warnings.
