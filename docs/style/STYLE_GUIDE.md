# Mars Life Line — Visual Style Guide

**Style v2:** Stylized Low-Poly 3D, **Terracotta Mars**.

**Phase 2 override (user direction, 2026-11-12):** each asset follows only its matching PNG in models and assets images/. These images already encode the approved style and override the generic hierarchy below. Keep catalog functional requirements and token material values; regenerate only a clearly defective reference.

## 0. How this guide works

**The reference images are the style.** The user approved the Mars asset sheet before
this conversion. The hero scene shows that asset family under the target game lighting.

- Primary Mars references outrank supplementary sheets. Images win over descriptive prose.
- Exact numeric values live in [`src/style/tokens.json`](../../src/style/tokens.json).
  Tokens win over numbers inferred from an image, including palette swatches.
- Before authoring an asset, open the category crop and full hero scene; compare after rendering.
- The style defines how things look, never which assets must exist. A reference scene is
  an art target, not a claim that those models are already implemented in the game.

## 1. Reference library

Primary references (current Mars direction):

| File | Purpose |
| --- | --- |
| [`references/01-hero-scene.png`](references/01-hero-scene.png) | Outpost composition, smooth dusty ground, faceted rocks, warm sky and atmospheric depth |
| [`references/02-style-board.png`](references/02-style-board.png) | Palette, materials, geometry, asset family and environment lighting |
| [`references/03-asset-style-sheet.png`](references/03-asset-style-sheet.png) | User-approved astronaut, rover, habitats, terrain and utility props |

Category crops in `references/crops/`, regenerated with `npm run style:crops`:

| Category | Crops |
| --- | --- |
| Character | `characters.png` |
| Vehicle | `vehicles.png`, `vehicles-hero.png` |
| Architecture | `architecture.png`, `architecture-examples.png`, `architecture-hero-base.png`, `architecture-hero-dome.png` |
| Props | `props.png`, `architecture-hero-dome.png` |
| Environment | `environment.png`, `environment-board.png`, `environment-hero-ground.png` |
| Lighting and atmosphere | `lighting-atmosphere.png`, `lighting-hero-sky.png`, `environment-hero-ground.png` |
| Palette, materials and primitives | `palette-materials-geometry.png` |

Supplementary Mars sheets (regenerated to improve layout, legibility and shape variety):

| Sheet in `references/generated/` | Use for | Review notes |
| --- | --- | --- |
| `g01-construction-details.jpg` | Chamfers, airlock portal, window strip, plinth, wrap-around ribs, lamps | Keep cyan lights small; emissives are recessed strips or cube heads |
| `g02-more-props.jpg` | Cargo, generator, pump, railing, storage rack, airlock ring, tool cart | Sheet spacing is for presentation; model at functional real-world scale |
| `g03-small-items.jpg` | O2 canister, battery, toolbox, wrench, medkit, data pad, ration, rock sample | Displayed sizes are illustrative; do not enlarge handheld items to furniture size |
| `g04-terrain-variety.jpg` | Pebbles, boulders, clusters, craters, mesa, ridge and ground patch | Use irregular squashed rocks with flat buried bases; never regular balls |
| `g05-pebble-box-buddy.jpg` | PEBBLE helper robot (approved design): body, tracks, head, screen face, grippers | Real size ≈ 0.6 m long, knee high; two tank-tread tracks, no wheels; both arms are grippers, no brush; one cyan beacon only |

**Known primary-sheet drift:** the asset sheet uses triangulated display ground and
near-spherical material swatches. The hero scene governs actual ground: smooth, gently
mottled and matte. Rocks and ridges keep visible facets. Swatches and sphere lighting are
illustrative; use tokens for values, and do not infer gloss for environment materials.

Style v1 images are preserved unchanged in `archive/v1/` for history only. They are not
active references and are not attached to the Mars Kiln project. Never edit originals in
place during later refinement; archive them before an explicitly approved replacement.
Prompt briefs and provenance: [`REFERENCE_GENERATION.md`](REFERENCE_GENERATION.md).

## 2. The look

A tidy miniature Mars outpost under a **dusty peach sky**. **Ivory-white machinery with
thick slate-grey frames and bold orange panels** stands on **smooth iron-oxide red soil**,
among **asymmetric terracotta rocks, ochre-lit slabs and distant eroded mesas**. Warm light
catches broad chamfers; shaded faces turn muted plum or slate. Cream machinery remains
neutral enough to separate from the warm landscape. Small cyan beacons provide a cool
counterpoint. Amber doors and windows glow gently even in daylight.

Priority order:

