import type { Runtime } from './commands.ts'
import { halfRations } from './food.ts'
import type { SimState } from './state.ts'
import { absoluteMinute } from './time.ts'
export const taskMultiplier = (s: SimState) => s.you.energy === 0 ? 1.5 : s.you.energy === 1 ? 1.25 : 1
export const canWorkOutside = (s: SimState) => s.you.energy > 0 && s.you.doseDP <= 90 && s.you.suitO2Kg > 0
export function losePip(s: SimState, key: 'energy' | 'health' | 'spirit') { s.you[key] = Math.max(0, s.you[key] - 1) as 0 | 1 | 2 | 3 }
export function stepYou(s: SimState, r: Runtime) {
  const now = absoluteMinute(s)
  for (const event of s.log) if (event.kind === 'freshFoodBonus' && (event.sol - 1) * 1440 + event.minute + 10 * 1440 === now) losePip(s, 'health')
  if (!s.clock.sleeping && absoluteMinute(s) !== r.lastWakeAt && (s.clock.minute === 120 || s.clock.minute === 360)) losePip(s, 'energy')
  if (s.air.co2 >= 0.8 && s.clock.minute % 120 === 0) losePip(s, 'energy')
  if (s.clock.sleeping && (!s.power.on.heaters || (s.power.level.heaters ?? 1) < 1)) r.coldSleep = true
  if (s.clock.minute === 360 && (!s.power.on.heaters || (s.power.level.heaters ?? 1) < 1)) losePip(s, 'health')
  if (s.clock.minute === 0) {
    if (halfRations(s)) { losePip(s, 'energy'); losePip(s, 'spirit') }
    if (s.clock.sol - r.lastFreshFood > 20 && s.clock.sol % 10 === 0) losePip(s, 'health')
    if (s.comms.blackout && s.clock.sol % 7 === 0) losePip(s, 'spirit')
  }
}
