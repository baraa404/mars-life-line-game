import { RigidBody, TrimeshCollider } from '@react-three/rapier'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { materials, palette } from '../../style/tokens'
import { fbm, smoothstep } from './noise'
import { TERRAIN_SEGMENTS, TERRAIN_SIZE, terrainHeight, washDistance } from './landscape'
import { createRegolithTextures, createSurfaceGravel } from './terrainSurface'

function buildTerrain() {
  const plane = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS)
  plane.rotateX(-Math.PI / 2)
  const pos = plane.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) pos.setY(i, terrainHeight(pos.getX(i), pos.getZ(i)))

  const colliderVertices = new Float32Array(pos.array as Float32Array)
  const colliderIndices = new Uint32Array(plane.index!.array)

  // Soil stays smooth; visible facets belong on separate rocks and ridges.
  plane.computeVertexNormals()

  const mid = new THREE.Color(palette['regolith-mid'])
  const light = new THREE.Color(palette['regolith-light'])
  const shadow = new THREE.Color(palette['shadow-plum'])
  const normals = plane.attributes.normal as THREE.BufferAttribute
  const colors = new Float32Array(pos.count * 3)
  const c = new THREE.Color()

  for (let i = 0; i < pos.count; i++) {
    const slope = 1 - normals.getY(i)
    const height = pos.getY(i)
    const x = pos.getX(i), z = pos.getZ(i)
    const mottle = fbm(x * 0.14, z * 0.14, 3, 11)
    const wash = Math.exp(-((washDistance(x, z) / 3) ** 2))
    const sediment = fbm(x * .055 + mottle * 2, z * .055, 3, 47)
    const mineral = smoothstep(.27, .64, sediment)
    c.copy(mid)
      .lerp(light, 0.07 + mottle * 0.23 + mineral * .23 + wash * 0.12 + smoothstep(3, 20, height) * 0.14)
      .lerp(shadow, (1 - mineral) * .10)
      .lerp(shadow, smoothstep(0.06, 0.5, slope) * 0.32)
    c.toArray(colors, i * 3)
  }
  plane.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  return { geometry: plane, colliderVertices, colliderIndices }
}

function buildGravel() {
  const stones = createSurfaceGravel()
  const geometry = new THREE.OctahedronGeometry(.5, 0)
  const material = new THREE.MeshStandardMaterial({ color: palette['regolith-mid'], roughness: 1, flatShading: true })
  const mesh = new THREE.InstancedMesh(geometry, material, stones.length)
  const transform = new THREE.Object3D(), shade = new THREE.Color()
  for (let i = 0; i < stones.length; i++) {
    const s = stones[i]
    transform.position.set(s.x, s.y, s.z)
    transform.rotation.set(.1, s.yaw, .18)
    transform.scale.set(s.width, s.width * s.squash, s.width * .72)
    transform.updateMatrix(); mesh.setMatrixAt(i, transform.matrix)
    mesh.setColorAt(i, shade.setScalar(s.shade))
  }
  mesh.name = 'RegolithGravel'; mesh.receiveShadow = true; mesh.computeBoundingSphere()
  return mesh
}

/** Shallow wheel impressions on the cleared rover apron, conforming to the ground. */
function buildWheelImpressions() {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(15, 0, 11), new THREE.Vector3(15.8, 0, 15),
    new THREE.Vector3(21, 0, 21), new THREE.Vector3(33, 0, 26),
  ])
  const points = curve.getSpacedPoints(115)
  const geometry = new THREE.PlaneGeometry(.28, .13)
  geometry.rotateX(-Math.PI / 2)
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(palette['regolith-mid']).lerp(new THREE.Color(palette['trim-dark']), .32),
    roughness: 1, transparent: true, opacity: .38, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
  })
  const mesh = new THREE.InstancedMesh(geometry, material, points.length * 2)
  const transform = new THREE.Object3D(), tangent = new THREE.Vector3()
  let i = 0
  points.forEach((p, index) => {
    tangent.copy(points[Math.min(index + 1, points.length - 1)]).sub(points[Math.max(0, index - 1)]).normalize()
    for (const side of [-1, 1]) {
      const x = p.x + tangent.z * .86 * side, z = p.z - tangent.x * .86 * side
      transform.position.set(x, terrainHeight(x, z) + .008, z)
      transform.rotation.set(0, Math.atan2(tangent.x, tangent.z), 0)
      transform.scale.setScalar(.8 + Math.sin(index * 1.7) * .12)
      transform.updateMatrix(); mesh.setMatrixAt(i++, transform.matrix)
    }
  })
  mesh.name = 'RoverWheelImpressions'; mesh.receiveShadow = true; mesh.computeBoundingSphere()
  return mesh
}

// These immutable resources belong to the world, across Suspense retries and the
// landing/game canvases. Do not dispose them when an individual Terrain unmounts.
let sharedTerrain: ReturnType<typeof buildTerrain> | undefined
let sharedTextures: ReturnType<typeof createRegolithTextures> | undefined
let sharedMaterial: THREE.MeshStandardMaterial | undefined
// Each Terrain owns its instance object; geometry/material live with that object.
if (import.meta.hot) import.meta.hot.dispose(() => {
  sharedTerrain?.geometry.dispose()
  sharedTextures?.normal.dispose()
  sharedTextures?.albedo.dispose()
  sharedTextures?.roughness.dispose()
  sharedMaterial?.dispose()
})

export function Terrain({ visualOnly = false }: { visualOnly?: boolean }) {
  const gravel = useMemo(() => buildGravel(), [])
  const wheelImpressions = useMemo(() => buildWheelImpressions(), [])
  useEffect(() => () => { gravel.dispose(); gravel.geometry.dispose(); (gravel.material as THREE.Material).dispose() }, [gravel])
  useEffect(() => () => { wheelImpressions.dispose(); wheelImpressions.geometry.dispose(); (wheelImpressions.material as THREE.Material).dispose() }, [wheelImpressions])
  const { geometry, colliderVertices, colliderIndices } = (sharedTerrain ??= buildTerrain())
  const { normal, albedo, roughness } = (sharedTextures ??= createRegolithTextures())
  const m = materials['matte-environment']
  const material = sharedMaterial ??= new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: m.roughness, metalness: m.metalness,
    map: albedo, normalMap: normal, normalScale: new THREE.Vector2(.8, .8), roughnessMap: roughness,
  })

  const mesh = <mesh geometry={geometry} receiveShadow dispose={null}>
    <primitive object={material} attach="material" dispose={null} />
  </mesh>
  const detail = <><primitive object={gravel} dispose={null} /><primitive object={wheelImpressions} dispose={null} /></>
  if (visualOnly) return <>{mesh}{detail}</>
  return <RigidBody type="fixed" colliders={false} friction={1}>
    <TrimeshCollider args={[colliderVertices, colliderIndices]} />{mesh}{detail}
  </RigidBody>
}
