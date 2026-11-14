import type { Runtime } from './commands.ts'
import type { SimState, Location } from './state.ts'
import { absoluteMinute } from './time.ts'
export const G: Record<Location, number> = { outside: 1, overhang: 0.6, hab: 0.8, shelter: 0.7, ship: 0.8, rover: 0.9 }
export const S: Record<Location, number> = { outside: 1, overhang: 0.3, hab: 0.35, shelter: 0.2, ship: 0.4, rover: 0.5 }
export const DP_MICROGRAY = 210
/** Piecewise rise 1h, plateau 1h, tail 6h. Integral = 39 DP without GCR. */
export function sepFluxAt(minutesSinceOnset: number) {
  const t = minutesSinceOnset
  const peak = 39 * 1440 / 270
  return t < 0 || t >= 480 ? 0 : t < 60 ? peak * t / 60 : t < 120 ? peak : peak * (480 - t) / 360
}
export function stepRadiation(s: SimState, r: Runtime) {
  const now = absoluteMinute(s)
  s.rad.gcrFactor = now < r.forbushUntil ? 0.9 : 1
  if (r.sepStart !== null) {
    const elapsed = now - r.sepStart - r.sepOnset
    s.rad.sepFlux = sepFluxAt(elapsed)
    s.rad.weather = elapsed < 0 ? 'flare' : elapsed < 480 ? 'sep' : 'quiet'
    if (elapsed >= 480) r.sepStart = null
  }
  const shield = s.you.location === 'shelter' && r.waterWallLiters === 30 ? 0.1 : S[s.you.location]
  s.you.doseDP += (s.rad.gcrFactor * G[s.you.location] + s.rad.sepFlux * shield) / 1440
}
