# command-base — connected hero headquarters

- Request: “okay generate it it looks amazaing make the big thing all”.
- Category: building; LOD0 budget 12,000 triangles from existing style tokens.
- Sole design reference: `assets/concepts/command-base-user-reference.png` (owner's
  cropped hero-base image, 2026-11-13). This explicit reference supersedes the
  earlier Phase 2 per-module image restriction for this new asset.
- Planned functional size: main core ~8 × 6.8 × 8 m; connected left-side wing
  extends total width to ~23 m; roof equipment ~12 m tall. Metres, +X forward,
  +Y up, entry steps contact Y=0. Dimensions must be measured on final export.
- Traits: large chamfered ivory pressure shell, thick slate exoskeleton ribs,
  recessed glowing amber octagonal entrance, broad three-step stair/porch,
  warm horizontal windows, bold orange side badge, connected ribbed wing,
  rooftop parabolic dish on a lattice support, twin braced antenna towers,
  small cyan lintel marker and amber tower lamps.
- Materials: generated Mars style header; smooth-structure ivory/slate,
  accent orange paint, dark trim, warm emissive and small cool emissive details.
  No NASA logo; plaque uses a generic orbital mark.

## Functional and destination contract

New complete exterior asset, preserving older independent models in the library.
Main roof, entrance, outer_hatch, two door leaves, roof dish/dish support,
antenna towers, side-wing roof and info_anchor retain semantic node names.
Closed exterior is collidable; enterable rooms/airlock gameplay remain later work.
Emissive strips are authored now; bloom/light spill and animated lighting remain
later polish. Replace the small hab/airlock in the current site layout and keep
solar/battery/rover/landing areas. Avoid new footprint/route collisions.

## Review and delivery

Review material-faithful GPU front/three-quarter/back images against the attached
reference; check foundations, tower feet/braces, dish/feed support and stairs.
Save to project collection with attribution, ingest through the pipeline,
verify the optimized GLB in game, then update docs/checklist.

## Result — 2026-11-13

- Saved collection `project`, asset `a_658f5c9b3c024c9a930f6bfe2bfcb5d9`,
  revision `r_315bdde28a32473e9a74d086875ff846`, program `p_56a66cc60648`.
- Canonical source: `assets/source/command-base-final.kiln.js`.
- Measured local X/Y/Z: 11.9675 × 13.13 × 20.931923 m. Full placed geometry:
  8,320 triangles, below the 12,000 budget; six style materials.
- Optimized runtime GLB: `public/models/command-base.glb`, 176,860 bytes.
  Manifest unique-buffer statistics differ from placed triangles by design.
- Material-faithful GPU review accepted; final hero: `assets/reviews/command-base/hero.png`.
  Dish was lifted clear of its pedestal, wing plaques seated, and wing mirrored
  to match the reference. Support contacts measured within 1 cm; embedded hull
  components are intentional. This is not a watertight/structural certification.
- Actual game loader/browser reviewed the connected exterior on the existing
  terrain in live and daylight views. No browser console errors observed.
  Browser evidence: `assets/reviews/command-base/in-game.png`.
  Base renderer observed around 205–220 calls including shadows; hardware FPS
  qualification remains open.
- Tests verify exact batch geometry, triangle budget, named owners and empty
  anchors, reflected winding, immutable source buffers, routes and collisions.
  Final suite: 69 passing tests.
- The reference specifies the front/side appearance; hidden rear details are
  inferred. Closed exterior only: playable rooms, door operation and lighting
  effects are future work. Existing solar, dock, rover and landing areas remain.