1. Big chamfers and octagonal sections on manufactured parts.
2. White body, thick grey structure, substantial flat orange painted panels.
3. Chunky compact proportions, oversized helmets and heavy rover wheels.
4. Faceted rocks and ridges against smooth dusty ground.
5. Warm sun, restrained plum shadows, peach haze and readable small emissives.

The finish is clean satin or matte. Fine red dust near feet, wheels and plinth bottoms
is optional and restrained. Avoid grime, dense scratches and an orange filter over everything.

## 3. Colour

| Token | Hex | Use |
| --- | --- | --- |
| `space-deep` | `#20283D` | Opaque dark navy visor and windshield; not the sky |
| `shadow-plum` | `#765768` | Muted shaded environment faces and ambient tone |
| `regolith-mid` | `#B95C40` | Iron-oxide soil and rock midtones |
| `regolith-light` | `#E6A26A` | Pale ochre/terracotta lit tops |
| `structure-white` | `#F2E5D2` | Warm ivory body panels and suits |
| `structure-gray` | `#686976` | Slate frames, ribs, chassis and doors |
| `trim-dark` | `#303240` | Tyres, vents and deep recesses |
| `accent-orange` | `#FF8A24` | Safety paint and warm lights |
| `accent-cyan` | `#54E5F5` | Rare beacon heads and indicators |
| `accent-blue` | `#35CFFF` | Small screens and signal lights |
| `glass-tint` | `#EBD9C5` | Light warm transparent dome panes |
| `cell-blue` | `#2F58B8` | Solar cells |

Atmosphere tokens are separate: `sky-top` `#C98270`, `sky-horizon` `#F2BE92`.
They guide the backdrop and haze, not manufactured asset paint.

### Colour blocking

| Asset | Main body | Frame / mechanical | Orange paint and glow | Dark / cool |
| --- | --- | --- | --- | --- |
| Habitat | ~55% ivory | ~25% grey | ~15% corner panel, portal, windows | Recesses and one small cyan light |
| Crate | ~30% ivory | ~30% grey | ~35% large face panels, small slits | Minor gaps |
| Rover | ~45% ivory | ~25% grey | ~10% hubs, side panel, headlights | ~20% tyres and windshield; small roof light |
| Astronaut | ~65% ivory | ~15% grey joints, boots, gloves | ~15% joint pads and belt | Visor and backpack screen |
| Dome | Thick ivory struts | Grey hubs | Orange base panels and warm interior | Light transparent panes |

Orange is real panel area, not a pinstripe. Grey bands wrap edges and ends. Cyan is
rare: one or two small sources per object. Green is confined to muted greenhouse plants.
Do not paint all equipment rust-red to make it belong on Mars; use terrain and light.

## 4. Materials

| Role | Look | Use |
| --- | --- | --- |
| `matte-environment` | Dry matte, no visible highlight | Rocks, craters, slabs and ridges |
| `smooth-structure` | Satin ivory or slate, broad soft highlight | Machinery and suits |
| `accent-paint` | Orange satin, not glowing | Panels, pads, hubs and bands |
| `emissive-warm` | Small amber/orange glow | Recessed door outlines, window strips, headlights |
| `emissive-cool` | Small cyan source | Beacons, roof bars and screens |
| `dark-trim` | Dark matte slate | Tyres, recesses and vents |
| `glass` | Light warm see-through tint | Dome and window panes |
| `visor` | Glossy opaque navy with a soft highlight | Helmet visors and windshields |
| `solar-cell` | Deep blue semi-gloss | Panels, with white grid bars as geometry |

Flat colours, no detailed PBR texture maps on assets. Material metalness stays at or
below 0.1. Seams are shallow geometry. Ground may use soft mottling or a subtle pit
texture; the current world uses continuous vertex-colour mottling. Optional dust on
assets is a restrained lower-edge tint, not a weathering pass across every surface.

## 5. Lighting and atmosphere

- One low warm key light and soft peach sky fill. Whites stay readable as ivory.
- Shadow faces are muted plum/slate, never crushed black. Shadows are soft and directional.
- The sky grades from dusty rose overhead into pale peach at the horizon.
- Distant mesas lose contrast and blend into warm atmospheric haze.
- The approved daytime composition has no prominent planet or visible star field.
- Orange lights stay small and controlled. Use subtle bloom and local spill when supported;
  the current world does not yet implement bloom or automatic point-light spill.
- Compare models in the game rig; a Kiln studio preview alone does not establish a match.

## 6. Shape language

Primitives: chamfered block, octagonal prism, wedge, frustum and irregular faceted rock.

- Manufactured chamfers: about 6–12% of the smallest dimension. Door portals and major
  corners may be cut harder to form octagonal silhouettes. Soft suit parts get rounded bevels.
