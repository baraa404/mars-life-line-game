import type { Runtime } from './commands.ts'
import { logEvent } from './causal.ts'
import { clamp, type SimState } from './state.ts'
import { absoluteMinute } from './time.ts'
export function stepPebble(s: SimState, r: Runtime) {
  const p = s.pebble, now = absoluteMinute(s)
  r.nightWatch = s.clock.sleeping && !p.glitched && p.batteryPct > 0 && p.location === 'hab'
  if (p.glitched) {
    if (now < r.rebootUntil) return
    p.glitched = false; logEvent(s, 'pebbleReboot', 'PEBBLE rebooted.')
  } else if (s.rad.weather === 'sep' && s.rad.sepFlux > 0 && ['outside', 'overhang'].includes(p.location) && r.rebootUntil === 0) {
    p.glitched = true; r.rebootUntil = now + 30; logEvent(s, 'pebbleGlitch', 'PEBBLE needs a 30-minute reboot.'); return
  }
  if (s.rad.weather === 'quiet') r.rebootUntil = 0
  const charging = s.power.on.pebbleCharge && !r.pebbleTravel && p.location === 'hab' && (!p.job || p.job.kind === 'charge')
  if (charging) {
    p.batteryPct = clamp(p.batteryPct + 25 / 60, 0, 100) // Tuning: four-hour full charge.
    if (p.job?.kind === 'charge') p.job.etaMin = (100 - p.batteryPct) / (25 / 60)
    if (p.batteryPct === 100 && p.job?.kind === 'charge') p.job = null
    return
  }
  p.batteryPct = Math.max(0, p.batteryPct - (p.job ? 5 : 1) / 60)
  if (!p.job || p.job.kind === 'charge' || p.batteryPct === 0 || r.pebbleTravel) return
  p.dust = clamp(p.dust + 0.01 / 60)
  p.job.etaMin = Math.max(0, p.job.etaMin - 1 / (1 + p.dust))
  if (p.job.etaMin > 1e-9) return
  const job = p.job
  if (job.kind === 'cleanPanels') s.power.panelDust *= 0.5
  if (job.kind === 'carry') s.science.samples++
  logEvent(s, `pebble:${job.kind}`, `${job.kind} completed at ${job.target}.`)
  p.job = null; p.location = 'hab'
}
