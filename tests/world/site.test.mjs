import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import * as THREE from 'three'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'
import {MeshoptDecoder} from 'meshoptimizer'
import RAPIER from '@dimforge/rapier3d-compat'
import { SITE,SITE_ROUTES,SITE_PADS,CABLE_ROUTES,siteClearance,STATION_POINTS,STATION_INTERACTION_POINTS } from '../../src/game/world/siteLayout.ts'
import {surfaceHeight,createRockPlacements,MESAS,SHELVES,terrainHeight,TERRAIN_SIZE,TERRAIN_SEGMENTS} from '../../src/game/world/landscape.ts'
import {buildAssetCollisionParts} from '../../src/game/assets/colliders.ts'
import {prepareSiteModel,updateSiteMaterials} from '../../src/game/assets/siteModel.ts'
import {createMesaGeometry} from '../../src/game/world/landscapeGeometry.ts'
import {exteriorAppearance} from '../../src/game/world/appearance.ts'
await MeshoptDecoder.ready
const scenes=new Map()
for(const p of [...SITE,...['hab-module','hab-airlock'].map(asset=>({asset}))]){if(scenes.has(p.asset))continue;const b=readFileSync(new URL('../../public/models/'+p.asset+'.glb',import.meta.url));const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');scenes.set(p.asset,gltf.scene)}
test('site has complete required assets, nearby ship and compact station layout',()=>{
 assert.equal(SITE.filter(p=>p.asset==='solar-array-row').length,4)
 const ship=SITE.find(p=>p.id==='ship')
 assert.equal(Math.hypot(ship.x,ship.z),50)
 for(const id of ['hab','shelter','greenhouse','oxygen','dish','ice-rocks','dock'])assert(Math.hypot(SITE.find(p=>p.id===id).x,SITE.find(p=>p.id===id).z)<36,id)
 assert(new Set(SITE.map(p=>p.id)).size===SITE.length)
})
test('pads and route centres share flat visual/physical ground; instanced rocks leave clearance',()=>{
 for(const pad of SITE_PADS.filter(p=>p.z!==-110))for(let x=pad.x-pad.halfX+2;x<pad.x+pad.halfX-2;x+=2)for(let z=pad.z-pad.halfZ+2;z<pad.z+pad.halfZ-2;z+=2)assert(Math.abs(surfaceHeight(x,z))<1e-6,`pad ${x},${z}`)
 for(const route of SITE_ROUTES)for(let i=0;i<=100;i++){let t=i/100,x=route.from[0]*(1-t)+route.to[0]*t,z=route.from[1]*(1-t)+route.to[1]*t;assert(Math.abs(surfaceHeight(x,z))<(route.id==='shelter-approach'?.62:.01),route.id)}
 for(const rock of createRockPlacements())assert(siteClearance(rock.x,rock.z,rock.width*.48))
 assert(MESAS.every(f=>Math.hypot(f.x,f.z)-Math.max(f.radiusX,f.radiusZ)>75))
 assert(CABLE_ROUTES.every(r=>r.points.length>=2))
})
test('batching preserves exact transformed bounds/triangle coverage and semantic nodes',()=>{
 for(const [id,scene] of scenes){
  const before=new THREE.Box3();for(const part of buildAssetCollisionParts(scene))for(let i=0;i<part.vertices.length;i+=3)before.expandByPoint(new THREE.Vector3().fromArray(part.vertices,i));const model=prepareSiteModel(scene,false)
  model.root.updateMatrixWorld(true);const after=new THREE.Box3();let tri=0
  model.root.traverseVisible(n=>{if(n.isMesh){n.geometry.computeBoundingBox();for(let i=0;i<n.geometry.attributes.position.count;i++)after.expandByPoint(new THREE.Vector3().fromBufferAttribute(n.geometry.attributes.position,i).applyMatrix4(n.matrixWorld));tri+=n.geometry.attributes.position.count/3}})
  assert(before.min.distanceTo(after.min)<.001,id+' minimum');assert(before.max.distanceTo(after.max)<.001,id+' maximum')
  const originalTri=buildAssetCollisionParts(scene).reduce((sum,p)=>sum+p.indices.length/3,0);assert.equal(tri,originalTri,id)
  for(const name of ['roof','shelter_zone','info_anchor','charge_bar','panel_1','hatch','ramp','lid'])if(scene.getObjectByName(name))assert(model.root.getObjectByName(name),id+' '+name)
  model.dispose()
 }
})
test('dust and nine lamp segments update independently without changing cached source or other copies',()=>{
 const source=scenes.get('solar-array-row'),one=prepareSiteModel(source),two=prepareSiteModel(source)
 assert.equal(one.dust.length,5);const original=one.dust[0].original.clone()
 updateSiteMaterials(one,.8,.6);assert(!one.dust[0].material.color.equals(original))
 assert(two.dust[0].material.color.equals(original));assert(source.getObjectByName('panel_1_array-cells-0').material.color.equals(original))
 const battery=prepareSiteModel(scenes.get('battery-bank'));assert.equal(battery.lamps.length,9)
 for(const [fraction,count] of [[0,0],[.2,2],[.6,6],[1,9]]){updateSiteMaterials(battery,0,fraction);assert.equal(battery.lamps.filter(l=>l.material.emissiveIntensity>0).length,count)}
 one.dispose();two.dispose();battery.dispose()
})
test('day/dusk/night and tau produce distinct sun, sky and fog without new colour tokens',()=>{
 const day=exteriorAppearance(720,.5),dusk=exteriorAppearance(1065,.5),night=exteriorAppearance(0,.5),storm=exteriorAppearance(720,4.5)
 assert(day.keyIntensity>dusk.keyIntensity);assert.equal(night.keyIntensity,0);assert(!day.top.equals(night.top))
 assert(storm.fogDensity>day.fogDensity*4);assert(storm.keyIntensity<day.keyIntensity)
 assert(day.sun.distanceTo(dusk.sun)>20)
})
test('Rapier player capsule has clear route corridors and is blocked by base/ship collision',async()=>{
 await RAPIER.init();const world=new RAPIER.World({x:0,y:-3.71,z:0})
 for(const p of SITE){if(p.collider==='none')continue;const angle=p.rotationY*Math.PI/180,q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),angle)
  for(const part of buildAssetCollisionParts(scenes.get(p.asset))){const collider=RAPIER.ColliderDesc.trimesh(part.vertices,part.indices).setTranslation(p.x,(p.y??0)+surfaceHeight(p.x,p.z),p.z).setRotation(q);const c=world.createCollider(collider);c.userData=p.id}
 }
 // Include terrain and the actual procedural rock formations in clearance queries.
 const ground=new THREE.PlaneGeometry(TERRAIN_SIZE,TERRAIN_SIZE,TERRAIN_SEGMENTS,TERRAIN_SEGMENTS);ground.rotateX(-Math.PI/2)
 const positions=ground.attributes.position;for(let i=0;i<positions.count;i++)positions.setY(i,terrainHeight(positions.getX(i),positions.getZ(i)))
 world.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(positions.array),new Uint32Array(ground.index.array)))
 const tokens=JSON.parse(readFileSync(new URL('../../src/style/tokens.json',import.meta.url)));const colors={mid:tokens.palette['regolith-mid'].hex,light:tokens.palette['regolith-light'].hex,shadow:tokens.palette['shadow-plum'].hex}
 const formations=[]
 for(const f of [...MESAS,...SHELVES]){const g=createMesaGeometry(f,SHELVES.includes(f),colors);formations.push(g);world.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(g.attributes.position.array),new Uint32Array(g.index?.array??Array.from({length:g.attributes.position.count},(_,i)=>i))))}
 world.step()
 const shape=new RAPIER.Capsule(.55,.35),rot={x:0,y:0,z:0,w:1}
 for(const r of SITE_ROUTES)for(let i=0;i<=100;i++){const t=i/100,x=r.from[0]*(1-t)+r.to[0]*t,z=r.from[1]*(1-t)+r.to[1]*t
  // Endpoints near the repair machine are destinations, stop 1.5m away.
  if(r.id==='repair-approach'&&t>.8)continue
  let hits=0;world.intersectionsWithShape({x,y:surfaceHeight(x,z)+1.1,z},rot,shape,()=>{hits++;return true});assert.equal(hits,0,`${r.id} at ${x},${z}`)
 }
 let hits=0;world.intersectionsWithShape({x:0,y:3.5,z:3.65},rot,shape,()=>{hits++;return true});assert(hits>0,'hab wall must block capsule')
 const ship=scenes.get('landing-ship');ship.updateMatrixWorld(true);const contact=new THREE.Raycaster(new THREE.Vector3(10,3.5,0),new THREE.Vector3(-1,0,0)).intersectObject(ship,true)[0];assert(contact,'ship must have a hull surface');const point=contact.point.clone().applyAxisAngle(new THREE.Vector3(0,1,0),Math.PI).add(new THREE.Vector3(SITE.find(p=>p.id==='ship').x,.12,0));hits=0;world.intersectionsWithShape(point,rot,shape,()=>{hits++;return true});assert(hits>0,'ship hull must block capsule')
 world.free();ground.dispose();formations.forEach(g=>g.dispose())
})

