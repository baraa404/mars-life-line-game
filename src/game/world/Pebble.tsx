import { publicUrl } from '../../publicUrl'
import { gameAudio } from '../audio/audio'
import { Html, useGLTF } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier'
import type { EcctrlHandle } from 'ecctrl'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { AnimationMixer, Group, LoopOnce, MathUtils, Mesh, MeshBasicMaterial, SRGBColorSpace, TextureLoader, Vector3 } from 'three'
import { useMissionStore } from '../../state/useMissionStore'
import { palette } from '../../style/tokens'
import type { Point } from './habLayout'
import { PEBBLE_DOCK, pebbleCanOccupy, pebbleFollowState, PEBBLE_FOLLOW_STOP, pebbleMotionStep, pebbleSteeringStep } from './pebbleMotion'
import { surfaceHeight } from './landscape'
import { jobTargets } from './stationModules'
import { useInteractionTargets } from '../interaction/Interaction'
import { PEBBLE_ARRIVAL, SHIP_ROUTE } from '../missions/m0'

const faces = ['neutral', 'happy', 'worried', 'thinking', 'sleepy', 'alarm', 'static', 'rebooting', 'card-mode'] as const
type Face = typeof faces[number]
const yard: Point = [1, 0, 9]
const routeJunction: Point = [8, 0, 6]
const playfulReplies = ['Boop received. Dignity rebooting…', 'You rock. I’m PEBBLE. We’re basically family.', 'Tiny robot. ENORMOUS enthusiasm.', 'That tickles my circuits!']

