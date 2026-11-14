/** Metres, matching landing-ship-cabin-walkable.glb. +Z faces the viewport. */
export const CABIN_FLOOR = 0.92
export const CABIN_EYE = CABIN_FLOOR + 1.65
export const CABIN_RADIUS = 0.23
export const CABIN_SPAWN = { x: 0, z: -1.9 }
export const CABIN_LIMITS = { minX: -2.22, maxX: 2.22, minZ: -3.07, maxZ: 1.56 }
export type CabinObstacle = { name: string; minX: number; maxX: number; minZ: number; maxZ: number }
export const CABIN_OBSTACLES: CabinObstacle[] = [
  { name: 'hatch and wheel', minX: -.73, maxX: .73, minZ: -3.15, maxZ: -2.77 },
  { name: 'console', minX: -1.97, maxX: 1.97, minZ: .68, maxZ: 1.48 },
  ...[-1.22, 1.22].map(x => ({ name: `seat ${x}`, minX: x - .45, maxX: x + .45, minZ: -1.1, maxZ: -.16 })),
  ...[-1.63, 1.63].map(x => ({ name: `locker ${x}`, minX: x - .46, maxX: x + .46, minZ: -3.04, maxZ: -2.50 })),
  ...[-2.03, 2.03].map(x => ({ name: `oxygen ${x}`, minX: x - .19, maxX: x + .19, minZ: -2.07, maxZ: -1.69 })),
]

export function cabinPositionClear(x: number, z: number) {
  const r = CABIN_RADIUS, b = CABIN_LIMITS
  if (x < b.minX + r || x > b.maxX - r || z < b.minZ + r || z > b.maxZ - r) return false
  return !CABIN_OBSTACLES.some(o => x > o.minX - r && x < o.maxX + r && z > o.minZ - r && z < o.maxZ + r)
}

/** Small swept steps prevent tunnelling; axis resolution lets the body slide along furniture. */
export function moveInCabin(position: { x: number; z: number }, dx: number, dz: number) {
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / .06))
  let { x, z } = position
  for (let i = 0; i < steps; i++) {
    if (cabinPositionClear(x + dx / steps, z)) x += dx / steps
    if (cabinPositionClear(x, z + dz / steps)) z += dz / steps
  }
  return { x, z }
}
