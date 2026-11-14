import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import { useMissionStore } from '../../state/useMissionStore'
import { stepInteraction, aimedTarget, availableTargets, type SpatialTarget } from './targeting'

export interface InteractionTarget extends SpatialTarget {
  label: string
  hold?: boolean
  /** Seconds the player must hold E; defaults to HOLD_SECONDS. */
  holdSeconds?: number
  use: () => void
}

export function InteractionController({ targets, blocked, obstructed }: {
  targets: () => InteractionTarget[]
  blocked: () => boolean
  obstructed?: (eye: Vector3, direction: Vector3, distance: number) => boolean
}) {
  const input = useRef({ held: false, pressed: false, toggled: false, alternate: -1, duration: 0, id: '' })
  const look = useRef(new Vector3())
  const current = useRef({ targets, blocked, obstructed })
  current.current = { targets, blocked, obstructed }
  useEffect(() => {
    const reset = () => { Object.assign(input.current, { held: false, pressed: false, toggled: false, duration: 0 }) }
    const down = (event: KeyboardEvent) => {
      if (event.defaultPrevented || current.current.blocked() || event.repeat || event.ctrlKey || event.metaKey || event.altKey ||
        (event.target instanceof HTMLElement && event.target.closest('button,input,select,a,textarea,summary'))) return
      if (event.code === 'KeyE') {
        event.preventDefault()
        input.current.held = input.current.pressed = true
      } else if (event.code === 'KeyF') {
        event.preventDefault()
        input.current.alternate++
      }
    }
    const up = (event: KeyboardEvent) => { if (event.code === 'KeyE') input.current.held = false }
    // Left click acts on whatever sits under the centre dot, but only once the mouse is captured.
    const click = (event: MouseEvent) => {
      if (event.button !== 0 || !document.pointerLockElement || current.current.blocked()) return
      input.current.held = input.current.pressed = true
    }
    const release = (event: MouseEvent) => { if (event.button === 0) input.current.held = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('mousedown', click)
    window.addEventListener('mouseup', release)
    window.addEventListener('blur', reset)
    return () => {
      window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', reset)
      window.removeEventListener('mousedown', click); window.removeEventListener('mouseup', release)
      useMissionStore.setState({ prompt: null })
    }
  }, [])
  useFrame(({ camera }, dt) => {
    const api = current.current, key = input.current, ui = useMissionStore.getState()
    const available = api.blocked() ? [] : availableTargets(api.targets(), camera.position,
      api.obstructed ? (direction, distance) => api.obstructed!(camera.position, direction, distance) : undefined)
    let target: InteractionTarget | undefined
    if (key.alternate >= 0 && !document.pointerLockElement && available.length) target = available[key.alternate % available.length]
    else {
      key.alternate = -1
      target = aimedTarget(available, camera.position, camera.getWorldDirection(look.current))
    }
    const prompt = target ? { id: target.id, label: target.label, hold: !!target.hold } : null
    if (ui.prompt?.id !== prompt?.id || ui.prompt?.label !== prompt?.label || ui.prompt?.hold !== prompt?.hold) useMissionStore.setState({ prompt })
    const { activate, progress } = stepInteraction(key, target, dt, ui.settings.toggleHold)
    document.querySelectorAll<HTMLElement>('.hold-ring').forEach(ring => ring.style.setProperty('--hold-progress', String(progress)))
    if (activate) target?.use()
    key.pressed = false
  }, -1)
  return null
}
