import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { EcctrlHandle } from 'ecctrl'
import { useMemo, useRef, type RefObject } from 'react'
import { Group, MathUtils } from 'three'
import { useMissionStore } from '../../state/useMissionStore'
import { useStoryStore } from '../../state/useStoryStore'
import { brief, nextSpots, trayReady, type Mode, type Spot, type StoryAction, type StoryState } from '../../sim/story/story'
import { palette } from '../../style/tokens'
import { gameAudio } from '../audio/audio'
import { useInteractionTargets, type Target } from '../interaction/Interaction'
import { HAB_FLOOR, type Point } from './habLayout'
import { surfaceHeight } from './landscape'
import { placementPoint } from './siteLayout'
import { Local } from './Stations'
import {
  faceCentre, GH_BOARD_LOCAL, GH_CONTROL_LOCAL, GREENHOUSE_CENTER, GREENHOUSE_RADIUS, LEVER_SPACING, LEVERS, RECYCLER_PLACEMENT,
  SPOT_POINTS, STORY_POINTS, TRAY_LOCAL,
} from './storyLayout'

type Cue = Parameters<typeof gameAudio.play>[0]
const send = (action: StoryAction, cue?: Cue) => {
  const ok = useStoryStore.getState().dispatch(action)
  if (ok && cue) gameAudio.play(cue, .5, .2)
  return ok
}
const story = () => useStoryStore.getState().state
const LEVER_COLOR: Record<Mode, string> = {
  survival: palette['plant-green'], balanced: palette['accent-blue'], farming: palette['accent-orange'], emergency: palette['regolith-mid'],
}
const LEVER_NAME: Record<Mode, string> = { survival: 'Survival', balanced: 'Balanced', farming: 'Farming', emergency: 'EMERGENCY' }
const HAB_EXIT: Point = [0, HAB_FLOOR + 1.27, 2.65]

const rotateY = (p: Point, yaw: number): Point => [p[0] * Math.cos(yaw) + p[2] * Math.sin(yaw), p[1], -p[0] * Math.sin(yaw) + p[2] * Math.cos(yaw)]
const add = (a: Point, b: Point): Point => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const BOARD_YAW = faceCentre(GH_BOARD_LOCAL)
const CONTROL_YAW = faceCentre(GH_CONTROL_LOCAL)
/** Lever i on a board, in the board's own frame (+X out of the face; left to right is +Z to −Z). */
const leverLocal = (i: number): Point => [.1, .95, (1.5 - i) * LEVER_SPACING]
const ghLeverPoint = (i: number) => { const p = add(GH_BOARD_LOCAL, rotateY(leverLocal(i), BOARD_YAW)); return placementPoint('greenhouse', [p[0], p[1] + .1, p[2]]) }
const HAB_BOARD_YAW = -Math.PI / 2
const habLeverPoint = (i: number): Point => add([STORY_POINTS.habBoard[0], HAB_FLOOR, STORY_POINTS.habBoard[2]], rotateY(leverLocal(i), HAB_BOARD_YAW))

function modeTarget(s: StoryState, mode: Mode): { enabled: boolean; label: string } {
  if (mode === 'emergency') return { enabled: s.scene === 6 && !s.stormChoice && !s.allClear, label: 'Pull the red EMERGENCY lever' }
  const ready = s.ghValve && s.ghLights && (s.scene !== 6 || s.allClear)
  return { enabled: ready && s.mode !== mode, label: `Pull the ${LEVER_NAME[mode]} lever` }
}

/** Fade, move the player, then fade back in. */
const transfer = { current: null as null | { time: number; moved: boolean; foot: Point; facing: number; after?: () => void } }
function teleport(foot: Point, facing: number, after?: () => void) {
  if (transfer.current) return
  useMissionStore.setState({ fading: true, prompt: null })
  transfer.current = { time: 0, moved: false, foot, facing, after }
}

