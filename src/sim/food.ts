import type { Runtime } from './commands.ts'
import { logEvent } from './causal.ts'
import { trayIsLit } from './loads.ts'
import { clamp, type SimState } from './state.ts'
export const CROPS = { mizuna: { cycle: 25, yield: 1 }, wheat: { cycle: 50, yield: 6 }, pepper: { cycle: 55, yield: 1.5 } }
export function harvestDueSoon(s: SimState) {
  return s.food.trays.some(t => t.crop && t.health > 0 && (1 - t.growth) * CROPS[t.crop].cycle * 16 / (t.photoperiod * (t.photoperiod / 16)) <= 2)
}
export const halfRations = (s: SimState) => s.food.pantrySols < 1 && !harvestDueSoon(s)
export function stepFood(s: SimState, r: Runtime) {
  s.food.pantrySols = Math.max(0, s.food.pantrySols - (halfRations(s) ? 0.5 : 1) / 1440)
  s.food.trays.forEach((t, i) => {
    if (!t.crop || t.growth >= 1) return
    if (!s.power.on.trayClimate || (s.power.level.trayClimate ?? 1) === 0 || !r.waterAvailable) { t.health = Math.max(0, t.health - 0.1 / 1440); return }
    if (trayIsLit(s, i) && t.health > 0) t.growth = clamp(t.growth + (t.photoperiod / 16) * (s.power.level[`trayLights${i + 1}` as 'trayLights1'] ?? 1) / (CROPS[t.crop].cycle * 16 * 60))
  })
}
export function harvest(s: SimState, r: Runtime, index: number) {
  const t = s.food.trays[index]
  if (!t?.crop || t.growth < 1 || t.health <= 0) return
  s.food.pantrySols += CROPS[t.crop].yield
  if (t.crop === 'mizuna' && s.you.health < 3) {
    s.you.health = (s.you.health + 1) as SimState['you']['health']
    logEvent(s, 'freshFoodBonus', 'Mizuna health bonus for 10 sols.')
  }
  if (t.crop === 'pepper') s.you.spirit = Math.min(3, s.you.spirit + 1) as SimState['you']['spirit']
  r.lastFreshFood = s.clock.sol
  logEvent(s, 'harvest', `Harvested ${t.crop}.`)
  t.crop = null; t.growth = 0
}
