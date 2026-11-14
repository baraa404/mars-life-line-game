import { BufferGeometry, Material, Mesh, Object3D } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

/** Keep live controls intact; batch the texture-free stationary cabin by material. */
export function prepareCabinModel(source: Object3D) {
  const root = source.clone(true)
  root.updateMatrixWorld(true)
  const inverse = root.matrixWorld.clone().invert()
  const buckets = new Map<Material, BufferGeometry[]>()
  const owned: BufferGeometry[] = []
  root.traverse(node => {
    if (!(node instanceof Mesh)) return
    node.receiveShadow = true
    node.castShadow = true
    for (let part: Object3D | null = node; part && part !== root; part = part.parent) {
      if (/^(Joint_throttle_[01]|Joint_encoder_1_1|Mesh_HatchWheel)$/.test(part.name)) return
    }
    if (Array.isArray(node.material) || node.material.map) throw new Error(`Cabin batching expects a single untextured material: ${node.name}`)
    const geometry = node.geometry.index ? node.geometry.toNonIndexed() : node.geometry.clone()
    // All authored cabin surfaces are solid materials; runtime displays are separate.
    for (const name of Object.keys(geometry.attributes)) if (!['position', 'normal'].includes(name)) geometry.deleteAttribute(name)
    if (!geometry.getAttribute('normal')) geometry.computeVertexNormals()
    geometry.applyMatrix4(inverse.clone().multiply(node.matrixWorld))
    if (!buckets.has(node.material)) buckets.set(node.material, [])
    buckets.get(node.material)!.push(geometry)
    node.visible = false
  })
  for (const [material, pieces] of buckets) {
    const geometry = mergeGeometries(pieces)
    pieces.forEach(piece => piece.dispose())
    if (!geometry) throw new Error('Cabin surfaces could not be batched')
    owned.push(geometry)
    const mesh = new Mesh(geometry, material)
    mesh.name = 'cabin-batch:' + material.name
    mesh.castShadow = true; mesh.receiveShadow = true
    root.add(mesh)
  }
  return { root, dispose: () => owned.forEach(geometry => geometry.dispose()) }
}
