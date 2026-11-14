import * as THREE from 'three'
import { fbm, seededRandom, smoothstep } from './noise.ts'
import { surfaceHeight, type Formation } from './landscape.ts'

export type TerrainPalette = { mid: string; light: string; shadow: string }

export function colourRock(geometry: THREE.BufferGeometry, palette: TerrainPalette) {
  const p = geometry.getAttribute('position'), n = geometry.getAttribute('normal')
  const colours = new Float32Array(p.count * 3)
  const mid = new THREE.Color(palette.mid), light = new THREE.Color(palette.light)
  const shadow = new THREE.Color(palette.shadow), c = new THREE.Color()
  for (let i = 0; i < p.count; i++) {
    const up = n.getY(i)
    c.copy(mid).lerp(light, up > 0.3 ? 0.18 + up * 0.22 : 0.025)
    if (up < 0.15) c.lerp(shadow, 0.07)
    c.toArray(colours, i * 3)
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colours, 3))
  return geometry
}

/** Decode normalized compressed vertices before baking transforms (never mutate loader caches). */
export function extractRockGeometry(mesh: THREE.Mesh, palette: TerrainPalette) {
  const source = mesh.geometry.getAttribute('position')
  const vertices = new Float32Array(source.count * 3)
  for (let i = 0; i < source.count; i++) {
    vertices.set([source.getX(i), source.getY(i), source.getZ(i)], i * 3)
  }
  let geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  if (mesh.geometry.index) geometry.setIndex(mesh.geometry.index.clone())
  geometry.applyMatrix4(mesh.matrixWorld)
  geometry.computeBoundingBox()
  const box = geometry.boundingBox!
  const center = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3())
  geometry.translate(-center.x, -box.min.y, -center.z)
  geometry.scale(1 / Math.max(size.x, size.z), 1 / Math.max(size.x, size.z), 1 / Math.max(size.x, size.z))
  if (geometry.index) {
    const indexed = geometry
    geometry = indexed.toNonIndexed()
    indexed.dispose()
  }
  geometry.computeVertexNormals()
  colourRock(geometry, palette)
  geometry.computeBoundingSphere()
  return geometry
}

/** Irregular, eroded height fields: geological benches, not concentric stacked blocks. */
export function createMesaGeometry(f: Formation, shelf: boolean, palette: TerrainPalette) {
  const random = seededRandom(f.seed)
  const resolution = shelf ? 28 : 44
  const tiers = shelf ? 2 : 2 + f.seed % 3
  const crown = shelf ? 0.58 : 0.36 + random() * 0.16
  const phase = random() * Math.PI * 2
  const indexed = new THREE.PlaneGeometry(f.radiusX * 2.5, f.radiusZ * 2.5, resolution, resolution)
  indexed.rotateX(-Math.PI / 2)
  const points = indexed.getAttribute('position')
  const base = surfaceHeight(f.x, f.z)
  for (let i = 0; i < points.count; i++) {
    const u = points.getX(i) / f.radiusX, v = points.getZ(i) / f.radiusZ
    const warpX = u + Math.sin(v * 4 + phase) * 0.09 + (fbm(u * 3 + 10, v * 3, 3, f.seed) - 0.44) * 0.20
    const warpZ = v + Math.cos(u * 3 - phase) * 0.10
    const angle = Math.atan2(warpZ, warpX)
    const r = Math.hypot(warpX, warpZ) * (1 + Math.sin(angle * 3 + phase) * 0.11 + Math.sin(angle * 7 - phase) * 0.045)
    let height = 0
    for (let tier = 0; tier < tiers; tier++) {
      const outer = 1 - tier / tiers * (1 - crown)
      const inner = outer - (1 - crown) / tiers * (0.70 + Math.sin(tier + phase) * 0.09)
      const shift = Math.sin(angle * (4 + tier) + phase + tier * 1.4) * 0.035
      height += f.height / tiers * smoothstep(outer + shift, inner + shift, r)
    }
    // Erosion cuts uneven radial gullies into the flanks, leaving broad intact cap rock.
    const gully = Math.max(0, Math.sin(angle * 8 + phase + r * 3)) ** 6
    height *= 1 - gully * smoothstep(crown * 0.8, 0.95, r) * 0.18
    if (shelf) {
      const fracture = Math.abs(u + Math.sin(v * 5 + phase) * 0.075 - 0.09)
      height -= Math.exp(-(fracture * fracture) / 0.0005) * 0.20 * smoothstep(0.2, 0.65, height / f.height)
    }
    const x = f.x + u * f.radiusX, z = f.z + v * f.radiusZ
    const ground = surfaceHeight(x, z)
    const y = ground + height - 0.14 + (base - ground) * smoothstep(0.96, crown, r) * 0.82
    points.setXYZ(i, x, y, z)
  }
  indexed.computeVertexNormals()
  const geometry = indexed.toNonIndexed()
  indexed.dispose()
  // Keep readable rock planes, with only a little smoothing across their edges.
  const smoothNormals = geometry.getAttribute('normal').clone()
  geometry.computeVertexNormals()
  const faceNormals = geometry.getAttribute('normal')
  const normal = new THREE.Vector3()
  for (let i = 0; i < faceNormals.count; i++) {
    normal.fromBufferAttribute(faceNormals, i).multiplyScalar(0.65)
    normal.x += smoothNormals.getX(i) * 0.35
    normal.y += smoothNormals.getY(i) * 0.35
    normal.z += smoothNormals.getZ(i) * 0.35
    normal.normalize()
    faceNormals.setXYZ(i, normal.x, normal.y, normal.z)
  }
  const p = geometry.getAttribute('position'), n = geometry.getAttribute('normal')
  const colours = new Float32Array(p.count * 3)
  const mid = new THREE.Color(palette.mid), light = new THREE.Color(palette.light), shade = new THREE.Color(palette.shadow)
  const c = new THREE.Color()
  for (let i = 0; i < p.count; i++) {
    const up = n.getY(i), elevation = p.getY(i) - base
    const strata = Math.sin(elevation * 1.4 + phase) * 0.5 + 0.5
    c.copy(mid).lerp(light, 0.07 + smoothstep(0.35, 0.95, up) * 0.24 + strata * 0.035)
    c.lerp(shade, (1 - smoothstep(0.2, 0.8, up)) * 0.08)
    c.toArray(colours, i * 3)
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colours, 3))
  geometry.computeBoundingSphere()
  return geometry
}

/** One exact static collision mesh for visible formations and larger scattered stones. */
export function appendCollision(geometry: THREE.BufferGeometry, matrix: THREE.Matrix4, positions: number[], indices: number[]) {
  const p = geometry.getAttribute('position'), offset = positions.length / 3
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.set(p.getX(i), p.getY(i), p.getZ(i)).applyMatrix4(matrix)
    positions.push(v.x, v.y, v.z)
  }
  const idx = geometry.index
  for (let i = 0; i < (idx?.count ?? p.count); i++) indices.push(offset + (idx ? idx.getX(i) : i))
}
