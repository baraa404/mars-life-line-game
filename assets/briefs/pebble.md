# pebble

Sole visual reference: `docs/style/references/generated/g05-pebble-box-buddy.jpg`. Inspected before authoring; kept unchanged.

Box Buddy approved sheet: compact ivory head/neck/body, orange cheek panels and ear discs, two continuous tank-tread belts with orange hubs, two articulated two-finger grippers, wrist nozzle, one cyan beacon. 0.6 m class.

Generated Mars header materials; metres,+Y up,+X forward. Runtime/library integration only; mission scene interactions remain separate.

## Result

Completed 2026-11-13.

- Collection `project`, asset `a_55d0db4c8f1d4c83b0f0b92b1768439c`, revision `r_53e22bce317d430dab423745b084e8a9`, programRef `p_760848a5bbac`.
- Exact source `assets/source/phase-3/pebble-final.kiln.js`; editable ZIP `assets/reviews/phase-3/bundles/pebble.zip`; optimized GLB `public/models/pebble.glb`. Default legacy converter, editable export, then Meshopt derivative.
- Measured X × Y × Z: 0.519 × 0.731 × 0.600 m; 4,410 placed triangles; 108,648 optimized bytes. Declared budget passes.
- Material-faithful GPU review: `assets/reviews/phase-3/pebble-final.png`; camera and receipts alongside it. Reference PNG unchanged.
- Native clips: `Idle`, `Drive`, `TurnInPlace`, `Happy`, `Worried`, `Hide`, `Clean`, `Grip`, `HeadTilt`, `Reboot`, `Charge`, `Point`. Five material-faithful GPU phases (0, .13, .31, .67, 1) reviewed per clip; declared loops close. Native bindings/finite transforms checked after optimization.
- Both belts have circulating pads in Drive and opposite circulation in TurnInPlace. Flat UV-mapped screen_face plus face_default geometry; hide face_default when mapping an expression. SVG TextureLoader images need flipY=true for this authored panel. Standalone clips are in-place actor motions: runtime travel, panel air-puff VFX, jobs and face-state selection remain gameplay work.
- Verified through GLTFLoader/MeshoptDecoder; semantic nodes and scale checks pass. All 76 project tests and production build pass. Scene placement and gameplay wiring remain separately tracked.

Ten targeted rest-pose surface checks cover both arms from body to palm: body/socket seams are 2.5 mm, link/elbow/forearm/palm surfaces touch. Receipt: assets/reviews/phase-3/pebble-interfaces.json. Unsigned surface distances do not certify strength or continuous animated collision clearance.
