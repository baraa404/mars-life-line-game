import { useEffect, useMemo } from 'react'
import { BufferAttribute, BufferGeometry, Color, CylinderGeometry, InstancedMesh, Matrix4, MeshStandardMaterial, Quaternion, Vector3 } from 'three'
import { palette } from '../../style/tokens'
import { terrainHeight, TERRAIN_SIZE } from './landscape'
import { fbm, seededRandom, smoothstep } from './noise'

/** Low-cost scenery beyond the playable basin, shared with the landing approach. */
export function DistantTerrain() {
  const scenery = useMemo(() => {
    const core = TERRAIN_SIZE / 2 - 2, extent = 1400, step = 20
    const axis = Array.from(new Set([
      ...Array.from({ length: extent * 2 / step + 1 }, (_, i) => -extent + i * step), -core, core,
    ])).sort((a, b) => a - b)
    const n = axis.length, positions = new Float32Array(n * n * 3), colours = new Float32Array(n * n * 3)
    const height = (x: number, z: number) => {
      const distance = Math.max(Math.abs(x), Math.abs(z))
      // A short buried overlap hides the junction with the high-resolution basin.
      const blend = smoothstep(180, 250, distance)
      return terrainHeight(x, z) - (1 - blend) * 1.5 + blend * (fbm(x * .004, z * .004, 3, 64) - .4) * 22
    }
    const base = new Color(palette['regolith-mid']), light = new Color(palette['regolith-light']), tint = new Color()
    for (let iz = 0; iz < n; iz++) for (let ix = 0; ix < n; ix++) {
      const x = axis[ix], z = axis[iz], index = (iz * n + ix) * 3
      positions.set([x, height(x, z), z], index)
      tint.copy(base).lerp(light, .1 + fbm(x * .009, z * .009, 2, 18) * .24).toArray(colours, index)
    }
    const indices: number[] = []
    for (let iz = 0; iz < n - 1; iz++) for (let ix = 0; ix < n - 1; ix++) {
      if (axis[ix] >= -core && axis[ix + 1] <= core && axis[iz] >= -core && axis[iz + 1] <= core) continue
      const a = iz * n + ix, b = a + 1, c = a + n, d = c + 1
      indices.push(a, c, b, b, c, d)
    }
    const ground = new BufferGeometry()
    ground.setAttribute('position', new BufferAttribute(positions, 3))
    ground.setAttribute('color', new BufferAttribute(colours, 3))
    ground.setIndex(indices); ground.computeVertexNormals()
    const material = new MeshStandardMaterial({ vertexColors: true, roughness: .98 })
    const ridgeGeometry = new CylinderGeometry(.64, 1, 1, 13, 5)
    const ridgePositions = ridgeGeometry.getAttribute('position')
    const ridgeColors = new Float32Array(ridgePositions.count * 3)
    const layers = [1, .94, .70, .73, .49, .43]
    for (let i = 0; i < ridgePositions.count; i++) {
      const x = ridgePositions.getX(i), y = ridgePositions.getY(i), z = ridgePositions.getZ(i)
      const angle = Math.atan2(z, x), level = Math.round((y + .5) * 5)
      const radius = Math.hypot(x, z)
      const edge = 1 + Math.sin(angle * 3 + .7) * .16 + Math.cos(angle * 7 - .3) * .075
      const r = radius > .01 ? layers[level] * edge : 0
      const h = y + (Math.sin(angle * 4 + .8) * .04 + Math.cos(angle * 7) * .018) * (y + .5)
      ridgePositions.setXYZ(i, Math.cos(angle) * r + (y + .5) * .09, h, Math.sin(angle) * r)
      tint.copy(base).lerp(light, .07 + level * .038 + (level % 2) * .045).toArray(ridgeColors, i * 3)
    }
    ridgeGeometry.setAttribute('color', new BufferAttribute(ridgeColors, 3))
    ridgeGeometry.computeVertexNormals()
    ridgeGeometry.computeBoundingSphere()
    const ridgeMaterial = new MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true })
    const ridges = new InstancedMesh(ridgeGeometry, ridgeMaterial, 128)
    const random = seededRandom(741), transform = new Matrix4(), rotation = new Quaternion(), up = new Vector3(0, 1, 0)
    let count = 0
    for (const radius of [340, 540, 800, 1120]) for (let i = 0; i < 16; i++) {
      const angle = (i + random() * .45) / 16 * Math.PI * 2
      const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius
      const rx = 25 + random() * 40, rz = 24 + random() * 36, h = 14 + random() * 42
      if (Math.max(Math.abs(x), Math.abs(z)) - Math.max(rx, rz) < 220) continue
      rotation.setFromAxisAngle(up, random() * Math.PI)
      transform.compose(new Vector3(x, height(x, z) + h / 2 - 6, z), rotation, new Vector3(rx, h, rz))
      ridges.setMatrixAt(count, transform)
      ridges.setColorAt(count, tint.setScalar(.82 + random() * .2))
      count++
    }
    // Smaller chunks break up the apron just beyond the old terrain edge.
    for (let i = 0; i < 64; i++) {
      const angle = random() * Math.PI * 2, radius = 215 + random() * 260
      const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius
      const rx = 4 + random() * 9, rz = 4 + random() * 10, h = 3 + random() * 9
      if (Math.max(Math.abs(x), Math.abs(z)) - Math.max(rx, rz) < 185) continue
      rotation.setFromAxisAngle(up, random() * Math.PI)
      transform.compose(new Vector3(x, height(x, z) + h * .35, z), rotation, new Vector3(rx, h, rz))
      ridges.setMatrixAt(count, transform)
      ridges.setColorAt(count, tint.setScalar(.75 + random() * .3))
      count++
    }
    ridges.count = count; ridges.computeBoundingSphere()
    return { ground, material, ridges, dispose() { ground.dispose(); material.dispose(); ridges.dispose(); ridgeGeometry.dispose(); ridgeMaterial.dispose() } }
  }, [])
  useEffect(() => () => scenery.dispose(), [scenery])
  return <group name="DistantTerrain">
    <mesh geometry={scenery.ground} material={scenery.material} receiveShadow />
    <primitive object={scenery.ridges} />
  </group>
}
