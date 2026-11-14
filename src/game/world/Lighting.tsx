import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { lighting } from '../../style/tokens'
import { readWorldAppearance } from './appearance'
export function Lighting() {
  const sun = useRef<THREE.DirectionalLight>(null), hemi = useRef<THREE.HemisphereLight>(null), ambient = useRef<THREE.AmbientLight>(null)
  const skyFill = new THREE.Color(lighting.hemisphere.sky)
  useFrame(() => {
    const a = readWorldAppearance()
    if (sun.current) {
      sun.current.position.copy(a.sun); sun.current.color.copy(a.key); sun.current.intensity = a.keyIntensity
      // No shadow-map render for a sun that is below the horizon.
      sun.current.castShadow = a.keyIntensity > .03
    }
    if (hemi.current) {
      hemi.current.intensity = a.hemiIntensity
      hemi.current.color.copy(a.horizon).lerp(skyFill, .7)
    }
    if (ambient.current) ambient.current.intensity = a.ambientIntensity
  })
  return <>
    <hemisphereLight ref={hemi} args={[lighting.hemisphere.sky, lighting.hemisphere.ground, lighting.hemisphere.intensity]} />
    <ambientLight ref={ambient} color={lighting.ambient.color} intensity={lighting.ambient.intensity} />
    <directionalLight ref={sun} position={[40, 65, 45]} color={lighting.key.color} intensity={lighting.key.intensity}
      castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-.00015} shadow-normalBias={.035}
      shadow-camera-left={-55} shadow-camera-right={55} shadow-camera-top={55} shadow-camera-bottom={-55}
      shadow-camera-near={1} shadow-camera-far={220} />
  </>
}
