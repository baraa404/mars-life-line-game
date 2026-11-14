import { useEffect } from 'react'
import { useMissionStore } from '../state/useMissionStore'
import { closePanel } from './Modal'

/** Panels the player may leave with Esc; the shelter and the ending close themselves. */
const closable = (panel: string) => ['terminal', 'manage', 'pebble-chat', 'pause'].includes(panel)

/** One-key panels shown in the bottom-left shortcut bar. */
export const SHORTCUTS = [
  { code: 'KeyM', key: 'M', label: 'Quick management', panel: 'station:console' },
  { code: 'KeyP', key: 'P', label: 'Ask PEBBLE', panel: 'pebble-chat' },
] as const

/** Opens a shortcut panel, or closes it when it is already open. */
export function toggleShortcut(panel: string) {
  const ui = useMissionStore.getState()
  if (ui.fading || ui.snapshot?.fastForward) return
  if (panel === 'station:console' && (!ui.openPanel || closable(ui.openPanel))) {
    if (document.pointerLockElement) document.exitPointerLock()
    ui.setView(ui.view === 'station' ? 'firstPerson' : 'station')
    return
  }
  if (ui.openPanel === panel) { closePanel(); return }
  if (ui.openPanel && !closable(ui.openPanel)) return
  if (document.pointerLockElement) document.exitPointerLock()
  useMissionStore.setState({ openPanel: panel, panelHistory: [] })
}

export function useGameShortcuts() {
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const ui = useMissionStore.getState()
      const editing = event.target instanceof HTMLElement && !!event.target.closest('input,textarea,select,[contenteditable]')
      if (event.defaultPrevented || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return
      if (event.code === 'Escape') {
        event.preventDefault()
        if (ui.openPanel) { if (closable(ui.openPanel)) closePanel(); return }
        if (ui.view === 'station' && !ui.fading) { ui.setView('firstPerson'); return }
        if (!ui.fading) ui.setPanel('pause')
        return
      }
      const shortcut = !editing && !event.shiftKey && SHORTCUTS.find(s => s.code === event.code)
      if (shortcut) { event.preventDefault(); toggleShortcut(shortcut.panel) }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [])
}
