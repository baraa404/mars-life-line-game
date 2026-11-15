import { publicUrl } from '../../publicUrl'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react'
import { ACESFilmicToneMapping, Box3, Group, MathUtils, Mesh, MeshStandardMaterial, Object3D, PointLight, HemisphereLight, Vector3 } from 'three'
import { lighting, palette } from '../../style/tokens'
import type { LandingStage } from './m0'
import { CabinWalk } from './CabinWalk'
import { CabinInstruments } from './CabinInstruments'
import { prepareCabinModel } from './cabinModel'
import { LandingExterior } from './LandingExterior'
import { landingFlight, type LandingClock } from './landingFlight'
import { CABIN_CONTROLS } from './cabinGuidance'

function Cockpit({ stage, reduced, pressure, suitColor, onSuit, onSeal, onCycle, onExit, cycling, active, flightClock, onReady, onDescent }: {
  stage: LandingStage; active: boolean; reduced: boolean; pressure: number; suitColor: string; onSuit: () => void; onSeal: () => void; onCycle: () => void; onExit: () => void; cycling: boolean; flightClock?: RefObject<LandingClock>; onReady?: () => void; onDescent?: () => void
}) {
  const fallbackClock = useRef<LandingClock>({ stage, seconds: 0 })
  const clock = flightClock ?? fallbackClock
  const stars = useRef<Group>(null)
  const hemi = useRef<HemisphereLight>(null)
  const cabin = useGLTF(publicUrl('/models/landing-ship-cabin-walkable.glb'))
  const orbit = useGLTF(publicUrl('/models/mars.glb'))
  const planet = useRef<Group>(null)
  const entryLight = useRef<PointLight>(null)
  const thrustLight = useRef<PointLight>(null)
  const cabinModel = useMemo(() => prepareCabinModel(cabin.scene), [cabin.scene])
  const room = cabinModel.root
  useEffect(() => () => cabinModel.dispose(), [cabinModel])

  const mars = useMemo(() => {
    const root = orbit.scene.clone(true)
    const bounds = new Box3().setFromObject(root)
    const center = bounds.getCenter(new Vector3())
    const size = bounds.getSize(new Vector3())
    // Imported Mars has an offset origin and a one-unit diameter. Keep the
    // rotation pivot at its center and match the previous four-metre globe.
    const scale = 4 / Math.max(size.x, size.y, size.z)
    root.scale.multiplyScalar(scale)
    root.position.addScaledVector(center, -scale)
    root.traverse(node => {
      if (node instanceof Mesh) {
        // A distant planet must not receive shadows from the nearby cockpit.
        node.castShadow = false
        node.receiveShadow = false
      }
    })
    return root
  }, [orbit.scene])

  const planetLightTarget = useMemo(() => {
    const target = new Object3D()
    target.position.set(-0.35, 2.1, 8.5)
    return target
  }, [])

  const hatch = useMemo(() => room.getObjectByName('Mesh_HatchWheel'), [room])
  const flight = ['orbit', 'earth', 'entry'].includes(stage)

  useFrame(({ clock: renderClock }, dt) => {
    const t = renderClock.elapsedTime
    const pose = landingFlight(stage, clock.current.stage === stage ? clock.current.seconds : 0)
    if (planet.current) {
      planet.current.visible = pose.planetVisible
      planet.current.scale.setScalar(pose.planetRadius / 2)
      planet.current.position.z = pose.planetRadius + 6.5
      if (!reduced) planet.current.rotation.y += dt * .025
    }
    if (stars.current) stars.current.visible = pose.atmosphere < .5
    if (hemi.current) hemi.current.intensity = pose.atmosphere * lighting.hemisphere.intensity
    if (hatch) hatch.rotation.z = MathUtils.damp(hatch.rotation.z, stage === 'exit' ? -.62 : 0, reduced ? 30 : 6, dt)

    if (entryLight.current) {
      entryLight.current.intensity = pose.plasma * (5 + Math.sin(t * 26) * 1.2)
    }
    if (thrustLight.current) {
      thrustLight.current.intensity = stage === 'thrust' ? (2 + 4 * (1 - pose.progress)) + (reduced ? 0 : Math.sin(t * 38) * .4) : 0
    }
  })

  return <>
    <SceneReady onReady={onReady} />
    <LandingExterior stage={stage} clock={clock} />

    {/* Outer space starfield */}
    {flight && (
      <group ref={stars}><Stars
        radius={50}
        depth={35}
        count={4000}
        factor={3.5}
        saturation={0.15}
        fade
        speed={0.4}
      /></group>
    )}

    {/* Sun directional light with shadow projection */}
    <directionalLight
      castShadow
      color={flight ? '#FFF5EA' : lighting.key.color}
      intensity={flight ? 3.2 : 2.6}
      position={flight ? [-2.6, 4.2, 5.2] : [-2.4, 4.8, 4.8]}
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0006}
      shadow-normalBias={0.02}
      shadow-camera-left={-3.5}
      shadow-camera-right={3.5}
      shadow-camera-top={3.5}
      shadow-camera-bottom={-3.5}
      shadow-camera-near={0.5}
      shadow-camera-far={25}
    />

    {/* Ambient & fill lighting */}
    <ambientLight
      color={flight ? '#182236' : palette['shadow-plum']}
      intensity={flight ? 0.28 : 0.35}
    />
    <hemisphereLight ref={hemi}
      args={[lighting.hemisphere.sky, lighting.hemisphere.ground, 0]} />

    {/* Cockpit instrument console glow */}
    <pointLight
      color={palette['accent-cyan']}
      intensity={1.2}
      position={[-0.34, 1.76, 0.45]}
      distance={2.5}
      decay={2}
    />
    <pointLight
      color={palette['accent-orange']}
      intensity={0.65}
      position={[-0.3, 2.35, 0.8]}
      distance={2.5}
      decay={2}
    />

    {/* Dynamic entry plasma glow */}
    <pointLight
      ref={entryLight}
      color="#FF5500"
      intensity={0}
      position={[-0.35, 2.1, 3.2]}
      distance={9}
      decay={1.5}
    />

    {/* Dynamic thrust flare */}
    <pointLight
      ref={thrustLight}
      color="#FFA834"
      intensity={0}
      position={[-0.35, 0.4, 2.2]}
      distance={8}
      decay={1.5}
    />

    {/* Cockpit room interior */}
    <primitive object={room} />
    <CabinWalk active={active} reduced={reduced} stage={stage} />
    <CabinInstruments room={room} stage={stage} pressure={pressure} active={active} onSuit={onSuit} onSeal={onSeal} onCycle={onCycle} onExit={onExit} cycling={cycling} clock={clock} onDescent={onDescent} />
    {/* Local practical lamps preserve dark recesses and furniture shadows. */}
    <pointLight color="#FFE2B8" intensity={7} position={[0, 3.28, -1.3]} distance={5} decay={2}
      castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} shadow-normalBias={0.015} />
    <pointLight color="#FFE2B8" intensity={3} position={[0, 3.2, -2.65]} distance={3} decay={2} />

    {/* The cone starts beyond the window and points away from the cabin,
        illuminating Mars without filling in the cockpit's shadows. */}
    {flight && <>
      <primitive object={planetLightTarget} />
      <spotLight color="#FFF5EA" intensity={110} position={[-4, 5, 3]}
        target={planetLightTarget} angle={0.5} penumbra={0.3} distance={18} decay={2} />
    </>}

    {/* In-orbit Mars planet */}
    {flight && (
      <group ref={planet} position={[-0.35, 2.1, 8.5]} rotation-y={Math.PI / 2}>
        <primitive object={mars} />
      </group>
    )}

    {!['seal', 'cycle', 'exit'].includes(stage) && (
      <Suspense fallback={null}>
        <CabinProp id="astronaut-suit-rack" position={[2.0, 0.92, -0.8]} suitColor={suitColor} />
        <CabinProp id="helmet-shelf" position={[1.69, 1.75, -1.75]} rotationY={Math.PI} />
        <CabinProp id="o2-canister" position={[-2.03, 0.94, -1.88]} />
      </Suspense>
    )}

    {stage === 'cycle' && (
      <>
        <pointLight color={palette['accent-cyan']} intensity={3 * (1 - pressure)} position={CABIN_CONTROLS.cycle} distance={3} />
        {!reduced && pressure < 0.96 && [0, 1, 2].map(i => (
          <mesh
            key={i}
            position={[CABIN_CONTROLS.cycle[0] + (i - 1) * .11, CABIN_CONTROLS.cycle[1] - .3 + i * .11, CABIN_CONTROLS.cycle[2] + (1 - pressure) * (.6 + i * .17)]}
            scale={0.4 + (1 - pressure) * 2}
          >
            <sphereGeometry args={[0.09, 7, 5]} />
            <meshBasicMaterial color={palette['glass-tint']} transparent opacity={pressure * 0.28} depthWrite={false} />
          </mesh>
        ))}
      </>
    )}
  </>
}

