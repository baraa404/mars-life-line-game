import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { CanvasTexture, DoubleSide, Group, Object3D, MathUtils, Raycaster } from 'three'
import type { LandingStage } from './m0'
import { InteractionController, type InteractionTarget } from '../interaction/InteractionController'
import { landingFlight, type LandingClock } from './landingFlight'
import { CABIN_CONTROLS } from './cabinGuidance'
import { CabinGuidance } from './CabinGuidance'

function instrumentTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 768; canvas.height = 384
  return new CanvasTexture(canvas)
}

function controlLabel(text: string) {
  const texture = instrumentTexture()
  const c = (texture.image as HTMLCanvasElement).getContext('2d')!
  c.fillStyle = '#202833'; c.fillRect(0, 0, 768, 384)
  c.fillStyle = '#F2E5D2'; c.font = 'bold 80px monospace'
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 384, 192)
  texture.needsUpdate = true
  return texture
}

function drawDisplay(texture: CanvasTexture, index: number, stage: LandingStage, pressure: number, auxiliary: boolean, altitude = 0, verticalSpeed = 0, pitch = 0) {
  const canvas = texture.image as HTMLCanvasElement, c = canvas.getContext('2d')!
  c.fillStyle = '#0B1822'; c.fillRect(0, 0, 768, 384)
  c.strokeStyle = '#183440'; c.lineWidth = 1
  for (let x = 0; x < 768; x += 48) { c.beginPath(); c.moveTo(x, 54); c.lineTo(x, 384); c.stroke() }
  for (let y = 54; y < 384; y += 48) { c.beginPath(); c.moveTo(0, y); c.lineTo(768, y); c.stroke() }
  c.font = 'bold 30px monospace'; c.fillStyle = '#9ACBD0'
  c.fillText(['FLIGHT / GUIDANCE', 'ENGINE / CONTROL', 'ENVIRONMENT / ECLSS'][index], 24, 40)
  c.fillStyle = '#F3E5CD'; c.font = 'bold 36px monospace'
  const landed = !['orbit', 'earth', 'entry', 'arm', 'thrust'].includes(stage)
  if (index === 0) {
    c.fillText(landed ? 'SURFACE LOCK' : stage === 'entry' ? 'ENTRY VECTOR' : 'MARS APPROACH', 24, 96)
    c.strokeStyle = '#58D5D8'; c.lineWidth = 3
    c.beginPath(); c.arc(195, 234, 100, 0, Math.PI * 2); c.stroke()
    c.beginPath(); c.moveTo(80, 234); c.lineTo(310, 234); c.moveTo(195, 120); c.lineTo(195, 344); c.stroke()
    c.strokeStyle = '#E8A065'; c.beginPath(); c.moveTo(148, 225); c.lineTo(195, 242); c.lineTo(243, 225); c.stroke()
    c.font = '26px monospace'; c.fillStyle = '#9ACBD0'
    c.fillText('TARGET JEZERO', 365, 170); c.fillText('PITCH ' + (pitch * 180 / Math.PI).toFixed(1), 365, 220)
    c.fillText('ALT ' + altitude.toFixed(1) + ' M', 365, 268); c.fillText('V/S ' + verticalSpeed.toFixed(1) + ' M/S', 365, 316)
  } else if (index === 1) {
    c.fillText(stage === 'thrust' ? 'DESCENT BURN' : stage === 'arm' ? 'APPROACH HOLD' : landed ? 'ENGINE SAFE' : 'PROPULSION READY', 24, 96)
    for (let i = 0; i < 4; i++) {
      const y = 143 + i * 53
      c.font = '24px monospace'; c.fillStyle = '#9ACBD0'; c.fillText(['FUEL', 'OXID', 'BUS A', 'BUS B'][i], 24, y + 20)
      c.fillStyle = '#203C44'; c.fillRect(145, y, 455, 24)
      c.fillStyle = i > 1 ? '#8ECCA8' : '#E8A065'; c.fillRect(145, y, (i < 2 ? .84 - i * .08 : .96) * 455, 24)
      c.fillStyle = '#F3E5CD'; c.fillText(['84%', '76%', '28 V', '28 V'][i], 635, y + 20)
    }
    c.fillStyle = '#8ECCA8'; c.fillText('THROTTLE: ' + (stage === 'thrust' ? 'AUTO / ACTIVE' : stage === 'arm' ? 'HOVER HOLD' : 'STANDBY'), 24, 369)
  } else {
    c.fillText(Math.round(pressure * 100) + '%  CABIN PRESSURE', 24, 96)
    c.font = '28px monospace'; c.fillStyle = '#9ACBD0'
    c.fillText('O2  21.0%      TEMP  21 C', 24, 155); c.fillText('CO2 0.04%      RH    42%', 24, 206)
    c.fillStyle = '#8ECCA8'; c.fillText('AIR LOOP  NOMINAL', 24, 265)
    c.fillStyle = auxiliary ? '#8ECCA8' : '#E8A065'; c.fillText('AUX BUS   ' + (auxiliary ? 'ONLINE' : 'ISOLATED'), 24, 316)
    c.font = '22px monospace'; c.fillStyle = '#9ACBD0'; c.fillText('HATCH: ' + (stage === 'exit' ? 'UNLOCKED' : 'SEALED'), 24, 365)
  }
  texture.needsUpdate = true
}

