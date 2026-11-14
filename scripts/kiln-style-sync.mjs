#!/usr/bin/env node
// Generates the Kiln-side style artifacts from src/style/tokens.json:
//   assets/style/kiln-project.json          Kiln project draft (design profile, references)
//   assets/style/mars-style.header.kiln.js  paste-in material/palette block for .kiln.js sources
// then creates or updates the Kiln project "mars-life-line".
// Usage: node scripts/kiln-style-sync.mjs [--dry-run]

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_ID = 'mars-life-line';
const dryRun = process.argv.includes('--dry-run');

const tokens = JSON.parse(readFileSync(join(root, 'src/style/tokens.json'), 'utf8'));
const hexOf = (name) => {
  const entry = tokens.palette[name] ?? tokens.atmosphere[name];
  if (!entry) throw new Error(`Unknown palette token: ${name}`);
  return entry.hex;
};

const references = [
  ['hero-scene', '01-hero-scene.png', 'THE TARGET. Base, greenhouse dome, rover, crates, faceted rust-red rocks on smooth dusty ground, eroded mesas and peach atmospheric sky.'],
  ['style-board', '02-style-board.png', 'Palette swatches, material spheres, geometry primitives, environment pieces, lighting panel.'],
  ['asset-style-sheet', '03-asset-style-sheet.png', 'One panel per category: astronauts, rover, habitat/dome/module, props, rocks/crater.'],
  ['crop-characters', 'crops/characters.png', 'Characters: stocky astronaut, big helmet + black visor, orange joint pads, backpack screen.'],
  ['crop-vehicles', 'crops/vehicles.png', 'Vehicles: 6 huge wheels with orange hubs, white/grey armoured body, orange headlight bar, cyan roof bar.'],
  ['crop-vehicles-hero', 'crops/vehicles-hero.png', 'Rover in the hero scene under game lighting.'],
  ['crop-architecture', 'crops/architecture.png', 'Habitat with octagonal glowing door portal, geodesic dome, module with window strip.'],
  ['crop-architecture-examples', 'crops/architecture-examples.png', 'Row of buildings/props in the same style at small scale.'],
  ['crop-architecture-hero-base', 'crops/architecture-hero-base.png', 'Main base in context: stacked blocks, corridor modules, roof antennas and dish.'],
  ['crop-architecture-hero-dome', 'crops/architecture-hero-dome.png', 'Greenhouse dome and crate in context.'],
  ['crop-props', 'crops/props.png', 'Props: crate, tanks, solar panel, dish, cyan beacon, lattice tower; all on chunky plinths.'],
  ['crop-environment', 'crops/environment.png', 'Faceted boulders in clusters, flat mesa rock, crater with raised stepped rim.'],
  ['crop-environment-board', 'crops/environment-board.png', 'Rust-red boulders, layered eroded mesa, angular ridge and shallow crater.'],
  ['crop-environment-hero-ground', 'crops/environment-hero-ground.png', 'Smooth mottled ground with half-buried faceted rocks and pebbles.'],
  ['crop-lighting-atmosphere', 'crops/lighting-atmosphere.png', 'Warm ivory/peach lit faces, muted plum shadows, dusty atmospheric haze and distant mesas.'],
  ['crop-lighting-hero-sky', 'crops/lighting-hero-sky.png', 'Dusty rose-to-peach sky, layered eroded mesa horizon and warm haze; no prominent planet or star field.'],
  ['crop-palette-materials-geometry', 'crops/palette-materials-geometry.png', 'Palette swatches, matte/satin/emissive material spheres, chunky primitives; tokens define numeric values.'],
  ['gen-construction-details', 'generated/g01-construction-details.jpg', 'Supplementary Mars sheet (primary references win): chamfered corner, door portal, window strip, plinth, rib bands, lights.'],
  ['gen-more-props', 'generated/g02-more-props.jpg', 'Supplementary Mars sheet (primary references win): containers, generator, fuel pump, railing, rack, airlock ring, tool cart.'],
  ['gen-small-items', 'generated/g03-small-items.jpg', 'Supplementary Mars sheet (primary references win): pickup items. Drawn oversized; keep real scale.'],
  ['gen-terrain-variety', 'generated/g04-terrain-variety.jpg', 'Supplementary Mars sheet (primary references win): rust-red rock/crater/mesa/ridge range; irregular squashed half-buried boulders, smooth ground patch.'],
].map(([id, file, description]) => {
  const path = join(root, 'docs/style/references', file);
  const sha = createHash('sha256').update(readFileSync(path)).digest('hex');
  return { id, title: file, uri: relative(root, path), description, sha256: `sha256:${sha}` };
});

