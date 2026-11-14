import { useEffect } from 'react'
import { menuControls, nextControlIndex } from './keyboardNavigation'

/** Capture menu input before world handlers. Native controls retain their semantics. */
export function useKeyboardMenus(mode: 'home' | 'landing' | 'campaign') {
  useEffect(() => {
    const root = () => document.querySelector<HTMLElement>('dialog[open], [data-keyboard-menu]')
    const down = (event: KeyboardEvent) => {
      const menu = root()
      if (!menu || event.altKey || event.ctrlKey || event.metaKey) return
      const controls = menuControls(menu)
      if (!controls.length) return
      const node = document.activeElement as HTMLElement | null
      const text = node?.matches('textarea,input:not([type="range"]):not([type="checkbox"])')
      if (text && event.code !== 'Tab') return
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyE', 'Enter', 'Space', 'Tab'].includes(event.code)) return
      // Keyboard navigation moves focus between menu controls without blocking mouse clicks.
      event.preventDefault()
      event.stopImmediatePropagation()
      const index = controls.indexOf(node!)
      if (['ArrowUp', 'ArrowDown', 'Tab'].includes(event.code)) {
        const direction = event.code === 'ArrowUp' || (event.code === 'Tab' && event.shiftKey) ? -1 : 1
        controls[index < 0 ? (direction > 0 ? 0 : controls.length - 1) : nextControlIndex(index, controls.length, direction)]?.focus()
        return
      }
      const selected = index < 0 ? controls[0] : node!
      selected.focus()
      if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
        const direction = event.code === 'ArrowRight' ? 1 : -1
        if (selected instanceof HTMLInputElement && selected.type === 'range') {
          if (direction > 0) selected.stepUp(); else selected.stepDown()
          selected.dispatchEvent(new Event('input', { bubbles: true }))
          selected.dispatchEvent(new Event('change', { bubbles: true }))
        } else if (selected instanceof HTMLSelectElement) {
          selected.selectedIndex = Math.max(0, Math.min(selected.options.length - 1, selected.selectedIndex + direction))
          selected.dispatchEvent(new Event('change', { bubbles: true }))
        }
        return
      }
      if (event.repeat) return
      if (selected.tagName === 'SUMMARY') (selected.parentElement as HTMLDetailsElement).open = !(selected.parentElement as HTMLDetailsElement).open
      else selected.click()
    }
    document.addEventListener('keydown', down, true)
    return () => {
      document.removeEventListener('keydown', down, true)
    }
  }, [mode])
}
