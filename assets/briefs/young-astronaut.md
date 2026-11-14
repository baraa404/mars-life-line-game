# Asset brief: Young Astronaut

- Id: `young-astronaut`
- Request: "yes create it and add it in teh game to see it"
- Approved design: `assets/concepts/young-astronaut-concept-01.png`, explicitly approved in chat.
- Category: character; LOD0 triangle budget: 8,000.
- Target height: 1.8 m; Y=0 ground; +X forward.
- Style references: `docs/style/references/crops/characters.png`, full Mars hero scene, and approved concept sheet.
- Copy: oversized opaque navy helmet and side pucks; stocky padded ivory suit; slate structural bands, gloves and heavy boots; substantial orange shoulder/elbow/knee/belt pads; chamfered backpack with a small cyan screen.
- Colour target: approximately 65% ivory, 15% slate, 15% orange, dark visor and rare cyan indicator.

## Parts and motion

Helmet shell/visor, collar, chest control blocks, padded torso/hips, paired shoulder/elbow/wrist and hip/knee/ankle groups, boots, gloves, backpack. Use the shared style materials. Movable rigid joint hierarchy and a friendly wave clip; no smooth skin deformation or facial rig. Preserve joint targets through optimization. Fixed display placement next to the rover, clear of spawn and rover.

## Result

- Kiln asset: `a_aac4382a07df4b248de3463ab18da0ae`; revision: `r_819a2302d3e94039b493787f87f8f8b1`.
- Final programRef: `p_dc509fe44c60`; source: `assets/source/young-astronaut-final.kiln.js`.
- Measured: 0.876402 × 1.8 × 1.084661 m; 6,088 placed triangles; 77 mesh nodes, six distinct materials; triangle budget passes. Soles at Y=0.
- Game id: `young-astronaut`; optimized GLB 83,732 bytes (raw 122,048). Placement `(0.65,0,3.6)`, Y rotation −100°, scale 1.
- Compared GPU front/3-quarter/side/back views against approved concept and character crop. Matches ivory/navy/slate/orange colour blocking, oversized helmet, side pucks, orange pads, chest controls and cyan backpack display. Fine helmet panel seams and glove detail are simplified for the game geometry budget.
- Seven material-faithful animation phases reviewed. Loop endpoints close; both feet remain at ground level. Export integrity accepted with no export warnings. Overlap observer reports embedded suit details; bounded pair analysis is not a continuous collision check.
- Actual optimized GLB loaded through Three.js GLTFLoader/MeshoptDecoder; 16 joint nodes, native Friendly_Wave clip and moving shoulder verified. Browser preview shows the astronaut waving in the Mars scene. Screenshot: `assets/reviews/young-astronaut-in-game.jpg`.
- Verification: production build, lint (existing repository-wide warnings), existing collider regression checks. Targeted AssetModel lint has no findings.
- Limitations: rigid segmented articulation, no skin weights, facial rig or finger articulation. Display character, no player/NPC controls; collider disabled so animated limbs do not have stale fixed colliders. No new runtime-performance target was requested.


## Idle and Walk revision — 2026-11-13

Animation reference: `models and assets images/young-astronaut-clips.webp`.
The accepted astronaut geometry and Friendly_Wave are retained. Idle adds a gentle
upper-body/head motion; Walk adds opposing hip/knee/arm motion and a pelvis-height
curve fitted to the actual rigid soles at 33 samples. The optimized walk is checked
at 65 phases for ground clearance. This is an in-place walk for Station View;
world movement and a Station View actor controller remain separate.

Child revision `r_c40080a6bd85476681a3ba0a6b3e27b0` of asset `a_aac4382a07df4b248de3463ab18da0ae`, programRef `p_eb00e53709d8`. Exact source `assets/source/phase-3/young-astronaut-final.kiln.js`. Model height 1.8 m; 6,088 placed triangles; 87,844 optimized bytes. Five GPU phases reviewed for Idle/Walk; loops close. 76 tests and build pass.