const style = [
  'THE REFERENCE IMAGES ARE THE STYLE. Before authoring, open the crop for the asset category (references crop-*) and the hero scene; after rendering, compare side by side. If text and image disagree, the image wins.',
  'Look: tidy, toy-like Mars outpost. Chunky ivory-white machines, thick slate-grey frames, big chamfered corners and bold orange panels on smooth rusty terracotta soil. Irregular half-buried faceted rocks, ochre-lit mesas and dusty peach sky. Warm key, muted plum shadows, warm haze, small amber glows and rare cyan lights. Keep ivory readable; dust is restrained at lower edges. Hero scene governs smooth ground; sheet triangulation is display drift. Never photoreal, gritty or heavily weathered.',
  'Shape: chamfer hard, about 6-12% of the smallest dimension; big structural corners cut until they read as octagons (door portals, crates, modules). Thick frames, ribs, plinths and rims; only masts and lattice struts are thin. Build from 2-3 stacked or butted chamfered blocks, not one extrusion. Props stand on heavy chamfered plinths (white with an orange band). Grey bands wrap edges and ends. Rocks, boulders and mountains are faceted (hull smooth:false); never include ground in an asset.',
  'Colour blocking: white body, grey frames, bands and chassis, and orange as LARGE flat panels (corner or side panels, crate faces, dome base band, suit pads, wheel hubs), typically 10-35% of an object. Cyan is rare: 1-2 small lights per object. Emissives are outlines inside recesses, horizontal strips or small squares, never whole faces.',
  'Category cues: astronaut about 4.5 heads tall, big round helmet with glossy black visor, orange pads at shoulder/elbow/knee/belt, backpack with cyan screen. Rover: 6 huge wheels (about 40% of height) with orange hubs, wedge-front armoured body, orange headlight bar, cyan roof bar. Habitat: octagonal door portal with glowing orange inner outline, grey doors and steps. Dome: thick white geodesic struts with hub plates, warm interior glow, orange/white base ring.',
  'Materials: flat colours, no textures or normal maps, metalness <= 0.1, no mirror reflections; name each material by its role.',
  'Avoid: photorealism, PBR textures, random palettes, excessive neon, timid bevels, thin fiddly parts, clutter.',
  'Full guide: docs/style/STYLE_GUIDE.md. Values: src/style/tokens.json.',
].join('\n');
if (style.length > 4000) throw new Error(`design.style is ${style.length} chars; Kiln allows 4000`);

const materialRoles = Object.entries(tokens.materials).map(([role, m]) => {
  const values = [
    `colours ${m.colors.map((c) => `${c} ${hexOf(c)}`).join(', ')}`,
    `roughness ${m.roughness}`,
    `metalness ${m.metalness}`,
    m.emissive ? `emissive ${hexOf(m.emissive)} x${m.emissiveIntensity}` : null,
    m.opacity !== undefined ? `opacity ${m.opacity}` : null,
  ].filter(Boolean);
  return { role, description: `${m.description} (${values.join('; ')})` };
});

const budgets = Object.entries(tokens.geometry.triangleBudgets)
  .map(([k, [lo, hi]]) => `${k} ${lo}-${hi}`)
  .join(', ');
const s = tokens.scale;

const draft = {
  projectId: PROJECT_ID,
  name: 'Mars Life Line',
  brief:
    'Stylized low-poly assets for a browser game set on a Mars outpost (React Three Fiber + Three.js). ' +
    'Every asset follows the shared design profile and reference images. The project defines how things look, not which assets exist.',
  design: {
    style,
    scale: `${tokens.geometry.units}. Reference sizes: astronaut ${s['astronaut-height']} m tall, door ${s['door-height']} m, crate ${s['crate-size']} m, rover ${s['rover-length']} m long, habitat module ${s['habitat-module-length']} m long.`,
    palette: Object.entries({ ...tokens.palette, ...tokens.atmosphere }).map(([role, v]) => ({ role, color: v.hex })),
    materialRoles,
    conventions: [
      'Start every .kiln.js source from assets/style/mars-style.header.kiln.js and use its STYLE materials; do not invent colours.',
      `Triangle budgets (LOD0): ${budgets}. Declare the category budget with defineBudget().`,
      `Radial segments: small ${tokens.geometry.radialSegments.small}, default ${tokens.geometry.radialSegments.default}, large ${tokens.geometry.radialSegments.large}.`,
      'Use gameMaterial with the role name as material name so the game can find and tune materials.',
      'Ground contact at Y=0, +X forward, metres. Keep real-world scale; stylise proportions, not overall size.',
      'Atmosphere entries (sky-*) belong to the backdrop only. The space-deep token is for opaque visors, not the daytime sky.',
      'Name the closest reference crop in the brief before authoring. Review with --render gpu (material-faithful) at a 3/4 angle and compare side by side with that crop (STYLE_GUIDE.md section 9) before accepting.',
    ],
    exceptions: [],
  },
  deliveryProfiles: [
    {
      id: 'web-r3f',
      target: 'three',
      description: 'GLB loaded with drei useGLTF in React Three Fiber; optimized with glTF Transform (meshopt) by scripts/asset-pipeline.mjs.',
      performanceIntent: 'Browser game on integrated GPUs: few materials per asset, flat colours, no textures by default.',
      constraints: ['Self-contained GLB', 'Material names equal style roles', 'No textures unless recorded in the brief'],
    },
  ],
  references,
};

