import type { Runtime } from './commands.ts'
import type { SimState } from './state.ts'
export const dailyWaterDemand = (s: SimState) => 1 + s.food.trays.reduce((sum, t) => sum + (t.crop ? t.crop === 'wheat' ? 3 : 2 : 0), 0) + (s.power.on.electrolyser ? 1.62 * (s.power.level.electrolyser ?? 1) : 0)
export function stepWater(s: SimState, r: Runtime) {
  const before = s.water.liters
  const use = (1 + s.food.trays.reduce((sum, t) => sum + (t.crop ? t.crop === 'wheat' ? 3 : 2 : 0), 0)) / 1440 + r.electrolyserWater
  r.waterAvailable = before >= use
  s.water.liters = Math.max(0, before - use)
  let produced = 0
  if (s.power.on.waterProcessor && s.water.filterLife > 0) {
    const liters = Math.min(6 / 60 * (s.power.level.waterProcessor ?? 1), s.water.iceKg * 0.9)
    produced = liters
    s.water.liters += liters
    s.water.iceKg = Math.max(0, s.water.iceKg - liters / 0.9)
    // Provisional filter capacity: 300 L clean / 150 L dirty.
    s.water.filterLife = Math.max(0, s.water.filterLife - liters / 300 * (s.water.iceDirty ? 2 : 1))
  }
  if (r.pumpMinutes > 0 && s.power.on.shelterPump) {
    r.pumpMinutes--
    if (r.pumpMinutes === 0) {
      if (s.water.liters >= 30) { s.water.liters -= 30; r.waterWallLiters = 30 }
      s.power.on.shelterPump = false
    }
  }
  // A full rolling-sol consumption window; production offsets consumption, never wall transfers.
  const netUse = Math.max(0, use - produced)
  r.waterSum += netUse - r.waterUse[r.waterCursor]
  r.waterUse[r.waterCursor] = netUse
  r.waterCursor = (r.waterCursor + 1) % 1440
}
