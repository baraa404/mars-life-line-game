import { useEffect } from 'react'
import { useMissionStore } from '../../state/useMissionStore'

export function useMouseCapture(canvas: HTMLCanvasElement, active: boolean) {
  useEffect(() => {
    if (!active) {
      if (document.pointerLockElement === canvas) document.exitPointerLock()
      return
    }
    const hint = () => useMissionStore.setState({ captureHint: 'Press V for mouse look · IJKL keyboard look' })
    const capture = () => {
      if (document.pointerLockElement === canvas) return
      canvas.focus({ preventScroll: true })
      try { void canvas.requestPointerLock()?.catch(hint) } catch { hint() }
    }
    const down = (event: KeyboardEvent) => {
      if (event.code === 'KeyV' && !event.repeat && !event.defaultPrevented) { event.preventDefault(); capture() }
    }
    const change = () => {
      if (document.pointerLockElement === canvas) useMissionStore.setState({ captureHint: '' })
      else hint()
    }
    window.addEventListener('keydown', down)
    document.addEventListener('pointerlockchange', change)
    document.addEventListener('pointerlockerror', hint)
    capture()
    return () => {
      window.removeEventListener('keydown', down)
      document.removeEventListener('pointerlockchange', change)
      document.removeEventListener('pointerlockerror', hint)
      if (document.pointerLockElement === canvas) document.exitPointerLock()
    }
  }, [canvas, active])
}
