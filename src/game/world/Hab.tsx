import { Html, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useMemo, useRef } from 'react'
import { useMissionStore } from '../../state/useMissionStore'
import { useStoryStore } from '../../state/useStoryStore'
import { palette } from '../../style/tokens'
import { Interaction, type Target } from '../interaction/Interaction'
import { BUNK_Z, HAB_FLOOR, OUTER_HATCH, WINDOW_INFILL, type Point } from './habLayout'
import { HabDetails } from './HabDetails'

interface Piece {
  asset: string
  at: Point
  yaw?: number
  part?: string
  half?: Point
}

const tileCenters = [-2, 0, 2]
const floor = tileCenters.flatMap(x => tileCenters.map(z => ({ asset: 'int-floor-ceiling', at: [x, -.1, z] as Point, part: 'floor_tile' })))
const ceiling = floor.map(tile => ({ ...tile, at: [tile.at[0], 2.5, tile.at[2]] as Point, part: 'ceiling_tile', yaw: Math.PI }))
const walls = tileCenters.flatMap<Piece>(i => [
  { asset: 'int-wall-panel', at: [-3, 0, i], part: 'variant_flat' },
  { asset: 'int-wall-panel', at: [3, 0, i], yaw: Math.PI, part: i === 0 ? 'variant_vent' : 'variant_flat' },
  { asset: 'int-wall-panel', at: [i, 0, -3], yaw: -Math.PI / 2, part: 'variant_flat' },
  { asset: 'int-wall-panel', at: [i, 0, 3], yaw: Math.PI / 2, part: i === 0 ? 'variant_door' : 'variant_flat' },
]).filter(wall => !(wall.at[0] === -3 && wall.at[2] === -2))
const furniture: Piece[] = [
  { asset: 'bunk', at: [-2.28, 0, BUNK_Z], yaw: -Math.PI / 2, half: [.46, .65, 1.04] },
  { asset: 'console-station', at: [0, 0, -2.52], yaw: -Math.PI / 2, half: [.55, .66, .33] },
  { asset: 'galley-chair', at: [2.14, 0, -.2], yaw: Math.PI, half: [.27, .47, .28] },
  { asset: 'pebble-nook', at: [2.79, 0, -2], yaw: Math.PI },
  { asset: 'window-hab', at: [-2.99, .9, -2] },
  { asset: 'int-door-inner', at: [0, 0, 2.92], yaw: Math.PI / 2 },
]

function KitPiece({ asset, at, yaw, part }: Piece) {
  const { scene } = useGLTF('/models/' + asset + '.glb')
  const model = useMemo(() => {
    const source = part ? scene.getObjectByName(part) : scene
    if (!source) throw new Error('Missing ' + asset + ' node ' + part)
    const clone = source.clone(true)
    if (part) clone.position.set(0, 0, 0)
    if (asset === 'window-hab') {
      const backing = clone.getObjectByName('Navy_glass_backing')
      const frost = clone.getObjectByName('frost_overlay')
      if (backing) backing.visible = false
      if (frost) frost.visible = false
    }
    return clone
  }, [asset, part, scene])
  return <group position={at} rotation-y={yaw ?? 0}><primitive object={model} /></group>
}

for (const asset of new Set([...floor, ...walls, ...furniture].map(piece => piece.asset))) useGLTF.preload('/models/' + asset + '.glb')

