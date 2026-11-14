import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import test from 'node:test';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import { buildAssetCollisionParts } from '../src/game/assets/colliders.ts';

await MeshoptDecoder.ready;
const ids = ['rock-pebbles','rock-boulders','rock-cluster','mesa-distant','ridge-horizon','mesa-cliff-overhang','hab-module','hab-airlock','storm-shelter-module','solar-array-row'];
const scenes = {};
for (const id of ids) {
  const bytes = readFileSync(new URL('../public/models/' + id + '.glb', import.meta.url));
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  scenes[id] = gltf.scene;
  gltf.scene.updateMatrixWorld(true);
}
const required = {
  'hab-module': ['roof','info_anchor',...['left','right'].flatMap(side => [1,2,3].map(i => 'window_' + side + '_' + i))],
  'hab-airlock': ['roof','info_anchor','outer_hatch','inner_hatch'],
  'storm-shelter-module': ['roof','info_anchor'],
  'solar-array-row': ['info_anchor',...Array.from({length:5},(_,i) => 'panel_' + (i+1))],
  'mesa-cliff-overhang': ['shelter_zone'],
  'rock-pebbles': Array.from({length:5},(_,i) => 'pebble_variant_' + (i+1)),
  'rock-boulders': Array.from({length:4},(_,i) => 'boulder_variant_' + (i+1)),
  'mesa-distant': Array.from({length:3},(_,i) => 'mesa_variant_' + (i+1)),
};
test('all ten optimized models load with finite, grounded collision geometry', () => {
  for (const id of ids) {
    const parts = buildAssetCollisionParts(scenes[id]);
    assert(parts.length > 0, id);
    let minY = Infinity;
    const bounds = new THREE.Box3();
    for (const part of parts) {
      assert(part.vertices.every(Number.isFinite), id + ' non-finite vertices');
      assert(part.indices.every(i => i < part.vertices.length / 3), id + ' invalid index');
      for (let i=1; i<part.vertices.length; i+=3) minY = Math.min(minY,part.vertices[i]);
      for (let i=0; i<part.vertices.length; i+=3) bounds.expandByPoint(new THREE.Vector3().fromArray(part.vertices,i));
    }
    const size=bounds.getSize(new THREE.Vector3());
    // Meshopt position quantization scales with a mesh's overall extent.
    const tolerance=Math.max(0.002,Math.max(size.x,size.y,size.z)/16384);
    assert(Math.abs(minY)<tolerance, id + ' ground Y=' + minY);
  }
});
test('required semantic nodes and variant meshes survive optimization', () => {
  for (const [id,names] of Object.entries(required)) for (const name of names) {
    const node = scenes[id].getObjectByName(name);
    assert(node,id + ' missing ' + name);
    assert(node.isMesh || node.children.length>0,id + ' empty semantic node ' + name);
  }
});
test('solar cleaning targets retain independently owned cell materials', () => {
  const seen = new Set();
  for(let i=1;i<=5;i++){
    const panel=scenes['solar-array-row'].getObjectByName('panel_'+i),materials=new Set();
    panel.traverse(node=>{if(node.isMesh){const ms=Array.isArray(node.material)?node.material:[node.material];for(const material of ms)if(material.name.startsWith('array-cells-'))materials.add(material);}});
    assert.equal(materials.size,1,'panel_'+i+' cell material absent or moved out of target');
    for(const mat of materials){assert(!seen.has(mat),'panels must support independent dust state');seen.add(mat);}
  }
});
test('overhang shelter floor, open approach, back wall and overhead clearance are real geometry', () => {
  const scene=scenes['mesa-cliff-overhang'],zone=scene.getObjectByName('shelter_zone');
  const floor=zone.getWorldPosition(new THREE.Vector3());
  const occupant=floor.clone().add(new THREE.Vector3(0,1.0,0));
  const front = new THREE.Raycaster(occupant,new THREE.Vector3(1,0,0),0.05,8).intersectObject(scene,true);
  assert.equal(front.length,0,'shelter approach obstructed');
  const back = new THREE.Raycaster(occupant,new THREE.Vector3(-1,0,0),0.05,8).intersectObject(scene,true);
  assert(back.length>0,'shelter has no recessed back wall');
  const up = new THREE.Raycaster(floor.clone().add(new THREE.Vector3(0,0.2,0)),new THREE.Vector3(0,1,0),0.05,15).intersectObject(scene,true);
  assert(up.length>0,'overhang has no roof');
  assert(up[0].point.y-floor.y>2.3,'astronaut and PEBBLE need head clearance');
  const down = new THREE.Raycaster(floor.clone().add(new THREE.Vector3(0,0.15,0)),new THREE.Vector3(0,-1,0),0,0.3).intersectObject(scene,true);
  assert(down.length>0,'shelter floor unsupported');
  const report={floor:floor.toArray(),backDistance:back[0].distance,headroom:up[0].point.y-floor.y,approachClear:true};
  writeFileSync(new URL('../assets/reviews/phase-2/shelter-clearance.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
});
test('airlock pressure chamber has a clear center passage behind its separate hatch assemblies', () => {
  const scene=scenes['hab-airlock'],meshes=[];
  scene.traverse(node=>{
    if(!node.isMesh)return;
    let current=node;
    while(current){if(current.name==='outer_hatch'||current.name==='inner_hatch')return;current=current.parent;}
    meshes.push(node);
  });
  const hits=new THREE.Raycaster(new THREE.Vector3(2.2,1.48,0),new THREE.Vector3(-1,0,0),0.05,4).intersectObjects(meshes,false);
  assert.equal(hits.length,0,'pressure-shell geometry blocks the doorway');
});

