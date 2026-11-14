import { useFrame, useThree } from '@react-three/fiber'
import type { EcctrlHandle } from 'ecctrl'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { Euler, MathUtils, OrthographicCamera, PerspectiveCamera, Quaternion, Vector3 } from 'three'
import { playerInputBlocked, useMissionStore } from '../../state/useMissionStore'
import { EYE_HEIGHT_ABOVE_BODY } from '../player/Player'
import { useMouseCapture } from './useMouseCapture'
import { arrivalPose } from '../world/habLayout'

import { SLEEP_EYE, SLEEP_ROTATION, STATION_PITCH as pitch, stationCameraDistance } from './viewLayout'
const panKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']
const editable = (e: KeyboardEvent) => e.target instanceof HTMLElement && !!e.target.closest('input,textarea,select,button,a')

export function FirstPersonCamera({ target }: { target: RefObject<EcctrlHandle | null> }) {
  const gl = useThree(s => s.gl)
  const blocked = useMissionStore(playerInputBlocked)
  useMouseCapture(gl.domElement, !blocked)
  const set = useThree(s => s.set)
  const size = useThree(s => s.size)
  const get = useThree(s => s.get)
  const first = useRef(get().camera as PerspectiveCamera)
  const station = useMemo(() => new OrthographicCamera(-1, 1, 1, -1, .05, 1600), [])
  const state = useRef({
    arrived: -1, yaw: 0, pitch: 0, angle: Math.PI / 4, zoom: 24,
    center: new Vector3(8, 0, 1), eye: new Vector3(), orbit: new Vector3(),
    facing: new Quaternion(), euler: new Euler(0, 0, 0, 'YXZ'), displayStation: false, viewTarget: 'firstPerson', viewTime: 1, rightDrag: false, keys: new Set<string>(),
    sleepEye: new Vector3(...SLEEP_EYE),
    sleepRotation: new Quaternion().setFromEuler(new Euler(...SLEEP_ROTATION, 'YXZ')),
  })
  useEffect(() => {
    const canvas = gl.domElement, input = state.current
    const move = (e: MouseEvent) => {
      const ui = useMissionStore.getState()
      if (ui.view === 'station' && input.rightDrag && !ui.openPanel && !ui.decisionOpen && !ui.paused) {
        const k = input.zoom / Math.max(1, canvas.clientHeight) * 2
        input.center.x += (-e.movementX * Math.cos(input.angle) - e.movementY * Math.sin(input.angle)) * k
        input.center.z += (e.movementX * Math.sin(input.angle) - e.movementY * Math.cos(input.angle)) * k
      } else if (document.pointerLockElement === canvas && !playerInputBlocked(ui)) {
        input.yaw -= e.movementX * .002
        input.pitch = MathUtils.clamp(input.pitch - e.movementY * .002, -1.53, 1.53)
      }
    }
    const click = () => {
      if (!playerInputBlocked(useMissionStore.getState()) && document.pointerLockElement !== canvas) {
        canvas.focus({ preventScroll: true })
        try { void canvas.requestPointerLock()?.catch(() => undefined) } catch { /* Keyboard look remains available. */ }
      }
    }
    const wheel = (e: WheelEvent) => {
      const ui = useMissionStore.getState()
      if (ui.view !== 'station' || ui.openPanel || ui.decisionOpen || ui.paused) return
      e.preventDefault()
      input.zoom = MathUtils.clamp(input.zoom * Math.exp(e.deltaY * .001), 9, 118)
    }
    const down = (e: KeyboardEvent) => {
      const ui = useMissionStore.getState()
      if (editable(e) || ui.openPanel || ui.decisionOpen || ui.paused) return
      if (ui.view === 'station') {
        if (panKeys.includes(e.code)) input.keys.add(e.code)
        if (!e.repeat && (e.code === 'KeyQ' || e.code === 'KeyE')) input.angle += e.code === 'KeyQ' ? Math.PI / 2 : -Math.PI / 2
        if (e.code === 'Equal' || e.code === 'Minus') input.zoom = MathUtils.clamp(input.zoom * (e.code === 'Equal' ? .85 : 1.15), 9, 118)
      } else if (['KeyJ', 'KeyL', 'KeyI', 'KeyK'].includes(e.code)) input.keys.add(e.code)
    }
    const up = (e: KeyboardEvent) => { input.keys.delete(e.code) }
    const mouseDown = (e: MouseEvent) => { input.rightDrag = e.button === 2 && useMissionStore.getState().view === 'station' }
    const mouseUp = () => { input.rightDrag = false }
    const clear = () => { input.keys.clear(); mouseUp() }
    const menu = (e: MouseEvent) => { if (useMissionStore.getState().view === 'station') e.preventDefault() }
    canvas.tabIndex = 0
    canvas.setAttribute('aria-label', 'Life Line Station world. Use J, L, I and K to look with the keyboard.')
    canvas.addEventListener('click', click)
    canvas.addEventListener('wheel', wheel, { passive: false })
    canvas.addEventListener('mousedown', mouseDown)
    canvas.addEventListener('contextmenu', menu)
    window.addEventListener('mouseup', mouseUp)
    window.addEventListener('mousemove', move)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clear)
    const unsubscribe = useMissionStore.subscribe((ui, previous) => {
      if (ui.view !== previous.view) clear()
      if (playerInputBlocked(ui) && document.pointerLockElement === canvas) document.exitPointerLock()
    })
    return () => {
      unsubscribe()
      canvas.removeEventListener('click', click)
      canvas.removeEventListener('wheel', wheel)
      canvas.removeEventListener('mousedown', mouseDown)
      canvas.removeEventListener('contextmenu', menu)
      window.removeEventListener('mouseup', mouseUp)
      window.removeEventListener('mousemove', move)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
    }
  }, [gl])

  useFrame((frame, dt) => {
    const input = state.current, ui = useMissionStore.getState(), body = target.current?.body
    const isStation = ui.view === 'station'
    if (input.viewTarget !== ui.view) {
      input.viewTarget = ui.view
      input.viewTime = 0
    }
    input.viewTime += dt
    // Swap projections beneath the opaque middle of the cloud wipe.
    if (ui.settings.reducedMotion || input.viewTime >= .45) input.displayStation = isStation
    if (input.arrived !== ui.arrival) {
      input.yaw = (ui.arrivalSpot ?? arrivalPose(ui.area, input.arrived >= 0, ui.shipArrival)).facing
      input.pitch = ui.area === 'airlock' ? -.17 : ui.arrival === 1 && ui.area === 'hab' ? -.11 : 0
      input.arrived = ui.arrival
    }
    if (!isStation && !playerInputBlocked(ui)) {
      input.yaw += (Number(input.keys.has('KeyJ')) - Number(input.keys.has('KeyL'))) * 1.65 * dt
      input.pitch = MathUtils.clamp(input.pitch + (Number(input.keys.has('KeyI')) - Number(input.keys.has('KeyK'))) * 1.4 * dt, -1.53, 1.53)
    }
    if (isStation && !ui.openPanel && !ui.decisionOpen && !ui.paused) {
      const right = Number(input.keys.has('KeyD') || input.keys.has('ArrowRight')) - Number(input.keys.has('KeyA') || input.keys.has('ArrowLeft'))
      const back = Number(input.keys.has('KeyS') || input.keys.has('ArrowDown')) - Number(input.keys.has('KeyW') || input.keys.has('ArrowUp'))
      const distance = input.zoom * dt
      input.center.x += (right * Math.cos(input.angle) + back * Math.sin(input.angle)) * distance
      input.center.z += (back * Math.cos(input.angle) - right * Math.sin(input.angle)) * distance
    }
    if (body) {
      input.eye.copy(body.translation())
      input.eye.y += EYE_HEIGHT_ABOVE_BODY
    }
    input.facing.setFromEuler(input.euler.set(input.pitch, input.yaw, 0, 'YXZ'))
    const cam = first.current
    const fov = ui.settings.fov
    if (cam.fov !== fov || cam.aspect !== size.width / size.height) {
      cam.fov = fov
      cam.aspect = size.width / size.height
      cam.updateProjectionMatrix()
    }
    const span = input.zoom
    // Keep the whole orthographic near plane above the terrain at every zoom.
    const radius = stationCameraDistance(span)
    input.center.x = MathUtils.clamp(input.center.x, -170, 170)
    input.center.z = MathUtils.clamp(input.center.z, -170, 170)
    input.orbit.set(Math.sin(input.angle) * Math.cos(pitch), Math.sin(pitch), Math.cos(input.angle) * Math.cos(pitch))
      .multiplyScalar(radius).add(input.center)
    station.position.copy(input.orbit)
    station.lookAt(input.center)
    const aspect = size.width / Math.max(1, size.height)
    if (station.top !== span || station.right !== span * aspect) {
      station.top = span; station.bottom = -span
      station.right = span * aspect; station.left = -span * aspect
      station.updateProjectionMatrix()
    }
    cam.position.copy(input.eye)
    cam.quaternion.copy(input.facing)
    if (!input.displayStation && ui.area === 'hab' && ui.snapshot?.state.clock.sleeping) {
      cam.position.copy(input.sleepEye)
      cam.quaternion.copy(input.sleepRotation)
    }
    const active = input.displayStation ? station : cam
    active.updateMatrixWorld()
    if (frame.camera !== active) set({ camera: active })
    if (active === station) frame.raycaster.camera = station
  }, -12)
  return null
}