const header = `// ---- Mars Life Line style header (generated by scripts/kiln-style-sync.mjs from src/style/tokens.json, style v${tokens.version}) ----
// Paste at the top of every .kiln.js source. Do not edit colours here; edit tokens.json and re-run npm run style:sync.
const PALETTE = ${JSON.stringify(Object.fromEntries(Object.entries(tokens.palette).map(([k, v]) => [k, Number.parseInt(v.hex.slice(1), 16)])), null, 2)
  .replace(/"([^"]+)": (\d+)/g, (_, k, n) => `'${k}': 0x${Number(n).toString(16).toUpperCase().padStart(6, '0')}`)};

const BUDGETS = ${JSON.stringify(Object.fromEntries(Object.entries(tokens.geometry.triangleBudgets).map(([k, v]) => [k, v[1]])))};
const SEGMENTS = ${JSON.stringify(tokens.geometry.radialSegments)};

// Bevel radius for roundedBoxGeo: ratio of the smallest dimension (style range ${tokens.geometry.bevelRatio.join('-')}).
function bevel(w, h, d, ratio = ${((tokens.geometry.bevelRatio[0] + tokens.geometry.bevelRatio[1]) / 2).toFixed(2)}) {
  return Math.min(w, h, d) * ratio;
}

// One shared material per role. Variants (e.g. structure-gray) take an explicit colour token.
function styleMaterials() {
  const m = ${JSON.stringify(tokens.materials)};
  const make = (role, colorToken) => {
    const spec = m[role];
    const color = PALETTE[colorToken ?? spec.colors[0]];
    const name = colorToken && colorToken !== spec.colors[0] ? role + ':' + colorToken : role;
    if (role === 'glass') return glassMaterial(color, { opacity: spec.opacity, roughness: spec.roughness, metalness: spec.metalness, name });
    const opts = { roughness: spec.roughness, metalness: spec.metalness, name };
    if (spec.emissive) Object.assign(opts, { emissive: PALETTE[spec.emissive], emissiveIntensity: spec.emissiveIntensity });
    return gameMaterial(color, opts);
  };
  return {
    rock: make('matte-environment'),
    rockLight: make('matte-environment', 'regolith-light'),
    rockShadow: make('matte-environment', 'shadow-plum'),
    panel: make('smooth-structure'),
    panelGray: make('smooth-structure', 'structure-gray'),
    accent: make('accent-paint'),
    trim: make('dark-trim'),
    glowWarm: make('emissive-warm'),
    glowCool: make('emissive-cool'),
    glowBlue: make('emissive-cool', 'accent-blue'),
    glass: make('glass'),
    visor: make('visor'),
    solarCell: make('solar-cell'),
  };
}
// ---- end style header ----
`;

mkdirSync(join(root, 'assets/style'), { recursive: true });
const draftPath = join(root, 'assets/style/kiln-project.json');
writeFileSync(draftPath, JSON.stringify(draft, null, 2) + '\n');
writeFileSync(join(root, 'assets/style/mars-style.header.kiln.js'), header);
console.log('wrote assets/style/kiln-project.json and assets/style/mars-style.header.kiln.js');

if (dryRun) process.exit(0);

const kiln = (...args) => {
  const out = execFileSync(process.execPath, [join(root, 'kiln.mjs'), ...args], { cwd: root, encoding: 'utf8' });
  try { return JSON.parse(out); } catch { return out; }
};

let existing = null;
try { existing = kiln('project', 'get', PROJECT_ID); } catch { existing = null; }

if (!existing) {
  const res = kiln('project', 'create', '--file', draftPath);
  console.log('created Kiln project', PROJECT_ID, res?.revisionId ?? res?.project?.revisionId ?? '');
} else {
  const expected = existing.revisionId ?? existing.project?.revisionId ?? existing.revision?.revisionId;
  if (!expected) throw new Error('Could not read current project revision from `kiln project get` output');
  // inventory and reviews are omitted so Kiln keeps them; every supplied top-level field is replaced.
  const { projectId: _id, ...patch } = draft;
  const patchPath = join(root, 'assets/style/.kiln-project.patch.json');
  writeFileSync(patchPath, JSON.stringify(patch));
  const res = kiln('project', 'update', PROJECT_ID, '--expected', expected, '--file', patchPath);
  console.log('updated Kiln project', PROJECT_ID, res?.revisionId ?? res?.project?.revisionId ?? '');
}
