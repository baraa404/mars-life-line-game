import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Box3, Raycaster, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { CABIN_SPAWN, CABIN_EYE, CABIN_FLOOR, CABIN_RADIUS, CABIN_OBSTACLES, cabinPositionClear, moveInCabin } from '../../src/game/missions/cabinLayout.ts'
import { CABIN_CONTROLS, cabinObjective, cabinObjectiveBearing } from '../../src/game/missions/cabinGuidance.ts'

test('guidance follows required controls and waits during pressure cycling', () => {
  for (const [stage, control] of [['arm', 'throttle'], ['suit', 'suit'], ['seal', 'hatch'], ['cycle', 'cycle'], ['exit', 'hatch']]) {
    assert.equal(cabinObjective(stage, false).point, CABIN_CONTROLS[control])
  }
  assert.equal(cabinObjective('cycle', true), null)
  for (const stage of ['orbit', 'earth', 'entry', 'thrust', 'touchdown', 'signal']) assert.equal(cabinObjective(stage, false), null)
})

test('guide arrow distinguishes ahead, left, right and behind as the camera turns', () => {
  assert.equal(cabinObjectiveBearing(0, -1, 0, -1), 0)
  assert.equal(cabinObjectiveBearing(1, 0, 0, -1), Math.PI / 2)
  assert.equal(cabinObjectiveBearing(-1, 0, 0, -1), -Math.PI / 2)
  assert.equal(Math.abs(cabinObjectiveBearing(0, 1, 0, -1)), Math.PI)
  assert.equal(cabinObjectiveBearing(1, 0, 1, 0), 0)
})

test('cycle lever beside the hatch is reachable and unobstructed from the central aisle', async () => {
  const { prepareCabinModel } = await import('../../src/game/missions/cabinModel.ts')
  const b = readFileSync(new URL('../../public/models/landing-ship-cabin-walkable.glb', import.meta.url))
  const { scene } = await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), '')
  const model = prepareCabinModel(scene)
  model.root.updateMatrixWorld(true)
  const approach = moveInCabin(CABIN_SPAWN, 0, -.5)
  assert(cabinPositionClear(approach.x, approach.z))
  const eye = new Vector3(approach.x, CABIN_EYE, approach.z)
  const point = new Vector3(...CABIN_CONTROLS.cycle), distance = eye.distanceTo(point)
  assert(distance < 2, 'within interaction range without walking into furniture')
  const ray = new Raycaster(eye, point.clone().sub(eye).normalize())
  assert(!ray.intersectObject(model.root, true).some(hit => hit.distance < distance - .35), 'no seat or locker hides the lever')
  assert(point.distanceTo(new Vector3(...CABIN_CONTROLS.hatch)) < 1, 'beside the wheel')
  model.dispose()
})

test('standing spawn and central aisle provide a traversable route to the console', () => {
  assert.equal(CABIN_EYE - CABIN_FLOOR, 1.65)
  assert(cabinPositionClear(CABIN_SPAWN.x, CABIN_SPAWN.z))
  for (let z = -2.45; z <= .44; z += .02) assert(cabinPositionClear(0, z), `aisle blocked at ${z}`)
  const atConsole = moveInCabin(CABIN_SPAWN, 0, 50)
  assert(atConsole.z > .38 && atConsole.z <= .45)
  const atHatch = moveInCabin(atConsole, 0, -50)
  assert(atHatch.z >= -2.55 && atHatch.z < -2.45)
})

test('long moves cannot tunnel through walls, seats, lockers, oxygen or the hatch', () => {
  for (const obstacle of CABIN_OBSTACLES) {
    const x = (obstacle.minX + obstacle.maxX) / 2
    const z = (obstacle.minZ + obstacle.maxZ) / 2
    assert(!cabinPositionClear(x, z), obstacle.name)
  }
  const seat = moveInCabin({ x: 1.22, z: -1.6 }, 0, 10)
  assert(seat.z < -1.3)
  const leftWall = moveInCabin(CABIN_SPAWN, -50, 0)
  assert(cabinPositionClear(leftWall.x, leftWall.z))
  assert(leftWall.x > -2)
  const back = moveInCabin(CABIN_SPAWN, 0, -50)
  assert(cabinPositionClear(back.x, back.z))
})

test('diagonal walking slides along a blocked console without entering it', () => {
  const result = moveInCabin({ x: 0, z: .44 }, .8, .8)
  assert(result.x > .7)
  assert(result.z <= .45)
  assert(cabinPositionClear(result.x, result.z))
})

test('delivered GLB has standing headroom, aisle clearance and retained control pivots', async () => {
  const b = readFileSync(new URL('../../public/models/landing-ship-cabin-walkable.glb', import.meta.url))
  const { scene } = await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), '')
  scene.updateMatrixWorld(true)
  const bounds = name => {
    const part = scene.getObjectByName(name)
    assert(part, `missing ${name}`)
    return new Box3().setFromObject(part)
  }
  const floor = bounds('Mesh_CabinFloor'), ceiling = bounds('Mesh_Ceiling')
  assert(Math.abs(floor.max.y - CABIN_FLOOR) < .001)
  assert(ceiling.min.y - CABIN_EYE > .9)
  const port = bounds('Joint_seat_port'), starboard = bounds('Joint_seat_starboard')
  assert(starboard.min.x - port.max.x > 1.4)
  assert(starboard.min.x - port.max.x > CABIN_RADIUS * 2)
  for (const name of ['Joint_throttle_0', 'Joint_throttle_1', 'Joint_button_arm', 'Joint_encoder_1_1']) {
    const node = scene.getObjectByName(name); assert(node, name)
    assert(node.children.length, `empty control ${name}`)
  }
  for (let i = 0; i < 3; i++) {
    const display = bounds('Mesh_DisplaySurface_' + i)
    assert(display.getSize(new Vector3()).x > .55)
  }
})

test('cabin batching preserves visible geometry, materials and moving controls', async () => {
  const { prepareCabinModel } = await import('../../src/game/missions/cabinModel.ts')
  const b = readFileSync(new URL('../../public/models/landing-ship-cabin-walkable.glb', import.meta.url))
  const { scene } = await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), '')
  const model = prepareCabinModel(scene)
  const stats = root => {
    let triangles = 0, draws = 0
    const box = new Box3(), materials = new Set()
    root.updateMatrixWorld(true)
    root.traverseVisible(n => {
      if (!n.isMesh) return
      triangles += (n.geometry.index?.count ?? n.geometry.attributes.position.count) / 3
      draws++; materials.add(n.material.name)
      box.union(new Box3().setFromObject(n))
    })
    return { triangles, draws, box, materials }
  }
  const before = stats(scene), after = stats(model.root)
  assert.equal(before.triangles, after.triangles)
  assert.deepEqual(before.materials, after.materials)
  assert(before.box.min.distanceTo(after.box.min) < .001)
  assert(before.box.max.distanceTo(after.box.max) < .001)
  assert(after.draws < 30, `unexpected draws: ${after.draws}`)
  for (const name of ['Joint_throttle_0', 'Joint_throttle_1', 'Joint_encoder_1_1', 'Mesh_HatchWheel']) {
    const node = model.root.getObjectByName(name)
    assert(node?.visible, `${name} must remain visible`)
    const initial = new Box3().setFromObject(node)
    node.rotation.x += .5; model.root.updateMatrixWorld(true)
    const moved = new Box3().setFromObject(node)
    assert(initial.min.distanceTo(moved.min) + initial.max.distanceTo(moved.max) > .005, name)
  }
  model.dispose()
})
