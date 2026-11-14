import { publicUrl } from '../../publicUrl'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody, TrimeshCollider } from '@react-three/rapier'
import { Suspense, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { buildAssetCollisionParts } from '../assets/colliders'
import { prepareSiteModel, updateSiteMaterials } from '../assets/siteModel'
import { useWorldStore } from '../../state/useWorldStore'
import { useMissionStore } from '../../state/useMissionStore'
import { useStoryStore } from '../../state/useStoryStore'
import { surfaceHeight } from './landscape'
import { CABLE_FITTINGS, CABLE_ROUTES, SITE, type SitePlacement } from './siteLayout'
// Start all requests together, before any child can suspend the world render.
for (const asset of new Set([
  ...SITE.map(placement => placement.asset),
  'mars-rock-kit', 'pebble', 'young-astronaut', 'flag-plaque', 'greenhouse-tray', 'path-lamp',
])) useGLTF.preload(publicUrl(`/models/${asset}.glb`))
useGLTF.preload([publicUrl('/models/cable-run-straight.glb'), publicUrl('/models/cable-run-bend.glb'), publicUrl('/models/cable-run-t.glb')])

function PlacedModel({ placement, visualOnly = false }: { placement: SitePlacement; visualOnly?: boolean }) {
  const { scene } = useGLTF(publicUrl(`/models/${placement.asset}.glb`))
  const model = useMemo(() => prepareSiteModel(scene, placement.shadow !== false), [scene, placement.shadow])
  const collision = useMemo(() => {
    if (visualOnly || placement.collider === 'none') return null
    // One compound triangle mesh per static object; source node transforms are fully decoded.
    const parts = buildAssetCollisionParts(scene)
    const vertices: number[] = [], indices: number[] = []
    for (const part of parts) { const offset = vertices.length / 3; vertices.push(...part.vertices); for (const i of part.indices) indices.push(offset + i) }
    return { vertices: new Float32Array(vertices), indices: new Uint32Array(indices) }
  }, [scene, placement.collider, visualOnly])
  const greenhouse = useMemo(() => {
    if (placement.id !== 'greenhouse') return null
    const batch = (name: string) => model.root.getObjectByName('site-batch:' + name) as THREE.Mesh | undefined
    return { foliage: batch('plant-foliage'), leds: batch('emissive-magenta') }
  }, [model, placement.id])
  const row = placement.id.startsWith('solar-') ? Number(placement.id.slice(6)) - 1 : -1
  useEffect(() => () => { model.dispose() }, [model])
  useFrame(() => {
    if (visualOnly) return
    const ui = useMissionStore.getState(), s = ui.snapshot?.state, story = useStoryStore.getState().state
    const preview = import.meta.env.DEV ? useWorldStore.getState().preview : 'live'
    const dust = row >= 0 && story ? story.panelDust[row] : s?.power.panelDust ?? .05
    updateSiteMaterials(model, preview === 'storm' ? .8 : dust,
      preview === 'night' ? .2 : s ? s.power.batteryKWh / s.power.batteryCapKWh : .6)
    if (greenhouse) {
      // Story crops replace the dome's built-in foliage; the LEDs follow the grow-light switch.
      if (greenhouse.foliage) greenhouse.foliage.visible = !story
      if (greenhouse.leds) greenhouse.leds.visible = !story || story.ghLights && !story.brownout && story.mode !== 'emergency'
    }
    model.root.visible = placement.id !== 'hab' || ui.area !== 'hab' || ui.view === 'station'

  })
  const pos: [number, number, number] = [placement.x, (placement.y ?? 0) + surfaceHeight(placement.x, placement.z), placement.z]
  // Distant decorations sit outside the physics terrain; do not sample extrapolated ground there.
  if (Math.abs(placement.x) > 180 || Math.abs(placement.z) > 180) pos[1] = placement.y ?? 0
  const contents = <>
    <primitive object={model.root} onClick={(event: import('@react-three/fiber').ThreeEvent<MouseEvent>) => {
      const ui = useMissionStore.getState()
      if (ui.view !== 'station' || ui.openPanel || ui.fading) return
      event.stopPropagation(); ui.setPanel('manage')
    }} />
    {collision && <TrimeshCollider args={[collision.vertices, collision.indices]} />}
  </>
  if (visualOnly) return <group position={pos} rotation-y={placement.rotationY * Math.PI / 180}>{contents}</group>
  return <RigidBody name={placement.id} type="fixed" colliders={false} position={pos} rotation={[0, placement.rotationY * Math.PI / 180, 0]}>{contents}</RigidBody>
}
function CableNetwork() {
  const sources = useGLTF([publicUrl('/models/cable-run-straight.glb'), publicUrl('/models/cable-run-bend.glb'), publicUrl('/models/cable-run-t.glb')])
  const scene = sources[0].scene, bend = sources[1].scene, tee = sources[2].scene
  const network = useMemo(() => {
    const source = prepareSiteModel(scene, false), group = new THREE.Group(), owned: THREE.InstancedMesh[] = []
    const fittingsRoot = new THREE.Group()
    for (const p of CABLE_FITTINGS) {
      const clone = (p.asset === 'cable-run-bend' ? bend : tee).clone(true)
      clone.position.set(p.x, surfaceHeight(p.x, p.z) + (p.y ?? 0), p.z)
      clone.rotation.y = p.rotationY * Math.PI / 180; fittingsRoot.add(clone)
    }
    const fittings = prepareSiteModel(fittingsRoot, false)
    group.add(fittings.root)
    const poses: THREE.Matrix4[] = []
    for (const route of CABLE_ROUTES) for (let i = 1; i < route.points.length; i++) {
      const [ax, az] = route.points[i - 1], [bx, bz] = route.points[i], length = Math.hypot(bx - ax, bz - az)
      const trimStart = CABLE_FITTINGS.some(p => p.x === ax && p.z === az) ? 1 : 0
      const trimEnd = CABLE_FITTINGS.some(p => p.x === bx && p.z === bz) ? 1 : 0
      const remaining = length - trimStart - trimEnd
      if (remaining <= 0) continue
      const count = Math.ceil(remaining / 2), step = remaining / count
      for (let j = 0; j < count; j++) {
        const t = (trimStart + (j + .5) * step) / length, x = ax + (bx - ax) * t, z = az + (bz - az) * t
        const m = new THREE.Matrix4().compose(new THREE.Vector3(x, surfaceHeight(x, z) - .18, z),
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.atan2(bz - az, bx - ax)), new THREE.Vector3(step / 2, 1, 1))
        poses.push(m)
      }
    }
    source.root.traverse(node => {
      if (!(node instanceof THREE.Mesh) || !node.name.startsWith('site-batch:')) return
      const instances = new THREE.InstancedMesh(node.geometry, node.material, poses.length)
      poses.forEach((m, i) => instances.setMatrixAt(i, m)); instances.receiveShadow = true
      instances.computeBoundingSphere(); group.add(instances); owned.push(instances)
    })
    // Buried, covered trenches are deliberately nonblocking; no raised crossing collider.
    return { group, dispose() { owned.forEach(m => m.dispose()); source.dispose(); fittings.dispose() } }
  }, [scene, bend, tee])
  useEffect(() => () => network.dispose(), [network])
  return <primitive object={network.group} />
}
export function BaseSite({ visualOnly = false, exclude = [] }: { visualOnly?: boolean; exclude?: readonly string[] }) {
  return <><Suspense fallback={null}><CableNetwork /></Suspense>{SITE.filter(p => !exclude.includes(p.id)).map(placement =>
    <PlacedModel key={placement.id} placement={placement} visualOnly={visualOnly} />)}</>
}
