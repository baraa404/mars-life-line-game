/** Metres, +X east, -Z north. Explicit mission geometry, independent of render code. */
export type SitePlacement = { id: string; asset: string; x: number; z: number; y?: number; rotationY: number; collider: 'trimesh' | 'none'; shadow?: boolean }
export const LANDING_PAD_X = 50
/**
 * One east-west avenue (z 10.5) runs past the hab door (0, 6.4); every station faces it.
 * North side, against the hab: greenhouse and storm shelter on the wing, oxygen maker on the
 * east wall. South side: the ice drill (opposite the oxygen maker, joined by a buried water
 * line), the rover parked by the ice and a cargo pile. Power and comms stay north-east by the
 * ship road (z 6).
 */
export const AVENUE_Z = 10.5
export const SITE: SitePlacement[] = [
  { id: 'hab', asset: 'command-base', x: 0, z: 0, rotationY: -90, collider: 'trimesh' },
  { id: 'greenhouse', asset: 'greenhouse-dome', x: -13.5, z: 5.8, rotationY: -90, collider: 'trimesh' },
  { id: 'shelter', asset: 'storm-shelter-module', x: -7.5, z: 6.5, rotationY: -90, collider: 'trimesh' },
  { id: 'oxygen', asset: 'oxygen-maker', x: 6.2, z: 6.6, rotationY: -90, collider: 'trimesh' },
  { id: 'recycler', asset: 'water-recycler', x: 2.5, z: 14.3, rotationY: 90, collider: 'trimesh' },
  { id: 'ice-drill', asset: 'ice-drill', x: 8, z: 14.5, rotationY: 90, collider: 'trimesh' },
  { id: 'ice-rocks', asset: 'rock-cluster', x: 12.5, z: 17, rotationY: 40, collider: 'trimesh' },
  { id: 'rover', asset: 'mars-rover', x: 14, z: 13, rotationY: 90, collider: 'trimesh' },
  { id: 'supply', asset: 'crate-supply', x: -4.5, z: 14.2, rotationY: 0, collider: 'trimesh' },
  { id: 'supply-2', asset: 'crate-supply', x: -2.2, z: 14.4, rotationY: 8, collider: 'trimesh' },
  ...Array.from({ length: 4 }, (_, i): SitePlacement => ({ id: `solar-${i + 1}`, asset: 'solar-array-row', x: 19 + i * 4, z: -10, rotationY: 180, collider: 'trimesh' })),
  { id: 'battery', asset: 'battery-bank', x: 15.5, z: -15, rotationY: -90, collider: 'trimesh' },
  { id: 'dock', asset: 'pebble-dock', x: 5, z: 1.5, rotationY: 90, collider: 'trimesh' },
  { id: 'dish', asset: 'comms-dish', x: 14.5, z: 1.5, rotationY: -90, collider: 'trimesh' },
  { id: 'landing-pad', asset: 'landing-pad', x: LANDING_PAD_X, z: 0, y: -.2, rotationY: 0, collider: 'trimesh' },
  { id: 'landing-scorch', asset: 'landing-scorch', x: LANDING_PAD_X, z: 0, y: .115, rotationY: 0, collider: 'none', shadow: false },
  { id: 'ship', asset: 'landing-ship', x: LANDING_PAD_X, z: 0, y: .12, rotationY: 180, collider: 'trimesh' },
  { id: 'horizon-mesas', asset: 'mesa-distant', x: -110, z: -255, y: 3, rotationY: 20, collider: 'none', shadow: false },
  { id: 'horizon-ridge', asset: 'ridge-horizon', x: 110, z: -235, y: 4, rotationY: -20, collider: 'none', shadow: false },
]
export const SITE_PADS = [
  { x: 8, z: 1, halfX: 31, halfZ: 27, feather: 14 },
  { x: LANDING_PAD_X, z: 0, halfX: 10, halfZ: 10, feather: 14 },
]
export const SITE_ROUTES = [
  { id: 'ship-walk', from: [9, 6], to: [LANDING_PAD_X, 6], width: 4 },
  { id: 'array-walk', from: [8, 6], to: [34, 0], width: 4 },
  { id: 'avenue', from: [-14, 10.5], to: [9, 10.5], width: 3 },
  { id: 'avenue-link', from: [9, 6], to: [9, 10.5], width: 3 },
] as const
export function segmentDistance(x: number, z: number, a: readonly number[], b: readonly number[]) {
  const dx = b[0] - a[0], dz = b[1] - a[1]
  const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1)))
  return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t)
}
export function siteClearance(x: number, z: number, radius = 0) {
  if (SITE_PADS.some(p => Math.abs(x - p.x) < p.halfX + radius + 1 && Math.abs(z - p.z) < p.halfZ + radius + 1)) return false
  if (SITE_ROUTES.some(r => segmentDistance(x, z, r.from, r.to) < r.width / 2 + radius + 1)) return false
  return !CABLE_ROUTES.some(r => r.points.some((point, i) => i > 0 && segmentDistance(x, z, r.points[i - 1], point) < .6 + radius))
}
/** Flatten actual terrain vertices (not a separate floating floor) with blended borders. */
export function siteHeight(x: number, z: number, natural: number) {
  let weight = 0
  const smooth = (t: number) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t) }
  for (const p of SITE_PADS) {
    const d = Math.max(Math.abs(x - p.x) - p.halfX, Math.abs(z - p.z) - p.halfZ)
    weight = Math.max(weight, 1 - smooth(d / p.feather))
  }
  for (const r of SITE_ROUTES) weight = Math.max(weight, 1 - smooth((segmentDistance(x, z, r.from, r.to) - r.width / 2) / 14))
  for (const r of CABLE_ROUTES) for (let i = 1; i < r.points.length; i++) weight = Math.max(weight, 1 - smooth((segmentDistance(x, z, r.points[i - 1], r.points[i]) - .6) / 10))
  return natural * (1 - weight)
}
export type CableRoute = { id: string; points: [number, number][] }
// Orthogonal spline control points for the buried power cables.
export const CABLE_ROUTES: CableRoute[] = [
  { id: 'hab-battery', points: [[3, -3], [8, -3], [12, -3], [12, -15], [14.3, -15]] },
  { id: 'battery-array', points: [[16.7, -15], [19, -15], [23, -15], [27, -15], [31, -15]] },
  ...Array.from({ length: 4 }, (_, i): CableRoute => ({ id: `array-feed-${i + 1}`, points: [[19 + i * 4, -15], [19 + i * 4, -13]] })),
  { id: 'water-line', points: [[7.2, 12.85], [7.2, 7.4]] },
  { id: 'oxygen-line', points: [[4.85, 6.6], [4.05, 6.6]] },
]

