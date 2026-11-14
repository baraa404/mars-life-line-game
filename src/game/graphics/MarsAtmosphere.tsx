import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, BufferAttribute, BufferGeometry, Group, ShaderMaterial } from 'three'
import { useMissionStore } from '../../state/useMissionStore'
import { readWorldAppearance } from '../world/appearance'

/** Seeded particles keep a stable sky and avoid touching the simulation RNG. */
export function MarsAtmosphere() {
  const group = useRef<Group>(null)
  const resources = useMemo(() => {
    let seed = 7251
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
    const dust = new Float32Array(320 * 3)
    for (let i = 0; i < dust.length; i += 3) {
      dust[i] = (random() - .5) * 64
      dust[i + 1] = random() * 10
      dust[i + 2] = (random() - .5) * 64
    }
    const stars = new Float32Array(1200 * 3)
    for (let i = 0; i < stars.length; i += 3) {
      const y = .08 + random() * .92, angle = random() * Math.PI * 2
      const radius = Math.sqrt(1 - y * y)
      stars.set([Math.cos(angle) * radius * 480, y * 480, Math.sin(angle) * radius * 480], i)
    }
    const dustGeometry = new BufferGeometry().setAttribute('position', new BufferAttribute(dust, 3))
    const starGeometry = new BufferGeometry().setAttribute('position', new BufferAttribute(stars, 3))
    const material = (isDust: boolean) => new ShaderMaterial({
      transparent: true, depthWrite: false, blending: AdditiveBlending,
      uniforms: { time: { value: 0 }, opacity: { value: 0 } },
      vertexShader: `uniform float time; varying float strength;
        void main() {
          vec3 p = position;
          ${isDust ? `p.x = mod(p.x + 32.0 + time * .65, 64.0) - 32.0;
            p.z += sin(time * .15 + position.x) * .5;` : ''}
          vec4 eye = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * eye;
          gl_PointSize = ${isDust ? 'clamp(22.0 / max(1.0, -eye.z), 1.0, 3.0)' : '1.6'};
          strength = ${isDust ? 'smoothstep(0.0, 4.0, -eye.z) * (1.0 - smoothstep(18.0, 32.0, length(p.xz)))' : '.55 + .45 * fract(position.x * 17.3)'};
        }`,
      fragmentShader: `uniform float opacity; varying float strength;
        void main() {
          float falloff = 1.0 - smoothstep(.05, .5, length(gl_PointCoord - .5));
          gl_FragColor = vec4(${isDust ? 'vec3(.85, .52, .29)' : 'vec3(.70, .80, 1.0)'}, falloff * opacity * strength);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    })
    return { dustGeometry, starGeometry, dustMaterial: material(true), starMaterial: material(false) }
  }, [])
  useEffect(() => () => {
    resources.dustGeometry.dispose(); resources.starGeometry.dispose()
    resources.dustMaterial.dispose(); resources.starMaterial.dispose()
  }, [resources])
  useFrame(({ camera }, dt) => {
    const ui = useMissionStore.getState(), a = readWorldAppearance()
    if (group.current) {
      group.current.position.set(camera.position.x, 0, camera.position.z)
      group.current.visible = ui.view === 'station' || ui.area === 'outside'
    }
    const reduced = ui.settings.reducedMotion
    // Shader uniforms are mutable GPU state, updated outside React render.
    // oxlint-disable-next-line react/immutability
    if (!reduced && !ui.paused) resources.dustMaterial.uniforms.time.value += Math.min(dt, .05)
    resources.dustMaterial.uniforms.opacity.value = reduced ? 0 : .16 * a.day
    resources.starMaterial.uniforms.opacity.value = (1 - a.day) * Math.exp(-a.fogDensity * 100)
  })
  return <group ref={group}>
    <points geometry={resources.dustGeometry} material={resources.dustMaterial} frustumCulled={false} />
    <points geometry={resources.starGeometry} material={resources.starMaterial} frustumCulled={false} />
  </group>
}