function useStoryTargets() {
  useInteractionTargets(() => {
    const s = story()
    if (!s || s.ending) return []
    const list: Target[] = []
    const outside = (t: Omit<Target, 'area'>) => list.push({ area: 'outside', range: 3.8, aimRadius: 1.2, ...t })
    STORY_POINTS.panels.forEach((point, i) => outside({
      id: 'story-panel-' + i, point: [...point] as Point, range: 4.8, aimRadius: 1.8, hold: true, holdSeconds: 2.2,
      enabled: s.scene >= 2 && s.panelDust[i] >= .15, label: `Scrub solar panel row ${i + 1}`,
      use: () => send({ type: 'cleanPanel', panel: i }, 'tool'),
    }))
    outside({ id: 'story-breaker', point: STORY_POINTS.breaker, range: 3.8, aimRadius: 1.2, hold: true, holdSeconds: 1.5, enabled: s.scene >= 2 && !s.backup,
      label: 'Throw the backup power breaker', use: () => send({ type: 'backup' }, 'switch') })
    outside({ id: 'story-filter', point: STORY_POINTS.filterRack, range: 3.8, aimRadius: 1.2, enabled: s.scene >= 3 && s.filter === 'crate',
      label: 'Take a new water filter', use: () => send({ type: 'takeFilter' }, 'pebble-grip') })
    const coverRecycler = s.scene === 6 && !s.allClear && !s.secured.recycler
    outside({ id: 'story-socket', point: STORY_POINTS.recyclerSocket, range: 3.8, aimRadius: 1.2, hold: true, holdSeconds: coverRecycler ? 1.4 : 1.6,
      enabled: coverRecycler || s.scene >= 3 && s.filter === 'carried',
      label: coverRecycler ? 'Close the recycler’s radiation cover' : 'Install the new filter',
      use: () => coverRecycler ? send({ type: 'secure', system: 'recycler' }, 'door') : send({ type: 'installFilter' }, 'tool') })
    outside({ id: 'story-lever', point: STORY_POINTS.recyclerLever, range: 3.8, aimRadius: 1.2, enabled: s.scene >= 3 && !s.recycler,
      label: s.filter === 'installed' ? 'Pull the recycler start lever' : 'Start lever (install a filter first)',
      use: () => send({ type: 'startRecycler' }, 'switch') })
    const coverOxygen = s.scene === 6 && !s.allClear && !s.secured.oxygen
    outside({ id: 'story-oxygen', point: [...STORY_POINTS.oxygen] as Point, range: 4.0, aimRadius: 1.5, hold: true, holdSeconds: 1.4,
      enabled: coverOxygen || s.scene >= 3 && !s.oxygenGen,
      label: coverOxygen ? 'Close the generator’s radiation cover' : 'Start the oxygen generator',
      use: () => coverOxygen ? send({ type: 'secure', system: 'oxygen' }, 'door') : send({ type: 'startOxygen' }, 'switch') })
    outside({ id: 'story-gh-in', point: STORY_POINTS.greenhouseDoorOut, range: 4.2, aimRadius: 1.5, label: 'Enter the greenhouse',
      use: () => { gameAudio.play('door', .4); teleport(STORY_POINTS.greenhouseInside, 0) } })
    outside({ id: 'story-gh-out', point: STORY_POINTS.greenhouseDoorIn, range: 3.4, aimRadius: 1.4, label: 'Leave the greenhouse',
      use: () => { gameAudio.play('door', .4); teleport(STORY_POINTS.greenhouseOutside, Math.PI) } })
    outside({ id: 'story-valve', point: STORY_POINTS.ghValve, range: 3.4, aimRadius: 1.1, hold: true, holdSeconds: 1.6, enabled: s.scene >= 4 && !s.ghValve,
      label: 'Turn the water valve open', use: () => send({ type: 'valve' }, 'tool') })
    const override = s.scene === 6 && !s.stormChoice && !s.allClear
    outside({ id: 'story-lights', point: STORY_POINTS.ghLights, range: 3.4, aimRadius: 1.1, hold: override, holdSeconds: 1.5, enabled: override || s.scene >= 4 && !s.ghLights,
      label: override ? 'Override: keep the greenhouse farming' : 'Switch on the grow lights',
      use: () => override ? send({ type: 'override' }, 'switch') : send({ type: 'lights' }, 'switch') })
    LEVERS.forEach((mode, i) => {
      const t = modeTarget(s, mode)
      outside({ id: 'story-gh-lever-' + mode, point: ghLeverPoint(i), range: 3.2, aimRadius: .22, ...t, use: () => send({ type: 'mode', mode }, 'switch') })
      list.push({ id: 'story-hab-lever-' + mode, area: 'hab', point: habLeverPoint(i), range: 3.2, aimRadius: .22, ...t, use: () => send({ type: 'mode', mode }, 'switch') })
    })
    STORY_POINTS.trays.forEach((point, i) => {
      const tray = s.trays[i]
      const harvest = trayReady(tray) && (s.scene === 4 && s.harvested < 3 || s.scene === 8)
      outside({ id: 'story-tray-' + i, point, range: 3.8, aimRadius: 1.3, enabled: s.scene >= 4 && s.ghValve && s.ghLights,
        hold: tray.blocked || harvest, holdSeconds: tray.blocked ? 1.8 : 1.4,
        label: tray.blocked ? `Clear tray ${i + 1}’s blocked drip line` : harvest ? `Harvest tray ${i + 1}` : `Check tray ${i + 1}`,
        use: () => tray.blocked ? send({ type: 'clearTray', tray: i }, 'tool') : harvest ? send({ type: 'harvest', tray: i }, 'harvest') : send({ type: 'checkTray', tray: i }, 'ui-click') })
    })
    outside({ id: 'story-shelter', point: [...STORY_POINTS.shelter] as Point, range: 4.5, aimRadius: 1.8, enabled: s.scene === 6 && !s.sheltered && !s.allClear,
      label: 'Enter the radiation shelter', use: () => { gameAudio.play('door', .45); teleport(STORY_POINTS.shelter, Math.PI, () => send({ type: 'shelter' })) } })
    list.push(s.scene === 7
      ? { id: 'story-report', area: 'hab', point: STORY_POINTS.terminal, range: 3.8, aimRadius: 1.4, hold: true, holdSeconds: 2, label: 'Submit the mission report',
        use: () => send({ type: 'report' }, 'message') }
      : { id: 'story-terminal', area: 'hab', point: STORY_POINTS.terminal, range: 3.8, aimRadius: 1.4, label: 'Use the control terminal',
        use: () => { if (document.pointerLockElement) document.exitPointerLock(); gameAudio.play('ui-open', .4); useMissionStore.getState().setView('station'); send({ type: 'terminal' }) } })
    return list
  })
}

