import type { CausalEvent, LoadId, Location, Msg, PebbleJob, Tray } from './state.ts'
export type Action =
  | { type: 'setPriority'; priority: LoadId[] }
  | { type: 'toggleLoad'; load: LoadId; on: boolean }
  | { type: 'setLevel'; load: LoadId; level: number }
  | { type: 'pebbleJob'; kind: PebbleJob['kind']; target: string; travel?: boolean }
  | { type: 'pebbleArrived'; target: string }
  | { type: 'pebbleFollow'; location: 'hab' | 'outside' }
  | { type: 'setLocation'; location: Location }
  | { type: 'setAirlock'; sealed: boolean }
  | { type: 'sendMessage'; text: string }
  | { type: 'plant'; tray: number; crop: Tray['crop']; photoperiod: Tray['photoperiod'] }
  | { type: 'harvest'; tray: number }
  | { type: 'waterWall'; lock: boolean }
  | { type: 'replaceScrubber' }
  | { type: 'startStorm' }
  | { type: 'startSep'; eventId: string }
  | { type: 'forbush' }
  | { type: 'missionComplete'; mission: string }
  | { type: 'm0Startup'; plan: 'earth' | 'warm' | 'grow' }
export type Command = Action | { type: 'choose'; cardId: string; optionId: string } | { type: 'practiceCard' }
  | { type: 'm0Land' } | { type: 'm0WakeStation' }
  | { type: 'sleep' } | { type: 'wait'; hours: 1 | 2 | 4 } | { type: 'skipSols'; sols: number }
export interface CardOption {
  id: string; label: string; effects: Action[]
  benefit?: string; cost?: string; systems?: string[]; later?: string; feedback?: string; recovery?: string
}
export interface Card {
  id: string; text: string; options: CardOption[]
  details?: { info: string; hint: string; science: string; source: 'game-value' | 'calculated' | 'nasa-fact' | 'story' }
}
export interface BatterySample { at: number; kWh: number }
export interface WakeReport { at: number; interrupted: boolean; samples: BatterySample[]; events: CausalEvent[]; messages: Msg[] }
export interface ScheduledCard { eventId?: string; at: number; card: Card; domain: string; negative: boolean }
export interface Runtime {
  steps: number; airlockSealed: boolean; card: Card | null
  fastForward: { kind: 'sleep' | 'wait' | 'skip'; until: number } | null
  lastWakeAt: number; coldSleep: boolean; waterWallLiters: number; pumpMinutes: number
  waterUse: number[]; waterCursor: number; waterSum: number
  waterAvailable: boolean; electrolyserWater: number
  stormStart: number | null; sepStart: number | null; sepOnset: number; forbushUntil: number
  rebootUntil: number; nightWatch: boolean; lastFreshFood: number
  scheduled: ScheduledCard[]; lastEvent: string | null; cooldowns: Record<string, number>
  lastDomain: Record<string, number>; negativeSol: number
  warnings: Record<string, { level: number; yellowAt: number | null; red: boolean; decision: boolean }>
  notices: { kind: string; text: string }[]; checkpoint: boolean
  sleepHistory?: { logStart: number; samples: BatterySample[] }
  wakeReport?: WakeReport
  pebbleTravel?: string
  mission?: 'm0-walk' | 'm0-choice' | 'm0-night' | 'm0-complete'
}
export function createRuntime(): Runtime {
  return { steps: 0, airlockSealed: true, card: null, fastForward: null, coldSleep: false,
    lastWakeAt: -1, waterWallLiters: 0, pumpMinutes: 0, waterUse: Array(1440).fill(0), waterCursor: 0, waterSum: 0,
    waterAvailable: true, electrolyserWater: 0, stormStart: null, sepStart: null, sepOnset: 0,
    forbushUntil: 0, rebootUntil: 0, nightWatch: false, lastFreshFood: 1,
    scheduled: [], lastEvent: null, cooldowns: {}, lastDomain: {}, negativeSol: -1,
    warnings: {}, notices: [], checkpoint: false }
}
