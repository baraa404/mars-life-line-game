import { clamp, loadRecord, type LoadId, type SimState } from './state.ts'
import type { Runtime } from './commands.ts'
export const lightId = (i: number) => `trayLights${i + 1}` as LoadId
export function trayIsLit(s: SimState, i: number) {
  const tray = s.food.trays[i]
  if (!tray?.crop || !s.power.on[lightId(i)]) return false
  const start = (24 - tray.photoperiod) / 2
  const h = s.clock.minute / 60
  return h >= start && h < start + tray.photoperiod
}
export function loadKW(s: SimState, r: Runtime, id: LoadId): number {
  if (!s.power.on[id]) return 0
  const level = clamp(s.power.level[id] ?? 1)
  switch (id) {
    case 'lifeSupport': return 1.5
    case 'heaters': return clamp(0.2 + 0.015 * (20 - s.env.outsideC), 0.4, 2.5) * level
    case 'oxygenMaker': return 1.5 * level
    case 'electrolyser': return s.water.liters >= 0.0675 / 60 * level ? level : 0
    case 'waterProcessor': return s.water.iceKg > 0 && s.water.filterLife > 0 ? (s.water.iceDirty ? 2.1 : 1.5) * level : 0
    case 'trayLights1': case 'trayLights2': case 'trayLights3': return trayIsLit(s, Number(id.at(-1)) - 1) ? level : 0
    case 'trayClimate': return s.food.trays.reduce((kw, t) => kw + (t.crop ? t.crop === 'pepper' ? 0.35 : 0.2 : 0), 0) * level
    case 'lab': return 1.5 * level
    case 'dish': return !s.comms.blackout && s.comms.outbox.some(m => m.sentAt === null) && s.comms.relayWindows.some(w => s.clock.minute >= w.start && s.clock.minute < w.end) ? 0.8 : 0
    case 'roverCharge': return s.rover.batteryKWh < 30 ? 2 : 0
    case 'pebbleCharge': return !r.pebbleTravel && s.pebble.batteryPct < 100 && !s.pebble.glitched && s.pebble.location === 'hab' && (!s.pebble.job || s.pebble.job.kind === 'charge') ? 0.2 : 0
    case 'shelterPump': return r.pumpMinutes > 0 ? 0.3 : 0
  }
}
export function demand(s: SimState, r: Runtime) {
  const loads = loadRecord(0)
  for (const id of s.power.priority) loads[id] = loadKW(s, r, id)
  return loads
}
