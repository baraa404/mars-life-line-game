import { gameAudio } from '../audio/audio'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { MathUtils } from 'three'
import { useMouseCapture } from '../camera/useMouseCapture'
import { CABIN_EYE, CABIN_SPAWN, moveInCabin } from './cabinLayout'
import type { LandingStage } from './m0'

const walkingKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'KeyI', 'KeyJ', 'KeyK', 'KeyL']
const editable = (target: EventTarget | null) => target instanceof HTMLElement && !!target.closest('input,textarea,select,button,a')

export function CabinWalk({ active, reduced, stage }: { active: boolean; reduced: boolean; stage: LandingStage }) {
  const { camera, gl } = useThree()
  useMouseCapture(gl.domElement, active)
  const input = useRef({ ...CABIN_SPAWN, yaw: Math.PI, pitch: -.12, keys: new Set<string>() })
  useEffect(() => {
    const canvas = gl.domElement, state = input.current
    const clear = () => state.keys.clear()
    const down = (e: KeyboardEvent) => {
      if (!active || editable(e.target) || !walkingKeys.includes(e.code)) return
      e.preventDefault()
      state.keys.add(e.code)
    }
    const up = (e: KeyboardEvent) => state.keys.delete(e.code)
    const mouse = (e: MouseEvent) => {
      if (!active || document.pointerLockElement !== canvas) return
      state.yaw -= e.movementX * .002
      state.pitch = MathUtils.clamp(state.pitch - e.movementY * .002, -1.35, 1.35)
    }
    const lock = () => {
      if (!active || document.pointerLockElement === canvas) return
      canvas.focus({ preventScroll: true })
      try { void canvas.requestPointerLock()?.catch(() => undefined) } catch { /* IJKL provides keyboard look. */ }
    }
    const unlocked = () => { if (document.pointerLockElement !== canvas) clear() }
    canvas.tabIndex = 0
    canvas.setAttribute('aria-label', 'Landing ship cabin. WASD or arrows to walk, IJKL to look. Click for mouse look. Escape releases the mouse.')
    canvas.addEventListener('click', lock)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('mousemove', mouse)
    window.addEventListener('blur', clear)
    window.addEventListener('focusin', clear)
    document.addEventListener('pointerlockchange', unlocked)
    return () => {
      clear()
      if (document.pointerLockElement === canvas) document.exitPointerLock()
      canvas.removeEventListener('click', lock)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('mousemove', mouse)
      window.removeEventListener('blur', clear)
      window.removeEventListener('focusin', clear)
      document.removeEventListener('pointerlockchange', unlocked)
    }
  }, [active, gl])

  const stepDistance = useRef(0)
  useFrame(({ clock }, delta) => {
    const s = input.current, keys = s.keys, dt = Math.min(delta, .05)
    if (active) {
      s.yaw += (Number(keys.has('KeyJ')) - Number(keys.has('KeyL'))) * 1.6 * dt
      s.pitch = MathUtils.clamp(s.pitch + (Number(keys.has('KeyI')) - Number(keys.has('KeyK'))) * 1.25 * dt, -1.35, 1.35)
      const forward = Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown'))
      const right = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'))
      const length = Math.hypot(forward, right)
      if (length) {
        const speed = keys.has('ShiftLeft') || keys.has('ShiftRight') ? 2.3 : 1.4
        const distance = speed * dt / length
        const next = moveInCabin(s,
          (right * Math.cos(s.yaw) - forward * Math.sin(s.yaw)) * distance,
          (-right * Math.sin(s.yaw) - forward * Math.cos(s.yaw)) * distance)
        stepDistance.current += Math.hypot(next.x - s.x, next.z - s.z)
        if (stepDistance.current >= .85) { gameAudio.footstep(false); stepDistance.current = 0 }
        s.x = next.x; s.z = next.z
      }
    }
    const shake = active && !reduced
      ? stage === 'arm' ? .008 : ['entry', 'thrust', 'touchdown'].includes(stage) ? .012 : 0
      : 0
    camera.position.set(s.x, CABIN_EYE + shake * Math.sin(clock.elapsedTime * 35), s.z)
    camera.rotation.set(s.pitch, s.yaw, 0, 'YXZ')
  }, -10)
  return null
}
