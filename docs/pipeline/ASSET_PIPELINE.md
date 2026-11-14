# Asset Pipeline

**Phase 2 user direction (2026-11-12):** use only each asset's matching image in
`models and assets images/`
for visual design and review. These images already contain the approved style and
override the generic reference steps below. Inspect first; regenerate only a clearly
defective reference, archive its original, and review the replacement before modeling.
Keep catalog scale/nodes and token material values. Check off verified model assets
separately from their future gameplay wiring.

From a text or image request to a styled, optimized GLB in the asset library.

**Phase 2 layout:** `AssetGallery` stays unmounted; `BaseSite` places selected
saved models through `siteLayout.ts`. Ingest updates the library/manifest.
Add a deliberate site placement when a newly ingested model should enter the
world; do not restore the automatic asset display row. See `docs/tech/world.md`.

```
request (text + optional image)
  → look             open the category reference crop + hero scene (the images are the style)
  → brief            assets/briefs/<id>.md, names the closest reference and traits to copy
  → author in Kiln    kiln_workspace MCP, source starts from the style header
  → review + refine   GPU render compared side by side with the reference crop
  → save              Kiln collection "project" (assets/kiln/), project mars-life-line
  → ingest            npm run asset:ingest  (Kiln export → glTF Transform → manifest)
  → test in world     npm run dev, walk up to it
```

## 1. Request

Give the agent:

- **What it is**, what it's for, and roughly how big (or "use the style scale").
- **Optional reference images**: drop them in the chat or in `assets/briefs/refs/`.
  Your image decides what the object *is* (parts, function, silhouette). The project's
  style references decide how it *looks*, so a realistic photo still comes out Terracotta Mars.
- **Optional constraints**: must fit through a door, has a working hatch, needs a light, etc.

Example: *"Create a supply crate, about 1 m, with a lid and an orange stripe. Reference attached."*

## 2. Look at the style references

Mandatory before any authoring. The agent opens (with the Read tool) the category crop(s)
listed in [`STYLE_GUIDE.md` section 1](../style/STYLE_GUIDE.md#1-reference-library), the
hero scene, and any matching supplementary sheet in `docs/style/references/generated/`.
The guide text describes the images; the images are the authority.

If nothing in the library resembles the request (say, an interior or a creature), the agent
generates a supplementary sheet with its image generation tool (Cursor or Codex), attaching the primary Mars references and
the closest crops as references. It then reviews the sheet against the primary Mars references and adds it
to the library table with its drift noted.

## 3. Brief

The agent writes `assets/briefs/<id>.md` from
[`ASSET_BRIEF_TEMPLATE.md`](ASSET_BRIEF_TEMPLATE.md): category, triangle budget (from
`src/style/tokens.json`), dimensions, parts, material roles, **the closest style reference
and 3–5 traits to copy from it**, and a colour-blocking target.
The brief is the record of what was asked for, and is what review is checked against.

## 4. Author in Kiln

Rules for the agent (full details in [`docs/style/KILN_STYLE_BRIEF.md`](../style/KILN_STYLE_BRIEF.md)):

1. Read `AGENTS.md`, `skills/kiln-author-asset/SKILL.md`, the style guide and the brief.
2. Paste `assets/style/mars-style.header.kiln.js` at the top of the source. Use only its
   `styleMaterials()`, `PALETTE`, `SEGMENTS`, `bevel()` and `BUDGETS`.
3. Call `defineBudget({ triangles: BUDGETS['<category>'] }, root)`.
4. Pass `projectId: "mars-life-line"` on every `kiln_render`, `kiln_edit`, `kiln_inspect`
   and `kiln_save` call (CLI: `--project mars-life-line`).
5. Use `kiln_discover` to find helpers. Don't guess API names.

## 5. Review and refine

- Render with GPU (`materialFaithful: true`) at a 3/4 angle similar to the reference crop.
  A CPU view shows only shape, not material.
- Open the render **and the brief's style reference side by side** and run the checklist
  in `STYLE_GUIDE.md` section 9. Typical misses: chamfers too small, orange too timid,
  parts too thin.
- Record what matched and what still differs in the brief's Result section.
- Fix problems with `kiln_source` + `kiln_edit`, re-render, and repeat until it passes.
- Optional: `npm run kiln:view` opens Kiln's local dashboard (Live Review, Library).

## 6. Save

`kiln_save` with `collection: "project"`, `projectId: "mars-life-line"`, a clear `name`,
the brief text and attribution. This writes the editable source, GLB and preview into
`assets/kiln/`. Refinements later are saved as child revisions of the same asset.

## 7. Ingest into the game

```sh
npm run asset:list-kiln                          # saved Kiln assets, newest revision each
npm run asset:ingest -- "Supply crate"           # by name or Kiln asset id
npm run asset:ingest -- "Supply crate" --pos 4,0,-6 --rot-y 30 --collider cuboid
npm run asset:list                               # what the game currently loads
npm run asset:remove -- supply-crate             # unload from the game (Kiln copy stays)
```

`ingest` does, in order:

1. `kiln export <asset> <revision> --format glb` into `assets/exports/<asset>/<revision>.glb`
   (raw, never overwritten, gitignored, reproducible from the saved revision).
2. glTF Transform: `dedup → instance → weld → prune → meshopt`. No `flatten`/`join`, so node
   names, anchors and faceted normals survive. Output: `public/models/<id>.glb`.
3. Writes/updates the entry in `src/game/assets/assetManifest.json` with the exact Kiln
   revision, placement, collider and size stats. Re-ingesting keeps placement and collider.

Animated models and assets with named hatch/ramp, nozzle/window, cable connector or
charging-arm, roof, door-leaf, dish and antenna nodes retain their hierarchy:
the `instance` transform skips them and pruning keeps empty leaves/anchors.
This prevents repeated mesh batching from stripping future interaction targets. `AssetModel` currently plays `Friendly_Wave` when that named clip is present.
Manifest triangle statistics count unique mesh buffers; a model's full placed triangle
count can be higher where multiple nodes reuse a mesh.

Placement defaults to an automatic row on the test pad in front of the spawn point.
Colliders: `hull` (default), `cuboid`, `trimesh` (exact, heavier), `none`.

## 8. Test in the world

`npm run dev` → walk up to the asset in first person. Check it under the real game
lighting, at real scale, next to other assets. If it looks wrong here, go back to step 5;
the Kiln preview alone is not acceptance.

## Changing the style

See `STYLE_GUIDE.md` section 10. Short version: change reference images first if the look itself changes, then edit `src/style/tokens.json`, run
`npm run style:sync`, update the docs and changelog.

The Kiln subprocess output buffer is 64 MiB: saved catalog records can exceed Node’s
1 MiB default. This changes catalog transport capacity, not model size limits.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Agent has no `kiln_*` tools | Cursor: enable `kiln_workspace` in Settings → MCP, new chat. Codex: `codex mcp list` in the project (see `docs/tech/agents.md`) |
| Agent sees a server named `kiln` | That's another installation; disable it, use `kiln_workspace` |
| "stale workspace" error | `npm run kiln:check`, then upgrade (see `docs/tech/kiln.md`) |
| Render reports CPU fallback | `npm run kiln:status`; GPU service starts on demand |
| GLB missing in the world | `npm run asset:list`; check browser console for 404 |

## Runtime texture and Phase 3 anchors

Optimization retains UV attributes even when the saved material has no texture yet,
so screen_face can receive a face texture at runtime. Phase 3 screen, sleep/wait,
lever/needle, frost, hatch wheel and kit variant/tile targets skip global instancing
and preserve empty leaves. Native animation bindings remain protected.
