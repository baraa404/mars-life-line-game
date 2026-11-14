# Battery bank — Phase 2

Sole visual reference: `models and assets images/battery-bank.webp`.
The user explicitly requires each asset to follow its own image. No other reference image governs this model. Existing style tokens supply material values.

## Result

Recreated the original generic cabinet with a chamfered pressure housing, full octagonal end frames, recessed ivory end plates and orange inserts, inset handles and bolt recesses, three stepped front covers, sloped instrument fascia, nine gauge segments (seven illuminated), separate status screen, roof hatch seams and handles, capped cyan beacon, four mounting shoes and clamp hinges. The back repeats the cabinet's unillustrated structural section; only the front, top and left end are evidenced by the image.

- Saved project collection asset: `a_e98ced26f5bf4fe1b21c08b4d9c34430`.
- Revision: `r_e3967df424964d8da20080f1bbddd15c`; parent: `r_f394129601a2467a8ab228f6e523c440`.
- Program: `p_77ec7bf1c763`.
- Editable source: `assets/source/battery-bank-reference-recreation.kiln.js`.
- Game model: `public/models/battery-bank.glb`, 124,104 bytes. 2,884 unique-buffer triangles, 5,312 placed triangles.
- Measured extents: X 1.26 m depth, Y 1.5705 m height, Z 2.43 m width. Instruments face +X; feet contact Y=0.
- Preview: `assets/reviews/battery-bank-reference-recreation.png`; camera: `assets/reviews/battery-bank-camera.json`.
- Test-world position: (0, 0, 10), Y rotation -60 degrees, cuboid colliders.

## Verification

Material-faithful GPU reference view and in-game close-up reviewed on 2026-11-12. Optimized GLB checked for `charge_bar`, all nine `Mesh_charge_segment_N` children, and `info_anchor`. Segment materials have small roughness differences to preserve independent lamp meshes through deduplication/instancing. Seven lamps start illuminated, matching the reference. Gameplay percentage binding remains Phase 2.C work.

Kiln export integrity and node readiness pass. Intentional overlaps attach panel inserts, washers and hinge pins; automated pair analysis covers only 64 overlapping pairs and is not a complete assembly proof. No frame-rate qualification is claimed. This is a visual recreation of the supplied single view, not an exact reconstruction of unseen surfaces.