test('batched roofs and hatches retain independent visibility and transform ownership',()=>{
 for(const [asset,anchor] of [['hab-module','roof'],['hab-airlock','outer_hatch'],['landing-ship','ramp']]){
  const model=prepareSiteModel(scenes.get(asset)),node=model.root.getObjectByName(anchor)
  let owned=0;node.traverseVisible(n=>{if(n.isMesh&&n.name.startsWith('site-batch:'))owned++})
  assert(owned>0,asset+' must render under '+anchor)
  const visible=()=>{let count=0;model.root.traverseVisible(n=>{if(n.isMesh&&n.name.startsWith('site-batch:'))count++});return count}
  const before=visible();node.visible=false;assert.equal(visible(),before-owned);model.dispose()
 }
})
test('placed solid modules have no unintended footprint overlaps',()=>{
 const solid=SITE.filter(p=>p.collider!=='none'&&p.id!=='landing-pad')
 const boxes=solid.map(p=>{const scene=scenes.get(p.asset),box=new THREE.Box3().setFromObject(scene),matrix=new THREE.Matrix4().compose(new THREE.Vector3(p.x,(p.y??0)+surfaceHeight(p.x,p.z),p.z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),p.rotationY*Math.PI/180),new THREE.Vector3(1,1,1));return {id:p.id,box:box.applyMatrix4(matrix)}})
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
  const a=boxes[i],b=boxes[j];if([a.id,b.id].sort().join(',')==='airlock,hab')continue
  if(a.box.intersectsBox(b.box)) {
   const partBoxes=id=>{const p=solid.find(p=>p.id===id);const matrix=new THREE.Matrix4().compose(new THREE.Vector3(p.x,(p.y??0)+surfaceHeight(p.x,p.z),p.z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),p.rotationY*Math.PI/180),new THREE.Vector3(1,1,1));return buildAssetCollisionParts(scenes.get(p.asset)).map(part=>{const box=new THREE.Box3();for(let k=0;k<part.vertices.length;k+=3)box.expandByPoint(new THREE.Vector3().fromArray(part.vertices,k).applyMatrix4(matrix));return box})}
   assert(!partBoxes(a.id).some(aa=>partBoxes(b.id).some(bb=>aa.intersectsBox(bb))),`${a.id} overlaps ${b.id}`)
  }
 }
})
test('hero headquarters preserves named attachments, two doors and rooftop owners',()=>{
 const source=scenes.get('command-base')
 for(const name of ['roof','wing_roof','outer_hatch','door_leaf_left','door_leaf_right','dish','dish_support','antenna_tower_left','antenna_tower_rear','info_anchor','entrance_anchor','interior_anchor'])assert(source.getObjectByName(name),'missing '+name)
 const model=prepareSiteModel(source)
 for(const name of ['roof','wing_roof','door_leaf_left','door_leaf_right','dish']){
  const owner=model.root.getObjectByName(name);let count=0;owner.traverseVisible(n=>{if(n.isMesh&&n.name.startsWith('site-batch:'))count++});assert(count>0,name+' must own live geometry')
 }
 assert(buildAssetCollisionParts(source).reduce((sum,p)=>sum+p.indices.length/3,0)<=12000)
 model.dispose()
})
test('mirrored static geometry keeps outward triangle winding and source buffers untouched',()=>{
 const source=new THREE.Group(),mirror=new THREE.Group();source.add(mirror);mirror.scale.z=-1
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(2,2,2),new THREE.MeshStandardMaterial());mirror.add(mesh)
 const original=Array.from(mesh.geometry.index.array),model=prepareSiteModel(source)
 model.root.updateMatrixWorld(true)
 model.root.traverseVisible(n=>{if(!n.isMesh||!n.name.startsWith('site-batch:'))return;const p=n.geometry.attributes.position
  for(let i=0;i<p.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(p,i),b=new THREE.Vector3().fromBufferAttribute(p,i+1),c=new THREE.Vector3().fromBufferAttribute(p,i+2),normal=b.clone().sub(a).cross(c.clone().sub(a)),center=a.clone().add(b).add(c).divideScalar(3);assert(normal.dot(center)>0)}
 })
 for(const part of buildAssetCollisionParts(source))for(let i=0;i<part.indices.length;i+=3){const a=new THREE.Vector3().fromArray(part.vertices,part.indices[i]*3),b=new THREE.Vector3().fromArray(part.vertices,part.indices[i+1]*3),c=new THREE.Vector3().fromArray(part.vertices,part.indices[i+2]*3);assert(b.sub(a).cross(c.sub(a)).dot(a)>0)}
 assert.deepEqual(Array.from(mesh.geometry.index.array),original)
 model.dispose();mesh.geometry.dispose();mesh.material.dispose()
})

