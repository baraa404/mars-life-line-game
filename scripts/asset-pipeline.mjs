#!/usr/bin/env node
// Kiln saved asset -> raw GLB export -> glTF Transform optimization -> game manifest.
//
//   node scripts/asset-pipeline.mjs list-kiln                 saved Kiln assets (newest revision each)
//   node scripts/asset-pipeline.mjs ingest <kilnAssetId|name> [revisionId] [--id game-id] [--pos x,y,z] [--rot-y deg] [--scale s] [--collider hull|trimesh|cuboid|none]
//   node scripts/asset-pipeline.mjs optimize <in.glb> <out.glb>
//   node scripts/asset-pipeline.mjs list                      assets registered in the game
//   node scripts/asset-pipeline.mjs remove <game-id>
//
// KILN_CLI overrides the Kiln entry point (default: the workspace launcher ./kiln.mjs).

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, instance, meshopt, prune, weld } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, 'src/game/assets/assetManifest.json');
const exportsDir = join(root, 'assets/exports');
const modelsDir = join(root, 'public/models');
const kilnCli = process.env.KILN_CLI ?? join(root, 'kiln.mjs');

const kiln = (...args) => JSON.parse(execFileSync(process.execPath, [kilnCli, ...args], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'asset';

function readManifest() {
  return JSON.parse(readFileSync(manifestPath, 'utf8'));
}
function writeManifest(manifest) {
  manifest.assets.sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

function flag(args, name) {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  const value = args[i + 1];
  args.splice(i, 2);
  return value;
}

function newestRevisions() {
  const byAsset = new Map();
  for (const rev of kiln('assets').assets) {
    const prev = byAsset.get(rev.assetId);
    if (!prev || rev.createdAt > prev.createdAt) byAsset.set(rev.assetId, rev);
  }
  return [...byAsset.values()];
}

async function createIO() {
  await MeshoptDecoder.ready;
  await MeshoptEncoder.ready;
  return new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
}

// Flatten/join are deliberately not used: they would rename or merge nodes that the game
// and Kiln anchors/colliders address by name. weld() in glTF Transform v4 only merges
// bitwise-identical vertices, so faceted (flat-shaded) normals survive.
export async function optimize(input, output) {
  const io = await createIO();
  const doc = await io.read(input);
  // Global instancing reparents repeated meshes and prunes their semantic parents.
  // Keep independently addressable interaction targets and native animation bindings.
  const preserveHierarchy = doc.getRoot().listAnimations().length > 0 ||
    doc.getRoot().listNodes().some((node) => /^(roof$|wing_roof$|outer_hatch$|inner_hatch$|door_leaf_|dish$|dish_support$|antenna_tower_|hatch$|ramp$|nozzle_|window_|connector_|charging_arm$|screen_anchor$|sleep_interact$|wait_interact$|lever$|gauge_needle$|frost_overlay$|variant_|floor_tile$|ceiling_tile$|hatch_wheel$)/.test(node.getName()));
  const transforms = [dedup()];
  if (!preserveHierarchy) transforms.push(instance({ min: 2 }));
  await doc.transform(...transforms, weld(), prune({ keepLeaves: preserveHierarchy, keepAttributes: true }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  mkdirSync(dirname(output), { recursive: true });
  await io.write(output, doc);

  let triangles = 0;
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const count = prim.getIndices()?.getCount() ?? prim.getAttribute('POSITION')?.getCount() ?? 0;
      if (prim.getMode() === 4) triangles += count / 3;
    }
  }
  return {
    bytesIn: statSync(input).size,
    bytesOut: statSync(output).size,
    triangles,
    materials: doc.getRoot().listMaterials().map((m) => m.getName()),
  };
}

async function ingest(args) {
  const id = flag(args, '--id');
  const pos = flag(args, '--pos');
  const rotY = flag(args, '--rot-y');
  const scale = flag(args, '--scale');
  const collider = flag(args, '--collider');
  if (collider && !['hull', 'trimesh', 'cuboid', 'none'].includes(collider)) throw new Error('--collider must be hull, trimesh, cuboid or none');
  const [ref, revisionArg] = args;
  if (!ref) throw new Error('usage: ingest <kilnAssetId|name> [revisionId] [--id game-id] [--pos x,y,z] [--rot-y deg] [--scale s] [--collider hull|trimesh|cuboid|none]');

  const revisions = newestRevisions();
  const match = revisions.find((r) => r.assetId === ref) ?? revisions.find((r) => r.name === ref || slug(r.name) === ref);
  if (!match) throw new Error(`No saved Kiln asset "${ref}". Run list-kiln to see saved assets.`);
  const revisionId = revisionArg ?? match.revisionId;
  const gameId = id ?? slug(match.name);

  const raw = join(exportsDir, match.assetId, `${revisionId}.glb`);
  if (!existsSync(raw)) {
    mkdirSync(dirname(raw), { recursive: true });
    const receipt = kiln('export', match.assetId, revisionId, '--format', 'glb', '--out', raw, '--json');
    if (receipt.ok === false) throw new Error(`Kiln export failed: ${JSON.stringify(receipt)}`);
  }

  const out = join(modelsDir, `${gameId}.glb`);
  const stats = await optimize(raw, out);

  const manifest = readManifest();
  const previous = manifest.assets.find((a) => a.id === gameId);
  const entry = {
    id: gameId,
    name: match.name,
    file: `/models/${gameId}.glb`,
    kiln: { collection: 'project', assetId: match.assetId, revisionId },
    placement: {
      position: pos ? pos.split(',').map(Number) : (previous?.placement.position ?? null),
      rotationY: rotY !== undefined ? Number(rotY) : (previous?.placement.rotationY ?? 0),
      scale: scale !== undefined ? Number(scale) : (previous?.placement.scale ?? 1),
      collider: collider ?? previous?.placement.collider ?? 'hull',
    },
    stats: { triangles: stats.triangles, bytes: stats.bytesOut, rawBytes: stats.bytesIn, materials: stats.materials },
    ingestedAt: new Date().toISOString(),
  };
  manifest.assets = manifest.assets.filter((a) => a.id !== gameId).concat(entry);
  writeManifest(manifest);

  console.log(`ingested ${gameId} (${match.assetId} @ ${revisionId})`);
  console.log(`  raw       ${relative(root, raw)}  ${stats.bytesIn} B`);
  console.log(`  optimized ${relative(root, out)}  ${stats.bytesOut} B, ${stats.triangles} tris`);
  console.log(`  materials ${stats.materials.join(', ') || '(none)'}`);
}

const [command, ...rest] = process.argv.slice(2);
switch (command) {
  case 'list-kiln':
    for (const r of newestRevisions()) console.log(`${r.assetId}  ${r.revisionId}  ${r.createdAt}  ${r.name}`);
    break;
  case 'ingest':
    await ingest(rest);
    break;
  case 'optimize': {
    const [input, output] = rest;
    if (!input || !output) throw new Error('usage: optimize <in.glb> <out.glb>');
    console.log(await optimize(input, output));
    break;
  }
  case 'list':
    for (const a of readManifest().assets) console.log(`${a.id}  ${a.file}  ${a.stats.triangles} tris  ${a.stats.bytes} B  kiln:${a.kiln.assetId}@${a.kiln.revisionId}`);
    break;
  case 'remove': {
    const [gameId] = rest;
    const manifest = readManifest();
    const entry = manifest.assets.find((a) => a.id === gameId);
    if (!entry) throw new Error(`No game asset "${gameId}"`);
    manifest.assets = manifest.assets.filter((a) => a.id !== gameId);
    writeManifest(manifest);
    rmSync(join(root, 'public', entry.file), { force: true });
    console.log(`removed ${gameId} from the game (the Kiln asset and raw export are kept)`);
    break;
  }
  default:
    console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 9).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
    process.exit(command ? 1 : 0);
}
