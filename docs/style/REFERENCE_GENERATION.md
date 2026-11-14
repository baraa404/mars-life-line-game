# Mars reference generation — 2026-11-12

## Individual object reference extension — 2026-11-13

The owner requested every missing physical game object as a separate image for later
3D modeling, saved immediately under `models and assets images/`. The library
[index](<../../models and assets images/README.md>) maps catalog objects to their images.
`generation-plan.json` and individual `*-provenance.json` retain briefs, full prompts,
input reference paths and built-in ImageGen output paths. No CLI/API fallback was used.

Connected references use shared source images: landing cabin → existing landing ship;
greenhouse interior → new exterior; standalone tray → greenhouse interior;
dirty ice crate → clean crate; seed packets → common packet design;
comms/weather desks → existing Station console; shelter → existing shelter exterior;
track skirts → approved Box Buddy. Objects retain the ivory/slate/orange family.

Review includes file decoding, catalog coverage, original-reference hashes and visual
inspection of every new image. Rejected newly generated attempts live under
`models and assets images/` with an `-alternative` filename suffix; they are excluded from the modeling index.
Crop-stage and filter-state images contain variants of the same asset. Other new object
files each isolate one object; interior cutaways show that room's installed contents.

These images establish appearance and construction cues. Catalog dimensions and named
nodes remain the modeling requirements. No new palette tokens, 3D exports or gameplay
completion boxes were changed. Native UI, effects, audio, credited NASA-source images and
campaign illustration work remain their respective implementation tasks.

The registered Kiln workspace tools and unrelated app integrations were not needed for
this image-only task. Only local file tools and the built-in ImageGen tool were used.

## Earlier Mars style-sheet conversion

Tool: built-in ImageGen, reference-guided generation/editing. No CLI/API fallback was used.
The user approved the primary Mars asset sheet, then authorized the full setting conversion
and asked for all four supplementary sheets to be regenerated with improved presentation.

## Shared prompt direction

Stylized low-poly 3D, chunky miniature proportions, large crisp chamfers and thick frames.
Satin ivory-white machinery, slate-grey bands, bold orange painted panels, dark navy
recesses and rare small cyan indicators. Matte rust-red / terracotta terrain, pale ochre
lit tops, muted plum shadows, warm directional sun and soft fill. Sand-cream sheet
backgrounds, dark short labels, thin dividers, generous spacing and fully framed objects.
Keep whites readable. Avoid detailed PBR textures, grime, tiny greebles, mirror metal,
large emissive faces, excessive bloom and watermarks. The hero scene governs smooth ground.

## Prompt set and saved outputs

1. **`references/03-asset-style-sheet.png`** — preserve the previous category layout and
   exact asset family: stocky astronaut turnarounds, six-wheel rover, octagonal habitat,
   geodesic greenhouse, corridor, framed crate, tanks, solar panel, dish and beacon.
   Reinterpret for Mars with rust/ochre terrain and a clean cream catalogue layout.
   Include palette swatches, material spheres and chunky geometry examples.
2. **`references/01-hero-scene.png`** — preserve the outpost composition: dome left,
   habitat/dish center-right, rover right, crate near left foreground and a broad readable
   middle ground. Apply the approved Mars sheet's asset colours. Smooth red dust, sparse
   pebbles, rover tracks, faceted half-buried rocks, eroded mesas fading into peach haze.
   Replace the old celestial backdrop with a dusty atmospheric sky. No extra characters,
   vehicles or HUD. Keep small amber and cyan lights readable in daylight.
3. **`references/02-style-board.png`** — top row palette, four material spheres and geometry;
   middle row asset family; bottom left terrain and mesas; bottom right miniature outpost
   landscape illustrating peach haze. Match the approved sheet and new hero lighting.
4. **`references/generated/g01-construction-details.jpg`** — improved 3×2 close-up grid:
   chamfered structural corner, octagonal airlock and steps, recessed window strip,
   heavy plinth, corridor wrap-around ribs, cyan cube beacon and small amber wall lamp.
5. **`references/generated/g02-more-props.jpg`** — seven readable catalogue items:
   stacked cargo crates, generator, fuel pump with thick hose, railing, storage rack,
   freestanding octagonal airlock ring and wheeled tool cart. Improve silhouettes and
   dimensional layering while preserving the object categories.
6. **`references/generated/g03-small-items.jpg`** — eight items in a 4×2 grid: O2 canister,
   battery, toolbox, wrench, medkit, data pad, rations and a transparent jar containing a
   red faceted rock. Practical handheld forms, generous spacing, no oversized pedestals.
7. **`references/generated/g04-terrain-variety.jpg`** — two-row terrain kit: pebbles,
   small rock, medium boulder, large boulder, cluster, two shallow craters, broken-edged
   mesa slab, eroded ridge and smooth mottled ground patch. Improve irregularity and
   variation; use squashed flat-bottom rocks with broad faces rather than regular spheres.
8. **`references/generated/g05-pebble-box-buddy.jpg`** — user-approved PEBBLE helper
   robot ("Box Buddy", chosen from three tracked concepts): rounded-cube ivory body with
   orange side panels, two tank-tread tracks with orange hubs, small head on a short neck,
   dark screen face with cyan eyes, one cyan antenna beacon, two two-finger grippers (no
   brush). Three-quarter, side and back views. Inputs: `crops/vehicles.png` and
   `crops/characters.png` as style references, then the chosen concept as edit target to
   replace the brush with a gripper.

Inputs for steps 1–2: the corresponding v1 primary images, then the approved Mars sheet.
Inputs for steps 3–7: the corresponding v1 sheet as edit target, the approved Mars asset
sheet as style reference and the new Mars hero as lighting reference. The v1 inputs are
preserved in `archive/v1/`; they are excluded from the active project profile.

Built-in PNG outputs for the four supplementary sheets are encoded as quality-95 JPEGs
at the existing `.jpg` paths using Sharp. Primary images remain PNG. Crops are generated
by `scripts/crop-references.mjs`, using normalized regions for the current layouts.

## Review

All seven generated images were visually inspected. The new utility and equipment
sheets separate objects more clearly; the terrain sheet improves squat irregular rocks
and adds an eroded ridge rather than repeating regular spherical forms. The construction
sheet shows clean large bevels and a cyan beacon consistent with the main asset sheet.

Known drift: sheet display ground can be triangulated; the actual ground follows the
smooth hero scene. Material spheres can show stronger highlights than intended; numeric
roughness and metalness come from tokens. Display scales are illustrative. The reference
images are concepts, not exported 3D models or screenshots of the empty test world.
