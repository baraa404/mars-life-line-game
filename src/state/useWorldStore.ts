import { create } from 'zustand'

export type Preview = 'live' | 'day' | 'dusk' | 'night' | 'storm'
export type SiteView = 'base' | 'array' | 'ship' | 'greenhouse' | 'ice'
type WorldState = {
  preview: Preview
  siteView: SiteView
  setPreview: (preview: Preview) => void
  setSiteView: (siteView: SiteView) => void
  renderStats: { calls: number; triangles: number; fps: number; x: number; z: number } | null

  debug: boolean
  physicsDebug: boolean
  toggleDebug: () => void
  togglePhysicsDebug: () => void
}

export const useWorldStore = create<WorldState>()((set) => ({
  preview: 'live', siteView: 'base', renderStats: null,
  setPreview: preview => set({ preview }), setSiteView: siteView => set({ siteView }),
  debug: false,
  physicsDebug: false,
  toggleDebug: () => set((s) => ({ debug: !s.debug })),
  togglePhysicsDebug: () => set((s) => ({ physicsDebug: !s.physicsDebug })),
}))
