import type { Action, Command, Runtime } from './commands.ts'
import { logEvent, openCard } from './causal.ts'
import { planningCard } from './planningCard.ts'
import { harvest } from './food.ts'
import { random } from './rng.ts'
import { LOAD_IDS, type SimState } from './state.ts'
import { absoluteMinute, canSleep, inside, nextDawn } from './time.ts'
import { canWorkOutside } from './you.ts'
import { chooseStartup, startTouchdown, wakeStation } from './touchdown.ts'
export function validCommand(c: unknown): c is Command {
  if (!c || typeof c !== 'object' || !('type' in c)) return false
  const cmd = c as Command
  switch (cmd.type) {
    case 'setPriority': return Array.isArray(cmd.priority) && cmd.priority.length === LOAD_IDS.length && new Set(cmd.priority).size === LOAD_IDS.length && cmd.priority.every(id => LOAD_IDS.includes(id))
    case 'toggleLoad': return LOAD_IDS.includes(cmd.load) && typeof cmd.on === 'boolean'
    case 'setLevel': return LOAD_IDS.includes(cmd.load) && Number.isFinite(cmd.level) && cmd.level >= 0 && cmd.level <= 1
    case 'pebbleJob': return ['cleanPanels', 'scout', 'carry', 'charge'].includes(cmd.kind) && typeof cmd.target === 'string' &&
      (cmd.travel === undefined || typeof cmd.travel === 'boolean')
    case 'pebbleArrived': return typeof cmd.target === 'string'
    case 'pebbleFollow': return cmd.location === 'hab' || cmd.location === 'outside'
    case 'setLocation': return ['hab', 'shelter', 'outside', 'overhang', 'rover', 'ship'].includes(cmd.location)
    case 'setAirlock': return typeof cmd.sealed === 'boolean'
    case 'sendMessage': return typeof cmd.text === 'string' && cmd.text.length > 0 && cmd.text.length <= 2000
    case 'plant': return Number.isInteger(cmd.tray) && cmd.tray >= 0 && cmd.tray < 3 && [null, 'mizuna', 'wheat', 'pepper'].includes(cmd.crop) && [12, 16, 20].includes(cmd.photoperiod)
    case 'harvest': return Number.isInteger(cmd.tray) && cmd.tray >= 0 && cmd.tray < 3
    case 'waterWall': return typeof cmd.lock === 'boolean'
    case 'startSep': return typeof cmd.eventId === 'string'
    case 'missionComplete': return typeof cmd.mission === 'string'
    case 'm0Startup': return ['earth', 'warm', 'grow'].includes(cmd.plan)
    case 'm0Land': case 'm0WakeStation': return true
    case 'choose': return typeof cmd.cardId === 'string' && typeof cmd.optionId === 'string'
    case 'wait': return [1, 2, 4].includes(cmd.hours)
    case 'skipSols': return Number.isInteger(cmd.sols) && cmd.sols >= 1 && cmd.sols <= 7
    case 'sleep': case 'replaceScrubber': case 'startStorm': case 'forbush': case 'practiceCard': return true
    default: return false
  }
}
function applyAction(s: SimState, r: Runtime, c: Action) {
  const now = absoluteMinute(s)
  switch (c.type) {
    case 'setPriority': s.power.priority = ['lifeSupport', ...c.priority.filter(id => id !== 'lifeSupport')]; break
    case 'toggleLoad': if (c.load !== 'lifeSupport') s.power.on[c.load] = c.on; break
    case 'setLevel': if (c.load !== 'lifeSupport') s.power.level[c.load] = c.level; break
    case 'setAirlock': r.airlockSealed = c.sealed; break
    case 'setLocation': {
      if (['outside', 'overhang', 'rover'].includes(c.location) && inside(s)) {
        if (s.you.location === 'ship' && r.mission === 'm0-walk') {
          s.you.location = c.location
          break
        }
        if (s.air.o2Kg < 0.5 || s.you.energy === 0 || s.you.doseDP > 90) {
          r.notices.push({ kind: 'evaBlocked', text: 'Check your air, energy, and dose before going out.' })
          return false
        }
        s.air.o2Kg -= 0.5; s.you.suitO2Kg = 0.5
      } else if (!inside(s) && ['outside', 'overhang', 'rover'].includes(c.location) && !canWorkOutside(s)) return false
      s.you.location = c.location; break
    }
    case 'pebbleJob':
      if (s.pebble.glitched || s.pebble.batteryPct <= 0 || s.pebble.job) return false
      s.pebble.job = { kind: c.kind, target: c.target, etaMin: c.kind === 'cleanPanels' ? 180 : c.kind === 'charge' ? (100 - s.pebble.batteryPct) / (25 / 60) : 120 }
      s.pebble.location = c.kind === 'charge' ? 'hab' : 'outside'
      if (c.travel) r.pebbleTravel = c.target
      if (c.kind === 'charge') s.power.on.pebbleCharge = true
      break
    case 'pebbleArrived':
      if (r.pebbleTravel !== c.target || s.pebble.job?.target !== c.target) return false
      delete r.pebbleTravel
      break
    case 'pebbleFollow':
      if (s.pebble.job || s.pebble.glitched || s.pebble.batteryPct <= 0) return false
      s.pebble.location = c.location
      break
    case 'plant': s.food.trays[c.tray] = { crop: c.crop, growth: 0, health: 1, name: s.food.trays[c.tray].name, photoperiod: c.photoperiod }; break
    case 'harvest': harvest(s, r, c.tray); break
    case 'replaceScrubber': s.air.scrubberLife = 1; break
    case 'sendMessage': s.comms.outbox.push({ id: `msg:${now}:${s.comms.outbox.length}`, text: c.text, sentAt: null, arrivesEarthAt: null, replyAt: null, uploadMin: 0, receivedAt: null }); break
    case 'waterWall':
      if (c.lock) { if (s.water.liters < 30 || r.waterWallLiters || r.pumpMinutes) return false; r.pumpMinutes = 60; s.power.on.shelterPump = true }
      else { s.water.liters += r.waterWallLiters; r.waterWallLiters = 0; r.pumpMinutes = 0; s.power.on.shelterPump = false }
      break
    case 'startStorm': if (r.stormStart === null) r.stormStart = now; break
    case 'startSep':
      r.sepStart = now; r.sepOnset = 10 + Math.floor(random(s) * 31); r.rebootUntil = 0
      s.rad.eventId = c.eventId; s.rad.weather = 'flare'; break
    case 'forbush': r.forbushUntil = now + 1440; break
    case 'missionComplete': r.notices.push({ kind: 'missionComplete', text: c.mission }); break
    case 'm0Startup': return chooseStartup(s, r, c.plan)
  }
  return true
}
export function applyCommand(s: SimState, r: Runtime, c: Command) {
  if (r.card && c.type !== 'choose' && c.type !== 'setLocation' && c.type !== 'setAirlock') return false
  if (c.type === 'm0Land') return startTouchdown(s, r)
  if (c.type === 'm0WakeStation') return wakeStation(s, r)
  if (c.type === 'm0Startup') return false
  if (c.type === 'practiceCard') return openCard(s, r, planningCard)
  if (c.type === 'choose') {
    const card = r.card
    const option = card?.id === c.cardId ? card.options.find(o => o.id === c.optionId) : undefined
    if (!option) return false
    for (const effect of option.effects) if (!validCommand(effect) || ['choose', 'sleep', 'wait', 'skipSols', 'practiceCard', 'm0Land', 'm0WakeStation'].includes(effect.type)) return false
    r.card = null
    for (const effect of option.effects) applyAction(s, r, effect)
    for (const warning of Object.values(r.warnings)) warning.decision = true
    logEvent(s, 'decision', option.feedback ?? `${c.cardId}: ${c.optionId}`)
    if (card?.details) r.notices.push({ kind: 'marsTruth', text: card.details.science })
    r.checkpoint = true
    return true
  }
  if (c.type === 'sleep' || c.type === 'wait' || c.type === 'skipSols') {
    if (r.fastForward || !inside(s) || !r.airlockSealed) return false
    const h = s.clock.minute / 60, now = absoluteMinute(s)
    if (c.type === 'sleep') {
      if (r.mission === 'm0-walk' || r.mission === 'm0-choice') return false
      if (!canSleep(s, r.airlockSealed)) return false
      const nap = h < 17 && h >= 6 && s.you.energy <= 1
      s.clock.sleeping = true; r.coldSleep = false
      r.fastForward = { kind: 'sleep', until: nap ? now + 180 : nextDawn(s) }; r.checkpoint = true
      r.sleepHistory = { logStart: s.log.length, samples: [{ at: now, kWh: s.power.batteryKWh }] }
    } else if (c.type === 'wait') {
      if (h < 6 || h >= 18 || h + c.hours > 18) return false
      r.fastForward = { kind: 'wait', until: now + c.hours * 60 }
    } else r.fastForward = { kind: 'skip', until: now + c.sols * 1440 }
    logEvent(s, c.type, `Started ${c.type}.`)
    return true
  }
  const applied = applyAction(s, r, c)
  if (applied) logEvent(s, 'command', c.type)
  return applied
}
