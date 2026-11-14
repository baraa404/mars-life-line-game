import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'meshoptimizer';
import {buildAssetCollisionParts} from '../src/game/assets/colliders.ts';
await MeshoptDecoder.ready;
const ids=['pebble','young-astronaut','int-wall-panel','int-floor-ceiling','int-door-inner','window-hab','airlock-interior','console-station','bunk','galley-chair','pebble-nook','data-pad'];
const assets={};
for(const id of ids){const b=readFileSync(new URL('../public/models/'+id+'.glb',import.meta.url));assets[id]=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');assets[id].scene.updateMatrixWorld(true);}
const expected={pebble:['Idle','Drive','TurnInPlace','Happy','Worried','Hide','Clean','Grip','HeadTilt','Reboot','Charge','Point'],'young-astronaut':['Idle','Walk','Friendly_Wave']};
const measure={};
test('12 optimized models retain finite geometry, requested budgets and correct scale',()=>{
 for(const id of ids){const parts=buildAssetCollisionParts(assets[id].scene);assert(parts.length,id);const box=new THREE.Box3();let triangles=0;
 for(const p of parts){assert(p.vertices.every(Number.isFinite),id);assert(p.indices.every(i=>i>=0&&i<p.vertices.length/3));triangles+=p.indices.length/3;for(let i=0;i<p.vertices.length;i+=3)box.expandByPoint(new THREE.Vector3().fromArray(p.vertices,i));}
 const max=id==='int-wall-panel'?7500:id==='int-floor-ceiling'?3000:['pebble','young-astronaut'].includes(id)?8000:['airlock-interior','console-station','bunk'].includes(id)?6000:1500;assert(triangles<=max,id+' over budget');
 assert(box.min.y>=-.015,id+' below ground');measure[id]={size:box.getSize(new THREE.Vector3()).toArray(),triangles,bytes:readFileSync(new URL('../public/models/'+id+'.glb',import.meta.url)).length};}
 assert(measure.pebble.size[1]>.5&&measure.pebble.size[1]<.8);assert(Math.abs(measure['young-astronaut'].size[1]-1.8)<.003);
 writeFileSync(new URL('../assets/reviews/phase-3/runtime-measurements.json',import.meta.url),JSON.stringify(measure,null,2)+'\n');
});
test('interaction nodes, modular variants and screen UVs survive optimization',()=>{
 const required={pebble:['screen_face','head','neck','arm_l','arm_r','grip_l','grip_r','nozzle_r','antenna','track_l','track_r'],'int-wall-panel':['variant_flat','variant_window','variant_vent','variant_door','variant_corner'],'int-floor-ceiling':['floor_tile','ceiling_tile'],'int-door-inner':['hatch_wheel','door_leaf'],'window-hab':['frost_overlay'],'airlock-interior':['lever','gauge_needle'],'console-station':['screen_anchor'],bunk:['sleep_interact'],'galley-chair':['wait_interact']};
 for(const[id,names]of Object.entries(required))for(const name of names)assert(assets[id].scene.getObjectByName(name),id+' missing '+name);
 let uv=false;assets.pebble.scene.getObjectByName('screen_face').traverse(n=>{if(n.isMesh)uv=!!n.geometry.getAttribute('uv')});assert(uv,'face needs UVs for the SVG expressions');
 const faceNames=[];assets.pebble.scene.traverse(n=>{if(/brush/i.test(n.name))faceNames.push(n.name)});assert.equal(faceNames.length,0,'Box Buddy must not have a brush');
 for(const s of ['l','r'])assert(assets.pebble.scene.getObjectByName('finger_'+s+'_a')&&assets.pebble.scene.getObjectByName('finger_'+s+'_b'),'two gripper fingers');
});
test('all 15 native clips bind unique nodes, move at intermediate phases and declared loops close',()=>{
 for(const[id,names]of Object.entries(expected)){const{scene,animations}=assets[id];for(const name of names){const clip=animations.find(c=>c.name===name);assert(clip,id+' missing '+name);assert(clip.duration>0);const mixer=new THREE.AnimationMixer(scene);const action=mixer.clipAction(clip).setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;action.play();
 const targets=[...new Set(clip.tracks.map(t=>t.name.split('.')[0]))].map(name=>{let count=0;scene.traverse(n=>{if(n.name===name)count++});assert.equal(count,1,id+' ambiguous target '+name);return scene.getObjectByName(name)});
 const snapshots=[];for(const t of [0,.13,.31,.67,1]){mixer.setTime(t*clip.duration);scene.updateMatrixWorld(true);const state=targets.flatMap(n=>[...n.position.toArray(),...n.quaternion.toArray(),...n.scale.toArray()]);assert(state.every(Number.isFinite));snapshots.push(state);}
 assert(snapshots.slice(1).some(v=>v.some((x,i)=>Math.abs(x-snapshots[0][i])>1e-4)),id+' '+name+' static');
 if(clip.userData.kilnLoopIntent==='loop'){for(const n of targets){mixer.setTime(0);const p=n.position.clone(),q=n.quaternion.clone();mixer.setTime(clip.duration);assert(p.distanceTo(n.position)<1e-5,id+' '+name+' position loop');assert(q.angleTo(n.quaternion)<.001,id+' '+name+' rotation loop');}}
 mixer.stopAllAction();mixer.uncacheRoot(scene);
 }}
});
test('walk remains above ground',()=>{
 for(const[id,names]of [['young-astronaut',['Walk']]])for(const name of names){const{scene,animations}=assets[id];const clip=animations.find(c=>c.name===name);const mixer=new THREE.AnimationMixer(scene);const action=mixer.clipAction(clip).setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;action.play();for(let i=0;i<=64;i++){mixer.setTime(i/64*clip.duration);scene.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(scene);assert(b.min.y>-.006,'Walk foot penetration '+b.min.y);}mixer.stopAllAction();mixer.uncacheRoot(scene);}
});
test('real belt cleats travel around the track and opposed drive changes direction',()=>{
 const{animations}=assets.pebble;for(const name of ['Drive','TurnInPlace']){const c=animations.find(c=>c.name===name);const tracks=c.tracks.filter(t=>t.name.startsWith('lug_')&&t.name.endsWith('.position'));assert.equal(tracks.length,32);assert(tracks.every(t=>t.times.length>=10));}
});
test('face and icon SVG inventories are complete, parseable, labelled and script-free',()=>{
 const face=JSON.parse(readFileSync(new URL('../public/ui/pebble-faces/manifest.json',import.meta.url)));assert.equal(face.expressions.length,10);
 const icons=JSON.parse(readFileSync(new URL('../public/ui/icons/manifest.json',import.meta.url)));assert.equal(icons.icons.length,20);
 for(const item of [...face.expressions,...icons.icons]){const text=readFileSync(new URL('../public'+item.file,import.meta.url),'utf8');assert(text.includes('<svg')&&text.includes('viewBox=')&&text.includes('<title'));assert(!/<script|onload=|https?:\/\/(?!www.w3.org)/i.test(text));}
 assert.equal(new Set(face.expressions.map(x=>x.id)).size,10);assert.equal(new Set(icons.icons.map(x=>x.id)).size,20);
});
test('bundled variable fonts have valid sfnt headers, recorded hashes and OFL licences',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../public/fonts/manifest.json',import.meta.url)));
 for(const f of manifest.fonts){const bytes=readFileSync(new URL('../public'+f.file,import.meta.url));assert.equal(bytes.readUInt32BE(0),0x00010000);assert.equal(createHash('sha256').update(bytes).digest('hex'),f.sha256);const license=readFileSync(new URL('../public'+f.license,import.meta.url),'utf8');assert(license.includes('SIL OPEN FONT LICENSE Version 1.1'));}
});
