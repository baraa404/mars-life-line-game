# PEBBLE actor, jobs and decisions

PEBBLE uses the delivered Box Buddy GLB, native clips and screen expressions.
The actor follows about two metres behind the player, tests local steering
against fixed Rapier colliders, and uses the yard routes to reach remote jobs.
It crosses the hab/yard boundary through the airlock scene transition.

H or about 30 seconds without movement or a scene change gives a contextual
hint. PEBBLE approaches and points when it can reach the next target. Decision
delivery uses the nearby screen treatment or the wrist Data Pad when away.

Station View offers clean, scout, carry and charge jobs. Pick a job, then a
target. The robot drives there, and job progress begins once the actor sends
its arrival to the simulation. The 3D actor uses a work clip and the station tag
shows ETA and progress. Cleaning uses a wrist air puff. The sim keeps authority
over the battery, dust, ETA and job effects. PEBBLE goes to its nook for night
watch. Waking for a decision and rebooting are reflected in the UI.

The Data Pad provides a replayable night-power practice decision. Cards show
equal-weight options with benefits, costs, affected systems, later effects,
recoverability, science and source. A choice uses the existing command path,
saves a checkpoint, adds a causal entry and shows the science line. Older
saved cards can still render with their original text and options.

## PEBBLE Chat & Assistant (`src/ui/PebbleChat.tsx`, `src/pebble/offlineResponder.ts`)

PEBBLE includes an interactive chatbot accessible via `[P]` or clicking the enlarged PEBBLE card in the bottom-left HUD dock:
- Always online: Even without an external Gemini API key, PEBBLE operates on onboard autonomous robot intelligence (`offlineResponder.ts`), providing real-time gameplay answers for all story scenes (1–7), power tradeoffs, water recycling, oxygen production, greenhouse crops, radiation storms, and station controls.
- When `GEMINI_API_KEY` is configured, it queries Gemini with automatic, seamless fallback to the local responder if the network is unavailable or times out.
- UI: Features a prominent face avatar badge (3.6em / 56px), legible title and hint text, enlarged shortcut buttons (`[M]` and `[P]`), a welcoming onboarding screen with quick starter questions, and an expanded dialog window (32em width).

[Phase 3 asset library](../../assets/briefs/phase-3-batch.md) lists the exact
asset revisions and previews.
