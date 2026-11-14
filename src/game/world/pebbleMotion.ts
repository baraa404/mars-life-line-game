import { LANDING_PAD_X } from './siteLayout.ts'

/** Outdoor navigation limits include the robot's footprint and keep entrances clear. */
export const PEBBLE_DOCK = [6.3, 0, 1.5] as const
const buildings = [
  { minX: -4.6, maxX: 4.9, minZ: -4.4, maxZ: 8.5 }, // Command base and entry steps.
  { minX: -17.2, maxX: -2.5, minZ: -3, maxZ: 3.2 }, // Hab wing.
  { minX: -16.9, maxX: -10.1, minZ: 2.5, maxZ: 9.8 }, // Greenhouse dome.
  { minX: -9.8, maxX: -5.6, minZ: 4.6, maxZ: 8.6 }, // Storm shelter.
  { minX: 4.7, maxX: 7.9, minZ: 5.6, maxZ: 7.6 }, // Oxygen maker.
  { minX: 6.3, maxX: 9.7, minZ: 12.5, maxZ: 16.3 }, // Ice drill.
  { minX: 12.6, maxX: 15.4, minZ: 10.3, maxZ: 15.6 }, // Rover.
  { minX: -5.9, maxX: -.8, minZ: 12.8, maxZ: 15.8 }, // Cargo crates.
  { minX: 13.1, maxX: 16, minZ: .1, maxZ: 2.9 }, // Comms dish.
  { minX: LANDING_PAD_X - 4, maxX: LANDING_PAD_X + 4, minZ: -4, maxZ: 4 }, // Landing ship.
]
export function pebbleCanOccupy(x: number, z: number) {
  return !buildings.some(b => x > b.minX && x < b.maxX && z > b.minZ && z < b.maxZ)
}

/** Hysteresis keeps the companion settled until the player leaves its comfort radius. */
export const PEBBLE_FOLLOW_STOP = 3
export const PEBBLE_FOLLOW_START = 4.2
export function pebbleFollowState(distance: number, following: boolean, playerSpeed: number) {
  const active = distance > (following ? PEBBLE_FOLLOW_STOP : PEBBLE_FOLLOW_START)
  const maxSpeed = active ? Math.min(8, Math.max(2, playerSpeed) + Math.max(0, distance - PEBBLE_FOLLOW_START) * 1.2) : 0
  return { following: active, maxSpeed }
}

/** Ease speed at both ends; cap a long frame so resuming never makes the robot jump. */
export function pebbleMotionStep(speed: number, distance: number, stopAt: number, maxSpeed: number, delta: number) {
  const dt = Math.min(Math.max(delta, 0), .05)
  const remaining = Math.max(0, distance - stopAt)
  const wanted = Math.min(maxSpeed, remaining * 2.5)
  const nextSpeed = speed + (wanted - speed) * (1 - Math.exp(-6 * dt))
  const step = Math.min(nextSpeed * dt, remaining)
  return { speed: remaining > .002 ? nextSpeed : 0, step: remaining > .002 ? step : 0, dt }
}