- Frames, ribs, plinths, wheels and dome struts are thick. Masts and lattice struts are exceptions.
- Buildings and vehicles use two or three layered blocks, each with its own chamfers.
- Grey frames wrap corners and ends. Heavy plinths ground large props and towers.
- Emissives are inner outlines, strips or small squares; never a whole painted face.
- Radial segments: 8 small, 12 default, 16 for large curved hero surfaces.
- Real-world scale: astronaut 1.8 m, door 2.4 m, crate 1 m, rover 4.5 m, module 8 m.
  Stylization changes proportions, not overall size. Budgets live in tokens.

## 7. Category cues

### Characters

Stocky astronaut about 4.5 heads tall. Large helmet with side pucks, opaque navy visor,
ivory padded suit, orange shoulder/elbow/knee/belt pads, slate gloves and boots.
Chamfered backpack with a small cyan screen. Keep joints and limbs readable.

### Vehicles

Six large chunky treaded wheels on three axles, about 40% of overall height, with orange
hub discs. Ivory wedge-front upper body, grey chassis, sloped dark windshield, orange
headlight strip, small cyan roof bar, restrained roof cargo and one short antenna.

### Architecture

- Habitat: layered chamfered blocks, thick grey octagonal portal, recessed amber inner
  outline, grey double doors and steps, large orange corner panel, small windows and cyan lamp.
- Corridor: long capsule-box with grey wrap-around end ribs, recessed hatch and warm window strip.
- Greenhouse: thick white geodesic struts and broad hub plates, clear warm-tinted glass,
  muted plants and amber interior; alternate white and orange base panels.

### Props

Crates have grey edge frames and large orange faces. Capsule tanks have orange bands
and simple valves. Solar panels have dark blue cells, white grid bars and grey supports.
Dishes are shallow white bowls on grey lattice supports and heavy trimmed plinths.
Cyan cube beacons and orange-tipped lattice towers keep a restrained glow.
Use the supplementary sheets for construction details and handheld equipment.

### Environment

- Ground: smooth dusty terracotta with broad soft mottling, sparse pebbles and optional tracks.
- Boulders: squashed, irregular, half-buried, flat-bottomed; about 10–30 broad visible faces.
- Cluster: one large rock, two to four smaller pieces and a few pebbles.
- Mesa: low layered slab, flat top, chipped/angular edges; eroded ridges form the horizon.
- Crater: shallow broad bowl, raised rim and stepped faceted outer walls.
- Fine details must not obscure the silhouette or make terrain look like noisy PBR rock.

## 8. Principles

Readable primary and secondary forms before detail. Compact proportions, restrained
clutter, consistent bevel density, soft warm/cool contrast and a polished miniature feel.
Avoid photorealism, random colours, excessive neon, heavy grading and mirror metal.
The asset sheet is for presentation; infer neither giant pickups nor faceted ground from it.

## 9. Review

Before accepting an asset:

1. Open the category crop, matching supplementary sheet and hero scene.
2. Render a comparable 3/4 GPU view and require `viewFidelity.materialFaithful: true` for colour review.
3. Compare chunky silhouette, chamfers, white/grey/orange blocking, restrained cyan and matte/satin roles.
4. Check real-world dimensions, triangle budget, ground contact at Y=0 and functional clearances.
5. Check it in the Mars game world; note any differences in its brief.

CPU views establish geometry only. Never compensate for a preview light by darkening albedo.

## 10. Changing the style

1. Generate or add references first and obtain approval for a new direction.
2. Preserve superseded originals outside the active library; update this guide and tokens.
3. Regenerate category crops with `npm run style:crops` when images/layouts change.
4. Run `npm run style:sync` to generate `assets/style/mars-style.header.kiln.js` and update
   the `mars-life-line` Kiln profile with current image hashes.
5. Bump `tokens.version` for breaking visual changes; update docs, shared agent rules and changelog.
6. Verify the game with `npm run build`, `npm run lint` and a browser visual check.

Style v2 replaces the previous art direction. Saved assets do not recolour automatically;
refine any older models before accepting them under this style. The manifest was empty
at the time of this conversion.

## Phase 3 asset and typography record — 2026-11-13

Phase 3 assets follow their matching PNGs under `models and assets images/`;
Box Buddy uses the explicitly approved g05 sheet. Reference images were not changed.
Local Nunito body and Baloo 2 display fonts, both SIL OFL 1.1, replace the initial
system-only choice. Files/licences/source hashes: public/fonts. Assets and review:
`assets/briefs/phase-3-batch.md`.
