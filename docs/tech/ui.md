# HUD, panels and accessibility

**Story game (current):** the surface uses `StoryHud` (`StoryHud.tsx` + `.css`, built on the
warm `OutpostHud.css` styles): five resource meters with per-minute trends, the mission card
(scene N of 7, goals checklist, and side-by-side "OR" options with how/gain/cost), a carried
filter chip, a brownout alert, a survival countdown (`Vitals`: "NO OXYGEN: 12 s until you black
out" plus a pulsing edge vignette that closes in as `danger(state).severity` rises), the hold-ring
prompt and a toast. A lost mission opens the `Lost` panel instead of the debrief: cause, the
last six decisions, a tip, and Try Again / Main Menu. `StoryDialog` is the
always-visible speaker box at the bottom centre: typewriter text, a sound per new line,
auto-advance, Enter or click to skip, and the last line kept dimmed when idle. Panels:
quick management (M or interacting with the hab terminal switches to isometric Station View with
docked subsystems, solar generation/consumption and navigation on the left), shelter, ending debrief
(a junior-astronaut mission debrief console featuring a celebratory 5-star banner, 5 vibrant color-coded
vital cards—Power ⚡, Water 💧, Oxygen 🫁, Food 🥕, Shield 🛡️—with thick gradient bars, simple status badges,
tactical accomplishment milestone cards with emojis, PEBBLE high-five cheer, a dedicated toggle button to
expand the full scientific report with exact engineering telemetry, tradeoff analysis and NASA research links,
and above-the-fold action buttons), and pause; `Modal.tsx` holds the shared `Modal`, `Fact` and `closePanel`. The bottom-left dock houses the
enlarged PEBBLE chat card (with 3.6em face avatar, status hint, and `[P]` shortcut) and primary HUD buttons
(`[M] Quick management`, `[P] Ask PEBBLE`). PEBBLE chat is always online via a built-in autonomous local responder,
backed by Gemini API when configured. All menus (main menu, Touchdown, pause, modals, and site picker) support direct
mouse clicking with cursor pointers and hover states alongside keyboard navigation (Arrow keys, Tab, Enter, Space, E).
First person uses pointer lock: a centre dot, E or left click to use. See [Mission Critical](../game/mission-critical.md).
The sections below describe the earlier campaign HUD.

The React DOM HUD reads the runner's throttled snapshots. Three gauges show
power, air and water with trends, status words and shapes, and exact units in
the detail panels. Five chips cover food, the Sun, Earth, the astronaut and
PEBBLE. The clock shows sol, local time and sleep availability. First person
has a centre dot and an outdoor visor with a suit-air bar.

The top HUD uses the same inset control surfaces, warm borders and rounded
corners as the bottom command bar. Each resource and status is an individual
control within its tray. Readings reflow on narrow screens and at larger text
sizes while retaining the status words and shapes.

The game starts at the dedicated Homepage (`MainMenu`) displaying the full-screen
Mars illustration (`/ui/background-main-menu.png`). The menu presents Continue Game
(when an existing expedition save is found), New Game (with profile setup, Touchdown
descent sequence, or direct surface deployment), and Catalog. Free play mode has been
removed in favor of the unified expedition game.

The 3D Asset Catalog (`Catalog`) provides an interactive showcase of all 50 procedural
Kiln models with OrbitControls, bounding-box auto-framing, auto-rotate, wireframe
toggles, categorization, search, polygon/material statistics, and a first-person
Test Grounds walkthrough mode.

Touchdown provides the landing console, ship pressure controls, and initial mission
objectives. The campaign reuses the existing decision and wake report dialogs. See
[Touchdown](../game/phase-4-touchdown.md).

Station View includes module details, load controls and priorities. The
priority list supports drag and keyboard move buttons. Life Support remains
first. Load edits are queued while time is paused and applied on the next
simulation step after closing the panel.

The Data Pad shows quick readings, messages, the Why Chain, and the last
wake-up report. The report plots actual battery samples captured while
sleeping and includes overnight events and replies. The recovery screen
offers pre-sleep and pre-decision checkpoints when available. The playable
Return to Ship journey belongs to Phase 17.

Dialogs use the browser's modal focus containment and restore focus on close.
Decisions pause time and have no countdown. Settings persist locally and
include 100/125/150% text size, FOV (75° default), reduced motion, hold/toggle
and a volume preference. Audio sources remain scheduled for later work.
Nunito and Baloo 2 are bundled, and status icons are paired with text.