export const CABLE_FITTINGS: SitePlacement[] = [
  { id: 'cable-elbow-hab', asset: 'cable-run-bend', x: 12, z: -3, y: -.18, rotationY: 180, collider: 'none', shadow: false },
  { id: 'cable-elbow-array', asset: 'cable-run-bend', x: 12, z: -15, y: -.18, rotationY: 0, collider: 'none', shadow: false },
  { id: 'cable-elbow-last', asset: 'cable-run-bend', x: 31, z: -15, y: -.18, rotationY: -90, collider: 'none', shadow: false },
  ...[19, 23, 27].map((x): SitePlacement => ({ id: `cable-tee-${x}`, asset: 'cable-run-t', x, z: -15, y: -.18, rotationY: 0, collider: 'none', shadow: false })),
]

/** World position of a point given in a placement's local frame (+X is the model's front). */
export function placementPoint(id: string, local: readonly [number, number, number]): [number, number, number] {
  const p = SITE.find(item => item.id === id)
  if (!p) throw new Error('No site placement ' + id)
  const a = p.rotationY * Math.PI / 180, c = Math.cos(a), s = Math.sin(a)
  return [p.x + local[0] * c + local[2] * s, local[1], p.z - local[0] * s + local[2] * c]
}

/** Where the player stands to use each station: in front of its face, outside every collider. */
export const STATION_POINTS = {
  greenhouse: placementPoint('greenhouse', [4.5, 1.4, 0]),
  shelter: placementPoint('shelter', [2.8, 1.4, 0]),
  oxygen: placementPoint('oxygen', [1.9, 1.4, -.5]),
  ice: placementPoint('ice-drill', [2.6, 1.4, 0]),
  solar: [25, 1.4, -5.6] as [number, number, number],
  comms: placementPoint('dish', [2.3, 1.4, 0]),
}

/** Aim at the equipment itself; STATION_POINTS remain walking/guide destinations. */
export const STATION_INTERACTION_POINTS = {
  greenhouse: [placementPoint('greenhouse', [3.65, 1.4, 0])],
  shelter: [placementPoint('shelter', [1.7, 1.4, 0])],
  oxygen: [placementPoint('oxygen', [.82, 1.3, -.5])],
  ice: [placementPoint('ice-drill', [1.6, 1.4, 0])],
  solar: [1, 2, 3, 4].map(i => placementPoint(`solar-${i}`, [0, 1.24, -2.95])),
  comms: [placementPoint('dish', [1.2, 1.4, 0])],
}
