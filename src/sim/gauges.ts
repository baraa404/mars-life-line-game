import type { Runtime } from './commands.ts'
import { dailyWaterDemand } from './water.ts'
import { demand } from './loads.ts'
import type { SimState } from './state.ts'
import { H } from './time.ts'
export const airSols = (s: SimState) => s.air.o2Kg / 0.84
export function waterSols(s: SimState, r: Runtime) {
  if (s.water.liters <= 0) return 0
  const days = Math.min(1, r.steps / 1440)
  const dailyUse = days > 0 ? Math.max(0, r.waterSum) / days : dailyWaterDemand(s)
  return dailyUse <= 1e-12 ? Infinity : s.water.liters / dailyUse
}
export const status = (sols: number) => sols < 0.25 ? { level: 3, shape: '■', text: 'Return to Ship' } : sols < 1 ? { level: 2, shape: '■', text: 'Act' } : sols < 3 ? { level: 1, shape: '▲', text: 'Watch' } : { level: 0, shape: '●', text: 'OK' }
export function nightCovered(s: SimState, r: Runtime) {
  const night = structuredClone(s)
  night.clock.minute = 0; night.env.daylight = 0; night.env.outsideC = -72
  const kw = Object.values(demand(night, r)).reduce((a, b) => a + b, 0) - (s.power.fissionOnline ? 6 : 0)
  return kw <= 0 ? Infinity : s.power.batteryKWh / (kw * H)
}
