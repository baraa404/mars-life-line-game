import { LANDING_PAD_X } from '../../src/game/world/siteLayout.ts'
import { PEBBLE_ARRIVAL } from '../../src/game/missions/m0.ts'
import test from 'node:test'
import assert from 'node:assert/strict'
import { pebbleCanOccupy, pebbleFollowState, pebbleMotionStep, PEBBLE_DOCK } from '../../src/game/world/pebbleMotion.ts'

test('companion uses separate follow and stop radii without circling on heading changes', () => {
  assert.equal(pebbleFollowState(4, false, 0).following, false)
  assert.equal(pebbleFollowState(4.3, false, 3).following, true)
  assert.equal(pebbleFollowState(3.5, true, 3).following, true)
  assert.equal(pebbleFollowState(3, true, 0).following, false)
  assert.equal(pebbleFollowState(2, true, 6).maxSpeed, 0)
  assert.equal(pebbleFollowState(4, true, 3).maxSpeed, 3)
  assert(pebbleFollowState(7, true, 6).maxSpeed > 6, 'catches up with sprinting')
  assert.equal(pebbleFollowState(100, true, 6).maxSpeed, 8, 'bounded recovery speed')
})
test('walking, sprinting and stopping settle inside the follow radius at common frame rates', () => {
  for (const hz of [30, 60, 120]) {
    let player = 0, robot = -3.5, speed = 0, following = false
    for (let i = 0; i < hz * 24; i++) {
      const playerSpeed = i < hz * 8 ? 3 : i < hz * 16 ? 6 : 0
      player += playerSpeed / hz
      const distance = player - robot
      const follow = pebbleFollowState(distance, following, playerSpeed)
      following = follow.following
      const motion = pebbleMotionStep(speed, distance, 3, follow.maxSpeed, 1 / hz)
      speed = following ? motion.speed : 0
      if (following) robot += motion.step
      assert(player - robot >= 3, 'never crowds or overtakes the player')
      assert(player - robot < 6.5, 'keeps up with the player')
    }
    assert(player - robot < 3.01, 'settles when the player stops')
  }
})
test('start and stop ease smoothly without overshoot at common frame rates', () => {
  const results = []
  for (const hz of [30, 60, 120]) {
    let speed = 0, distance = 12, firstSpeed = 0
    for (let i = 0; i < hz * 8; i++) {
      const motion = pebbleMotionStep(speed, distance, .3, 5.8, 1 / hz)
      if (!i) firstSpeed = motion.speed
      assert(motion.step <= Math.max(0, distance - .3))
      speed = motion.speed
      distance -= motion.step
    }
    assert(firstSpeed < 1.1, 'accelerates instead of jumping to maximum speed')
    assert(distance >= .3 && distance < .32)
    assert.equal(speed, 0)
    results.push(distance)
  }
  assert(Math.max(...results) - Math.min(...results) < .01)
})
test('a stalled frame cannot teleport the robot forward', () => {
  const step = pebbleMotionStep(5.8, 100, .3, 5.8, 3)
  assert(step.step <= .29)
})
test('buildings and their open doors remain forbidden, while the outdoor dock is reachable', () => {
  for (const [x, z] of [[0, 0], [0, 6.4], [-10, 0], [-14, 1], [-7.5, 6.5], [-13.5, 5.8], [8, 14.5], [6.2, 6.6], [LANDING_PAD_X, 0]]) {
    assert.equal(pebbleCanOccupy(x, z), false, `inside ${x}, ${z}`)
  }
  for (const [x, z] of [[1, 9], [8, 6], PEBBLE_ARRIVAL, [8, -110], [19, -7], [PEBBLE_DOCK[0], PEBBLE_DOCK[2]]]) {
    assert(pebbleCanOccupy(x, z), `outdoor route ${x}, ${z}`)
  }
})
