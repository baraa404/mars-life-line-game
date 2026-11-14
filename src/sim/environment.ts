import type { Runtime } from './commands.ts'
import { clamp, type SimState } from './state.ts'
import { absoluteMinute, daylight } from './time.ts'
/** Provisional game curve, not yet a curated MEDA dataset (Phase 18). */
export const TEMPERATURE_C = [-64, -68, -72, -76, -79, -80, -78, -70, -59, -47, -37, -29, -24, -21, -20, -22, -27, -35, -43, -49, -53, -56, -59, -62]
export function outsideTemperature(minute: number) {
  const h = ((minute / 60) % 24 + 24) % 24, i = Math.floor(h)
  return clamp(TEMPERATURE_C[i] + (TEMPERATURE_C[(i + 1) % 24] - TEMPERATURE_C[i]) * (h - i), -153, 20)
}
export function stepEnvironment(s: SimState, r: Runtime) {
  s.env.daylight = daylight(s.clock.minute / 60)
  s.env.outsideC = outsideTemperature(s.clock.minute)
  if (r.stormStart === null) return
  const days = (absoluteMinute(s) - r.stormStart) / 1440
  s.env.stormPhase = days < 2 ? 'building' : days < 6 ? 'peak' : days < 9 ? 'clearing' : 'none'
  s.env.tau = days < 2 ? 0.5 + 4 * days / 2 : days < 6 ? 4.5 : days < 9 ? 4.5 - 4 * (days - 6) / 3 : 0.5
  if (days >= 9) r.stormStart = null
}
