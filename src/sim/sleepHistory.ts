import type { Runtime, WakeReport } from './commands.ts'
import type { SimState } from './state.ts'
import { absoluteMinute } from './time.ts'

export function recordSleep(s: SimState, r: Runtime) {
  const sleep = r.sleepHistory
  if (!sleep) return
  const at = absoluteMinute(s)
  if (at - sleep.samples.at(-1)!.at >= 15) sleep.samples.push({ at, kWh: s.power.batteryKWh })
}

export function finishSleep(s: SimState, r: Runtime, interrupted: boolean) {
  const sleep = r.sleepHistory
  if (!sleep) return
  const at = absoluteMinute(s)
  const end = { at, kWh: s.power.batteryKWh }
  const samples = sleep.samples.filter(point => point.at < at).concat(end)
  const report: WakeReport = { at, interrupted, samples, events: s.log.slice(sleep.logStart),
    messages: s.comms.inbox.filter(message => (message.receivedAt ?? -1) >= sleep.samples[0].at) }
  r.wakeReport = report
  delete r.sleepHistory
}
