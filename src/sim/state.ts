export const LOAD_IDS = ['lifeSupport', 'heaters', 'electrolyser', 'oxygenMaker', 'waterProcessor',
  'trayClimate', 'trayLights1', 'trayLights2', 'trayLights3', 'pebbleCharge', 'shelterPump',
  'dish', 'roverCharge', 'lab'] as const
export type LoadId = typeof LOAD_IDS[number]
export type Location = 'hab' | 'shelter' | 'outside' | 'overhang' | 'rover' | 'ship'
export interface Tray { crop: 'mizuna' | 'wheat' | 'pepper' | null; growth: number; photoperiod: 12 | 16 | 20; health: number; name: string }
export interface PebbleJob { kind: 'cleanPanels' | 'scout' | 'carry' | 'charge'; target: string; etaMin: number }
export interface CausalEvent { id: string; sol: number; minute: number; kind: string; causeIds: string[]; text: string; icon: string }
export interface Msg { id: string; text: string; sentAt: number | null; arrivesEarthAt: number | null; replyAt: number | null; uploadMin: number; receivedAt: number | null }
export interface RelayWindow { start: number; end: number }
export interface SimState {
  version: 2; seed: number; rng: number
  clock: { sol: number; minute: number; sleeping: boolean }
  env: { tau: number; outsideC: number; daylight: number; stormPhase: 'none' | 'building' | 'peak' | 'clearing' }
  power: { batteryKWh: number; batteryCapKWh: number; panelDust: number; arrayHealth: number; fissionOnline: boolean;
    on: Record<LoadId, boolean>; level: Partial<Record<LoadId, number>>; priority: LoadId[]; ledger: Record<LoadId, number> }
  air: { o2Kg: number; co2: number; scrubberLife: number; mix: { electrolyser: number; oxygenMaker: number } }
  water: { liters: number; iceKg: number; iceDirty: boolean; filterLife: number }
  food: { pantrySols: number; trays: Tray[] }
  you: { energy: 0 | 1 | 2 | 3; health: 0 | 1 | 2 | 3; spirit: 0 | 1 | 2 | 3; doseDP: number; location: Location; suitO2Kg: number }
  pebble: { batteryPct: number; dust: number; job: PebbleJob | null; location: Location; glitched: boolean }
  rad: { weather: 'quiet' | 'flare' | 'sep'; sepFlux: number; gcrFactor: number; eventId?: string }
  comms: { oneWayMin: number; blackout: boolean; outbox: Msg[]; inbox: Msg[]; relayWindows: RelayWindow[] }
  science: { samples: number; labHours: number }
  rover: { batteryKWh: number; gearGrit: number }
  log: CausalEvent[]
}
export const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n))
export const loadRecord = <T>(value: T): Record<LoadId, T> => Object.fromEntries(LOAD_IDS.map(id => [id, value])) as Record<LoadId, T>
export function createInitialState(seed: number): SimState {
  if (!Number.isFinite(seed)) throw new Error('Seed must be finite')
  const on = loadRecord(false)
  on.lifeSupport = on.heaters = true
  return { version: 2, seed: seed >>> 0, rng: seed >>> 0,
    clock: { sol: 1, minute: 15 * 60, sleeping: false },
    env: { tau: 0.5, outsideC: -22, daylight: Math.SQRT1_2, stormPhase: 'none' },
    power: { batteryKWh: 48, batteryCapKWh: 80, panelDust: 0.05, arrayHealth: 1, fissionOnline: false,
      on, level: {}, priority: [...LOAD_IDS], ledger: loadRecord(0) },
    air: { o2Kg: 10, co2: 0, scrubberLife: 1, mix: { electrolyser: 0, oxygenMaker: 0 } },
    water: { liters: 60, iceKg: 0, iceDirty: false, filterLife: 1 },
    food: { pantrySols: 50, trays: Array.from({ length: 3 }, (_, i) => ({ crop: null, growth: 0, photoperiod: 16, health: 1, name: `Tray ${i + 1}` })) },
    you: { energy: 3, health: 3, spirit: 3, doseDP: 0, location: 'hab', suitO2Kg: 0 },
    pebble: { batteryPct: 100, dust: 0, job: null, location: 'hab', glitched: false },
    rad: { weather: 'quiet', sepFlux: 0, gcrFactor: 1 },
    comms: { oneWayMin: 10, blackout: false, outbox: [], inbox: [], relayWindows: [{ start: 480, end: 540 }, { start: 960, end: 1020 }] },
    science: { samples: 0, labHours: 0 }, rover: { batteryKWh: 30, gearGrit: 0 }, log: [] }
}
