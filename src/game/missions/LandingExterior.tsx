import { publicUrl } from '../../publicUrl'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { Color, DoubleSide, Euler, FogExp2, Group, Mesh, Quaternion, ShaderMaterial, Vector3 } from 'three'
import { BaseSite } from '../world/BaseSite'
import { Terrain } from '../world/Terrain'
import { DistantTerrain } from '../world/DistantTerrain'
import { MarsLandscape } from '../world/MarsLandscape'
import { exteriorAppearance } from '../world/appearance'
import { AssetModel } from '../assets/AssetModel'
import { surfaceHeight } from '../world/landscape'
import { TouchdownSiteProps } from './TouchdownMission'
import { landingFlight, type LandingClock } from './landingFlight'
import { PEBBLE_ARRIVAL, type LandingStage } from './m0'

const NO_LANDED_SHIP = ['ship'] as const

/** This is the gameplay terrain and inventory, viewed in the moving ship's local frame. */
export function LandingExterior({ stage, clock }: { stage: LandingStage; clock: RefObject<LandingClock> }) {
  const world = useRef<Group>(null), veil = useRef<Mesh>(null)
  const state = useMemo(() => ({ inverse: new Quaternion(), rotation: new Euler(), position: new Vector3(),
    background: new Color(), fog: new FogExp2(0x04060e, 0), space: new Color('#04060e'), appearance: exteriorAppearance(900, .5),
    uniforms: { time: { value: 0 }, opacity: { value: 0 }, heat: { value: 0 } } }), [])
  const skyMaterial = useMemo(() => new ShaderMaterial({ side: DoubleSide, depthWrite: false, fog: false, toneMapped: false,
    uniforms: { top: { value: state.appearance.top }, horizon: { value: state.appearance.horizon } },
    vertexShader: 'varying float h; void main(){h=max(0.0,position.y/900.0);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: 'varying float h; uniform vec3 top; uniform vec3 horizon; void main(){gl_FragColor=vec4(mix(horizon,top,pow(h,.55)),1.0); #include <colorspace_fragment>\n}'
      .replace(' #include', '\n#include') }), [state])
  useEffect(() => () => skyMaterial.dispose(), [skyMaterial])
  useFrame(({ clock: renderClock }) => {
    const pose = landingFlight(stage, clock.current.stage === stage ? clock.current.seconds : 0)
    if (world.current) {
      state.inverse.setFromEuler(state.rotation.set(pose.pitch, pose.yaw, pose.roll, 'YXZ')).invert()
      world.current.quaternion.copy(state.inverse)
      world.current.position.fromArray(pose.position).negate().applyQuaternion(state.inverse)
      world.current.visible = pose.worldVisible
    }
    state.background.copy(state.space).lerp(state.appearance.horizon, pose.atmosphere)
    state.fog.color.copy(state.background)
    const visibility = stage === 'entry' || stage === 'arm' ? .25 : stage === 'thrust' ? .25 + .75 * pose.progress : 1
    state.fog.density = pose.atmosphere * state.appearance.fogDensity * visibility
    state.uniforms.time.value = renderClock.elapsedTime
    state.uniforms.opacity.value = Math.max(pose.haze, pose.dust * .34)
    state.uniforms.heat.value = pose.plasma
    if (veil.current) veil.current.visible = state.uniforms.opacity.value > .001
  }, -8)
  return <>
    <primitive attach="background" object={state.background} />
    <primitive attach="fog" object={state.fog} />
    <group ref={world}>
      <mesh material={skyMaterial} renderOrder={-1}>
        <sphereGeometry args={[900, 32, 16]} />
      </mesh>
      <Terrain visualOnly />
      <DistantTerrain />
      <MarsLandscape visualOnly />
      <BaseSite visualOnly exclude={NO_LANDED_SHIP} />
      <TouchdownSiteProps />
      <group position={[PEBBLE_ARRIVAL[0], surfaceHeight(...PEBBLE_ARRIVAL), PEBBLE_ARRIVAL[1]]}><AssetModel url={publicUrl('/models/pebble.glb')} /></group>
    </group>
    {/* Dust and plasma stay beyond the viewport, leaving the physical cabin unobscured. */}
    <mesh ref={veil} position={[0, 2.4, 2.05]} renderOrder={5}>
      <planeGeometry args={[9, 6]} />
      <shaderMaterial transparent depthWrite={false} side={DoubleSide} toneMapped={false} fog={false} uniforms={state.uniforms}
        vertexShader={'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}'}
        fragmentShader={`
          varying vec2 vUv; uniform float time; uniform float opacity; uniform float heat;
          float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
          float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
            return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
          float cloudsAt(vec2 p){float sum=0.0,weight=.55;for(int i=0;i<5;i++){sum+=weight*noise(p);p=p*2.1+3.7;weight*=.5;}return sum;}
          void main(){
            vec2 p=vUv*14.0+vec2(time*.2,-time*.9);
            float clouds=cloudsAt(p);
            vec3 dust=mix(vec3(.40,.20,.12),vec3(.84,.59,.38),clouds);
            vec3 colour=mix(dust,vec3(.94,.27,.055),heat*.32);
            float a=opacity>.97?1.0:clamp(opacity*(.78+clouds*.45),0.0,1.0);
            gl_FragColor=vec4(colour,a);
            #include <colorspace_fragment>
          }`} />
    </mesh>
  </>
}
