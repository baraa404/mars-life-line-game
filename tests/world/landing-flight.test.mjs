import test from 'node:test'
import assert from 'node:assert/strict'
import { landingFlight, LANDING_SITE, LANDING_YAW } from '../../src/game/missions/landingFlight.ts'
import { landingDuration, PEBBLE_ARRIVAL, SHIP_EXIT } from '../../src/game/missions/m0.ts'
import { arrivalPose } from '../../src/game/world/habLayout.ts'
import { SITE, SITE_PADS, SITE_ROUTES } from '../../src/game/world/siteLayout.ts'

const close = (a, b, epsilon = 1e-8) => assert(Math.abs(a - b) < epsilon, `${a} != ${b}`)
test('the globe-to-terrain handoff is hidden in atmospheric dust', () => {
  const d = landingDuration.entry
  for (let t = .48; t <= .56; t += .005) {
    const pose = landingFlight('entry', d * t)
    assert.equal(pose.worldVisible, true)
    close(pose.haze, 1)
    assert(pose.atmosphere > 0)
  }
  assert(landingFlight('entry', d * .47).planetVisible)
  assert(!landingFlight('entry', d * .57).planetVisible)
  assert.equal(landingFlight('entry', d).haze, 0)
})
test('entry, hover and thrust share the same position and attitude at their boundaries', () => {
  const entry = landingFlight('entry', landingDuration.entry)
  const hover = landingFlight('arm', 0)
  const thrust = landingFlight('thrust', 0)
  assert.deepEqual(entry.position, hover.position)
  assert.deepEqual(hover.position, thrust.position)
  close(entry.pitch, hover.pitch); close(hover.pitch, thrust.pitch)
})
test('the controlled descent slows continuously and stops on the gameplay landing pad', () => {
  let previous = landingFlight('thrust', 0)
  for (let i = 1; i <= 240; i++) {
    const pose = landingFlight('thrust', landingDuration.thrust * i / 240)
    assert(pose.altitude <= previous.altitude)
    assert(pose.verticalSpeed <= previous.verticalSpeed)
    assert(pose.position[1] >= LANDING_SITE.y)
    previous = pose
  }
  const contact = landingFlight('thrust', landingDuration.thrust)
  assert.deepEqual(contact.position, [LANDING_SITE.x, LANDING_SITE.y, LANDING_SITE.z])
  close(contact.verticalSpeed, 0); close(contact.pitch, 0)
  assert.deepEqual(contact.position, landingFlight('touchdown', 0).position)
})
test('suit, hatch and gameplay arrival all refer to the same landed ship', () => {
  const contact = landingFlight('thrust', landingDuration.thrust)
  for (const stage of ['signal', 'suit', 'seal', 'cycle', 'exit']) assert.deepEqual(landingFlight(stage, 0).position, contact.position)
  assert.equal(LANDING_SITE, SITE.find(p => p.id === 'ship'))
  const arrival = arrivalPose('outside', false, true)
  close(arrival.foot[0], SHIP_EXIT[0]); close(arrival.foot[2], SHIP_EXIT[2])
  assert(Math.hypot(arrival.foot[0] - LANDING_SITE.x, arrival.foot[2] - LANDING_SITE.z) < 10)
  close(Math.sin(LANDING_YAW), -1) // Cabin looks towards the existing base at x=0.
})

test('overshoot and skip-to-suit cannot put the ship below the terrain or past the pad', () => {
  const final = landingFlight('thrust', 10000)
  assert.deepEqual(final.position, [LANDING_SITE.x, LANDING_SITE.y, LANDING_SITE.z])
  assert.equal(final.altitude, 0)
  assert.equal(final.verticalSpeed, 0)
  assert.deepEqual(landingFlight('suit', 0).position, final.position)
  const hover = landingFlight('arm', 10000)
  assert.equal(hover.position[1], 70)
  assert.equal(hover.verticalSpeed, 0)
})

test('orbit and entry meet before the atmospheric transition, including altitude and attitude', () => {
  const orbit = landingFlight('earth', landingDuration.earth)
  const entry = landingFlight('entry', 0)
  assert.deepEqual(orbit.position, entry.position)
  close(orbit.pitch, entry.pitch)
  assert(orbit.altitude > 100000)
})

test('nearby landing keeps the pad, terrain, walking path and PEBBLE together', () => {
  for (const id of ['landing-pad', 'landing-scorch']) {
    const placement = SITE.find(p => p.id === id)
    assert.equal(placement.x, LANDING_SITE.x)
    assert.equal(placement.z, LANDING_SITE.z)
  }
  assert(SITE_PADS.some(p => p.x === LANDING_SITE.x && p.z === LANDING_SITE.z))
  const route = SITE_ROUTES.find(r => r.id === 'ship-walk')
  assert.equal(route.to[0], LANDING_SITE.x)
  assert(Math.hypot(SHIP_EXIT[0] - route.from[0], SHIP_EXIT[2] - route.from[1]) <= 35)
  assert(Math.hypot(PEBBLE_ARRIVAL[0] - SHIP_EXIT[0], PEBBLE_ARRIVAL[1] - SHIP_EXIT[2]) < 6)
})
