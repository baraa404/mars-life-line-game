import * as THREE from 'three'

type Tuple3 = [number, number, number]

export type AssetCollisionPart = {
  key: string
  vertices: Float32Array
  indices: Uint32Array
  center: Tuple3
  halfExtents: Tuple3
}

/** Decode collider vertices independently of the optimized visual mesh buffers. */
export function buildAssetCollisionParts(scene: THREE.Object3D): AssetCollisionPart[] {
  const parts: AssetCollisionPart[] = []
  const matrix = new THREE.Matrix4()
  const instanceMatrix = new THREE.Matrix4()
  const point = new THREE.Vector3()
  const bounds = new THREE.Box3()
  const center = new THREE.Vector3()
  const halfExtents = new THREE.Vector3()
  scene.updateMatrixWorld(true)

  scene.traverseVisible((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const position = object.geometry.getAttribute('position')
    if (!position || position.count < 3) return
    const sourceIndex = object.geometry.getIndex()
    const indices = Uint32Array.from(
      { length: sourceIndex?.count ?? position.count },
      (_, i) => sourceIndex ? sourceIndex.getX(i) : i,
    )
    const count = object instanceof THREE.InstancedMesh ? object.count : 1
    for (let instance = 0; instance < count; instance++) {
      matrix.copy(object.matrixWorld)
      if (object instanceof THREE.InstancedMesh) {
        object.getMatrixAt(instance, instanceMatrix)
        matrix.multiply(instanceMatrix)
      }
      const vertices = new Float32Array(position.count * 3)
      bounds.makeEmpty()
      for (let i = 0; i < position.count; i++) {
        // getX/Y/Z decode normalized integer accessors; .array would not.
        point.fromBufferAttribute(position, i).applyMatrix4(matrix)
        point.toArray(vertices, i * 3)
        bounds.expandByPoint(point)
      }
      bounds.getCenter(center)
      bounds.getSize(halfExtents).multiplyScalar(0.5)
      const transformedIndices = indices.slice()
      if (matrix.determinant() < 0) for (let i = 0; i < transformedIndices.length; i += 3) {
        const second = transformedIndices[i + 1]; transformedIndices[i + 1] = transformedIndices[i + 2]; transformedIndices[i + 2] = second
      }
      parts.push({
        key: `${object.uuid}:${instance}`,
        vertices,
        indices: transformedIndices,
        center: center.toArray() as Tuple3,
        halfExtents: halfExtents.toArray() as Tuple3,
      })
    }
  })
  return parts
}
