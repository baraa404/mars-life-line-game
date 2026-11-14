import type { Runtime } from './commands.ts'
import { logEvent, topContributors, warningCard } from './causal.ts'
import { demand } from './loads.ts'
import { clamp, loadRecord, type SimState } from './state.ts'
import { H } from './time.ts'
export function opacityFactor(tau: number) {
  const points = [[0.5, 1], [1, 0.8], [2, 0.5], [3, 0.3], [4, 0.18], [5, 0.12]]
  if (tau <= 0.5) return 1
  for (let i = 1; i < points.length; i++) if (tau <= points[i][0]) {
    const [x, y] = points[i - 1], [xx, yy] = points[i]
    return y + (yy - y) * (tau - x) / (xx - x)
  }
  return 0.12
}
export const solarKW = (s: SimState) => 16 * s.env.daylight * (1 - s.power.panelDust) * opacityFactor(s.env.tau) * s.power.arrayHealth
export function stepPower(s: SimState, r: Runtime) {
  if (s.clock.minute === 1080) s.power.ledger = loadRecord(0)
  s.power.on.lifeSupport = true // Always attempted; only the emergency shed loop can cut it.
  const generated = solarKW(s) + (s.power.fissionOnline ? 6 : 0)
  const loads = demand(s, r), before = s.power.batteryKWh, dt = H / 60
  let used = Object.values(loads).reduce((a, b) => a + b, 0)
  const shed: string[] = []
  for (const id of [...s.power.priority].reverse()) {
    if ((used - generated) * dt <= before + 1e-12) break
    if (!s.power.on[id] || loads[id] === 0) continue
    s.power.on[id] = false; used -= loads[id]; loads[id] = 0; shed.push(id)
  }
  const netEnergy = (generated - used) * dt
  const loss = Math.max(0, netEnergy) * 0.08
  const uncapped = before + netEnergy - loss
  const spilled = Math.max(0, uncapped - s.power.batteryCapKWh)
  s.power.batteryKWh = clamp(uncapped, 0, s.power.batteryCapKWh)
  for (const id of s.power.priority) s.power.ledger[id] += loads[id] * dt
  if (shed.length) {
    // A persistent dead base should issue one card, not one card every minute.
    if (!r.warnings.brownout || s.power.batteryKWh > 0.1) {
      logEvent(s, 'brownout', `Switched off: ${shed.join(', ')}. Review the night plan.`, topContributors(s))
      if (!r.mission || r.mission === 'm0-complete') warningCard(s, r, 'brownout', 'Power is short. Some machines switched off.')
      r.warnings.brownout = { level: 2, yellowAt: null, red: true, decision: false }
    }
  } else if (s.power.batteryKWh > 5) delete r.warnings.brownout
  if (loads.lab) s.science.labHours += (loads.lab / 1.5) / 60
  if (loads.roverCharge) s.rover.batteryKWh = Math.min(30, s.rover.batteryKWh + loads.roverCharge * dt * 0.92)
  return { loads, generatedKWh: generated * dt, usedKWh: used * dt, lossKWh: loss, spilledKWh: spilled, deltaKWh: s.power.batteryKWh - before }
}
