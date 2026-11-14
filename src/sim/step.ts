import type { Command, Runtime } from './commands.ts'
import { applyCommand } from './applyCommand.ts'
import { stepEnvironment } from './environment.ts'
import { stepPower } from './power.ts'
import { stepAir } from './air.ts'
import { stepWater } from './water.ts'
import { stepFood } from './food.ts'
import { stepRadiation } from './radiation.ts'
import { stepYou } from './you.ts'
import { stepPebble } from './pebble.ts'
import { stepComms, updateCommsTrack } from './comms.ts'
import { stepDirector, type EventDefinition } from './events/director.ts'
import { logEvent, topContributors, warningCard } from './causal.ts'
import { airSols, status, waterSols } from './gauges.ts'
import type { SimState } from './state.ts'
import { absoluteMinute, advanceClock } from './time.ts'
import { finishSleep, recordSleep } from './sleepHistory.ts'
function checkWarnings(s: SimState, r: Runtime) {
  if (r.mission && r.mission !== 'm0-complete') return
  for (const [id, sols] of [['air', airSols(s)], ['water', waterSols(s, r)]] as const) {
    const level = status(sols).level, now = absoluteMinute(s)
    const w = r.warnings[id] ??= { level: 0, yellowAt: null, red: false, decision: false }
    if (level === 0) { w.level = 0; w.yellowAt = null; w.red = false; w.decision = false; continue }
    if (r.card) continue
    const next = Math.min(level, w.level + 1)
    if (next <= w.level) continue
    if (next === 3 && (!w.red || !w.decision || w.yellowAt === null || now - w.yellowAt < 1440)) continue
    w.level = next
    if (next === 1) w.yellowAt = now
    if (next === 2) w.red = true
    const text = next === 3 ? `${id}: Return to Ship. Review what happened.` : `${id}: ${next === 1 ? 'Watch reserves.' : 'Act now.'} Make more or use less.`
    logEvent(s, next === 3 ? 'returnToShip' : 'threshold', text, topContributors(s))
    if (next === 3) r.notices.push({ kind: 'returnToShip', text })
    else warningCard(s, r, `${id}:${next}`, text)
  }
  if (!r.card && s.you.suitO2Kg < 0.0625 && ['outside', 'overhang', 'rover'].includes(s.you.location) && !r.warnings.suit) {
    warningCard(s, r, 'suit', 'Suit air is low. Return inside.'); r.warnings.suit = { level: 2, yellowAt: absoluteMinute(s), red: true, decision: false }
  }
  if (['hab', 'shelter', 'ship'].includes(s.you.location)) delete r.warnings.suit
}
/** Mutates only the owned state/runtime; one atomic Mars minute, shared by every time path. */
export function step(s: SimState, r: Runtime, commands: Command[] = [], deck: EventDefinition[] = []) {
  for (const c of commands) applyCommand(s, r, c)
  if (r.card) return false
  // In the prologue, walking and exploring cannot use up the first afternoon.
  if (r.mission === 'm0-walk' && s.clock.minute >= 1010) { r.steps++; return true }
  stepEnvironment(s, r); updateCommsTrack(s)
  stepPower(s, r); stepAir(s, r); stepWater(s, r); stepFood(s, r)
  stepRadiation(s, r); stepYou(s, r); stepPebble(s, r); stepComms(s)
  stepDirector(s, r, deck)
  r.steps++
  checkWarnings(s, r)
  advanceClock(s)
  recordSleep(s, r)
  if (r.fastForward && absoluteMinute(s) >= r.fastForward.until) {
    const kind = r.fastForward.kind
    r.fastForward = null
    if (kind === 'sleep') {
      finishSleep(s, r, false)
      s.clock.sleeping = false
      r.lastWakeAt = absoluteMinute(s); r.nightWatch = false
      s.you.energy = r.coldSleep ? 2 : 3
      r.notices.push({ kind: 'wokeUp', text: r.coldSleep ? 'You woke after a cold sleep.' : 'You woke rested.' })
      if (r.mission === 'm0-night') {
        r.mission = 'm0-complete'
        logEvent(s, 'missionComplete', 'Touchdown complete. Life Line Station is awake.')
        r.notices.push({ kind: 'missionComplete', text: 'Touchdown complete.' })
      }
      r.checkpoint = true
    }
  }
  return true
}
