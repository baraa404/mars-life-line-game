import { publicUrl } from '../../publicUrl'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useMissionStore } from '../../state/useMissionStore'
import { surfaceHeight } from './landscape'
import { AVENUE_Z, LANDING_PAD_X, SITE, STATION_POINTS, placementPoint } from './siteLayout'
import { palette } from '../../style/tokens'
import { fbm, smoothstep } from './noise'
import { createRegolithTextures } from './terrainSurface'
import { readWorldAppearance } from './appearance'

/** Lamp pairs along the ship road and the avenue; none on the paving itself. */
function lampPoses() {
  const poses: [number, number, number][] = []
  for (let x = 13; x <= LANDING_PAD_X - 10; x += 6) poses.push([x, 4.4, 0], [x, 7.6, 0])
  for (const x of [-11, -4, 4]) poses.push([x, AVENUE_Z + 1.8, 0])
  for (const x of [-2.6, 2.6]) poses.push([x, AVENUE_Z - 1.8, 0])
  return poses
}

function Lamps() {
  const { scene } = useGLTF(publicUrl('/models/path-lamp.glb'))
  const meshes = useMemo(() => {
    const poses = lampPoses(), list: THREE.InstancedMesh[] = []
    scene.updateMatrixWorld(true)
    scene.traverse(node => {
      if (!(node instanceof THREE.Mesh)) return
      const geometry = node.geometry.clone().applyMatrix4(node.matrixWorld)
      const mesh = new THREE.InstancedMesh(geometry, node.material, poses.length)
      poses.forEach(([x, z, yaw], i) => mesh.setMatrixAt(i, new THREE.Matrix4().compose(
        new THREE.Vector3(x, surfaceHeight(x, z), z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw), new THREE.Vector3(1, 1, 1))))
      mesh.computeBoundingSphere()
      list.push(mesh)
    })
    return list
  }, [scene])
  useEffect(() => () => meshes.forEach(mesh => mesh.geometry.dispose()), [meshes])
  return <>{meshes.map((mesh, i) => <primitive key={i} object={mesh} />)}</>
}

/** Same local soil and texture scale, with a compacted centre and two worn ruts. */
function Road() {
  const road = useMemo(() => {
    const paths = [
      { from: [7.6, 6], to: [LANDING_PAD_X - 7, 6], width: 2.4 },
      { from: [-15, AVENUE_Z], to: [10.2, AVENUE_Z], width: 2.8 },
      { from: [9, 4.8], to: [9, AVENUE_Z], width: 2.4 },
      { from: [0, 7.4], to: [0, AVENUE_Z], width: 4 },
      { from: [25, 4.8], to: [STATION_POINTS.solar[0], STATION_POINTS.solar[2]], width: 1.8 },
      { from: [14.5, 6], to: [STATION_POINTS.comms[0], STATION_POINTS.comms[2]], width: 1.6 },
    ]
    const positions: number[] = [], colors: number[] = [], uvs: number[] = []
    const mid = new THREE.Color(palette['regolith-mid']), light = new THREE.Color(palette['regolith-light'])
    const color = new THREE.Color()
    for (const path of paths) {
      const dx = path.to[0] - path.from[0], dz = path.to[1] - path.from[1], length = Math.hypot(dx, dz)
      const plane = new THREE.PlaneGeometry(length, path.width, Math.ceil(length / .75), 12)
      const vertices = plane.attributes.position
      const rgba = new Float32Array(vertices.count * 4)
      for (let i = 0; i < vertices.count; i++) {
        const along = vertices.getX(i) + length / 2, across = -vertices.getY(i)
        const edge = Math.abs(across) / (path.width / 2)
        const x = path.from[0] + dx / length * along - dz / length * across
        const z = path.from[1] + dz / length * along + dx / length * across
        const shoulder = Math.sin(along * 2.3) * .035 * edge
        const px = x - dz / length * shoulder, pz = z + dx / length * shoulder
        vertices.setXYZ(i, px, surfaceHeight(px, pz) + .012, pz)
        // Match the ground's world-space UVs: six metres per texture tile.
        plane.attributes.uv.setXY(i, (px + 180) / 360, (180 - pz) / 360)
        const rut = Math.exp(-(((Math.abs(across) - path.width * .28) / .14) ** 2))
        color.copy(mid).lerp(light, .18 + fbm(px * .14, pz * .14, 3, 11) * .23)
          .multiplyScalar(.60 - rut * .14)
        rgba.set([color.r, color.g, color.b, 1 - smoothstep(.8, 1, edge)], i * 4)
      }
      plane.setAttribute('color', new THREE.BufferAttribute(rgba, 4))
      const flat = plane.toNonIndexed()
      positions.push(...flat.attributes.position.array)
      colors.push(...flat.attributes.color.array)
      uvs.push(...flat.attributes.uv.array)
      plane.dispose(); flat.dispose()
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.computeVertexNormals()
    // Share the soil recipe; these small textures belong to this road only.
    const textures = createRegolithTextures(256)
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1,
      map: textures.albedo, normalMap: textures.normal, roughnessMap: textures.roughness,
      normalScale: new THREE.Vector2(.55, .55), transparent: true, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })
    return { geometry, material, textures }
  }, [])
  useEffect(() => () => {
    road.geometry.dispose(); road.material.dispose()
    Object.values(road.textures).forEach(texture => texture.dispose())
  }, [road])
  return <mesh name="PackedRegolithRoad" geometry={road.geometry} material={road.material} receiveShadow />
}