function HabRoom() {
  const view = useMissionStore(s => s.view)
  const area = useMissionStore(s => s.area)
  const visible = view === 'firstPerson' && area === 'hab'
  return <group position-y={HAB_FLOOR}>
    <group visible={visible}>
      {[...floor, ...walls, ...furniture].map(piece => <KitPiece key={piece.asset + piece.at.join(',')} {...piece} />)}
      <HabDetails />
      {WINDOW_INFILL.map(({ z, y, width, height }) => <mesh key={z + ':' + y} position={[-3.1, y, z]}>
        <boxGeometry args={[.2, height, width]} /><meshStandardMaterial color={palette['structure-white']} />
      </mesh>)}
      {view === 'firstPerson' && ceiling.map(piece => <KitPiece key={piece.at.join(',')} {...piece} />)}
      {area === 'hab' && view === 'firstPerson' && <>
        <pointLight position={[0, 1.97, -1.6]} color={palette['structure-white']} intensity={11} distance={7} />
        <pointLight position={[0, 1.97, 1.65]} color={palette['regolith-light']} intensity={8} distance={6} />
        <pointLight position={[2.12, 1.62, 1.4]} color={palette['regolith-light']} intensity={2.5} distance={3} />
        <pointLight position={[-2.3, 1.55, -1.54]} color={palette['regolith-light']} intensity={1.2} distance={2} />
      </>}
    </group>
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[3, .13, 3]} position={[0, -.13, 0]} />
      <CuboidCollider args={[3, .1, 3]} position={[0, 2.65, 0]} />
      {[-3, 3].map(edge => <CuboidCollider key={'x' + edge} args={[.12, 1.3, 3]} position={[edge, 1.3, 0]} />)}
      {[-3, 3].map(edge => <CuboidCollider key={'z' + edge} args={[3, 1.3, .12]} position={[0, 1.3, edge]} />)}
      {furniture.filter(piece => piece.half).map(({ asset, half, at }) =>
        <CuboidCollider key={asset} args={half!} position={[at[0], half![1], at[2]]} />)}
      <CuboidCollider args={[.32, .95, .92]} position={[2.64, .95, 1.4]} />
      <CuboidCollider args={[.3, 1.04, .73]} position={[-2.64, 1.04, 1.54]} />
      <CuboidCollider args={[.43, .4, .43]} position={[1.25, .4, -.2]} />
    </RigidBody>
  </group>
}

const AIRLOCK_SECONDS = 1.8

export function Hab() {
  const prompt = useMissionStore(s => s.prompt)
  const transfer = useRef<{ area: 'hab' | 'outside'; time: number; moved: boolean } | null>(null)

  function cycle(area: 'hab' | 'outside') {
    if (transfer.current) return
    if (document.pointerLockElement) document.exitPointerLock()
    useMissionStore.setState({ fading: true, airlockCycle: area, prompt: null, arrivalSpot: null })
    transfer.current = { area, time: 0, moved: false }
  }

  useFrame((_, delta) => {
    const pending = transfer.current
    if (!pending) return
    const ui = useMissionStore.getState()
    pending.time += Math.min(delta, .1)
    const total = ui.settings.reducedMotion ? .4 : AIRLOCK_SECONDS
    if (!pending.moved && pending.time >= total) {
      pending.moved = true
      useMissionStore.setState({ area: pending.area, shipArrival: false, arrival: ui.arrival + 1, prompt: null })
      useStoryStore.getState().dispatch({ type: pending.area === 'hab' ? 'enterHab' : 'leaveHab' })
    }
    if (pending.moved && pending.time >= total + .35) {
      transfer.current = null
      useMissionStore.setState({ fading: false, airlockCycle: null })
    }
  }, -25)

  const targets: Target[] = [
    { id: 'hab-hatch', area: 'hab', point: [0, HAB_FLOOR + 1.27, 2.65], label: 'Go outside (airlock)', range: 3.8, aimRadius: 1.5, use: () => cycle('outside') },
    { id: 'yard-hatch', area: 'outside', point: OUTER_HATCH, label: 'Enter the hab (airlock)', range: 4.2, aimRadius: 1.6, approach: true, use: () => cycle('hab') },
  ]

  return <>
    <HabRoom />
    {targets.filter(target => target.id === prompt?.id).map(target => <Html key={target.id} position={target.point} center zIndexRange={[2, 1]} style={{ pointerEvents: 'none' }}><span className="target-highlight" /></Html>)}
    <Interaction targets={targets} />
  </>
}
