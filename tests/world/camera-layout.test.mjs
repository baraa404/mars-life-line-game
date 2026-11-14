import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Box3, Euler, Quaternion, Raycaster, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'meshoptimizer'
import { STATION_PITCH, stationCameraDistance, SLEEP_EYE, SLEEP_ROTATION } from '../../src/game/camera/viewLayout.ts'
import { HAB_FLOOR } from '../../src/game/world/habLayout.ts'

test('station camera clears the ground across the whole supported zoom range', () => {
  for (let span = 9; span <= 118; span++) {
    const height = stationCameraDistance(span) * Math.sin(STATION_PITCH)
    const lowerEdgeHeight = height - span * Math.cos(STATION_PITCH)
    assert(lowerEdgeHeight > 10, `near plane cuts ground at zoom ${span}`)
  }
})
test('sleep eye is above the actual mattress, within the bunk, with an unobstructed view', async () => {
  await MeshoptDecoder.ready
  const b = readFileSync(new URL('../../public/models/bunk.glb', import.meta.url))
  const { scene } = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), '')
  scene.position.set(-2.28, HAB_FLOOR, -.8)
  scene.rotation.y = -Math.PI / 2
  scene.updateMatrixWorld(true)
  const mattress = new Box3().setFromObject(scene.getObjectByName('Orange_mattress_blanket'))
  const eye = new Vector3(...SLEEP_EYE)
  assert(eye.x > mattress.min.x && eye.x < mattress.max.x)
  assert(eye.z > mattress.min.z && eye.z < mattress.max.z)
  assert(eye.y > mattress.max.y + .1)
  const direction = new Vector3(0, 0, -1).applyQuaternion(new Quaternion().setFromEuler(new Euler(...SLEEP_ROTATION, 'YXZ')))
  const hits = new Raycaster(eye, direction, 0, 1).intersectObject(scene, true)
  assert(!hits.some(hit => hit.distance < .15), 'sleep camera clips the bunk frame')
})
