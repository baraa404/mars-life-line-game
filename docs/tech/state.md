# State: Zustand 5

Stores live in `src/state/`. Each store is one `create<State>()(...)` hook.

| Store | Holds |
| --- | --- |
| `useWorldStore` | `debug` (Leva panel + Stats, key **`**), `physicsDebug` (collider wireframes, key **P**) |

Rules:

- Read with selectors: `useWorldStore((s) => s.debug)`, so components re-render only on
  what they use.
- Outside React (event handlers, frame loops): `useWorldStore.getState()`.
- Do **not** write per-frame data (positions, velocities) into a store. Keep it in refs or
  read it from the Ecctrl handle; stores are for discrete state.
- `useMissionStore` owns `view`, `openPanel`, `paused`, `currentCard`, a discrete command
  queue, recent notices and a copied simulation snapshot at about 4 Hz. It also holds discrete area arrivals, interaction prompts, accessibility preferences, robot job selection and recovery requests. The mutable
  `SimRunner` remains in a ref in `src/game/Simulation.tsx`; the store is not authoritative
  for stocks. See [sim.md](sim.md) for commands, saves and replay.
  For the story game it also carries `arrivalSpot` (a one-off teleport foot point and
  facing, used by the greenhouse door and the shelter) and `pebbleGuide` (where PEBBLE drives).
- `useStoryStore` (story game, [mission-critical.md](../game/mission-critical.md)) owns the
  authoritative `StoryState`, the dialog (`line` on screen, `queue`, `log`; a negative line
  id means already read) and the action toast. `dispatch(action)` and `tick(dt)` call the
  pure `act`/`tick` in `src/sim/story/story.ts`. It saves to `marslifeline.story.v1` on every
  action and at most every 4 s while ticking; `clear()` deletes the save.

## Phase 2 world review

`useWorldStore` also carries development preview/visit selections and renderer
counters sampled at 1 Hz. These are diagnostics, not simulation save state.
Production appearance follows the mission snapshot; frame rendering mutates
Three refs/resources instead of pushing per-frame data into Zustand.
