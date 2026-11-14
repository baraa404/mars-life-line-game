import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { readWorldAppearance } from './appearance'
export function Sky() {
  const sky = useMemo(() => {
    const geometry = new THREE.SphereGeometry(600, 32, 16)
    const material = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false,
      uniforms: { top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, sunDirection: { value: new THREE.Vector3() }, daylight: { value: 1 } },
      vertexShader: 'varying float height; varying vec3 direction; void main(){direction=normalize(position);height=max(0.0,position.y/600.0);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: `
        varying float height;
        varying vec3 direction;
        uniform vec3 top;
        uniform vec3 horizon;
        uniform vec3 sunDirection;
        uniform float daylight;
        void main() {
          float alignment = max(0.0, dot(normalize(direction), sunDirection));
          float halo = pow(alignment, 48.0) * .18 * daylight;
          float disc = smoothstep(.99985, .99995, alignment) * daylight;
          vec3 sky = mix(horizon, top, pow(height, 0.55));
          sky = mix(sky, vec3(1.0, .79, .55), halo);
          gl_FragColor = vec4(mix(sky, vec3(1.0, .92, .76), disc * .9), 1.0);
          #include <colorspace_fragment>
        }` })
    return { geometry, material, fog: new THREE.FogExp2(new THREE.Color()), background: new THREE.Color() }
  }, [])
  useEffect(() => () => { sky.geometry.dispose(); sky.material.dispose() }, [sky])
  useFrame(() => {
    const a = readWorldAppearance()
    sky.material.uniforms.top.value.copy(a.top); sky.material.uniforms.horizon.value.copy(a.horizon)
    sky.material.uniforms.sunDirection.value.copy(a.sun).normalize()
    // Shader uniforms are GPU state updated per frame, outside React render.
    // oxlint-disable-next-line react/immutability
    sky.material.uniforms.daylight.value = a.day * Math.min(1, a.keyIntensity)
    // Three.js GPU resources are intentionally mutable outside React render.
    // oxlint-disable-next-line react/immutability
    sky.fog.color.copy(a.horizon); sky.fog.density = a.fogDensity; sky.background.copy(a.horizon)
  })
  return <><primitive attach="background" object={sky.background} /><primitive attach="fog" object={sky.fog} />
    <mesh geometry={sky.geometry} material={sky.material} renderOrder={-1} /></>
}
