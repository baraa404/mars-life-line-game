import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import test from 'node:test';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import { buildAssetCollisionParts } from '../src/game/assets/colliders.ts';

await MeshoptDecoder.ready;
const ids = ['pebble-dock', 'landing-pad', 'landing-scorch', 'landing-ship', 'cable-run-straight', 'cable-run-bend', 'cable-run-t'];
const scenes = {}, measurements = {};
for (const id of ids) {
  const bytes = readFileSync(new URL('../public/models/' + id + '.glb', import.meta.url));
  scenes[id] = (await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '')).scene;
  scenes[id].updateMatrixWorld(true);
}

test('seven optimized support models retain finite, grounded geometry at reference scale', () => {
  for (const id of ids) {
    const parts = buildAssetCollisionParts(scenes[id]);
    assert(parts.length, id);
    const box = new THREE.Box3();
    let triangles = 0;
    for (const part of parts) {
      assert(part.vertices.every(Number.isFinite), id);
      assert(part.indices.every(i => i >= 0 && i < part.vertices.length / 3), id);
      triangles += part.indices.length / 3;
      for (let i = 0; i < part.vertices.length; i += 3) box.expandByPoint(new THREE.Vector3().fromArray(part.vertices, i));
    }
    assert(Math.abs(box.min.y) < .003, id + ' must rest on Y=0');
    measurements[id] = { bytes: readFileSync(new URL('../public/models/' + id + '.glb', import.meta.url)).length, triangles, size: box.getSize(new THREE.Vector3()).toArray() };
  }
  assert(measurements['landing-ship'].size[1] > 6 && measurements['landing-ship'].size[1] < 7);
  assert(measurements['pebble-dock'].size[1] > 1.3 && measurements['pebble-dock'].size[1] < 1.7);
  assert(Math.abs(measurements['landing-pad'].size[0] - 12) < .003);
  writeFileSync(new URL('../assets/reviews/phase-2-support/runtime-measurements.json', import.meta.url), JSON.stringify(measurements, null, 2) + '\n');
});

test('optimization preserves populated ship, dock and cable interaction groups', () => {
  const required = {
    'landing-ship': ['hatch', 'ramp', ...[1, 2, 3, 4].map(i => 'nozzle_' + i), ...[1, 2].map(i => 'window_' + i), ...[1, 2, 3, 4].map(i => 'landing_leg_' + i)],
    'pebble-dock': ['charging_arm', 'shoulder', 'charging_head'],
    'cable-run-straight': ['connector_1', 'connector_2'],
    'cable-run-bend': ['connector_1', 'connector_2'],
    'cable-run-t': ['connector_1', 'connector_2', 'connector_3'],
  };
  for (const [id, names] of Object.entries(required)) for (const name of names) {
    const node = scenes[id].getObjectByName(name);
    assert(node, id + ': missing ' + name);
    let meshes = 0; node.traverse(n => { if (n.isMesh) meshes++; });
    assert(meshes, id + ': empty ' + name);
  }
});

test('scorch is a texture-free blended RGBA patch with a transparent perimeter', () => {
  const mesh = scenes['landing-scorch'].getObjectByName('scorch_patch');
  assert(mesh);
  let found = false;
  mesh.traverse(n => {
    if (!n.isMesh) return;
    const color = n.geometry.getAttribute('color');
    assert.equal(color.itemSize, 4);
    assert(n.material.transparent);
    assert.equal(n.material.map, null);
    const alphas = Array.from({ length: color.count }, (_, i) => color.getW(i));
    assert(Math.min(...alphas) < .001);
    assert(Math.max(...alphas) > .7);
    assert(alphas.some(a => a > .05 && a < .5));
    found = true;
  });
  assert(found);
});

test('four ship footpads meet ground and nozzle mouths remain open to recessed throats', () => {
  const ship = scenes['landing-ship'];
  for (let i = 1; i <= 4; i++) {
    const leg = ship.getObjectByName('landing_leg_' + i);
    const box = new THREE.Box3().setFromObject(leg);
    assert(Math.abs(box.min.y) < .003);
    const nozzle = ship.getObjectByName('nozzle_' + i);
    const center = nozzle.getWorldPosition(new THREE.Vector3());
    const hits = new THREE.Raycaster(center.clone().add(new THREE.Vector3(0, .1, 0)), new THREE.Vector3(0, 1, 0), 0, 2).intersectObject(nozzle, true);
    assert(hits.length, 'nozzle ' + i + ' missing recessed throat');
    assert(hits[0].point.y > 1.1, 'nozzle ' + i + ' mouth accidentally capped');
  }
});

test('cable connectors keep expected orientation and consistent section height', () => {
  for (const id of ['cable-run-straight', 'cable-run-bend', 'cable-run-t']) {
    const scene = scenes[id];
    for (let i = 1; i <= (id.endsWith('-t') ? 3 : 2); i++) {
      const end = scene.getObjectByName('connector_' + i);
      const world = end.getWorldPosition(new THREE.Vector3());
      assert(Math.abs(world.y) < .001);
      assert(Math.abs(Math.hypot(world.x, world.z) - 1) < .003);
      assert(Math.abs(new THREE.Box3().setFromObject(end).max.y - .378) < .003);
    }
  }
});
