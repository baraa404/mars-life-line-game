# Applying the Style in Kiln

How [`STYLE_GUIDE.md`](STYLE_GUIDE.md) turns into Kiln source code. Read the guide first.

## The two generated files

Both are written by `npm run style:sync` from `src/style/tokens.json`. Never hand-edit them.

| File | Purpose |
| --- | --- |
| `assets/style/mars-style.header.kiln.js` | Paste at the top of every `.kiln.js` source |
| `assets/style/kiln-project.json` | Design profile pushed into the Kiln project `mars-life-line` |

The Kiln project carries the style text, palette, material roles, conventions, delivery
profile and every reference image (the three primary Mars references, the category crops and the
supplementary sheets, with hashes). Select it on every call with
`projectId: "mars-life-line"` (CLI `--project mars-life-line`). It is guidance for the
author, not automatic recolouring.

## What the header gives you

```js
const M = styleMaterials();   // shared materials, one per role
// M.panel  M.panelGray  M.accent  M.trim  M.glowWarm  M.glowCool  M.glowBlue  M.glass
// M.visor  M.solarCell  M.rock   M.rockLight  M.rockShadow
PALETTE['accent-orange']      // 0xFF8A24, for the rare case you need a raw colour
SEGMENTS.small / .default / .large   // 8 / 12 / 16 radial segments
bevel(w, h, d)                // roundedBoxGeo radius at 9 % of the smallest dimension (pass a ratio up to ~0.25 for octagon-like corners)
BUDGETS['vehicle']            // upper triangle budget per category
```

Material names in the GLB equal the role (`smooth-structure`, `emissive-warm`, ...), so the
game can find and tune them. Variants are named `role:token`, e.g. `smooth-structure:structure-gray`.

## Minimal source skeleton

```js
// <paste assets/style/mars-style.header.kiln.js here>

const meta = { name: 'Supply crate' };

async function build() {
  const root = createRoot('SupplyCrate');
  const M = styleMaterials();
  const W = 1.2, H = 0.9, D = 0.9;

  createPart('Body', await roundedBoxGeo(W, H, D, bevel(W, H, D), { style: 'chamfer' }), M.panel,
    { position: [0, H / 2, 0], parent: root });
  createPart('Stripe', boxGeo(W + 0.01, 0.12, D + 0.01), M.accent,
    { position: [0, H * 0.7, 0], parent: root });

  defineBudget({ triangles: BUDGETS['small-prop'] }, root);
  return root;
}
```

## Helper choices that match the style

| Need | Helper |
| --- | --- |
| Manufactured block with soft edges | `await roundedBoxGeo(w, h, d, bevel(w,h,d), { style: 'chamfer' })` (`'round'` for suits/soft gear) |
| Cylinders, tanks, wheels | `cylinderGeo(rTop, rBottom, h, SEGMENTS.default)` |
| Faceted rocks/boulders | `await hull('Rock', ...chunks, { smooth: false })` |
| Dome / window glass | `M.glass` (alpha-blended `glassMaterial`) |
| Helmet visor / windshield | `M.visor` (opaque dark navy, glossy) |
| Rows of repeated parts | `arrayLinear`, `repeatAlongCurve`; mark with `repeatInstances(parent)` |
| Triangle budget | `defineBudget({ triangles: BUDGETS[cat] }, root)` |

Use `kiln_discover({ query })` in modelling language for anything else.

## Review settings

- Render with GPU (`--render gpu` / default auto with emissive materials). Read
  `viewFidelity.materialFaithful` before judging colour or glow.
- If a white part merges with the grey backdrop, use `backdrop: "dark"`.
- Do not darken colours to compensate for preview lighting; the game lighting is the target.
