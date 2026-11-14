import { siteClearance, siteHeight } from './siteLayout.ts'
import { fbm, seededRandom, smoothstep } from './noise.ts'

export const TERRAIN_SIZE = 360
export const TERRAIN_SEGMENTS = 240
export const PAD_RADIUS = 16
export const CRATERS = [
  { x: 19, z: -29, radius: 9, depth: 2.0 },
  { x: -38, z: 22, radius: 12, depth: 2.6 },
  { x: 42, z: 48, radius: 8, depth: 1.7 },
  { x: -27, z: -66, radius: 15, depth: 3.1 },
]

export function washDistance(x: number, z: number) {
  return Math.abs(x - Math.sin(z * 0.036) * 9 - Math.sin(z * 0.085) * 2)
}

// Cache only exact grid samples in a bounded region. Scattering, cliff meshes and
// physics repeatedly query these same four corners; arbitrary positions stay uncached.
const gridHeights = new Map<number, number>()
const gridStep = TERRAIN_SIZE / TERRAIN_SEGMENTS

/** The render grid, scattering and physical surface share this height function. */
export function terrainHeight(x: number, z: number): number {
  const ix = x / gridStep, iz = z / gridStep
  if (!Number.isInteger(ix) || !Number.isInteger(iz) || Math.abs(ix) > 1024 || Math.abs(iz) > 1024) {
    return calculateTerrainHeight(x, z)
  }
  const key = (ix + 1024) * 2049 + iz + 1024
  const cached = gridHeights.get(key)
  if (cached !== undefined) return cached
  const height = calculateTerrainHeight(x, z)
  gridHeights.set(key, height)
  return height
}

function calculateTerrainHeight(x: number, z: number) {
  const radius = Math.hypot(x, z)
  const fade = smoothstep(PAD_RADIUS, 29, radius)
  const rolling = (fbm(x * 0.019, z * 0.019, 3, 7) - 0.43) * 3.5
  // Broad overlapping foothills soften the transition from basin to escarpment.
  const hills = FOOTHILLS.reduce((sum, h) => sum + h.height * Math.exp(
    -(((x - h.x) / h.radiusX) ** 2 + ((z - h.z) / h.radiusZ) ** 2) * 2,
  ), 0)
  const dunes = Math.sin(x * 0.12 + Math.sin(z * 0.055) * 1.5) * 0.20
  const wash = Math.exp(-((washDistance(x, z) / 2.5) ** 2)) * 0.38
  let height = (rolling + hills + dunes - wash) * fade
  for (const crater of CRATERS) {
    const dx = x - crater.x, dz = z - crater.z
    const angle = Math.atan2(dz, dx)
    const d = Math.hypot(dx, dz) / (crater.radius * (1 + 0.045 * Math.sin(angle * 7)))
    const rim = crater.depth * 0.35 * Math.exp(-((d - 1) ** 2) / 0.045)
    const bowl = d < 1 ? -crater.depth * (1 - smoothstep(0.1, 1, d)) : 0
    height += (rim + bowl) * fade
  }
  const ridge = fbm(x * 0.011, z * 0.011, 3, 21)
  // An uneven basin rim, with a low opening to the south-east.
  const opening = smoothstep(-35, 110, x + z * 0.7)
  return siteHeight(x, z, height + smoothstep(92, 175, radius) * (2 + ridge * 9) * (1 - opening * 0.65))
}

/** Bilinear triangles match the grid's actual diagonal, including under scattered rocks. */
export function surfaceHeight(x: number, z: number) {
  const step = TERRAIN_SIZE / TERRAIN_SEGMENTS
  const x0 = Math.floor((x + TERRAIN_SIZE / 2) / step) * step - TERRAIN_SIZE / 2
  const z0 = Math.floor((z + TERRAIN_SIZE / 2) / step) * step - TERRAIN_SIZE / 2
  const u = (x - x0) / step, v = (z - z0) / step
  const a = terrainHeight(x0, z0), b = terrainHeight(x0 + step, z0)
  const c = terrainHeight(x0, z0 + step), d = terrainHeight(x0 + step, z0 + step)
  // PlaneGeometry after -PI/2 rotation uses the b-c diagonal.
  return u + v < 1 ? a + u * (b - a) + v * (c - a) : d + (1 - u) * (c - d) + (1 - v) * (b - d)
}

export type Formation = {
  x: number; z: number; radiusX: number; radiusZ: number; height: number; seed: number
}

/** Connected northern high ground, isolated western remnants and an open south-east. */
export const MESAS: Formation[] = [
  { x: -94, z: -110, radiusX: 35, radiusZ: 28, height: 21, seed: 18 },
  { x: -45, z: -151, radiusX: 25, radiusZ: 25, height: 24, seed: 35 },
  { x: 51, z: -151, radiusX: 25, radiusZ: 25, height: 21, seed: 91 },
  { x: 111, z: -123, radiusX: 29, radiusZ: 29, height: 16, seed: 104 },
  { x: -137, z: -43, radiusX: 25, radiusZ: 34, height: 18, seed: 62 },
  { x: -129, z: 53, radiusX: 29, radiusZ: 36, height: 16, seed: 126 },
  { x: -63, z: 139, radiusX: 37, radiusZ: 25, height: 14, seed: 171 },
]

