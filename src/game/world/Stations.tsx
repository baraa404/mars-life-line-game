import { publicUrl } from '../../publicUrl'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { EcctrlHandle } from 'ecctrl'
import { useMemo, useRef, type ReactNode, type RefObject } from 'react'
import { Vector3 } from 'three'
import { useMissionStore } from '../../state/useMissionStore'
import { useStoryStore } from '../../state/useStoryStore'
import { nextSpots, panelsClean, type Spot, type StoryState } from '../../sim/story/story'
import { palette } from '../../style/tokens'
import { playerPose } from '../player/playerPose'
import { surfaceHeight } from './landscape'
import { SITE } from './siteLayout'
import { RECYCLER_PLACEMENT } from './storyLayout'
import { Walkways } from './Walkways'
import type { Point } from './habLayout'

export type OutdoorStation = 'greenhouse' | 'shelter' | 'oxygen' | 'recycler' | 'solar' | 'battery'
export const STATION_INFO: Record<OutdoorStation, { name: string; icon: string; label: [number, number, number]; spots: Spot[] }> = {
  greenhouse: { name: 'Greenhouse', icon: 'food', label: [-13.5, 4.8, 6.3], spots: ['greenhouse', 'gh-valve', 'gh-lights', 'gh-board', 'trays'] },
  shelter: { name: 'Radiation Shelter', icon: 'radiation', label: [-7.5, 3.6, 6.8], spots: ['shelter'] },
  oxygen: { name: 'Oxygen Generator', icon: 'air', label: [6.2, 2.6, 6.9], spots: ['oxygen'] },
  recycler: { name: 'Water Recycler', icon: 'water', label: [RECYCLER_PLACEMENT.x, 2.7, RECYCLER_PLACEMENT.z], spots: ['recycler', 'crates'] },
  solar: { name: 'Solar Panels', icon: 'power', label: [25, 3.4, -10], spots: ['panels'] },
  battery: { name: 'Battery Bank', icon: 'power', label: [15.5, 3, -15], spots: ['battery'] },
}
const look = new Vector3()

/** A group in a site placement's local frame (+X is the model's front). */
export function Local({ id, children }: { id: string; children: ReactNode }) {
  const p = SITE.find(item => item.id === id)!
  return <group position={[p.x, surfaceHeight(p.x, p.z), p.z]} rotation-y={p.rotationY * Math.PI / 180}>{children}</group>
}

/** Status words under each floating station label and in quick management. */
export function stationStatus(s: StoryState, id: OutdoorStation) {
  if (id === 'greenhouse') {
    if (!s.ghValve || !s.ghLights) return 'Offline'
    if (s.trays.some(t => t.blocked)) return 'Drip line blocked!'
    return s.mode === 'emergency' ? 'Paused (emergency)' : `${s.mode ? s.mode[0].toUpperCase() + s.mode.slice(1) : 'Growing'} mode`
  }
  if (id === 'solar') return panelsClean(s) === 4 ? 'Clean' : `Dusty (${4 - panelsClean(s)} rows)`
  if (id === 'battery') return `${Math.round(s.power)}%${s.backup ? ' · backup on' : ''}${s.brownout ? ' · EMPTY' : ''}`
  if (id === 'oxygen') return s.secured.oxygen && s.scene === 6 ? 'Covered' : s.damaged.includes('oxygen') ? 'Damaged · half output' : s.oxygenGen ? (s.brownout ? 'No power' : 'Running') : 'Offline'
  if (id === 'recycler') return s.secured.recycler && s.scene === 6 ? 'Covered' : s.damaged.includes('recycler') ? 'Damaged · half output' : s.recycler ? (s.brownout ? 'No power' : 'Running') : s.filter === 'installed' ? 'Ready to start' : 'Filter clogged'
  return s.scene === 6 && !s.allClear ? 'GET INSIDE!' : 'Thick walls'
}