function CabinProp({ id, position, suitColor, rotationY = Math.PI / 2 }: { id: string; position: [number, number, number]; suitColor?: string; rotationY?: number }) {
  const { scene } = useGLTF(publicUrl('/models/') + id + '.glb')
  const { model, materials } = useMemo(() => {
    const root = scene.clone(true)
    const materials: MeshStandardMaterial[] = []
    root.traverse(node => {
      if (node instanceof Mesh) {
        node.castShadow = true
        node.receiveShadow = true
        if (suitColor && node.material instanceof MeshStandardMaterial && node.material.name.includes('accent-paint')) {
          node.material = node.material.clone()
          node.material.color.set(suitColor)
          materials.push(node.material)
        }
      }
    })
    return { model: root, materials }
  }, [scene, suitColor])

  useEffect(() => () => materials.forEach(material => material.dispose()), [materials])
  return <primitive object={model} position={position} rotation-y={rotationY} />
}

function SceneReady({ onReady }: { onReady?: () => void }) {
  useEffect(() => { onReady?.() }, [onReady])
  return null
}

export default function LandingScene(props: Parameters<typeof Cockpit>[0]) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ fov: 75, near: 0.025, far: 2000, position: [0, 2.57, -1.9] }}
      gl={{ toneMapping: ACESFilmicToneMapping, toneMappingExposure: lighting.exposure }}
    >
      <Suspense fallback={null}>
        <Cockpit {...props} />
      </Suspense>
    </Canvas>
  )
}