export const SHELVES: Formation[] = [
  { x: -31, z: -23, radiusX: 9, radiusZ: 6, height: 1.6, seed: 21 },
  { x: 37, z: -33, radiusX: 10, radiusZ: 7, height: 1.9, seed: 31 },
  { x: -57, z: -57, radiusX: 14, radiusZ: 10, height: 3.8, seed: 45 },
  { x: 72, z: -77, radiusX: 16, radiusZ: 11, height: 4.6, seed: 57 },
  { x: -47, z: 42, radiusX: 12, radiusZ: 9, height: 2.5, seed: 65 },
  { x: 52, z: 48, radiusX: 13, radiusZ: 9, height: 1.7, seed: 74 },
  { x: -89, z: -77, radiusX: 18, radiusZ: 13, height: 5.2, seed: 86 },
  { x: -89, z: 93, radiusX: 17, radiusZ: 11, height: 3.3, seed: 95 },
]

export const FOOTHILLS: Formation[] = [
  { x: -70, z: -85, radiusX: 39, radiusZ: 30, height: 4.8, seed: 1 },
  { x: 25, z: -95, radiusX: 54, radiusZ: 26, height: 5.5, seed: 2 },
  { x: 91, z: -94, radiusX: 35, radiusZ: 29, height: 3.8, seed: 3 },
  { x: -103, z: 12, radiusX: 29, radiusZ: 55, height: 4.4, seed: 4 },
  { x: -69, z: 100, radiusX: 42, radiusZ: 31, height: 3.6, seed: 5 },
  { x: 55, z: 66, radiusX: 38, radiusZ: 27, height: 2.4, seed: 6 },
]

export type RockPlacement = {
  variant: number; x: number; y: number; z: number
  width: number; heightScale: number; depthScale: number; rotation: number; shade: number
}

export function clearOfAssets(x: number, z: number, radius: number) {
  if (!siteClearance(x, z, radius)) return false
  if (Math.hypot(x, z) < 3.7 + radius) return false
  if (Math.hypot(x - 0.65, z - 3.6) < 1.25 + radius) return false
  if (Math.hypot(x, z - 14) < 1.8 + radius) return false
  // Keep a walkable route from spawn through the basin, rather than a scatter wall.
  if (radius > 0.10 && z > -55 && z < 16 && washDistance(x, z) < 2 + radius) return false
  return ![...MESAS, ...SHELVES].some(f =>
    ((x - f.x) / (f.radiusX + radius)) ** 2 + ((z - f.z) / (f.radiusZ + radius)) ** 2 < 1.12,
  )
}

export function createRockPlacements(): RockPlacement[] {
  const random = seededRandom(38106)
  const rocks: RockPlacement[] = []
  function add(x: number, z: number, width: number, variant = Math.floor(random() * 5)) {
    if (Math.abs(x) > 145 || Math.abs(z) > 145 || !clearOfAssets(x, z, width * 0.48)) return
    if (width > 1.3 && CRATERS.some(c => Math.hypot(x - c.x, z - c.z) < c.radius * 1.15)) return
    // Bury enough of the foot to avoid hovering on a sloping triangular ground cell.
    const slope = Math.max(
      Math.abs(surfaceHeight(x + width / 2, z) - surfaceHeight(x - width / 2, z)),
      Math.abs(surfaceHeight(x, z + width / 2) - surfaceHeight(x, z - width / 2)),
    )
    rocks.push({ variant, x, z, y: surfaceHeight(x, z) - slope * 0.55 - width * 0.035,
      width, heightScale: 0.9 + random() * 0.65, depthScale: 0.75 + random() * 0.5,
      rotation: random() * Math.PI * 2, shade: 0.84 + random() * 0.25 })
  }
  // Composed foreground silhouettes, deliberately outside the clear approach.
  for (const [x, z, width] of [[-3.5, 6, 1.6], [4.8, 3, 1.5], [-6.2, 1, 2.6], [6.8, -2.5, 2.1], [-9, -7, 3.1], [9, 6, 1.8], [-5, 12, 1.4]]) {
    add(x, z, width, Math.floor(random() * 4))
    for (let j = 0; j < 12; j++) add(x + (random() - 0.5) * 5, z + (random() - 0.5) * 4, 0.12 + random() ** 2 * 0.85)
  }
  // Broken cap rock and scree gather along the toes of cliffs and shelves.
  for (const formation of [...SHELVES, ...MESAS]) for (let i = 0; i < 48; i++) {
    const angle = random() * Math.PI * 2, distance = 1.11 + random() * 0.30
    const x = formation.x + Math.cos(angle) * formation.radiusX * distance
    const z = formation.z + Math.sin(angle) * formation.radiusZ * distance
    add(x, z, 0.18 + random() ** 2 * (formation.height > 10 ? 2.8 : 1.5))
  }
  for (let cluster = 0; cluster < 145; cluster++) {
    const angle = random() * Math.PI * 2
    const radius = 10 + Math.sqrt(random()) * 131
    const cx = Math.cos(angle) * radius, cz = Math.sin(angle) * radius
    add(cx, cz, 0.95 + random() ** 2 * 3.8)
    for (let j = 0; j < 12; j++) {
      const a = random() * Math.PI * 2, distance = Math.sqrt(random()) * 5
      add(cx + Math.cos(a) * distance, cz + Math.sin(a) * distance, 0.09 + random() ** 2 * 1.0)
    }
  }
  for (let i = 0; i < 2400; i++) {
    const x = (random() - 0.5) * 280, z = (random() - 0.5) * 280
    add(x, z, 0.065 + random() ** 3 * 0.5)
  }
  // More readable, sparse small stones in the first-person foreground.
  for (let i = 0; i < 700; i++) add((random() - 0.5) * 48, (random() - 0.5) * 48, 0.055 + random() ** 2 * 0.36)
  return rocks
}
