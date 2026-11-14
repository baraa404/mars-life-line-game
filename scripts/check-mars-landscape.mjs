import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import { createRockPlacements, surfaceHeight, terrainHeight, TERRAIN_SIZE, TERRAIN_SEGMENTS, MESAS, SHELVES, FOOTHILLS } from '../src/game/world/landscape.ts';
import { appendCollision, createMesaGeometry, extractRockGeometry } from '../src/game/world/landscapeGeometry.ts';

const tokens = JSON.parse(readFileSync(new URL('../src/style/tokens.json', import.meta.url)));
const colours = { mid: tokens.palette['regolith-mid'].hex, light: tokens.palette['regolith-light'].hex, shadow: tokens.palette['shadow-plum'].hex };

test('terrain preserves landing/asset ground and scatter placement matches real terrain triangles', () => {
  for (const [x,z] of [[0,0],[.65,3.6],[0,14],[-5,8]]) assert.equal(terrainHeight(x,z),0);
  const geometry = new THREE.PlaneGeometry(TERRAIN_SIZE,TERRAIN_SIZE,TERRAIN_SEGMENTS,TERRAIN_SEGMENTS);
  geometry.rotateX(-Math.PI/2);
  const positions=geometry.getAttribute('position');
  for(let i=0;i<positions.count;i++) positions.setY(i,terrainHeight(positions.getX(i),positions.getZ(i)));
  const ground=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial());
  ground.updateMatrixWorld(true);
  for(const [x,z] of [[19.2,-27.8],[-37.7,22.6],[42.4,47.7],[-26.2,-65.3],[61.7,13.4]]) {
    const hit=new THREE.Raycaster(new THREE.Vector3(x,100,z),new THREE.Vector3(0,-1,0)).intersectObject(ground)[0];
    assert(hit);
    assert(Math.abs(hit.point.y-surfaceHeight(x,z))<1e-5);
  }
  geometry.dispose(); ground.material.dispose();
});

test('scatter is repeatable and keeps physical obstacles away from spawn and existing assets', () => {
  const rocks=createRockPlacements();
  assert.deepEqual(rocks,createRockPlacements());
  assert(rocks.length>3000);
  for(const r of rocks) {
    assert(Object.values(r).every(Number.isFinite));
    const radius=r.width*.48;
    assert(Math.hypot(r.x,r.z)>=3.7+radius);
    assert(Math.hypot(r.x-.65,r.z-3.6)>=1.25+radius);
    assert(Math.hypot(r.x,r.z-14)>=1.8+radius);
    assert(r.y<=surfaceHeight(r.x,r.z));
  }
});

test('compressed Kiln stones decode into five grounded normalized variants and valid collision triangles',async()=>{
  await MeshoptDecoder.ready;
  const bytes=readFileSync(new URL('../public/models/mars-rock-kit.glb',import.meta.url));
  const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  gltf.scene.updateMatrixWorld(true);
  const variants=[];
  gltf.scene.traverse(n=>{if(n.isMesh&&/Rock_\d/.test(n.name))variants.push(n);});
  assert.equal(variants.length,5);
  for(const mesh of variants){
    const before=Array.from(mesh.geometry.attributes.position.array);
    const g=extractRockGeometry(mesh,colours); g.computeBoundingBox();
    const size=g.boundingBox.getSize(new THREE.Vector3());
    assert(Math.abs(g.boundingBox.min.y)<1e-5);
    assert(Math.abs(Math.max(size.x,size.z)-1)<1e-5);
    assert(g.attributes.normal.array.every(Number.isFinite));
    assert.deepEqual(Array.from(mesh.geometry.attributes.position.array),before);
    const vertices=[],indices=[];
    appendCollision(g,new THREE.Matrix4().makeScale(1.3,.8,2),vertices,indices);
    assert(vertices.every(Number.isFinite)); assert(indices.every(i=>i>=0&&i<vertices.length/3));
    assert.equal(indices.length,g.attributes.position.count);
    g.dispose();
  }
});

test('all eroded formations have finite geometry, upward cap faces and exact collision buffers',()=>{
  for(const f of [...MESAS,...SHELVES]){
    const geometry=createMesaGeometry(f,SHELVES.includes(f),colours);
    const p=geometry.attributes.position,n=geometry.attributes.normal;
    assert(p.array.every(Number.isFinite)); assert(n.array.every(Number.isFinite));
    assert(p.count>1000);
    let caps=0;
    for(let i=0;i<p.count;i++)if(n.getY(i)>.85&&p.getY(i)>surfaceHeight(f.x,f.z)+f.height*.7)caps++;
    assert(caps>20,'must retain a broad flat-topped cap');
    const vertices=[],indices=[];appendCollision(geometry,new THREE.Matrix4(),vertices,indices);
    assert.deepEqual(vertices,Array.from(p.array)); assert.equal(indices.length,p.count);
    geometry.dispose();
  }
});


test('distant cliffs leave the basin open and foothills remain gently walkable', () => {
  for (const f of MESAS) {
    assert(Math.hypot(f.x, f.z) - Math.max(f.radiusX, f.radiusZ) > 75,
      'major cliffs must stay beyond the playable basin');
    assert(f.height / Math.min(f.radiusX, f.radiusZ) < 1,
      'mesas should have broad proportions');
  }
  assert(!MESAS.some(f => f.x > 0 && f.z > 0), 'retain the south-east opening');
  for (const h of FOOTHILLS) {
    assert(terrainHeight(h.x, h.z) > 1, 'foothills must create actual ground relief');
    for (let x = h.x - 6; x <= h.x + 6; x += 3) {
      for (let z = h.z - 6; z <= h.z + 6; z += 3) {
        const dx = (terrainHeight(x + .5, z) - terrainHeight(x - .5, z));
        const dz = (terrainHeight(x, z + .5) - terrainHeight(x, z - .5));
        assert(Math.hypot(dx, dz) < .55, 'hill slopes must blend gradually into the basin');
      }
    }
  }
});
