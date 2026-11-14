import { SITE } from '../world/siteLayout.ts'
import { landingDuration, type LandingStage } from './m0.ts'

export type LandingClock = { stage: LandingStage; seconds: number }
export const LANDING_SITE = SITE.find(p => p.id === 'ship')!
export const LANDING_YAW = -Math.PI / 2 // Cabin +Z faces the station, matching the ship's -X nose.
const settleY = LANDING_SITE.y ?? 0
const clamp = (t: number) => Math.max(0, Math.min(1, t))
const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** One deterministic route shared by exterior movement, atmosphere and cockpit telemetry. */
export function landingFlight(stage: LandingStage, seconds: number) {
  const duration = landingDuration[stage] ?? 1
  const t = clamp(seconds / duration)
  let x = LANDING_SITE.x, y = settleY, z = LANDING_SITE.z, pitch = 0, roll = 0
  let atmosphere = 1, haze = 0, plasma = 0, dust = 0, worldVisible = true, planetVisible = false
  let planetRadius = 2, verticalSpeed = 0
  if (stage === 'orbit' || stage === 'earth') {
    worldVisible = false; planetVisible = true; atmosphere = 0
    y = 180000; x += 180; z += 140
  } else if (stage === 'entry') {
    // The terrain handoff occurs inside the opaque dust layer, not through the globe mesh.
    worldVisible = t >= .48; planetVisible = t < .56
    planetRadius = 2 + 125 * smooth(0, .55, t)
    atmosphere = smooth(.30, .75, t)
    haze = smooth(.20, .48, t) * (1 - smooth(.64, .98, t))
    plasma = Math.sin(Math.PI * smooth(0, .85, t)) * (1 - smooth(.7, 1, t))
    const travel = smooth(0, 1, t)
    x += lerp(180, 55, travel); y = lerp(280, 70, travel); z += lerp(140, 50, travel)
    // Orbital altitude collapses before the terrain reveal; both curves meet smoothly inside the haze.
    y += (180000 - 280) * (1 - smooth(0, .48, t))
    pitch = .58 * smooth(0, .35, t) - .23 * travel; roll = .035 * Math.sin(t * Math.PI * 2)
    verticalSpeed = 210 * 6 * t * (1 - t) / duration
    if (t < .48) {
      const u = t / .48
      verticalSpeed += (180000 - 280) * 6 * u * (1 - u) / (.48 * duration)
    }
  } else if (stage === 'arm') {
    x += 55; y = 70; z += 50; pitch = .35
  } else if (stage === 'thrust') {
    // Quadratic ease-out: horizontal and vertical speed both reach zero at contact.
    const remaining = (1 - t) ** 2
    x += 55 * remaining; y = settleY + (70 - settleY) * remaining; z += 50 * remaining
    pitch = .35 * remaining
    verticalSpeed = 2 * (70 - settleY) * (1 - t) / duration
    dust = smooth(.65, .94, t) * (1 - .4 * smooth(.94, 1, t))
  } else if (stage === 'touchdown') {
    y += .025 * Math.sin(t * Math.PI * 2) * (1 - t) ** 2
    dust = .6 * (1 - smooth(0, 1, t))
  }
  return { position: [x, y, z] as [number, number, number], yaw: LANDING_YAW, pitch, roll,
    atmosphere, haze, plasma, dust, worldVisible, planetVisible, planetRadius, verticalSpeed,
    altitude: Math.max(0, y - settleY), progress: t, landed: !['orbit', 'earth', 'entry', 'arm', 'thrust'].includes(stage) }
}
