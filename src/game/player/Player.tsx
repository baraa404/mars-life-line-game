import { gameAudio } from '../audio/audio'
import { LANDING_SITE } from '../missions/landingFlight'
import { useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Ecctrl, type EcctrlHandle } from 'ecctrl'
import type { RefObject } from 'react'
import { scale } from '../../style/tokens'
import { useWorldStore } from '../../state/useWorldStore'
import { surfaceHeight } from '../world/landscape'
import { useRef } from 'react'
import { playerInputBlocked, useMissionStore } from '../../state/useMissionStore'
import { useStoryStore } from '../../state/useStoryStore'
import { weakened } from '../../sim/story/story'
import { arrivalPose, HAB_FLOOR } from '../world/habLayout'
import type { ControlName } from './controls'

export const PLAYER_SPAWN: [number, number, number] = [0, HAB_FLOOR + 1.1, .65]

const CAPSULE_RADIUS = 0.35
const CAPSULE_HALF_HEIGHT = scale['astronaut-height'] / 2 - CAPSULE_RADIUS
const FLOAT_HEIGHT = 0.2
const EYE_HEIGHT = 1.65
/** Rigid body origin sits this far above the ground while standing. */
const BODY_HEIGHT = CAPSULE_HALF_HEIGHT + CAPSULE_RADIUS + FLOAT_HEIGHT
export const EYE_HEIGHT_ABOVE_BODY = EYE_HEIGHT - BODY_HEIGHT

type PlayerProps = { handle: RefObject<EcctrlHandle | null> }

/** Invisible first-person body: Ecctrl capsule driven by the keyboard. */
export function Player({ handle }: PlayerProps) {
  const [, getKeys] = useKeyboardControls<ControlName>()

  const lastView = useRef('base')
  const arrival = useRef(-1)
  const steps = useRef({ x: 0, z: 0, distance: 0, initialized: false })
  useFrame(({ camera }) => {
    const ui = useMissionStore.getState()
    const body = handle.current?.body
    if (!body) return
    if (arrival.current !== ui.arrival) {
      const { foot: [x, y, z] } = ui.arrivalSpot ?? arrivalPose(ui.area, arrival.current >= 0, ui.shipArrival)
      body.setTranslation({ x, y: y + BODY_HEIGHT, z }, true)
      body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      arrival.current = ui.arrival
    }
    if (import.meta.env.DEV) {
      const view = useWorldStore.getState().siteView
      if (view !== lastView.current && handle.current) {
        const points = { base: [0, 14, 0, 0], array: [40, -10, 23, -10], ship: [LANDING_SITE.x - 12, LANDING_SITE.z + 10, LANDING_SITE.x, LANDING_SITE.z], greenhouse: [-6, 16, -13.5, 6], ice: [2, 18, 8, 14.5] }
        const [x, z, tx, tz] = points[view]
        useMissionStore.setState({ area: 'outside' })
        body.setTranslation({ x, y: surfaceHeight(x, z) + 2, z }, true)
        body.setLinvel({ x: 0, y: 0, z: 0 }, true)
        camera.position.set(x, surfaceHeight(x, z) + 1.65, z); camera.lookAt(tx, surfaceHeight(tx, tz) + 1.3, tz)
        lastView.current = view
      }
    }
    const frozen = playerInputBlocked(ui)
    if (frozen) {
      const velocity = body.linvel()
      if (velocity.x || velocity.z) body.setLinvel({ x: 0, y: velocity.y, z: 0 }, true)
    }
    const position = body.translation(), velocity = body.linvel(), step = steps.current
    const distance = Math.hypot(position.x - step.x, position.z - step.z)
    if (!step.initialized || frozen || distance > 1 || Math.abs(velocity.y) > .8) step.distance = 0
    else if (Math.hypot(velocity.x, velocity.z) > .2) {
      step.distance += distance
      if (step.distance >= .85) { gameAudio.footstep(ui.area === 'outside'); step.distance = 0 }
    }
    step.x = position.x; step.z = position.z; step.initialized = true
    const story = useStoryStore.getState().state
    const keys = getKeys()
    handle.current?.setMovement(frozen ? { forward: false, backward: false, leftward: false, rightward: false, run: false, jump: false }
      : story && weakened(story) ? { ...keys, run: false, jump: false } : keys)
  }, -20)

  return (
    <Ecctrl
      ref={handle}
      position={PLAYER_SPAWN}
      capsuleRadius={CAPSULE_RADIUS}
      capsuleHalfHeight={CAPSULE_HALF_HEIGHT}
      floatHeight={FLOAT_HEIGHT}
      maxWalkVel={3}
      maxRunVel={6}
      jumpVel={2.6}
      fallingGravityScale={1.5}
      enableToggleRun={false}
    />
  )
}
