# Asset brief: <Name>

Copy to `assets/briefs/<id>.md` (id = lowercase-with-dashes) and fill in before authoring.

- **Id:** `<id>`
- **Request:** <the user's words, verbatim>
- **Category:** small-prop | medium-prop | vehicle | building | character | rock
- **Triangle budget (LOD0):** <from tokens.json geometry.triangleBudgets>
- **Overall size (m):** <L × H × W>, rests on Y = 0, faces +X
- **User references:** <image paths or "none">; what the object *is* (parts, function, silhouette)
- **Style reference (required):** <closest crop/sheet from STYLE_GUIDE.md section 1, e.g. `crops/props.png` (crate)>
- **Traits to copy from it:** <3–5 concrete traits, e.g. "grey frame wraps every edge", "orange face panels", "glowing slits">
- **Colour blocking target:** <white / grey / orange / dark / cyan shares, from STYLE_GUIDE.md section 3>

## Parts

| Part | Shape | Material role | Notes |
| --- | --- | --- | --- |
| Body | chamfered box | smooth-structure | |
| Stripe | box inset | accent-paint | |
| Light | small box | emissive-warm | |

## Functional requirements

<openings, moving parts, things that must fit; or "none">

## Style notes

<anything specific beyond STYLE_GUIDE.md; or "none">

## Result (filled in after saving)

- **Kiln asset / revision:** `<assetId>` / `<revisionId>`
- **Measured size / triangles:** <from render receipt>
- **Game id:** `<id>` (after `npm run asset:ingest`)
- **Side-by-side review:** <render path vs reference; traits matched; what still differs>
- **Known limitations:** <or "none">
