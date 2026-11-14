import { createInitialState, type SimState } from './state.ts'
import { createRuntime, type BatterySample, type Card, type Command, type Runtime } from './commands.ts'
import { validCommand } from './applyCommand.ts'
export const SAVE_KEY = 'marslifeline.save.v2'
export interface DecisionRecord { atStep: number; command: Command }
export interface Checkpoint { simState: SimState; runtime: Runtime; decisionCount: number; before?: 'sleep' | 'decision' }
export interface SaveData { simState: SimState; decisionLog: DecisionRecord[]; checkpoints: Checkpoint[]; settings: { runtime: Runtime; [key: string]: unknown } }
export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void }
export function assertInvariants(s: SimState) {
  const walk = (value: unknown) => {
    if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Non-finite simulation number')
    if (value && typeof value === 'object') Object.values(value).forEach(walk)
  }
  walk(s)
  if (s.version !== 2 || s.power.batteryKWh < 0 || s.power.batteryKWh > s.power.batteryCapKWh || s.power.batteryCapKWh <= 0) throw new Error('Invalid battery/version')
  for (const n of [s.air.o2Kg, s.water.liters, s.water.iceKg, s.food.pantrySols, s.you.suitO2Kg, s.you.doseDP, s.science.samples, s.science.labHours]) if (n < 0) throw new Error('Negative stock')
  for (const n of [s.air.co2, s.air.scrubberLife, s.water.filterLife, s.power.panelDust, s.power.arrayHealth, s.pebble.dust, ...s.food.trays.flatMap(t => [t.health, t.growth])]) if (n < 0 || n > 1) throw new Error('Invalid ratio')
  for (const n of [s.you.energy, s.you.health, s.you.spirit]) if (!Number.isInteger(n) || n < 0 || n > 3) throw new Error('Invalid astronaut pip')
  if (s.pebble.batteryPct < 0 || s.pebble.batteryPct > 100 || s.rover.batteryKWh < 0 || s.rover.batteryKWh > 30) throw new Error('Invalid vehicle battery')
  if (!Number.isInteger(s.clock.sol) || s.clock.sol < 1 || !Number.isInteger(s.clock.minute) || s.clock.minute < 0 || s.clock.minute >= 1440) throw new Error('Invalid clock')
  if (!validCommand({ type: 'setPriority', priority: s.power.priority }) || s.power.priority[0] !== 'lifeSupport') throw new Error('Invalid priority')
  if (!validCommand({ type: 'setLocation', location: s.you.location }) || !validCommand({ type: 'setLocation', location: s.pebble.location })) throw new Error('Invalid location')
}
function matchesShape(value: unknown, template: unknown): boolean {
  if (template === null) return true
  if (Array.isArray(template)) return Array.isArray(value) && (template.length === 0 || value.length === template.length && value.every((v, i) => matchesShape(v, template[i])))
  if (typeof value !== typeof template) return false
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof template === 'object') return !!value && Object.entries(template as object).every(([k, t]) => k in (value as object) && matchesShape((value as Record<string, unknown>)[k], t))
  return true
}
function validateState(s: SimState) {
  if (!matchesShape(s, createInitialState(0))) throw new Error('Malformed simulation state')
  assertInvariants(s)
  if (!['none', 'building', 'peak', 'clearing'].includes(s.env.stormPhase) || !['quiet', 'flare', 'sep'].includes(s.rad.weather)) throw new Error('Invalid environment')
  for (const t of s.food.trays) if (!validCommand({ type: 'plant', tray: 0, crop: t.crop, photoperiod: t.photoperiod })) throw new Error('Invalid crop')
  for (const [load, level] of Object.entries(s.power.level)) if (!validCommand({ type: 'setLevel', load, level })) throw new Error('Invalid load level')
  if (s.pebble.job && (!validCommand({ type: 'pebbleJob', ...s.pebble.job }) || !Number.isFinite(s.pebble.job.etaMin) || s.pebble.job.etaMin < 0)) throw new Error('Invalid PEBBLE job')
  for (const m of [...s.comms.outbox, ...s.comms.inbox]) {
    if (typeof m.id !== 'string' || typeof m.text !== 'string' || !Number.isFinite(m.uploadMin) || m.uploadMin < 0) throw new Error('Invalid message')
    for (const key of ['sentAt', 'arrivesEarthAt', 'replyAt', 'receivedAt'] as const) if (m[key] !== null && !Number.isFinite(m[key])) throw new Error('Invalid message timestamp')
  }
  if (s.comms.relayWindows.some(w => !Number.isFinite(w.start) || !Number.isFinite(w.end) || w.start < 0 || w.end > 1440 || w.start >= w.end)) throw new Error('Invalid relay window')
  for (const e of s.log) if (typeof e.id !== 'string' || typeof e.text !== 'string' || typeof e.kind !== 'string' || !Array.isArray(e.causeIds) || e.causeIds.some(id => typeof id !== 'string')) throw new Error('Invalid causal event')
}
function validCard(c: Card) {
  return c && typeof c.id === 'string' && typeof c.text === 'string' && Array.isArray(c.options) && c.options.length >= 2
    && (!c.details || (['info', 'hint', 'science'] as const).every(field => typeof c.details?.[field] === 'string')
      && ['game-value', 'calculated', 'nasa-fact', 'story'].includes(c.details.source))
    && new Set(c.options.map(o => o.id)).size === c.options.length
    && c.options.every(o => typeof o.id === 'string' && typeof o.label === 'string' && Array.isArray(o.effects)
      && [o.benefit, o.cost, o.later, o.feedback, o.recovery].every(value => value === undefined || typeof value === 'string')
      && (o.systems === undefined || Array.isArray(o.systems) && o.systems.every(system => typeof system === 'string'))
      && o.effects.every(e => validCommand(e) && !['choose', 'sleep', 'wait', 'skipSols', 'practiceCard', 'm0Land', 'm0WakeStation'].includes(e.type)))
}
function validSamples(points: BatterySample[]) {
  return Array.isArray(points) && points.length > 0 && points.length <= 100 &&
    points.every((point, i) => Number.isInteger(point?.at) && Number.isFinite(point.kWh) && point.kWh >= 0 &&
      (i === 0 || point.at > points[i - 1].at))
}
function validateRuntime(r: Runtime) {
  if (!matchesShape(r, createRuntime()) || !Number.isInteger(r.steps) || r.steps < 0 || !Number.isInteger(r.waterCursor) || r.waterCursor < 0 || r.waterCursor >= 1440) throw new Error('Malformed simulation runtime')
  if (r.card !== null && !validCard(r.card)) throw new Error('Malformed decision card')
  if (r.fastForward !== null && (!['sleep', 'wait', 'skip'].includes(r.fastForward.kind) || !Number.isFinite(r.fastForward.until))) throw new Error('Malformed time skip')
  if (r.scheduled.some(e => !Number.isFinite(e.at) || !validCard(e.card) || typeof e.domain !== 'string' || typeof e.negative !== 'boolean')) throw new Error('Malformed scheduled event')
  for (const key of ['stormStart', 'sepStart'] as const) if (r[key] !== null && !Number.isFinite(r[key])) throw new Error('Malformed event timestamp')
  if (r.waterUse.some(n => n < 0) || Math.abs(r.waterSum - r.waterUse.reduce((a, b) => a + b, 0)) > 1e-6) throw new Error('Malformed rolling water ledger')
  for (const n of [...Object.values(r.cooldowns), ...Object.values(r.lastDomain)]) if (!Number.isFinite(n)) throw new Error('Malformed director history')
  for (const w of Object.values(r.warnings)) if (!Number.isInteger(w.level) || w.level < 0 || w.level > 3 || w.yellowAt !== null && !Number.isFinite(w.yellowAt) || typeof w.red !== 'boolean' || typeof w.decision !== 'boolean') throw new Error('Malformed warning')
  if (r.notices.some(n => typeof n.kind !== 'string' || typeof n.text !== 'string')) throw new Error('Malformed notice')
  if (r.pebbleTravel !== undefined && typeof r.pebbleTravel !== 'string') throw new Error('Malformed PEBBLE travel')
  if (r.mission !== undefined && !['m0-walk', 'm0-choice', 'm0-night', 'm0-complete'].includes(r.mission)) throw new Error('Malformed mission')
  if (r.sleepHistory !== undefined && (!r.sleepHistory || !Number.isInteger(r.sleepHistory.logStart) || r.sleepHistory.logStart < 0 ||
    !validSamples(r.sleepHistory.samples))) throw new Error('Malformed sleep history')
  if (r.wakeReport !== undefined && (!r.wakeReport || !Number.isInteger(r.wakeReport.at) || typeof r.wakeReport.interrupted !== 'boolean' ||
    !validSamples(r.wakeReport.samples) || !Array.isArray(r.wakeReport.events) || !Array.isArray(r.wakeReport.messages) ||
    r.wakeReport.events.some(event => !event || typeof event.text !== 'string' || !Array.isArray(event.causeIds)) ||
    r.wakeReport.messages.some(message => !message || typeof message.text !== 'string'))) throw new Error('Malformed wake report')
}
/** Migration boundary: reject old/future schemas until a real migration is supplied. */
export function migrateSave(value: unknown): SaveData {
  if (!value || typeof value !== 'object') throw new Error('Malformed save')
  const data = value as SaveData
  if (data.simState?.version !== 2) throw new Error('Unsupported save version')
  validateState(data.simState)
  if (!data.settings || !Array.isArray(data.decisionLog) || !Array.isArray(data.checkpoints) || data.checkpoints.length > 20) throw new Error('Malformed save envelope')
  validateRuntime(data.settings.runtime)
  for (const d of data.decisionLog) if (!Number.isInteger(d.atStep) || d.atStep < 0 || !validCommand(d.command)) throw new Error('Malformed decision log')
  for (const c of data.checkpoints) {
    validateState(c.simState)
    validateRuntime(c.runtime)
    if (!Number.isInteger(c.decisionCount) || c.decisionCount < 0 || c.decisionCount > data.decisionLog.length ||
      (c.before !== undefined && c.before !== 'sleep' && c.before !== 'decision')) throw new Error('Malformed checkpoint')
  }
  return structuredClone(data)
}
export function readSave(storage: StoragePort): SaveData | null {
  const raw = storage.getItem(SAVE_KEY)
  return raw === null ? null : migrateSave(JSON.parse(raw))
}
