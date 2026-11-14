import type { SimState } from './state.ts'
export const MINUTES_PER_SOL = 1440
export const H = 1.0275
export const STEP_HOURS = 1 / 60
export const absoluteMinute = (s: SimState) => (s.clock.sol - 1) * 1440 + s.clock.minute
export const daylight = (hour: number) => hour <= 6 || hour >= 18 ? 0 : Math.sin(Math.PI * (hour - 6) / 12)
export const inside = (s: SimState) => ['hab', 'shelter', 'ship'].includes(s.you.location)
export const canSleep = (s: SimState, sealed: boolean) =>
  sealed && s.you.location === 'hab' && (s.clock.minute >= 1020 || s.you.energy <= 1)
export function advanceClock(s: SimState) {
  s.clock.minute++
  if (s.clock.minute === 1440) { s.clock.minute = 0; s.clock.sol++ }
}
export const nextDawn = (s: SimState) => absoluteMinute(s) + ((360 - s.clock.minute + 1440) % 1440 || 1440)
