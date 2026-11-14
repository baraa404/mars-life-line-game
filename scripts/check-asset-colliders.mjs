import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import { buildAssetCollisionParts } from '../src/game/assets/colliders.ts';

test('normalized vertices and nested GPU instance transforms reach collision shapes', () => {
  const scene = new THREE.Group();
  const parent = new THREE.Group();
  parent.position.set(10, 3, 0);
  parent.rotation.z = Math.PI / 2;
  parent.scale.set(2, 2, 2);
  scene.add(parent);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Int16BufferAttribute([
    0, 0, 0, 32767, 0, 0, 0, 32767, 0, 0, 0, 32767,
  ], 3, true));
  geometry.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 1, 1, 3, 2]);
  const mesh = new THREE.InstancedMesh(geometry, new THREE.MeshBasicMaterial(), 2);
  mesh.setMatrixAt(0, new THREE.Matrix4());
  mesh.setMatrixAt(1, new THREE.Matrix4().makeTranslation(2, 0, 0));
  parent.add(mesh);
  const parts = buildAssetCollisionParts(scene);
  assert.equal(parts.length, 2);
  assert(parts.every(p => p.vertices instanceof Float32Array && p.indices instanceof Uint32Array));
  const round = a => [...a].map(v => Math.round(v * 1e5) / 1e5);
  assert.deepEqual(round(parts[0].vertices), [10,3,0, 10,5,0, 8,3,0, 10,3,2]);
  assert.deepEqual(round(parts[1].vertices), [10,7,0, 10,9,0, 8,7,0, 10,7,2]);
  assert.equal(geometry.getAttribute('position').array.constructor, Int16Array);
});

test('real Meshopt rover produces all 193 placed collision parts with matching bounds', async () => {
  await MeshoptDecoder.ready;
  const bytes = readFileSync(new URL('../public/models/mars-rover.glb', import.meta.url));
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
    .parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  let instances = 0;
  let normalized = 0;
  gltf.scene.traverse(o => {
    if (o instanceof THREE.InstancedMesh) instances += o.count;
    if (o instanceof THREE.Mesh && o.geometry.getAttribute('position').normalized) normalized++;
  });
  assert(instances > 0);
  assert(normalized > 0);
  const parts = buildAssetCollisionParts(gltf.scene);
  assert.equal(parts.length, 193);
  const bounds = new THREE.Box3();
  for(const part of parts) {
    assert(part.vertices.every(Number.isFinite));
    assert(part.indices.every(i => i < part.vertices.length / 3));
    for(let i=0;i<part.vertices.length;i+=3) bounds.expandByPoint(new THREE.Vector3().fromArray(part.vertices,i));
  }
  const size = bounds.getSize(new THREE.Vector3());
  assert(Math.abs(bounds.min.y) < 0.001);
  for(const [actual, expected] of [[size.x,4.4915],[size.y,2.63],[size.z,2.433]])
    assert(Math.abs(actual - expected) < 0.002, `${actual} vs ${expected}`);
});