export function Pebble({ player }: { player: RefObject<EcctrlHandle | null> }) {
  const { scene, animations } = useGLTF(publicUrl('/models/pebble.glb'))
  const { world, rapier } = useRapier()
  const root = useRef<Group>(null)
  const asset = useMemo(() => scene.clone(true), [scene])
  const mixer = useMemo(() => new AnimationMixer(asset), [asset])
  const screen = useMemo(() => asset.getObjectByName('screen_face'), [asset])
  const screenPosition = useMemo(() => new Vector3(), [])
  const bumper = useMemo(() => new rapier.Ball(.24), [rapier])
  const tracks = useRef({ clip: '', face: '' as Face | '', speed: 0, guiding: false, syncedAt: -10, hint: 0, progressAt: 0, pointingUntil: 0,
    arrival: -1, card: '', reactionUntil: 0, glitchSince: 0, pos: new Vector3(...yard), goal: new Vector3(), following: false,
    heading: new Vector3(), lastPlayer: new Vector3(), acknowledgedAt: -10, blockedGoal: null as Vector3 | null })
  const [quip, setQuip] = useState('')
  const play = useRef({ remaining: 0, count: 0 })
  const dust = useRef<Group>(null)
  const tag = useMissionStore(s => s.view === 'station')
  const job = useMissionStore(s => s.snapshot?.state.pebble.job)
  const travel = useMissionStore(s => s.snapshot?.pebbleTravel)
  const chargeLevel = useMissionStore(s => s.snapshot?.state.pebble.batteryPct ?? 0)
  const progress = job ? travel ? 0 : job.kind === 'charge' ? chargeLevel / 100
    : 1 - job.etaMin / (job.kind === 'cleanPanels' ? 180 : 120) : 0
  const appearance = useMemo(() => new MeshBasicMaterial({ color: palette['space-deep'] }), [])
  const textures = useRef<Partial<Record<Face, ReturnType<TextureLoader['load']>>>>({})
  useEffect(() => {
    const bank = textures.current
    const loader = new TextureLoader()
    const faceDefault = asset.getObjectByName('face_default')
    if (faceDefault) faceDefault.visible = false
    asset.getObjectByName('screen_face')?.traverse(node => { if (node instanceof Mesh) node.material = appearance })
    faces.forEach(face => {
      const texture = loader.load(publicUrl('/ui/pebble-faces/') + face + '.svg')
      texture.colorSpace = SRGBColorSpace
      texture.flipY = true
      bank[face] = texture
    })
    return () => {
      gameAudio.stop('pebble')
      mixer.stopAllAction(); mixer.uncacheRoot(asset)
      appearance.dispose()
      Object.values(bank).forEach(texture => texture?.dispose())
    }
  }, [asset, appearance, mixer])

  function greet() {
    const ui = useMissionStore.getState()
    if (ui.currentCard) { ui.openDecision(); return }
    if (ui.paused || ui.fading || ui.openPanel || ui.decisionOpen || ui.snapshot?.fastForward || play.current.remaining > 0) return
    if (ui.snapshot?.state.pebble.glitched) { ui.setPanel('pebble'); return }
    play.current.remaining = 1.8
    setQuip(playfulReplies[play.current.count++ % playfulReplies.length])
  }

  useInteractionTargets(() => {
    const ui = useMissionStore.getState(), state = tracks.current
    return [{ id: 'pebble', area: 'outside', point: [state.pos.x, state.pos.y + .85, state.pos.z], range: 3.8, aimRadius: 1.4,
      label: ui.currentCard ? 'Read PEBBLE decision' : 'Boop PEBBLE',
      use: greet }]
  })
  useFrame(({ camera, clock }, delta) => {
    const robot = root.current, handle = player.current
    if (!robot || !handle?.body) return
    const ui = useMissionStore.getState(), s = ui.snapshot?.state, state = tracks.current
    if (!s) return
    const now = clock.elapsedTime
    if (play.current.remaining > 0 && !ui.paused && !ui.fading && !ui.openPanel && !ui.decisionOpen) {
      play.current.remaining = Math.max(0, play.current.remaining - Math.min(delta, .05))
      if (!play.current.remaining) setQuip('')
    }
    const playful = play.current.remaining > 0 && !ui.currentCard && !s.pebble.glitched
    const work = s.pebble.job
    const charge = work?.kind === 'charge' || !!ui.snapshot?.nightWatch || (!work && ui.area !== 'outside')
    const workingOutside = work && work.kind !== 'charge'
    const canFollow = !s.pebble.glitched && s.pebble.batteryPct > 0
    // Initialize once. Player airlock transitions must never relocate the robot.
    if (state.arrival < 0) {
      state.pos.fromArray(ui.shipArrival ? [PEBBLE_ARRIVAL[0], surfaceHeight(...PEBBLE_ARRIVAL), PEBBLE_ARRIVAL[1]] : yard)
    }
    if (state.arrival !== ui.arrival) { state.arrival = ui.arrival; state.progressAt = now }
    const body = handle.body.translation()
    const playerOutdoors = ui.area === 'outside' && pebbleCanOccupy(body.x, body.z)
    const playerDist = Math.hypot(body.x - state.pos.x, body.z - state.pos.z)
    const nearby = ui.area === 'outside' && playerDist <= 10
    if (nearby !== ui.pebbleNearby) useMissionStore.setState({ pebbleNearby: nearby })
    if (state.lastPlayer.distanceToSquared(state.heading.copy(body)) > 1) {
      state.lastPlayer.copy(body)
      state.progressAt = now
    }
    if (state.hint !== ui.hint || (!work && ui.view === 'firstPerson' && !ui.currentCard && !ui.openPanel && now - state.progressAt > 30)) {
      state.hint = ui.hint
      state.progressAt = now
      state.pointingUntil = now + 3
      if (ui.area === 'outside' && ui.snapshot?.mission === 'm0-walk') useMissionStore.setState({ speech: 'Follow the path west, then look for the orange hab hatch.' })
    }
    if (state.card && !ui.currentCard) {
      state.reactionUntil = now + 3
      if (ui.cardOrigin) useMissionStore.setState({ cardOrigin: null })
    }
    if (ui.currentCard && ui.currentCard.id !== state.card && nearby && screen) {
      screen.getWorldPosition(screenPosition).project(camera)
      useMissionStore.setState({ cardOrigin: [
        MathUtils.clamp(screenPosition.x, -.86, .86) * 50,
        MathUtils.clamp(-screenPosition.y, -.78, .78) * 50,
      ] })
    }
    state.card = ui.currentCard?.id ?? ''

    const target = work && jobTargets[work.target]?.point
    const velocity = handle.body.linvel()
    const follow = pebbleFollowState(playerDist, state.following, Math.hypot(velocity.x, velocity.z))
    const guiding = playerOutdoors && ui.snapshot?.mission === 'm0-walk' && !work
    if (!guiding || playerDist > 9) state.guiding = false
    else if (playerDist < 6) state.guiding = true
    const guideTo = ui.pebbleGuide && playerOutdoors ? ui.pebbleGuide : null
    if (guideTo && Math.hypot(body.x - guideTo[0], body.z - guideTo[2]) < 3.5) {
      useMissionStore.setState({ pebbleGuide: null })
    }
    if (guideTo) state.goal.set(guideTo[0], 0, guideTo[2])
    else if (charge) state.goal.fromArray(PEBBLE_DOCK)
    else if (workingOutside && target) {
      state.goal.fromArray(target)
      if (target[2] < -50 && state.pos.z > target[2] + 3) {
        if (state.pos.z > 6.7) state.goal.fromArray(routeJunction)
        else state.goal.set(8, 0, target[2] + 1)
      }
      else if (target[2] > -25 && state.pos.z > 6.7) state.goal.fromArray(routeJunction)
    } else if (state.guiding) {
      state.goal.set(state.pos.x > SHIP_ROUTE[0] + .8 ? SHIP_ROUTE[0] : 0, 0,
        state.pos.x > SHIP_ROUTE[0] + .8 ? SHIP_ROUTE[1] : 8.7)
    } else if (playerOutdoors && !state.guiding) {
      // Follow the player's position, so turns and strafing never swing an offset through them.
      state.goal.set(body.x, 0, body.z)
    } else {
      // Stay at the last outdoor position while the player is inside.
      state.goal.copy(state.pos)
    }
    const dist = Math.hypot(state.goal.x - state.pos.x, state.goal.z - state.pos.z)
    const followingPlayer = playerOutdoors && !state.guiding && !guideTo && !charge && !workingOutside
    state.following = followingPlayer && follow.following
    const stoppedAt = guideTo ? 1.6 : charge || workingOutside ? .35 : followingPlayer ? PEBBLE_FOLLOW_STOP : .3
    // Retry a blocked approach only once the player or task target has moved.
    if (state.blockedGoal && state.goal.distanceToSquared(state.blockedGoal) > .25) state.blockedGoal = null
    // Station view parks the companion; explicitly assigned jobs can still travel.
    const mayMove = (ui.view === 'firstPerson' || !!work) && !playful && !ui.paused && (!ui.openPanel || !!ui.currentCard) && (!ui.decisionOpen || nearby && !work) && !ui.fading && (playerOutdoors || !!work || charge) && (!followingPlayer || state.following)
    const guideSpeed = 2.7 * MathUtils.clamp((9 - playerDist) / 2, 0, 1)
    const motion = pebbleMotionStep(state.speed, dist, stoppedAt, guideTo ? guideSpeed * 1.3 : workingOutside ? 4 : state.guiding ? guideSpeed : followingPlayer ? follow.maxSpeed : 5.8, delta)
    state.speed = mayMove && canFollow ? motion.speed : 0
    let moved = false
    if (canFollow && mayMove && motion.step > 0 && !state.blockedGoal) {
      const next = pebbleSteeringStep(state.pos.x, state.pos.z, state.goal.x, state.goal.z, motion.step, (nextX, nextZ, headingX, headingZ) => {
        if (!pebbleCanOccupy(nextX, nextZ)) return false
        state.heading.set(headingX, 0, headingZ)
        const blocked = world.castShape({ x: state.pos.x, y: state.pos.y + .34, z: state.pos.z },
          { x: 0, y: 0, z: 0, w: 1 }, state.heading, bumper, 0, motion.step + .28, false,
          rapier.QueryFilterFlags.ONLY_FIXED, undefined, undefined, handle.body)
        return !blocked
      })
      if (next) {
        state.pos.x = next.x
        state.pos.z = next.z
        const turn = MathUtils.euclideanModulo(next.angle - robot.rotation.y + Math.PI, Math.PI * 2) - Math.PI
        robot.rotation.y += turn * (1 - Math.exp(-8 * motion.dt))
        moved = true
      } else state.blockedGoal = state.goal.clone()
    }
    if (!moved) state.speed = 0
    state.pos.y = surfaceHeight(state.pos.x, state.pos.z)
    robot.position.copy(state.pos)
    robot.rotation.z = 0
    if (playful && !ui.settings.reducedMotion) {
      const t = 1 - play.current.remaining / 1.8
      const envelope = Math.sin(t * Math.PI)
      robot.rotation.z = Math.sin(t * Math.PI * 8) * .12 * envelope
      robot.position.y += Math.abs(Math.sin(t * Math.PI * 3)) * .13 * envelope
    }
    robot.visible = ui.view === 'station' || ui.area === 'outside'
    let turning = false
    if (!moved && nearby && ui.view === 'firstPerson') {
      const facing = now < state.pointingUntil ? state.goal : body
      const desired = Math.atan2(-(facing.z - state.pos.z), facing.x - state.pos.x)
      const turn = MathUtils.euclideanModulo(desired - robot.rotation.y + Math.PI, Math.PI * 2) - Math.PI
      turning = Math.abs(turn) > .22
      robot.rotation.y += MathUtils.clamp(turn, -delta * 4, delta * 4)
    }
    if (!s.pebble.glitched) state.glitchSince = now
    const glitching = s.pebble.glitched && now - state.glitchSince < 1
    // The simulation's legacy 'hab' location means connected to station power;
    // the physical charging position is now the outdoor dock.
    const atDock = Math.hypot(state.pos.x - PEBBLE_DOCK[0], state.pos.z - PEBBLE_DOCK[2]) <= .38
    const location = atDock ? 'hab' : 'outside'
    if (!work && s.pebble.location !== location && canFollow && now - state.syncedAt > 1) {
      state.syncedAt = now
      ui.send({ type: 'pebbleFollow', location })
    }
    const workTarget = charge ? PEBBLE_DOCK : target
    const reached = !!workTarget && Math.hypot(workTarget[0] - state.pos.x, workTarget[2] - state.pos.z) <= .38
    if (mayMove && reached && work && ui.snapshot?.pebbleTravel === work.target && now - state.acknowledgedAt > 1.25) {
      state.acknowledgedAt = now
      ui.send({ type: 'pebbleArrived', target: work.target })
    }
    const cleaning = work?.kind === 'cleanPanels' && reached && !s.pebble.glitched && s.pebble.batteryPct > 0
    const clip = s.pebble.glitched ? 'Reboot' : ui.currentCard ? (moved ? 'Drive' : 'Idle') : playful && !ui.settings.reducedMotion ? 'Happy' : moved ? 'Drive'
      : now < state.pointingUntil ? 'Point' : charge ? 'Charge' : cleaning ? 'Clean' : work?.kind === 'carry' ? 'Grip'
      : now < state.reactionUntil ? 'Happy' : s.env.stormPhase === 'peak' ? 'Hide' : s.pebble.batteryPct < 20 ? 'Worried' : turning ? 'TurnInPlace' : 'Idle'
    const face: Face = s.pebble.glitched ? glitching ? 'static' : 'rebooting' : ui.currentCard ? 'card-mode'
      : playful ? 'happy' : now < state.reactionUntil ? 'happy' : now < state.pointingUntil ? 'thinking' : charge ? 'sleepy'
      : s.pebble.batteryPct < 20 ? 'worried' : 'neutral'
    if (face !== state.face) {
      state.face = face
      appearance.map = textures.current[face] ?? null
      appearance.color.set(appearance.map ? palette['structure-white'] : palette['space-deep'])
      appearance.needsUpdate = true
    }
    const audible = ui.area === 'outside' && playerDist < 12 && !ui.paused && !ui.fading && !ui.openPanel && !ui.decisionOpen
    if (audible && (moved || cleaning)) {
      gameAudio.loop('pebble', cleaning ? 'pebble-clean' : 'pebble-drive', .25 * Math.max(0, 1 - playerDist / 12))
    } else gameAudio.stop('pebble')
    if (clip !== state.clip) {
      if (state.clip && audible) {
        const cue = clip === 'Charge' ? 'pebble-charge' : clip === 'Grip' ? 'pebble-grip' : clip === 'TurnInPlace' ? 'pebble-turn' : null
        if (cue) gameAudio.play(cue, .25, 3)
      }
      const old = animations.find(animation => animation.name === state.clip)
      const next = animations.find(animation => animation.name === clip)
      state.clip = clip
      if (old) mixer.clipAction(old).fadeOut(.15)
      if (next) {
        const action = mixer.clipAction(next).reset().fadeIn(.15)
        if (next.userData.kilnLoopIntent === 'once') { action.setLoop(LoopOnce, 1); action.clampWhenFinished = true }
        action.play()
      }
    }
    if (!ui.paused && (!ui.openPanel || ui.currentCard)) mixer.update(ui.settings.reducedMotion ? Math.min(delta, .016) : delta)
    if (dust.current) {
      dust.current.visible = cleaning && !ui.settings.reducedMotion
      dust.current.children.forEach((puff, i) => {
        const t = (now * 1.6 + i / 4) % 1
        puff.position.set(.33 + t * .65, .36 + t * .17, -.17 + Math.sin(i * 2) * t * .21)
        puff.scale.setScalar(.35 + t * 1.4)
      })
    }
  }, -5)
  // Visual-only group: no rigid body or collider can block the player.
  return <group ref={root} position={yard}>
    <primitive object={asset} onClick={(event: ThreeEvent<MouseEvent>) => {
      const ui = useMissionStore.getState()
      if (ui.view === 'station') { event.stopPropagation(); greet() }
    }} />
    {quip && <Html position={[0, 1.85, 0]} center zIndexRange={[24, 23]} style={{ pointerEvents: 'none' }}>
      <span role="status" style={{ display: 'block', width: 'max-content', maxWidth: 210, padding: '10px 14px', borderRadius: '14px 14px 14px 2px', background: '#30221ef2', color: '#fff1da', border: '1px solid #edaa61', font: '700 13px/1.4 system-ui', textAlign: 'center', boxShadow: '0 4px 18px #0003' }}>{quip}</span>
    </Html>}
    <group ref={dust} visible={false}>{[0, 1, 2, 3].map(i => <mesh key={i}>
      <sphereGeometry args={[.085, 6, 4]} /><meshBasicMaterial color={palette['glass-tint']} transparent opacity={.45} depthWrite={false} />
    </mesh>)}</group>
    {tag && <Html position={[0, 1.12, 0]} center zIndexRange={[22, 19]}>
      <button data-mouse className="station-tag" onClick={greet}>
        <img alt="" src={publicUrl('/ui/icons/pebble.svg')} /><strong>PEBBLE</strong>{job && <small>{travel ? 'On the way' : Math.ceil(job.etaMin) + ' min left'}</small>}
        {job && <svg className="job-ring" viewBox="0 0 22 22" role="img" aria-label={Math.round(progress * 100) + '% done'}>
          <circle cx="11" cy="11" r="8" fill="none" stroke="var(--structure-gray)" strokeWidth="3" />
          <circle cx="11" cy="11" r="8" fill="none" stroke="var(--accent-cyan)" strokeWidth="3"
            pathLength="1" strokeDasharray={MathUtils.clamp(progress, 0, 1) + ' 1'} transform="rotate(-90 11 11)" />
        </svg>}
      </button>
    </Html>}
  </group>
}

