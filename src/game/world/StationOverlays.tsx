import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Group, InstancedMesh, Matrix4, TubeGeometry, Vector3 } from 'three'
import { useMissionStore, type MissionSnapshot } from '../../state/useMissionStore'
import { palette } from '../../style/tokens'
import { createCableSplines } from './cablePaths'
import { jobTargets, stationModules } from './stationModules'
import type { Point } from './habLayout'

export function moduleKW(id: string, snapshot: MissionSnapshot | null) {
  if (!snapshot) return 0
  if (id.startsWith('solar-')) return snapshot.solarKW / 4
  const load = stationModules[id]?.load
  if (load) return snapshot.loads[load]
  if (id === 'battery') return snapshot.solarKW + (snapshot.state.power.fissionOnline ? 6 : 0) - Object.values(snapshot.loads).reduce((a, b) => a + b, 0)
  return null
}

export function selectModule(id: string) {
  const ui = useMissionStore.getState()
  if (ui.jobPicker) {
    if (!jobTargets[id]?.jobs.includes(ui.jobPicker)) return
    ui.send({ type: 'pebbleJob', kind: ui.jobPicker, target: id, travel: true })
    useMissionStore.setState({ jobPicker: null, openPanel: null, panelHistory: [], speech: 'I’m on my way.' })
  } else if (stationModules[id]) ui.setPanel('module:' + id)
}

export function moduleStatus(id: string, snapshot: MissionSnapshot | null) {
  if (!snapshot) return { level: 0, text: '● OK' }
  const { power } = snapshot.state, load = stationModules[id]?.load
  const reserve = power.batteryKWh / power.batteryCapKWh
  if (id === 'battery' && reserve < .15 || load === 'lifeSupport' && !power.on.lifeSupport) return { level: 2, text: '■ Act' }
  if (id === 'battery' && reserve < .35 || id.startsWith('solar-') && power.panelDust > .3) return { level: 1, text: '▲ Watch' }
  return { level: 0, text: load && !power.on[load] ? '● Off' : '● OK' }
}

export function ModuleTag({ id, at }: { id: string; at: Point }) {
  const view = useMissionStore(s => s.view)
  const snapshot = useMissionStore(s => s.snapshot)
  const job = useMissionStore(s => s.jobPicker)
  const module = stationModules[id]
  if (view !== 'station' || (!module && !job) || (job && !jobTargets[id]?.jobs.includes(job))) return null
  const kw = moduleKW(id, snapshot)
  const status = moduleStatus(id, snapshot)
  return <Html position={at} center zIndexRange={[18, 3]}>
    <button className={'station-tag' + (id.startsWith('solar-') ? ' station-tag-solar' : '')} onClick={() => selectModule(id)}>
      <img alt="" src={'/ui/icons/' + (module?.icon ?? 'pebble') + '.svg'} />
      <strong>{module?.label ?? jobTargets[id]?.label}</strong>
      {module && <small><span className={'level-' + status.level}>{status.text}</span>{kw === null ? '' : ' · ' + Math.abs(kw).toFixed(1) + ' kW'}</small>}
    </button>
  </Html>
}

function flow(id: string, s: MissionSnapshot) {
  const solar = s.solarKW
  if (id.startsWith('array-feed')) return -solar / 4
  if (id === 'battery-array') return -solar
  if (id === 'hab-shelter') return s.loads.shelterPump
  if (id === 'hab-dock') return s.loads.pebbleCharge
  if (id === 'north-repair') return 0
  return -Object.values(s.loads).reduce((a, b) => a + b, 0) + s.loads.shelterPump + s.loads.pebbleCharge
}

export function PowerFlow() {
  const group = useRef<Group>(null)
  const dots = useRef<InstancedMesh>(null)
  const routes = useMemo(() => createCableSplines().map(route => {
    route.curve.points.forEach(point => { point.y += .22 })
    return { ...route, bands: [.035, .065, .105].map(radius => new TubeGeometry(route.curve, 64, radius, 5, false)) }
  }), [])
  const point = useMemo(() => new Vector3(), [])
  const transform = useMemo(() => new Matrix4(), [])
  useEffect(() => () => routes.forEach(route => route.bands.forEach(geometry => geometry.dispose())), [routes])
  useFrame(({ clock }) => {
    const ui = useMissionStore.getState()
    if (!group.current || !dots.current) return
    group.current.visible = ui.view === 'station'
    if (!group.current.visible || !ui.snapshot) return
    const s = ui.snapshot
    let index = 0
    routes.forEach((route, i) => {
      const kw = flow(route.id, s)
      const band = Math.abs(kw) >= 6 ? 2 : Math.abs(kw) >= 1 ? 1 : 0
      group.current!.children[i].children.forEach((mesh, j) => { mesh.visible = Math.abs(kw) > .03 && j === band })
      if (Math.abs(kw) <= .03) return
      for (let j = 0; j < 6; j++) {
        const t = (j / 6 + (ui.settings.reducedMotion ? 0 : clock.elapsedTime * .18)) % 1
        route.curve.getPointAt(kw > 0 ? t : 1 - t, point)
        dots.current!.setMatrixAt(index++, transform.makeTranslation(point.x, point.y + .1, point.z))
      }
    })
    dots.current.count = index
    dots.current.instanceMatrix.needsUpdate = true
  })
  return <group ref={group} visible={false}>
    {routes.map(route => <group key={route.id}>{route.bands.map((geometry, i) => <mesh key={i} geometry={geometry}>
      <meshBasicMaterial color={palette['accent-blue']} transparent opacity={.7} depthWrite={false} />
    </mesh>)}</group>)}
    <instancedMesh ref={dots} args={[undefined, undefined, routes.length * 6]} frustumCulled={false}>
      <sphereGeometry args={[.13, 6, 4]} /><meshBasicMaterial color={palette['accent-cyan']} />
    </instancedMesh>
  </group>
}
