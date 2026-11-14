import { KeyboardControls, Stats } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import type { EcctrlHandle } from 'ecctrl'
import { Suspense, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { useMissionStore } from '../state/useMissionStore'
import { useWorldStore } from '../state/useWorldStore'
import { lighting } from '../style/tokens'
import { FirstPersonCamera } from './camera/FirstPersonCamera'
import { keyboardMap } from './player/controls'
import { Player } from './player/Player'
import { StoryBridge } from './StoryBridge'
import { Lighting } from './world/Lighting'
import { Sky } from './world/Sky'
import { Terrain } from './world/Terrain'
import { DistantTerrain } from './world/DistantTerrain'
import { WorldDiagnostics } from './world/WorldDiagnostics'
import { BaseSite } from './world/BaseSite'
import { MarsLandscape } from './world/MarsLandscape'
import { Hab } from './world/Hab'
import { AstronautMarker, Pebble } from './world/Pebble'
import { TouchdownMission, TouchdownSiteProps } from './missions/TouchdownMission'
import { Stations } from './world/Stations'
import { StoryWorld } from './world/StoryWorld'
import { MarsAtmosphere } from './graphics/MarsAtmosphere'

/** Mars surface gravity, m/s². */
export const MARS_GRAVITY = -3.71

export function Game({ fromShip = false, onReady }: { fromShip?: boolean; onReady?: () => void }) {
  const player = useRef<EcctrlHandle>(null)
  const debug = useWorldStore((s) => s.debug)
  const physicsDebug = useWorldStore((s) => s.physicsDebug)

  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ fov: 75, near: 0.05, far: 2000, position: [0, 2.91, .65] }}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: lighting.exposure }}
      >
        <StoryBridge fromShip={fromShip} />
        {import.meta.env.DEV && <WorldDiagnostics />}
        <Sky />
        <Lighting />
        <MarsAtmosphere />
        <Suspense fallback={null}>
          <Physics gravity={[0, MARS_GRAVITY, 0]} debug={physicsDebug}>
            <Terrain />
            <DistantTerrain />
            <MarsLandscape />
            <BaseSite />
            <Suspense fallback={null}><Hab /></Suspense>
            <Player handle={player} />
            <WorldReady player={player} onReady={onReady} />
            <TouchdownMission player={player} />
            <Suspense fallback={null}><TouchdownSiteProps /></Suspense>
            <Suspense fallback={null}><Stations player={player} /></Suspense>
            <StoryWorld player={player} />
            <Suspense fallback={null}><Pebble player={player} /></Suspense>
            <Suspense fallback={null}><AstronautMarker player={player} /></Suspense>
          </Physics>
        </Suspense>
        <FirstPersonCamera target={player} />
        {debug && <Stats />}
      </Canvas>
    </KeyboardControls>
  )
}

/** Fade in only after physics, simulation and the arrival camera have initialized. */
function WorldReady({ player, onReady }: { player: RefObject<EcctrlHandle | null>; onReady?: () => void }) {
  const sent = useRef(false)
  const frames = useRef(0)
  useFrame(() => {
    if (sent.current || !player.current?.body || !useMissionStore.getState().snapshot) return
    if (++frames.current < 2) return
    sent.current = true
    onReady?.()
  })
  return null
}