/** Cheap pools stay visible everywhere; only three nearby fixtures use real lights. */
function ExteriorLights() {
  const group = useRef<THREE.Group>(null)
  const lighting = useMemo(() => {
    const sources = lampPoses().map(([x, z]) => ({
      position: new THREE.Vector3(x, surfaceHeight(x, z) + .72, z), color: new THREE.Color('#ffb05b'), radius: 2.3, power: 5,
    }))
    sources.push({ position: new THREE.Vector3(-.1, 3.8, 7), color: new THREE.Color('#ffe0b0'), radius: 4, power: 42 })
    // Coordinates measured from the existing GLB lenses, then transformed with their assets.
    const blue: Record<string, [number, number, number]> = {
      hab: [5.08, 5.12, .1], greenhouse: [3.01, 2.35, 0], shelter: [-.65, 2.82, -.65],
      dock: [0, .13, .58], battery: [-.08, 1.51, -.51], dish: [1.01, 2.31, 0],
    }
    for (const placement of SITE) {
      const local = placement.id.startsWith('solar-') ? [-.31, 2.25, -2.16] as [number, number, number] : blue[placement.id]
      if (!local) continue
      const position = new THREE.Vector3(...placementPoint(placement.id, local))
      position.y += surfaceHeight(placement.x, placement.z) + .12
      sources.push({ position, color: new THREE.Color('#24bfff'), radius: 2.8, power: placement.id === 'hab' ? 32 : 9 })
    }
    const geometry = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)
    const material = new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, uniforms: { brightness: { value: 0 } },
      vertexShader: `varying vec2 vUv; varying vec3 tint;
        void main(){vUv=uv;tint=instanceColor;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);}`,
      fragmentShader: `uniform float brightness; varying vec2 vUv; varying vec3 tint;
        void main(){float r=length((vUv-.5)*2.0);float a=pow(max(0.0,1.0-r),2.0);
          gl_FragColor=vec4(tint,a*brightness);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    })
    const pools = new THREE.InstancedMesh(geometry, material, sources.length)
    pools.name = 'FixtureLightPools'
    const transform = new THREE.Object3D()
    sources.forEach((source, i) => {
      const { x, z } = source.position
      transform.position.set(x, surfaceHeight(x, z) + .024, z)
      transform.scale.set(source.radius * 2, 1, source.radius * 2)
      transform.updateMatrix(); pools.setMatrixAt(i, transform.matrix); pools.setColorAt(i, source.color)
    })
    pools.computeBoundingSphere()
    const root = new THREE.Group()
    root.add(pools)
    const lights = Array.from({ length: 3 }, () => {
      const light = new THREE.PointLight('#ffffff', 0, 9, 2)
      root.add(light)
      return light
    })
    const ranked = sources.map(source => ({ source, distance: 0 }))
    return { root, pools, geometry, material, lights, ranked, elapsed: 1, focus: new THREE.Vector3(), direction: new THREE.Vector3() }
  }, [])
  useEffect(() => () => {
    lighting.pools.dispose(); lighting.geometry.dispose(); lighting.material.dispose()
    lighting.lights.forEach(light => light.dispose())
  }, [lighting])
  useFrame(({ camera }, dt) => {
    const ui = useMissionStore.getState()
    if (group.current) group.current.visible = ui.area !== 'hab' || ui.view === 'station'
    const night = 1 - readWorldAppearance().day
    // These values are mutable Three.js GPU state, outside React rendering.
    // oxlint-disable-next-line react/immutability
    lighting.material.uniforms.brightness.value = .02 + night * .44
    // oxlint-disable-next-line react/immutability
    lighting.elapsed += dt
    if (lighting.elapsed < .2) return
    // oxlint-disable-next-line react/immutability
    lighting.elapsed = 0
    lighting.focus.copy(camera.position)
    if (ui.view === 'station') {
      camera.getWorldDirection(lighting.direction)
      if (lighting.direction.y < -.01) lighting.focus.addScaledVector(lighting.direction, -camera.position.y / lighting.direction.y)
    }
    for (const entry of lighting.ranked) {
      entry.distance = lighting.focus.distanceToSquared(entry.source.position)
    }
    lighting.ranked.sort((a, b) => a.distance - b.distance)
    lighting.lights.forEach((light, i) => {
      const { source, distance } = lighting.ranked[i]
      light.position.copy(source.position); light.color.copy(source.color)
      light.intensity = source.power * (.05 + night * .95) * (ui.view === 'station' ? 1 : 1 - smoothstep(100, 256, distance))
    })
  })
  return <group ref={group}><primitive object={lighting.root} /></group>
}

export function Walkways() {
  return <group>
    <Road />
    <Lamps />
    <ExteriorLights />
  </group>
}
useGLTF.preload(publicUrl('/models/path-lamp.glb'))
