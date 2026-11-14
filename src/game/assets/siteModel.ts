import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { palette } from '../../style/tokens.ts'
const dustColor = new THREE.Color(palette['regolith-mid'])
const materialInputs = new WeakMap<ReturnType<typeof prepareSiteModel>, { dust: number; charge: number }>()
/** Bake static draw groups by material while retaining the original semantic hierarchy.
 * Panel materials and charge lamps stay separate and instance-owned for live binding.
 * No source buffers/materials are mutated, including Meshopt-normalized accessors.
 */
export function prepareSiteModel(source: THREE.Object3D, castShadow = true) {
  const root = source.clone(true)
  root.updateMatrixWorld(true)
  const buckets = new Map<string, { owner: THREE.Object3D; material: THREE.Material; pieces: THREE.BufferGeometry[]; cutaway: boolean }>()
  const materials = new Map<THREE.Material, THREE.Material>()
  const dust: { material: THREE.MeshStandardMaterial; original: THREE.Color }[] = []
  const lamps: { material: THREE.MeshStandardMaterial; segment: number; original: THREE.Color; intensity: number }[] = []
  const geometries: THREE.BufferGeometry[] = []
  root.traverse(node => {
    if (!(node instanceof THREE.Mesh)) return
    const list = Array.isArray(node.material) ? node.material : [node.material]
    if (list.length !== 1) throw new Error(`Site batching requires one material per mesh: ${node.name}`)
    const original = list[0]
    let material = materials.get(original)
    if (!material) {
      const cloned = original.clone(); material = cloned; materials.set(original, cloned)
      if (material instanceof THREE.MeshStandardMaterial) {
        if (material.name.startsWith('array-cells-')) dust.push({ material, original: material.color.clone() })
        const segment = /^charge-lamp-(\d+)$/.exec(material.name)
        if (segment) lamps.push({ material, segment: Number(segment[1]), original: material.emissive.clone(), intensity: material.emissiveIntensity })
      }
    }
    if (!material) throw new Error('Material clone failed')
    let owner: THREE.Object3D = root
    for (let parent = node.parent; parent && parent !== root; parent = parent.parent) {
      if (/^(roof|wing_roof|door_leaf_left|door_leaf_right|dish|dish_support|antenna_tower_left|antenna_tower_rear|outer_hatch|inner_hatch|hatch|ramp|lid|charge_bar|panel_\d+|charging_arm)$/.test(parent.name)) { owner = parent; break }
    }
    const ownerInverse = owner.matrixWorld.clone().invert()
    const copies = node instanceof THREE.InstancedMesh ? node.count : 1
    for (let instance = 0; instance < copies; instance++) {
      const transform = ownerInverse.clone().multiply(node.matrixWorld)
      if (node instanceof THREE.InstancedMesh) { const m = new THREE.Matrix4(); node.getMatrixAt(instance, m); transform.multiply(m) }
      const input = node.geometry, position = input.getAttribute('position'), normal = input.getAttribute('normal'), color = input.getAttribute('color')
      const geometry = new THREE.BufferGeometry()
      const indices = input.index, count = indices?.count ?? position.count
      const positions = new Float32Array(count * 3), normals = new Float32Array(count * 3), colors = new Float32Array(count * 4)
      const p = new THREE.Vector3(), n = new THREE.Vector3(), normalMatrix = new THREE.Matrix3().getNormalMatrix(transform)
      const mirrored = transform.determinant() < 0
      for (let i = 0; i < count; i++) {
        const order = mirrored && i % 3 !== 0 ? i + (i % 3 === 1 ? 1 : -1) : i
        const index = indices?.getX(order) ?? order
        p.fromBufferAttribute(position, index).applyMatrix4(transform).toArray(positions, i * 3)
        if (normal) n.fromBufferAttribute(normal, index).applyNormalMatrix(normalMatrix).toArray(normals, i * 3)
        const colorOffset = i * 4
        colors[colorOffset] = color ? color.getX(index) : 1
        colors[colorOffset + 1] = color ? color.getY(index) : 1
        colors[colorOffset + 2] = color ? color.getZ(index) : 1
        colors[colorOffset + 3] = color?.itemSize === 4 ? color.getW(index) : 1
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4))
      if (!normal) geometry.computeVertexNormals()
      // Every current site asset is texture-free; preserving UV textures needs an explicit batch contract.
      if (material instanceof THREE.MeshStandardMaterial && material.map) throw new Error(`Textured site asset needs UV batching: ${node.name}`)
      const cutaway = /^Mesh_(Main_pressure_hull|Right_service_shoulder|Structural_pressure_rib|Wing_pressure_shell|Wing_pressure_collar)/.test(node.name)
      const key = `${owner.uuid}:${material.uuid}:${cutaway}`
      if (!buckets.has(key)) buckets.set(key, { owner, material, pieces: [], cutaway })
      buckets.get(key)!.pieces.push(geometry)
    }
    node.visible = false // retain named anchors and transforms; rendering uses derived static batches.
  })
  for (const { owner, material, pieces, cutaway } of buckets.values()) {
    const geometry = mergeGeometries(pieces)
    if (!geometry) throw new Error('Incompatible site geometry')
    geometries.push(geometry); pieces.forEach(g => g.dispose())
    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = `site-batch:${material.name}`
    mesh.userData.cutaway = cutaway
    mesh.castShadow = castShadow && ['smooth-structure', 'matte-environment'].includes(material.name)
    mesh.receiveShadow = true
    owner.add(mesh)
  }
  return { root, dust, lamps, dispose() { geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()) } }
}
export function updateSiteMaterials(model: ReturnType<typeof prepareSiteModel>, panelDust: number, batteryFraction: number) {
  const dust = THREE.MathUtils.clamp(panelDust, 0, 1) * .85
  const charge = Math.ceil(THREE.MathUtils.clamp(batteryFraction, 0, 1) * 9)
  const previous = materialInputs.get(model)
  if (!previous || previous.dust !== dust) {
    for (const cell of model.dust) cell.material.color.copy(cell.original).lerp(dustColor, dust)
  }
  if (!previous || previous.charge !== charge) for (const lamp of model.lamps) {
    const lit = lamp.segment <= charge
    lamp.material.emissive.copy(lamp.original); lamp.material.emissiveIntensity = lit ? lamp.intensity : 0
    lamp.material.color.set(lit ? palette['structure-white'] : palette['trim-dark'])
  }
  if (previous) { previous.dust = dust; previous.charge = charge }
  else materialInputs.set(model, { dust, charge })
}
