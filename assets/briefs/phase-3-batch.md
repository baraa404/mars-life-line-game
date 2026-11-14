# Phase 3 — character, interior and UI asset library

Completed 2026-11-13. The matching images under `models and assets images/phase-3/`
were all inspected first and retained unchanged. PEBBLE follows only the approved
`docs/style/references/generated/g05-pebble-box-buddy.jpg`. The existing astronaut
model is preserved; its new clips follow `young-astronaut-clips.png`.

## Delivered models and motion

- [pebble](pebble.md): 4,410 placed triangles, 108,648 bytes, native clips Idle, Drive, TurnInPlace, Happy, Worried, Hide, Clean, Grip, HeadTilt, Reboot, Charge, Point.
- [astronaut-fp-arms](astronaut-fp-arms.md): 1,852 placed triangles, 48,544 bytes, native clips Reach, Grab, HoldTask, TurnWheel, PullLever, Brush, Wipe, CheckWrist, Point.
- [data-pad](data-pad.md): 484 placed triangles, 19,508 bytes, named modular/interaction groups.
- [int-wall-panel](int-wall-panel.md): 1,648 placed triangles, 37,728 bytes, named modular/interaction groups.
- [int-floor-ceiling](int-floor-ceiling.md): 352 placed triangles, 10,768 bytes, named modular/interaction groups.
- [int-door-inner](int-door-inner.md): 748 placed triangles, 18,964 bytes, named modular/interaction groups.
- [window-hab](window-hab.md): 366 placed triangles, 17,308 bytes, named modular/interaction groups.
- [console-station](console-station.md): 1,082 placed triangles, 29,416 bytes, named modular/interaction groups.
- [galley-chair](galley-chair.md): 532 placed triangles, 14,956 bytes, named modular/interaction groups.
- [bunk](bunk.md): 868 placed triangles, 24,656 bytes, named modular/interaction groups.
- [pebble-nook](pebble-nook.md): 656 placed triangles, 19,296 bytes, named modular/interaction groups.
- [airlock-interior](airlock-interior.md): 2,284 placed triangles, 45,008 bytes, named modular/interaction groups.
- [young-astronaut](young-astronaut.md): 6,088 placed triangles, 87,844 bytes, native clips Idle, Walk, Friendly_Wave.

PEBBLE's twelve clips are embedded in `pebble.glb`; there is no duplicate robot GLB
named pebble-clips. The arms contain nine requested clips. The astronaut retains
Friendly_Wave and adds Idle/Walk: 23 requested new clips, 24 total across the three
animated assets. Motions are rigid joint animation, without skin deformation.

Five wall variants and two floor/ceiling variants are kit groups displayed apart for
review. Reset selected variant transforms when placing them. The airlock is the
reference cutaway, not a completed sealed playable room. Other interaction anchors
are preserved but do not implement sleeping/waiting, pressure cycling or Station View.

## SVGs and typography

- `public/ui/pebble-faces/`: ten individual SVG expressions, sheet.svg, symbol sprite.svg and manifest.json with 256×160 cell rectangles. Explicit SVG pixel dimensions support WebGL image loading. The preview switches these on screen_face and hides face_default.
- `public/ui/icons/`: eleven U-23 system icons, three status shapes, four source badges and two labelled tags; individual SVGs, symbol sprite and manifest. Status shapes must be paired with words, not colour alone.
- `public/fonts/`: Nunito variable font for body text and Baloo 2 for headings, original SIL OFL 1.1 licences and source/hash manifest. Font acquisition is now complete; audio remains deferred. src/index.css loads local files with swap and fallbacks, without runtime external requests.

Sources: [Nunito](https://fonts.google.com/specimen/Nunito/about),
[Baloo 2](https://fonts.google.com/specimen/Baloo+2/about). Exact upstream file sources
and hashes are recorded in `public/fonts/manifest.json`; licences ship with the files.

## Review and verification

Run `npm run dev`, then visit `/assets/reviews/phase-3/preview.html`. It loads the actual
optimized GLBs with GLTFLoader/Meshopt through drei, game Lighting/Sky, a native clip
selector, first-person camera mode and the SVG/font gallery. Review images and exact
saved revisions/program refs are under `assets/reviews/phase-3/`; completed-models.png
is the batch sheet. Canonical editable source and ZIP bundles match the pinned revisions.

All models have material-faithful GPU review, all requested clips have five sampled
GPU poses, and native clips/nodes/scale are tested on optimized derivatives. Walk is
checked at 65 phases; the sampled soles stay above the ground tolerance. FP clips are
checked at 65 phases against the adapted eye plane. These are discrete checks, not a
continuous collision/IK guarantee. No hardware frame-rate target is certified.

76 project tests pass, including seven new asset/clip/SVG/font checks. Production build
passes with the existing large-bundle warning; targeted lint has no errors (isolated
preview Fast Refresh warnings remain). UV pruning was corrected so the runtime face
texture can be assigned later; semantic anchors and variant groups survive optimization.

Main world/base placement is preserved. This delivery completes the asset gate, not the
Phase 3 playable interior, actor controllers, task targeting, tool VFX or interaction flows.
