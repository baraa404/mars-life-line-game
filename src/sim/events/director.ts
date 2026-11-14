import type { Card, Runtime } from '../commands.ts'
import { logEvent, openCard } from '../causal.ts'
import { random } from '../rng.ts'
import type { SimState } from '../state.ts'
import { absoluteMinute } from '../time.ts'
export interface EventDefinition { id: string; domain: string; negative: boolean; cooldownSols: number; forecastLead: number; weight: (s: SimState) => number; card: Card }
/** Deck content is intentionally supplied by missions/Phase 17, never invented here. */
export function drawEvent(s: SimState, r: Runtime, deck: EventDefinition[]) {
  const now = absoluteMinute(s)
  const candidates = deck.filter(e => e.id !== r.lastEvent && (r.cooldowns[e.id] ?? 0) <= now
    && now - (r.lastDomain[e.domain] ?? -Infinity) >= 1440
    && !r.scheduled.some(p => p.domain === e.domain)
    && (!e.negative || r.negativeSol !== s.clock.sol))
    .map(event => ({ event, weight: Math.max(0, event.weight(s)) })).filter(e => Number.isFinite(e.weight) && e.weight > 0)
  const total = candidates.reduce((sum, e) => sum + e.weight, 0)
  if (!total) return null
  let pick = random(s) * total
  const chosen = candidates.find(e => (pick -= e.weight) < 0)?.event ?? candidates.at(-1)!.event
  const minLead = chosen.domain === 'dust' ? 1440 : chosen.domain === 'sep' ? 10 : chosen.domain === 'wear' ? 1 : 0
  const lead = Math.max(minLead, chosen.forecastLead)
  r.scheduled.push({ eventId: chosen.id, at: now + lead, card: chosen.card, domain: chosen.domain, negative: chosen.negative })
  r.cooldowns[chosen.id] = now + Math.max(1, chosen.cooldownSols) * 1440
  logEvent(s, 'forecast', `${chosen.id} forecast in ${lead} Mars minutes.`)
  return chosen.id
}
export function stepDirector(s: SimState, r: Runtime, deck: EventDefinition[]) {
  const now = absoluteMinute(s)
  if (s.clock.minute === 0 && !r.card) drawEvent(s, r, deck)
  if (r.card) return
  const due = r.scheduled.find(e => e.at <= now && (!e.negative || r.negativeSol !== s.clock.sol) && now - (r.lastDomain[e.domain] ?? -Infinity) >= 1440)
  if (!due) return
  r.scheduled.splice(r.scheduled.indexOf(due), 1)
  r.lastEvent = due.eventId ?? due.card.id
  if (due.negative) r.negativeSol = s.clock.sol
  r.lastDomain[due.domain] = now
  logEvent(s, 'event', due.card.text)
  openCard(s, r, due.card)
}
