import type { Runtime, Card } from './commands.ts'
import type { SimState } from './state.ts'
import { absoluteMinute } from './time.ts'
import { finishSleep } from './sleepHistory.ts'
export function logEvent(s: SimState, kind: string, text: string, causeIds: string[] = [], icon = '🎮') {
  const event = { id: `${absoluteMinute(s)}:${s.log.length}`, sol: s.clock.sol, minute: s.clock.minute, kind, causeIds, text, icon }
  s.log.push(event)
  return event.id
}
export function topContributors(s: SimState) {
  return [...s.power.priority].sort((a, b) => s.power.ledger[b] - s.power.ledger[a]).filter(id => s.power.ledger[id] > 0).slice(0, 2)
    .map(id => logEvent(s, 'energy', `${id}: ${s.power.ledger[id].toFixed(2)} kWh since sunset`))
}
export function openCard(s: SimState, r: Runtime, card: Card) {
  if (r.card) return false
  r.card = card
  if (s.clock.sleeping) { finishSleep(s, r, true); s.clock.sleeping = false; r.lastWakeAt = absoluteMinute(s); r.nightWatch = false; r.notices.push({ kind: 'wokeUp', text: 'PEBBLE woke you for a decision.' }); r.checkpoint = true }
  r.fastForward = null
  return true
}
export function warningCard(s: SimState, r: Runtime, id: string, text: string) {
  return openCard(s, r, { id, text, options: [
    { id: 'review', label: 'Keep the current plan', effects: [], benefit: 'Machines can keep doing their jobs.', cost: 'They keep using power.', systems: ['power'], later: 'Low reserves may get lower.', feedback: 'You kept the current plan.', recovery: 'Change the plan in Station View.' },
    { id: 'essentials', label: 'Keep essentials only', effects: s.power.priority.filter(id => !['lifeSupport', 'heaters'].includes(id)).map(load => ({ type: 'toggleLoad' as const, load, on: false })), benefit: 'Save power for air and warmth.', cost: 'Other jobs stop.', systems: ['power', 'air', 'water'], later: 'Paused machines may need a fresh start.', feedback: 'You put air and warmth first.', recovery: 'Turn other machines back on when power returns.' },
  ], details: { info: 'Check your gauges before choosing.', hint: 'Which machines do you need right now?', science: 'Machines share the power made by the base.', source: 'game-value' } })
}