test('station prompts aim at equipment with a clear ray from the walking destination', async () => {
 await RAPIER.init();const world=new RAPIER.World({x:0,y:0,z:0})
 for(const p of SITE){if(p.collider==='none')continue;const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),p.rotationY*Math.PI/180)
  for(const part of buildAssetCollisionParts(scenes.get(p.asset)))world.createCollider(RAPIER.ColliderDesc.trimesh(part.vertices,part.indices).setTranslation(p.x,(p.y??0)+surfaceHeight(p.x,p.z),p.z).setRotation(q))
 }
 world.step()
 for(const [id,points] of Object.entries(STATION_INTERACTION_POINTS))for(const point of points){
  const stand=id==='solar'?[point[0],1.4,-5.6]:STATION_POINTS[id],eye=new THREE.Vector3(stand[0],1.65,stand[2]),ray=new THREE.Vector3(...point).sub(eye),distance=ray.length()
  assert(distance<4.2,id+' must be within use range')
  assert(Math.hypot(point[0]-stand[0],point[2]-stand[2])>.5,id+' must target equipment rather than the walking destination')
  assert.equal(world.castRay(new RAPIER.Ray(eye,ray.normalize()),Math.max(0,distance-.35),true),null,id+' must have clear line of sight')
 }
 world.free()
})
