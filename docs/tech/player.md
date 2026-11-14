# Player: Ecctrl 2 (`ecctrl` 2.0) + first-person camera

The player is an invisible Ecctrl capsule with a first-person camera. There is no character
model yet.

## Ecctrl 2 essentials (differs from v1)

- Ecctrl **does not read the keyboard itself**. Input is pushed each frame with
  `handle.setMovement({ forward, backward, leftward, rightward, run, jump })`.
  `Player.tsx` reads drei `useKeyboardControls` and forwards it.
- Movement is relative to the **current camera direction**, which makes first person work
  without extra code.
- There is **no built-in follow camera**. `ecctrl/camera` exports `EcctrlCameraControls`
  (drei CameraControls with a changeable up axis) for third person later.
- `EcctrlHandle` exposes runtime state (`currPos`, `isOnGround`, `moveSpeed`, ...).
- Peer requirements: three ≥0.184, fiber ≥9.4, rapier ≥2.2, drei ≥10.7, leva ≥0.10.1.

## Current tuning (`src/game/player/Player.tsx`)

| Value | Setting |
| --- | --- |
| Capsule | radius 0.35, half-height 0.55 (1.8 m total = `scale.astronaut-height`) |
| Float height | 0.2 |
| Eye height | 1.65 m above ground |
| Spawn | `(0,2.36,0.65)`, looking toward the hab console |
| Walk / run | 3 / 6 m/s |
| Jump velocity | 2.6 m/s (≈0.9 m ballistic rise in Mars gravity, before controller/falling-scale effects) |
| Falling gravity scale | 1.5 |

## Controls

`src/game/player/controls.ts`: WASD/arrows move, Shift run, Space jump. While the story's
`weakened(state)` is true (a supply at zero, or a dose over half the lethal dose), `Player.tsx`
forces `run` and `jump` off, so a starving or suffocating commander can only walk. Click the canvas
to capture the mouse for looking (canvas Pointer Lock), Esc releases it. I/J/K/L provide keyboard look. F cycles nearby tasks, and E uses the highlighted target.

### Interaction targeting (`src/game/interaction/targeting.ts`)

First-person interaction prompts (`[E]`) require line of sight, range, and reticle alignment:
- View cone tolerance: `Math.min(target.aimRadius, depth * 0.8)` gives a wide, natural cone (approx. 40° half-angle) so looking near an object detects it easily without pixel-hunting, while preserving depth sorting (nearer objects take priority).
- Standard interactables (solar panels, airlocks, breakers, valves, terminals, PEBBLE) use generous `aimRadius` (1.1–1.8 m) and ranges (3.4–4.8 m).
- Compact controls (such as priority levers or cabin flight switches) retain tighter bounds (`aimRadius: 0.22 m`) to prevent accidentally toggling neighboring controls.

## Phase 1 simulation integration

Movement input is neutral while the mission store is paused, a planning panel or
decision card is open, or the view is outside first person. Pointer-lock clicks
are restricted to canvases, so the simulation debug buttons do not try to lock
the pointer. The in-app-browser Pointer Lock limitation remains for canvas clicks.

## Phase 2 review and routes

Development world-review visits relocate `EcctrlHandle.body` to the base, array,
ship, overhang or repair approach, then set camera facing. This is a review tool,
not gameplay fast travel; it does not alter the simulation astronaut location.
Normal walking still uses `setMovement`. Terrain ramps and cleared corridors
are defined in `siteLayout.ts`; solid placed models have triangle colliders.