/** Portable physical instruments live in the GLB; live readouts and interaction live here. */
export function CabinInstruments({ room, stage, pressure, active, clock, onDescent, onSuit, onSeal, onCycle, onExit, cycling }: {
  room: Object3D; stage: LandingStage; pressure: number; active: boolean; onSuit: () => void; onSeal: () => void; onCycle: () => void; onExit: () => void; cycling: boolean; clock?: RefObject<LandingClock>; onDescent?: () => void
}) {
  const textures = useMemo(() => [instrumentTexture(), instrumentTexture(), instrumentTexture()], [])
  const labels = useMemo(() => ['ARM', 'THROTTLE', 'AUX BUS', 'CYCLE'].map(controlLabel), [])
  const cycleLever = useRef<Group>(null)
  const [auxiliary, setAuxiliary] = useState(true)
  const [throttle, setThrottle] = useState(false)
  const raycast = useMemo(() => new Raycaster(), [])
  const levers = useMemo(() => [room.getObjectByName('Joint_throttle_0'), room.getObjectByName('Joint_throttle_1')], [room])
  const dial = useMemo(() => room.getObjectByName('Joint_encoder_1_1'), [room])
  useEffect(() => {
    textures.forEach((texture, i) => drawDisplay(texture, i, stage, pressure, auxiliary))
  }, [textures, stage, pressure, auxiliary])
  useEffect(() => () => [...textures, ...labels].forEach(t => t.dispose()), [textures, labels])

  const targets: InteractionTarget[] = [
    { id: 'aux', point: [1.53, 1.8, 1.0], range: 2, label: 'Toggle auxiliary bus', use: () => setAuxiliary(value => !value) },
    { id: 'arm', point: CABIN_CONTROLS.arm, range: 2, label: 'Arm descent', hold: true, enabled: stage === 'arm', use: () => onDescent?.() },
    { id: 'throttle', point: CABIN_CONTROLS.throttle, range: 2, label: 'Pull descent throttle', enabled: stage === 'arm', use: () => { setThrottle(true); onDescent?.() } },
    { id: 'suit', point: CABIN_CONTROLS.suit, range: 2, label: 'Confirm suit check', enabled: stage === 'suit', use: onSuit },
    { id: 'seal', point: CABIN_CONTROLS.hatch, range: 2, label: 'Seal cabin hatch', hold: true, enabled: stage === 'seal', use: onSeal },
    { id: 'cycle', point: CABIN_CONTROLS.cycle, range: 2, label: 'Pull pressure cycle lever', hold: true, enabled: stage === 'cycle' && !cycling, use: onCycle },
    { id: 'exit', point: CABIN_CONTROLS.hatch, range: 2, label: 'Open outer hatch', hold: true, enabled: stage === 'exit', use: onExit },
  ]

  const displayTime = useRef(0)
  useFrame((_, dt) => {
    displayTime.current += dt
    if (displayTime.current > .15) {
      displayTime.current = 0
      const pose = landingFlight(stage, clock?.current.stage === stage ? clock.current.seconds : 0)
      drawDisplay(textures[0], 0, stage, pressure, auxiliary, pose.altitude, pose.verticalSpeed, pose.pitch)
    }
    for (const lever of levers) if (lever) lever.rotation.x = MathUtils.damp(lever.rotation.x, throttle || stage === 'thrust' ? -.5 : .12, 6, dt)
    if (dial) dial.rotation.z = MathUtils.damp(dial.rotation.z, auxiliary ? -.5 : .5, 8, dt)
    if (cycleLever.current) cycleLever.current.rotation.x = MathUtils.damp(cycleLever.current.rotation.x, cycling || stage === 'exit' ? -.65 : 0, 8, dt)
  })

  return <>
    <InteractionController targets={() => targets} blocked={() => !active} obstructed={(eye, direction, distance) => {
      room.updateWorldMatrix(true, true)
      raycast.set(eye, direction)
      return raycast.intersectObject(room, true).some(hit => hit.distance < distance - .35)
    }} />
    <CabinGuidance stage={stage} cycling={cycling} active={active} />
    <group position={CABIN_CONTROLS.cycle}>
      <mesh position={[0, 0, -.35]} castShadow receiveShadow>
        <boxGeometry args={[.30, .56, .12]} /><meshStandardMaterial color="#202833" />
      </mesh>
      <mesh position={[0, .19, -.28]}>
        <planeGeometry args={[.25, .10]} /><meshBasicMaterial map={labels[3]} toneMapped={false} />
      </mesh>
      <mesh position={[0, -.12, -.17]} castShadow>
        <boxGeometry args={[.08, .08, .30]} /><meshStandardMaterial color="#8E969C" metalness={.5} roughness={.45} />
      </mesh>
      <group ref={cycleLever} position={[0, -.12, -.02]}>
        <mesh position={[0, .10, 0]} castShadow>
          <boxGeometry args={[.045, .22, .045]} /><meshStandardMaterial color="#8E969C" metalness={.5} roughness={.45} />
        </mesh>
        <mesh position={[0, .20, 0]} castShadow>
          <boxGeometry args={[.18, .08, .08]} />
          <meshStandardMaterial color="#58D5D8" emissive="#58D5D8" emissiveIntensity={stage === 'cycle' && !cycling ? .5 : .05} />
        </mesh>
      </group>
    </group>

    <group position={[0, 1.8, 1.08]} rotation-x={Math.PI / 4}>
      {textures.map((texture, i) => <mesh key={i} position={[(i - 1) * .73, .1, -.142]} rotation-y={Math.PI}>
        <planeGeometry args={[.57, .30]} />
        <meshBasicMaterial map={texture} toneMapped={false} side={DoubleSide} />
      </mesh>)}
      <mesh position={[1.53, .35, -.145]} rotation-y={Math.PI}>
        <planeGeometry args={[.27, .07]} /><meshBasicMaterial map={labels[2]} toneMapped={false} />
      </mesh>
    </group>
    {[{ x: 1.23, y: 1.38, label: 0, width: .22 }, { x: -1.46, y: 1.40, label: 1, width: .38 }].map(p =>
      <mesh key={p.label} position={[p.x, p.y, .70]} rotation-y={Math.PI}>
        <planeGeometry args={[p.width, .075]} /><meshBasicMaterial map={labels[p.label]} toneMapped={false} />
      </mesh>)}
  </>
}