export function AstronautMarker({ player }: { player: RefObject<EcctrlHandle | null> }) {
  const { scene, animations } = useGLTF(publicUrl('/models/young-astronaut.glb'))
  const asset = useMemo(() => scene.clone(true), [scene])
  const mixer = useMemo(() => new AnimationMixer(asset), [asset])
  const marker = useRef<Group>(null)
  const moving = useRef(false)
  useEffect(() => {
    mixer.clipAction(animations.find(clip => clip.name === 'Idle')!).play()
    return () => { mixer.stopAllAction(); mixer.uncacheRoot(asset) }
  }, [animations, asset, mixer])
  useFrame((_, dt) => {
    const node = marker.current, handle = player.current, ui = useMissionStore.getState()
    if (!node || !handle?.body) return
    const velocity = handle.body.linvel(), body = handle.body.translation()
    const walking = Math.hypot(velocity.x, velocity.z) > .1
    if (walking !== moving.current) {
      mixer.stopAllAction()
      mixer.clipAction(animations.find(clip => clip.name === (walking ? 'Walk' : 'Idle'))!).play()
      moving.current = walking
    }
    if (walking) node.rotation.y = Math.atan2(-velocity.z, velocity.x)
    node.visible = ui.view === 'station' && ui.area !== 'airlock'
    node.position.set(body.x, body.y - 1.1, body.z)
    mixer.update(dt)
  })
  return <group ref={marker} visible={false}><primitive object={asset} /></group>
}
