# Mars Life Line — Documentation

Read the relevant doc **before** changing a feature, and update it **after**
(see `.cursor/rules/docs-protocol.mdc`).

## Game implementation

Phase 0 documentation and baseline checks are recorded in
[game/preflight.md](game/preflight.md), including explicit decisions, deferrals
and existing warnings. Phase 1 implementation and validation are recorded in
[game/phase-1-verification.md](game/phase-1-verification.md). Use `npm test` for
simulation/asset checks and `npm run sim:check` for the 60-sol stability run.
Phase 2 layout and runtime verification: [game/phase-2-verification.md](game/phase-2-verification.md);
coordinates, routes and binding details: [tech/world.md](tech/world.md).
Phase 3 runtime and browser checks: [game/phase-3-verification.md](game/phase-3-verification.md).
Phase 4 mission, sources and checks: [game/phase-4-touchdown.md](game/phase-4-touchdown.md).
Current playable game, the 10-minute story "Mars: Mission Critical": [game/mission-critical.md](game/mission-critical.md).
Earlier "7 Sols" outpost plan (superseded): [game/hackathon-mvp.md](game/hackathon-mvp.md).
 The following docs distinguish current features from
planned implementation contracts:

- [game/README.md](game/README.md): game summary and design sources
- [game/missions.md](game/missions.md): M0–M12 implementation status
- [tech/sim.md](tech/sim.md): simulation state, stepping, time, saves and tests
- [tech/views.md](tech/views.md): first person, Station View, panels and switching
- [tech/pebble.md](tech/pebble.md): robot actor, jobs and decision cards
- [tech/ui.md](tech/ui.md): HUD, panels and accessibility

## Style

| Doc | Covers |
| --- | --- |
| [style/STYLE_GUIDE.md](style/STYLE_GUIDE.md) | The visual language: palette, materials, lighting, shape, rules for AI |
| [style/KILN_STYLE_BRIEF.md](style/KILN_STYLE_BRIEF.md) | How the style becomes Kiln source code |
| [style/references/](style/references/) | The style itself: 3 primary Mars images, category crops, 4 regenerated supplementary sheets |
| [`src/style/tokens.json`](../src/style/tokens.json) | Exact values (single source of truth) |

## Asset pipeline

Individual images for later 3D modeling, catalog coverage, reference pairings and saved
generation prompts: [object reference library](<../models and assets images/README.md>).

| Doc | Covers |
| --- | --- |
| [pipeline/ASSET_PIPELINE.md](pipeline/ASSET_PIPELINE.md) | Request → Kiln → review → save → ingest → test |
| [pipeline/ASSET_BRIEF_TEMPLATE.md](pipeline/ASSET_BRIEF_TEMPLATE.md) | Brief written for each asset |

## Tech stack

| Doc | Feature | Package |
| --- | --- | --- |
| [tech/kiln.md](tech/kiln.md) | Asset generation, MCP, upgrades | `@instruktlabs/kiln` 1.7 |
| [tech/agents.md](tech/agents.md) | Cursor, Codex and Antigravity: rules, MCP, skills | Cursor, Codex, Antigravity |
| [tech/rendering.md](tech/rendering.md) | Canvas, lighting, sky, asset loading | three 0.187, fiber 9, drei 10 |
| [tech/physics.md](tech/physics.md) | Gravity, colliders | `@react-three/rapier` 2.2 |
| [tech/player.md](tech/player.md) | Movement, first-person camera, controls | `ecctrl` 2.0 |
| [tech/state.md](tech/state.md) | Stores | `zustand` 5 |
| [tech/optimization.md](tech/optimization.md) | GLB optimization | `@gltf-transform/*` 4.5 |
| [tech/world.md](tech/world.md) | The test world and its known gaps | — |

Landscape concept, exact Kiln rock-kit revision and review notes:
[`assets/briefs/mars-landscape.md`](../assets/briefs/mars-landscape.md).

Battery-bank reference recreation and verification:
[`assets/briefs/battery-bank.md`](../assets/briefs/battery-bank.md).

Phase 2 models, per-asset references, exact revisions and verification:
[assets/briefs/phase-2-batch.md](../assets/briefs/phase-2-batch.md).

Dock, landing pad/scorch/ship and three cable variants, sources and review page:
[assets/briefs/phase-2-support-batch.md](../assets/briefs/phase-2-support-batch.md).

Connected hero headquarters, exact saved revision and review:
[assets/briefs/command-base.md](../assets/briefs/command-base.md).

Phase 3 models, native animation clips, SVG faces/icons and local licensed fonts:
[assets/briefs/phase-3-batch.md](../assets/briefs/phase-3-batch.md).

Phase 7 station machines (oxygen maker, ice drill, path lamp, water recycler), revisions and review:
[assets/briefs/phase-7-batch.md](../assets/briefs/phase-7-batch.md).

## History

[CHANGELOG.md](CHANGELOG.md): every change to features, style or pipeline, newest first.
