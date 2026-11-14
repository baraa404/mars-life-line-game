import { create } from 'zustand'
import type { BatterySample, Card, Command, LoadId, PebbleJob, SimState, WakeReport } from '../sim/index.ts'

export interface MissionSnapshot {
  state: SimState
  waterSols: number
  airSols: number
  nightHours: number
  nightWatch: boolean
  airlockSealed: boolean
  loads: Record<LoadId, number>
  solarKW: number
  fastForward: boolean
  pebbleTravel?: string
  sleepSamples?: BatterySample[]
  wakeReport?: WakeReport
  mission?: import('../sim/index.ts').Runtime['mission']
}

const defaults = { textSize: 100, fov: 75, reducedMotion: false, toggleHold: false, volume: 80, musicVolume: 35, muted: false }
function readSettings(): typeof defaults {
  try {
    const saved = JSON.parse(localStorage.getItem('marslifeline.preferences') ?? '{}')
    return {
      textSize: [100, 125, 150].includes(saved.textSize) ? saved.textSize : defaults.textSize,
      fov: Number.isFinite(saved.fov) ? Math.min(95, Math.max(55, saved.fov)) : defaults.fov,
      reducedMotion: typeof saved.reducedMotion === 'boolean' ? saved.reducedMotion : matchMedia('(prefers-reduced-motion: reduce)').matches,
      toggleHold: saved.toggleHold === true,
      muted: saved.muted === true,
      musicVolume: Number.isFinite(saved.musicVolume) ? Math.min(100, Math.max(0, saved.musicVolume)) : defaults.musicVolume,
      volume: Number.isFinite(saved.volume) ? Math.min(100, Math.max(0, saved.volume)) : defaults.volume,
    }
  } catch { return defaults }
}

export type Area = 'hab' | 'airlock' | 'outside'
export type Recovery = 'sleep' | 'decision'
interface MissionStore {
  view: 'firstPerson' | 'station'
  openPanel: string | null
  decisionOpen: boolean
  panelHistory: string[]
  backPanel: () => void
  openDecision: () => void
  currentCard: Card | null
  paused: boolean
  snapshot: MissionSnapshot | null
  events: { kind: string; text: string }[]
  commands: Command[]
  area: Area
  arrival: number
  shipArrival: boolean
  fading: boolean
  airlockCycle: 'hab' | 'outside' | null
  airlockStatus: { pressure: number; message: string; origin: 'hab' | 'outside'; cycling: boolean }
  settings: typeof defaults
  prompt: { id: string; label: string; hold: boolean } | null
  hint: number
  captureHint: string
  speech: string
  jobPicker: PebbleJob['kind'] | null
  pebbleNearby: boolean
  /** Outdoor point [x, y, z] PEBBLE is leading the player to; cleared on arrival. */
  pebbleGuide: [number, number, number] | null
  /** Where the next arrival places the player; null uses the area's default pose. */
  arrivalSpot: { foot: [number, number, number]; facing: number } | null
  cardOrigin: [number, number] | null
  recovery: Recovery | null
  recoveryAvailable: Record<Recovery, boolean>
  setView: (view: MissionStore['view']) => void
  setPanel: (panel: string | null) => void
  setPaused: (paused: boolean) => void
  openStationConsole: () => void
  consoleTransition: number
  send: (command: Command) => void
  askHint: () => void
  updateSettings: (settings: Partial<typeof defaults>) => void
}

export const useMissionStore = create<MissionStore>()((set) => ({
  view: 'firstPerson', openPanel: null, panelHistory: [], decisionOpen: false, currentCard: null, paused: false, snapshot: null, events: [], commands: [],
  area: 'hab', arrival: 0, shipArrival: false, fading: false, airlockCycle: null, airlockStatus: { pressure: 1, message: '', origin: 'hab', cycling: false }, settings: readSettings(), prompt: null,
  hint: 0, captureHint: '', speech: '', jobPicker: null, pebbleNearby: true, pebbleGuide: null, arrivalSpot: null, cardOrigin: null, recovery: null,
  recoveryAvailable: { sleep: false, decision: false },
  consoleTransition: 0,
  openStationConsole: () => set(s => ({ view: 'station', openPanel: null, panelHistory: [], prompt: null, jobPicker: null, consoleTransition: s.consoleTransition + 1 })),
  setView: view => set({ view, openPanel: null, panelHistory: [], prompt: null, jobPicker: null }),
  setPanel: openPanel => set(s => ({ openPanel, panelHistory: openPanel && s.openPanel && openPanel !== s.openPanel ? [...s.panelHistory, s.openPanel] : openPanel ? s.panelHistory : [] })),
  backPanel: () => set(s => ({ openPanel: s.panelHistory.at(-1) ?? null, panelHistory: s.panelHistory.slice(0, -1), jobPicker: null })),
  openDecision: () => set(s => s.currentCard ? { decisionOpen: true, openPanel: null, panelHistory: [], prompt: null } : {}),
  setPaused: paused => set({ paused }),
  send: command => set(s => ({ commands: [...s.commands, command] })),
  askHint: () => set(s => ({ hint: s.hint + 1 })),
  updateSettings: patch => set(s => {
    const settings = { ...s.settings, ...patch }
    try { localStorage.setItem('marslifeline.preferences', JSON.stringify(settings)) } catch { /* Settings still apply in this session. */ }
    return { settings }
  }),
}))

export const playerInputBlocked = (s: MissionStore) => s.view !== 'firstPerson' || s.paused ||
  s.fading || s.openPanel !== null || s.decisionOpen || !!s.snapshot?.fastForward && !s.currentCard