function Label({ id }: { id: OutdoorStation }) {
  const info = STATION_INFO[id]
  const status = useStoryStore(o => o.state ? stationStatus(o.state, id) : '')
  const goal = useStoryStore(o => !!o.state && nextSpots(o.state).some(spot => info.spots.includes(spot)))
  const area = useMissionStore(s => s.area)
  const station = useMissionStore(s => s.view === 'station')
  const panel = useMissionStore(s => s.openPanel)
  const inside = useStoryStore(o => !!o.state?.inGreenhouse)
  const node = useRef<HTMLDivElement>(null)
  const position = useMemo(() => new Vector3(info.label[0], surfaceHeight(info.label[0], info.label[2]) + info.label[1], info.label[2]), [info])
  useFrame(({ camera }) => {
    if (!node.current) return
    const distance = camera.position.distanceTo(position)
    node.current.style.opacity = String(station ? 1 : distance < 6 ? 0 : distance > 70 ? 0 : distance > 45 ? (70 - distance) / 25 : 1)
  })
  if ((!station && (area !== 'outside' || inside)) || (station && panel)) return null
  return <Html position={position} center zIndexRange={[4, 2]} style={{ pointerEvents: station ? 'auto' : 'none' }}>
    <div ref={node} data-mouse className={'station-label' + (goal ? ' goal' : '') + (station ? ' station-label-interactive' : '')}>
      {station && <button className="station-label-hit" aria-label={`${info.name}: ${status}`} onClick={() => useMissionStore.getState().setPanel('manage')} />}
      <img src={publicUrl('/ui/icons/') + info.icon + '.svg'} alt="" />
      <span><strong>{info.name}</strong><small>{status}</small></span>
      {goal && <em aria-label="Mission here">!</em>}
    </div>
  </Html>
}

/** Lights the lens on the oxygen generator's status lamp while it runs. */
function OxygenMaker() {
  const on = useStoryStore(o => !!o.state?.oxygenGen && !o.state.brownout)
  return <Local id="oxygen">
    <mesh position={[.4, 1.66, -.98]}>
      <boxGeometry args={[.17, .09, .17]} />
      <meshStandardMaterial color={palette['structure-white']} emissive={on ? palette['plant-green'] : palette['trim-dark']} emissiveIntensity={on ? 2.2 : .1} />
    </mesh>
    {on && <pointLight position={[.4, 2, -.98]} color={palette['plant-green']} intensity={2.5} distance={4} />}
  </Local>
}

/** Pale ice showing through the dug soil around the drill deck. */
function IceField() {
  return <Local id="ice-drill">
    {[[2, -1.7, .8], [-.4, 2.1, .7], [-2.2, -1.2, .6], [1.6, 1.9, .45], [3.4, .6, .5], [-2.8, 1.6, .4]].map(([x, z, r], i) =>
      <mesh key={i} position={[x, r * .2, z]} scale={[r, r * .45, r * 1.2]} rotation-y={i * 1.3}>
        <icosahedronGeometry args={[1, 0]} /><meshStandardMaterial color={palette['ice-pale']} roughness={.35} flatShading />
      </mesh>)}
  </Local>
}

/** Two layers of regolith sandbags on the shelter's back and side walls; the hatch (+X) and connector (+Z) stay open. */
function Sandbags() {
  const bags = useMemo(() => {
    const list: { at: Point; yaw: number }[] = []
    for (let layer = 0; layer < 2; layer++) for (let i = 0; i < 6; i++) {
      const t = -1.35 + i * .54, y = .17 + layer * .32
      list.push({ at: [-1.85, y, t], yaw: 0 }, { at: [t, y, -1.85], yaw: Math.PI / 2 })
      if (Math.abs(t) > .8) list.push({ at: [t, y, 1.85], yaw: Math.PI / 2 })
    }
    return list
  }, [])
  return <Local id="shelter">{bags.map((bag, i) =>
    <mesh key={i} position={bag.at} rotation-y={bag.yaw}>
      <boxGeometry args={[.42, .3, .56]} /><meshStandardMaterial color={palette['regolith-mid']} roughness={1} flatShading />
    </mesh>)}</Local>
}

export function Stations({ player }: { player: RefObject<EcctrlHandle | null> }) {
  useFrame(({ camera }) => {
    const body = player.current?.body
    if (!body) return
    const p = body.translation()
    camera.getWorldDirection(look)
    playerPose.x = p.x; playerPose.z = p.z; playerPose.heading = Math.atan2(look.x, -look.z); playerPose.known = true
  })
  return <>
    {(Object.keys(STATION_INFO) as OutdoorStation[]).map(id => <Label key={id} id={id} />)}
    <OxygenMaker />
    <IceField />
    <Sandbags />
    <Walkways />
  </>
}
