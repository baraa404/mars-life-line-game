import { openCard, logEvent } from './causal.ts'
import type { Runtime } from './commands.ts'
import { absoluteMinute, nextDawn } from './time.ts'
import type { SimState } from './state.ts'
import { touchdownCard } from './touchdownCard.ts'

export function startTouchdown(s: SimState, r: Runtime) {
  if (r.mission) return false
  r.mission = 'm0-walk'
  s.you.location = 'ship'
  s.you.suitO2Kg = .5
  s.power.batteryKWh = s.power.batteryCapKWh * .6
  s.power.on.heaters = false
  s.comms.oneWayMin = 10
  const now = absoluteMinute(s)
  s.comms.outbox.push({ id: 'm0-touchdown', text: 'We landed safely.', sentAt: now, arrivesEarthAt: now + 10,
    replyAt: null, uploadMin: 10, receivedAt: null })
  logEvent(s, 'messageSent', 'The ship sent a touchdown signal.')
  return true
}

export function wakeStation(s: SimState, r: Runtime) {
  if (r.mission !== 'm0-walk' || s.you.location !== 'hab') return false
  r.mission = 'm0-choice'
  s.power.batteryKWh = s.power.batteryCapKWh * .6
  s.you.energy = 3
  s.power.on.lifeSupport = true
  logEvent(s, 'stationWake', 'Life Support woke first. It keeps the air safe.')
  return openCard(s, r, touchdownCard)
}

export function chooseStartup(s: SimState, r: Runtime, plan: 'earth' | 'warm' | 'grow') {
  if (r.mission !== 'm0-choice') return false
  r.mission = 'm0-night'
  if (plan === 'earth') {
    const sent = absoluteMinute(s) + 20
    s.power.on.dish = true
    s.power.batteryKWh = Math.max(0, s.power.batteryKWh - .8 / 3)
    s.you.spirit = Math.min(3, s.you.spirit + 1) as SimState['you']['spirit']
    s.comms.outbox.push({ id: 'm0-video', text: 'Life Line Station is awake.', sentAt: sent, arrivesEarthAt: sent + 10,
      replyAt: Math.max(sent + 45, nextDawn(s) - 10), uploadMin: 10, receivedAt: null })
    r.fastForward = { kind: 'wait', until: sent }
  } else if (plan === 'warm') {
    s.power.on.heaters = true
    s.power.level.heaters = 1
  } else {
    s.food.trays[0] = { name: 'Tray 1', crop: 'mizuna', growth: 2 / 25, photoperiod: 16, health: 1 }
    s.power.on.trayClimate = s.power.on.trayLights1 = true
  }
  return true
}
