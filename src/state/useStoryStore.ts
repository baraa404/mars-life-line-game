import { create } from 'zustand'
import type { SiteId } from '../sim/outpost/data.ts'
import { SCRIPT, type Line } from '../sim/story/script.ts'
import { act, createStory, tick, type StoryAction, type StoryState } from '../sim/story/story.ts'

export const STORY_SAVE = 'marslifeline.story.v1'
export const SITE_CHOICE = 'marslifeline.site'
export interface SpokenLine extends Line { id: number }

interface StoryStore {
  state: StoryState | null
  /** Line on screen; it stays visible after the queue empties so the last instruction is never lost. */
  line: SpokenLine | null
  queue: Line[]
  log: SpokenLine[]
  toast: { text: string; ok: boolean; id: number } | null
  start: (site: SiteId) => void
  load: () => boolean
  dispatch: (action: StoryAction) => boolean
  tick: (dt: number) => void
  speak: (lines: Line[]) => void
  advance: () => void
  clear: () => void
}

let lastSave = 0
function persist(state: StoryState | null) {
  try {
    if (state) localStorage.setItem(STORY_SAVE, JSON.stringify(state))
    else localStorage.removeItem(STORY_SAVE)
  } catch { /* Saving is optional. */ }
}

export function hasStorySave() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORY_SAVE) ?? 'null')
    return saved?.version === 2 && !saved.ending
  } catch { return false }
}

export function readSiteChoice(): SiteId {
  try {
    const site = localStorage.getItem(SITE_CHOICE)
    if (site === 'gale' || site === 'jezero' || site === 'deuteronilus') return site
  } catch { /* Default below. */ }
  return 'deuteronilus'
}

export const useStoryStore = create<StoryStore>()((set, get) => ({
  state: null, line: null, queue: [], log: [], toast: null,
  start: site => {
    const state = createStory(site)
    try { localStorage.setItem(SITE_CHOICE, site) } catch { /* Saving is optional. */ }
    persist(state)
    set({ state, line: null, queue: [], log: [], toast: null })
    get().speak(SCRIPT.arrival)
  },
  load: () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORY_SAVE) ?? 'null') as StoryState | null
      if (saved?.version === 2 && !saved.ending) {
        set({ state: saved, line: null, queue: [], log: [], toast: null })
        get().speak(saved.time < 1 ? SCRIPT.arrival : [{ who: 'pebble', mood: 'happy', text: 'Welcome back, Commander! Your objectives are on the right.' }])
        return true
      }
    } catch { /* Fall through to a new game. */ }
    return false
  },
  dispatch: action => {
    const current = get().state
    if (!current) return false
    const result = act(current, action)
    if (result.state !== current) { persist(result.state); set({ state: result.state }) }
    if (result.message) set(s => ({ toast: { text: result.message, ok: result.ok, id: (s.toast?.id ?? 0) + 1 } }))
    if (result.lines.length) get().speak(result.lines)
    return result.ok
  },
  tick: dt => {
    const current = get().state
    if (!current) return
    const result = tick(current, dt)
    if (result.state === current) return
    set({ state: result.state })
    const now = performance.now()
    if (result.lines.length || now - lastSave > 4000) { lastSave = now; persist(result.state) }
    if (result.lines.length) get().speak(result.lines)
  },
  speak: lines => {
    if (!lines.length) return
    const { line, queue } = get()
    // An idle line (queue empty, already read) is replaced at once by new speech.
    if (!line || !queue.length && line.id < 0) {
      const [first, ...rest] = lines
      const id = Math.abs(line?.id ?? 0) + 1
      const spoken = { ...first, id }
      set(s => ({ line: spoken, queue: [...rest], log: [...s.log.slice(-40), spoken] }))
    } else set({ queue: [...queue, ...lines] })
  },
  advance: () => {
    const { line, queue } = get()
    if (!line) return
    if (!queue.length) { if (line.id > 0) set({ line: { ...line, id: -line.id } }); return }
    const [next, ...rest] = queue
    const spoken = { ...next, id: Math.abs(line.id) + 1 }
    set(s => ({ line: spoken, queue: rest, log: [...s.log.slice(-40), spoken] }))
  },
  clear: () => { persist(null); set({ state: null, line: null, queue: [], log: [], toast: null }) },
}))
