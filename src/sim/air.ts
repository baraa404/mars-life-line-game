import type { Runtime } from './commands.ts'
import type { SimState } from './state.ts'
import { inside } from './time.ts'
export function stepAir(s: SimState, r: Runtime) {
  if (inside(s)) { if (s.you.location !== 'ship') s.air.o2Kg = Math.max(0, s.air.o2Kg - 0.84 / 1440) }
  else s.you.suitO2Kg = Math.max(0, s.you.suitO2Kg - 0.5 / 480)
  const e = s.power.on.electrolyser ? (s.power.level.electrolyser ?? 1) : 0
  r.electrolyserWater = s.water.liters >= 0.0675 / 60 * e ? 0.0675 / 60 * e : 0
  s.air.o2Kg += r.electrolyserWater / 1.125
  s.air.o2Kg += s.power.on.oxygenMaker ? 0.05 / 60 * (s.power.level.oxygenMaker ?? 1) : 0
  s.air.mix = { electrolyser: e, oxygenMaker: s.power.on.oxygenMaker ? (s.power.level.oxygenMaker ?? 1) : 0 }
  if (s.power.on.lifeSupport) {
    s.air.scrubberLife = Math.max(0, s.air.scrubberLife - 1 / (8 * 1440))
    if (s.air.scrubberLife > 0) s.air.co2 = Math.max(0, s.air.co2 - 0.2 / 60)
    else s.air.co2 = Math.min(1, s.air.co2 + 0.1 / 60)
  } else s.air.co2 = Math.min(1, s.air.co2 + 0.1 / 60)
}