/** One wall- or post-mounted priority board: four coloured levers, the active mode's lever thrown down. */
function PriorityBoard({ post }: { post: boolean }) {
  const mode = useStoryStore(o => o.state?.mode ?? null)
  const active = useStoryStore(o => !!o.state && o.state.ghValve && o.state.ghLights)
  const levers = useRef<(Group | null)[]>([])
  useFrame((_, dt) => LEVERS.forEach((m, i) => {
    const lever = levers.current[i]
    if (lever) lever.rotation.z = MathUtils.damp(lever.rotation.z, m === mode ? -.9 : .6, 10, dt)
  }))
  return <group>
    {post && <mesh position={[-.05, .45, 0]}><boxGeometry args={[.12, .9, .12]} /><meshStandardMaterial color={palette['structure-gray']} /></mesh>}
    <mesh position={[0, .95, 0]}><boxGeometry args={[.08, .62, 1.12]} /><meshStandardMaterial color={palette['structure-white']} roughness={.6} /></mesh>
    <mesh position={[.045, 1.22, 0]}><boxGeometry args={[.01, .06, 1.04]} /><meshStandardMaterial color={palette['trim-dark']} emissive={active ? palette['accent-cyan'] : palette['trim-dark']} emissiveIntensity={active ? 1.2 : 0} /></mesh>
    {LEVERS.map((m, i) => {
      const [, y, z] = leverLocal(i)
      return <group key={m} position={[.05, y - .08, z]}>
        <mesh position={[.01, -.16, 0]}><boxGeometry args={[.02, .1, .16]} /><meshStandardMaterial color={LEVER_COLOR[m]} emissive={LEVER_COLOR[m]} emissiveIntensity={m === mode ? 1.4 : .15} /></mesh>
        <group ref={node => { levers.current[i] = node }}>
          <mesh position={[.09, 0, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[.018, .018, .18, 6]} /><meshStandardMaterial color={palette['trim-dark']} /></mesh>
          <mesh position={[.19, 0, 0]}><sphereGeometry args={[.04, 8, 6]} /><meshStandardMaterial color={LEVER_COLOR[m]} roughness={.4} /></mesh>
        </group>
      </group>
    })}
  </group>
}

/** Valve wheel and grow-light switch on a post beside the greenhouse door. */
function GreenhouseControls() {
  const valve = useStoryStore(o => !!o.state?.ghValve)
  const lights = useStoryStore(o => !!o.state?.ghLights)
  const wheel = useRef<Group>(null)
  useFrame((_, dt) => { if (wheel.current) wheel.current.rotation.x = MathUtils.damp(wheel.current.rotation.x, valve ? Math.PI * 2.5 : 0, 3, dt) })
  return <group position={GH_CONTROL_LOCAL} rotation-y={CONTROL_YAW}>
    <mesh position={[-.05, .7, 0]}><boxGeometry args={[.12, 1.4, .12]} /><meshStandardMaterial color={palette['structure-gray']} /></mesh>
    <mesh position={[0, .55, 0]}><boxGeometry args={[.1, .34, .34]} /><meshStandardMaterial color={palette['accent-blue']} roughness={.5} /></mesh>
    <group ref={wheel} position={[.13, .77, 0]}>
      <mesh rotation-z={Math.PI / 2}><torusGeometry args={[.13, .022, 6, 12]} /><meshStandardMaterial color={palette['accent-orange']} /></mesh>
      <mesh><boxGeometry args={[.02, .26, .03]} /><meshStandardMaterial color={palette['accent-orange']} /></mesh>
      <mesh><boxGeometry args={[.02, .03, .26]} /><meshStandardMaterial color={palette['accent-orange']} /></mesh>
    </group>
    <mesh position={[.02, 1.17, 0]}><boxGeometry args={[.08, .26, .2]} /><meshStandardMaterial color={palette['structure-white']} /></mesh>
    <mesh position={[.08, 1.17, 0]} rotation-z={lights ? -.5 : .5}><boxGeometry args={[.05, .12, .05]} /><meshStandardMaterial color={palette['grow-magenta']} emissive={palette['grow-magenta']} emissiveIntensity={lights ? 1.6 : .1} /></mesh>
  </group>
}

/** Crops grown on each built-in tray, with a status lamp: red when the drip line blocks. */
function TrayCrops() {
  const trays = useStoryStore(o => o.state?.trays.map(t => `${Math.round(t.growth * 25)}|${t.blocked}|${t.harvested}|${t.crop}|${t.dead}`).join(',') ?? '')
  const lights = useStoryStore(o => !!o.state?.ghLights && !o.state.brownout && o.state.mode !== 'emergency')
  const s = story()
  if (!s) return null
  return <>{TRAY_LOCAL.map((tray, i) => {
    const t = s.trays[i], ready = t.growth >= 1 && !t.harvested && !t.dead
    const size = t.harvested && s.scene === 4 ? 0 : .15 + Math.min(1, t.growth) * .85
    const color = t.dead || t.blocked && t.stalled > 6 ? palette['regolith-light'] : palette['plant-green']
    return <group key={i + trays} position={tray.at} rotation-y={tray.yaw * Math.PI / 180}>
      {size > 0 && Array.from({ length: 5 }, (_, p) => <group key={p} position={[0, 0, (p - 2) * .23]}>
        <mesh position={[0, size * .12, 0]} scale={[size * .17, size * .15, size * .17]}><icosahedronGeometry args={[1, 0]} /><meshStandardMaterial color={color} roughness={.8} flatShading /></mesh>
        {ready && <mesh position={[.07, size * .2, .05]} scale={.045}><icosahedronGeometry args={[1, 0]} /><meshStandardMaterial color={palette['accent-orange']} roughness={.6} flatShading /></mesh>}
      </group>)}
      <mesh position={[.37, -.12, .45]}><boxGeometry args={[.03, .07, .07]} />
        <meshStandardMaterial color={palette['trim-dark']} emissive={t.blocked ? palette['regolith-mid'] : ready ? palette['accent-orange'] : palette['plant-green']} emissiveIntensity={t.dead ? 0 : 2.4} />
      </mesh>
      {t.blocked && <pointLight position={[.5, 0, .45]} color={palette['regolith-mid']} intensity={1.5} distance={1.6} />}
    </group>
  })}
    {lights && <pointLight position={[-.2, 2.4, 0]} color={palette['grow-magenta']} intensity={7} distance={6} />}
  </>
}

function Breaker() {
  const on = useStoryStore(o => !!o.state?.backup)
  const [x, , z] = STORY_POINTS.breakerBase
  return <group position={[x, surfaceHeight(x, z), z]}>
    <mesh position={[0, .55, 0]}><boxGeometry args={[.12, 1.1, .12]} /><meshStandardMaterial color={palette['structure-gray']} /></mesh>
    <mesh position={[0, 1.15, .05]}><boxGeometry args={[.42, .42, .14]} /><meshStandardMaterial color={palette['accent-orange']} roughness={.5} /></mesh>
    <mesh position={[0, on ? 1.08 : 1.22, .15]}><boxGeometry args={[.07, .14, .07]} /><meshStandardMaterial color={palette['trim-dark']} /></mesh>
    <mesh position={[.14, 1.29, .13]}><boxGeometry args={[.05, .05, .03]} /><meshStandardMaterial color={palette['trim-dark']} emissive={on ? palette['plant-green'] : palette['accent-orange']} emissiveIntensity={on ? 2 : .6} /></mesh>
  </group>
}

function FilterRack() {
  const filter = useStoryStore(o => o.state?.filter ?? 'crate')
  const [x, , z] = STORY_POINTS.filterRack
  return <group position={[x, surfaceHeight(x, z), z]}>
    {[[-.3, -.17], [.3, -.17], [-.3, .17], [.3, .17]].map(([lx, lz], i) => <mesh key={i} position={[lx, .38, lz]}><boxGeometry args={[.05, .76, .05]} /><meshStandardMaterial color={palette['trim-dark']} /></mesh>)}
    <mesh position={[0, .78, 0]}><boxGeometry args={[.72, .06, .44]} /><meshStandardMaterial color={palette['structure-white']} roughness={.7} /></mesh>
    <mesh position={[0, .7, .225]}><boxGeometry args={[.72, .1, .02]} /><meshStandardMaterial color={palette['accent-orange']} /></mesh>
    {[-.2, 0, .2].map((dx, i) => (i !== 1 || filter === 'crate') && <mesh key={i} position={[dx, .94, 0]}>
      <cylinderGeometry args={[.08, .08, .26, 10]} /><meshStandardMaterial color={i === 1 ? palette['accent-cyan'] : palette['structure-white']} emissive={i === 1 ? palette['accent-cyan'] : palette['trim-dark']} emissiveIntensity={i === 1 ? .6 : 0} />
    </mesh>)}
  </group>
}

/** Start lever, status lamp and radiation cover for the water recycler. */
function RecyclerProps() {
  const s = useStoryStore(o => o.state ? `${o.state.filter}|${o.state.recycler}|${o.state.brownout}|${o.state.secured.recycler && o.state.scene === 6}` : '')
  const [filter, running, brownout, covered] = s.split('|')
  const on = running === 'true' && brownout !== 'true'
  return <group position={[RECYCLER_PLACEMENT.x, surfaceHeight(RECYCLER_PLACEMENT.x, RECYCLER_PLACEMENT.z), RECYCLER_PLACEMENT.z]} rotation-y={RECYCLER_PLACEMENT.rotationY * Math.PI / 180}>
    <group position={[.95, 0, -.55]}>
      <mesh position={[0, .45, 0]}><boxGeometry args={[.1, .9, .1]} /><meshStandardMaterial color={palette['structure-gray']} /></mesh>
      <mesh position={[.06, .95, 0]} rotation-z={running === 'true' ? -.8 : .6}><boxGeometry args={[.05, .3, .05]} /><meshStandardMaterial color={palette['accent-orange']} /></mesh>
      <mesh position={[0, 1.2, 0]}><boxGeometry args={[.12, .08, .12]} /><meshStandardMaterial color={palette['trim-dark']} emissive={on ? palette['plant-green'] : filter === 'installed' ? palette['accent-orange'] : palette['regolith-mid']} emissiveIntensity={1.8} /></mesh>
    </group>
    <mesh position={[.705, 1.4, .5]} rotation-y={Math.PI / 2}><circleGeometry args={[.065, 16]} /><meshStandardMaterial color={palette['trim-dark']} emissive={on ? palette['plant-green'] : filter === 'installed' ? palette['accent-orange'] : palette['regolith-mid']} emissiveIntensity={on || filter === 'installed' ? 2 : .4} /></mesh>
    {filter === 'installed' && <mesh position={[.73, 1, .25]} rotation-z={Math.PI / 2}><cylinderGeometry args={[.09, .09, .08, 12]} /><meshStandardMaterial color={palette['accent-cyan']} emissive={palette['accent-cyan']} emissiveIntensity={.5} /></mesh>}
    {on && <pointLight position={[1.1, 1.3, 0]} color={palette['accent-cyan']} intensity={1.6} distance={3} />}
    {covered === 'true' && <RadiationCover size={[1.7, 1.95, 1.9]} />}
  </group>
}

function RadiationCover({ size }: { size: [number, number, number] }) {
  return <group>
    <mesh position={[0, size[1] / 2, 0]}><boxGeometry args={size} /><meshStandardMaterial color={palette['structure-gray']} roughness={.9} transparent opacity={.94} /></mesh>
    <mesh position={[0, size[1] * .7, 0]}><boxGeometry args={[size[0] + .02, .16, size[2] + .02]} /><meshStandardMaterial color={palette['accent-orange']} /></mesh>
  </group>
}

function OxygenCover() {
  const covered = useStoryStore(o => !!o.state?.secured.oxygen && o.state.scene === 6)
  return covered ? <Local id="oxygen"><group position={[0, 0, -.1]}><RadiationCover size={[1.8, 1.95, 3]} /></group></Local> : null
}

/** Floating "!" markers over the next places the story needs, and the door to reach them. */
function Markers() {
  const key = useStoryStore(o => o.state ? `${o.state.scene}|${nextSpots(o.state).join(',')}|${o.state.inGreenhouse}|${o.state.trays.map(t => +t.blocked + 2 * +trayReady(t)).join('')}|${o.state.panelDust.map(d => d < .15 ? 1 : 0).join('')}` : '')
  const area = useMissionStore(m => m.area)
  const station = useMissionStore(m => m.view === 'station')
  const marks = useMemo(() => {
    const s = story()
    if (!s || !key) return []
    const b = brief(s), labels = new Map<Spot, string>()
    b.choice?.options.forEach(o => { if (!labels.has(o.spot)) labels.set(o.spot, o.label) })
    b.goals.forEach(g => { if (g.spot && !labels.has(g.spot)) labels.set(g.spot, g.text) })
    const out: { id: string; at: Point; label: string; area: 'hab' | 'outside' }[] = []
    const push = (id: string, at: Point, label: string, where: 'hab' | 'outside') => { if (!out.some(m => m.id === id)) out.push({ id, at, label, area: where }) }
    for (const spot of nextSpots(s)) {
      const place = SPOT_POINTS[spot], label = labels.get(spot) ?? ''
      if (place.inside === 'hab') {
        if (area === 'hab') push(spot, place.at, label, 'hab')
        else push('door-hab', [SPOT_POINTS.hab.at[0], SPOT_POINTS.hab.at[1] + .6, SPOT_POINTS.hab.at[2]], 'Hab: ' + label, 'outside')
        continue
      }
      if (area === 'hab') { push('exit-hab', HAB_EXIT, 'Go outside: ' + label, 'hab'); continue }
      if (place.inside === 'greenhouse' && !s.inGreenhouse) { push('door-gh', STORY_POINTS.greenhouseDoorOut, 'Greenhouse: ' + label, 'outside'); continue }
      if (!place.inside && s.inGreenhouse) { push('exit-gh', STORY_POINTS.greenhouseDoorIn, 'Leave greenhouse: ' + label, 'outside'); continue }
      if (spot === 'panels') STORY_POINTS.panels.forEach((p, i) => { if (s.panelDust[i] >= .15) push('panel' + i, [p[0], p[1] + 1.4, p[2]], `Row ${i + 1}`, 'outside') })
      else if (spot === 'trays') STORY_POINTS.trays.forEach((p, i) => {
        const t = s.trays[i]
        if (t.blocked || (s.scene === 4 && trayReady(t))) push('tray' + i, [p[0], p[1] + .7, p[2]], t.blocked ? 'Blocked!' : 'Ready', 'outside')
      })
      else push(spot, [place.at[0], (place.at[1] < .5 ? surfaceHeight(place.at[0], place.at[2]) + 1.4 : place.at[1]) + .55, place.at[2]], label, 'outside')
    }
    return out
  }, [key, area])
  if (station) return null
  return <>{marks.filter(m => m.area === area).map(m => <Html key={m.id} position={m.at} center zIndexRange={[6, 5]} style={{ pointerEvents: 'none' }}>
    <div className="story-marker"><em>!</em><span>{m.label}</span></div>
  </Html>)}</>
}

export function StoryWorld({ player }: { player: RefObject<EcctrlHandle | null> }) {
  useStoryTargets()
  const guided = useRef('')
  useFrame((_, delta) => {
    const ui = useMissionStore.getState(), s = story(), body = player.current?.body
    const pending = transfer.current
    if (pending) {
      pending.time += Math.min(delta, .1)
      if (!pending.moved && pending.time >= .45) {
        pending.moved = true
        useMissionStore.setState({ arrivalSpot: { foot: pending.foot, facing: pending.facing }, arrival: ui.arrival + 1, prompt: null })
        pending.after?.()
      }
      if (pending.moved && pending.time >= .85) { transfer.current = null; useMissionStore.setState({ fading: false }) }
    }
    if (!s || !body) return
    const p = body.translation()
    const inside = ui.area === 'outside' && Math.hypot(p.x - GREENHOUSE_CENTER[0], p.z - GREENHOUSE_CENTER[2]) < GREENHOUSE_RADIUS + .2 && p.y > .3
    if (inside !== s.inGreenhouse) useStoryStore.getState().dispatch({ type: 'greenhouse', inside })
    const spots = nextSpots(s), first = spots.find(spot => !SPOT_POINTS[spot].inside) ?? spots[0]
    const key = s.scene + ':' + spots.join(',')
    if (first && key !== guided.current && ui.area === 'outside' && !inside) {
      guided.current = key
      const place = SPOT_POINTS[first]
      const at = place.inside === 'hab' ? SPOT_POINTS.hab.at : place.inside === 'greenhouse' ? STORY_POINTS.greenhouseDoorOut : place.at
      useMissionStore.setState({ pebbleGuide: [at[0], 0, at[2]] })
    }
  })
  return <>
    <Local id="greenhouse">
      <group position={GH_BOARD_LOCAL} rotation-y={BOARD_YAW}><PriorityBoard post /></group>
      <GreenhouseControls />
      <TrayCrops />
    </Local>
    <group position={[STORY_POINTS.habBoard[0], HAB_FLOOR, STORY_POINTS.habBoard[2]]} rotation-y={HAB_BOARD_YAW}><HabBoard /></group>
    <Breaker />
    <FilterRack />
    <RecyclerProps />
    <OxygenCover />
    <Markers />
  </>
}

function HabBoard() {
  const visible = useMissionStore(m => m.area === 'hab' && m.view === 'firstPerson')
  return <group visible={visible}><PriorityBoard post={false} /></group>
}
