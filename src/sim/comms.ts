import type { SimState } from './state.ts'
import { logEvent } from './causal.ts'
import { random } from './rng.ts'
import { absoluteMinute } from './time.ts'
export function updateCommsTrack(s: SimState) {
  s.comms.oneWayMin = s.clock.sol >= 55 ? 21 : 10 + Math.min(39, s.clock.sol - 1) * 10 / 39
  s.comms.blackout = s.clock.sol >= 41 && s.clock.sol <= 54
}
export function stepComms(s: SimState) {
  const now = absoluteMinute(s), c = s.comms
  if (c.blackout) return
  if (s.power.on.dish && c.relayWindows.some(w => s.clock.minute >= w.start && s.clock.minute < w.end)) {
    const msg = c.outbox.find(m => m.sentAt === null)
    if (msg) {
      msg.uploadMin++
      if (msg.uploadMin >= 10) {
        msg.sentAt = now; msg.arrivesEarthAt = now + c.oneWayMin
        msg.replyAt = now + 2 * c.oneWayMin + 20 + Math.floor(random(s) * 21)
        logEvent(s, 'messageSent', `Sent: ${msg.text}`)
      }
    }
  }
  for (const msg of c.outbox) if (msg.replyAt !== null && msg.receivedAt === null && now >= msg.replyAt) {
    msg.receivedAt = now
    c.inbox.push({ ...msg, id: `${msg.id}:reply`, text: `Earth received: ${msg.text}` })
    s.you.spirit = Math.min(3, s.you.spirit + 1) as 0 | 1 | 2 | 3
    logEvent(s, 'messageArrived', 'A delayed reply arrived from Earth.')
  }
}
