import { publicUrl } from '../../publicUrl'
import { useGLTF } from '@react-three/drei'
import { RigidBody, TrimeshCollider } from '@react-three/rapier'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { materials, palette } from '../../style/tokens'
import { createRockPlacements, MESAS, SHELVES } from './landscape'
import { appendCollision, createMesaGeometry, extractRockGeometry } from './landscapeGeometry'

const ROCK_KIT = publicUrl('/models/mars-rock-kit.glb')
const terrainPalette = { mid: palette['regolith-mid'], light: palette['regolith-light'], shadow: palette['shadow-plum'] }

/** The saved Kiln kit supplies stones; the scene owns terrain, placement and collision. */
export function MarsLandscape({ visualOnly = false }: { visualOnly?: boolean }) {
  const { scene } = useGLTF(ROCK_KIT)
  const landscape = useMemo(() => {
    scene.updateMatrixWorld(true)
    const variants: THREE.BufferGeometry[] = []
    scene.traverse(node => {
      const match = /Rock_(\d)/.exec(node.name)
      if (node instanceof THREE.Mesh && match) variants[Number(match[1])] = extractRockGeometry(node, terrainPalette)
    })
    if (variants.filter(Boolean).length !== 5) throw new Error('Mars rock kit must contain five named rock variants')
    const material = new THREE.MeshStandardMaterial({ vertexColors: true,
      roughness: materials['matte-environment'].roughness, metalness: materials['matte-environment'].metalness })
    const group = new THREE.Group()
    group.name = 'MarsLandscape'
    const vertices: number[] = [], indices: number[] = [], identity = new THREE.Matrix4()
    const formations = [...MESAS.map(f => ({ f, shelf: false })), ...SHELVES.map(f => ({ f, shelf: true }))]
    const geometries = [...variants]
    for (const { f, shelf } of formations) {
      const geometry = createMesaGeometry(f, shelf, terrainPalette)
      geometries.push(geometry)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.name = `${shelf ? 'FracturedShelf' : 'LayeredMesa'}_${f.seed}`
      mesh.castShadow = mesh.receiveShadow = true
      mesh.matrixAutoUpdate = false
      group.add(mesh)
      if (!visualOnly) appendCollision(geometry, identity, vertices, indices)
    }
    const placements = createRockPlacements()
    const transform = new THREE.Object3D(), shade = new THREE.Color()
    for (let variant = 0; variant < 5; variant++) for (const large of [false, true]) {
      const rocks = placements.filter(r => r.variant === variant && (r.width >= 0.72) === large)
      if (!rocks.length) continue
      const mesh = new THREE.InstancedMesh(variants[variant], material, rocks.length)
      mesh.name = `${large ? 'Boulders' : 'Pebbles'}_${variant}`
      mesh.castShadow = large
      mesh.receiveShadow = true
      mesh.matrixAutoUpdate = false
      rocks.forEach((rock, i) => {
        transform.position.set(rock.x, rock.y, rock.z)
        transform.rotation.set(0, rock.rotation, 0)
        transform.scale.set(rock.width, rock.width * rock.heightScale, rock.width * rock.depthScale)
        transform.updateMatrix()
        mesh.setMatrixAt(i, transform.matrix)
        mesh.setColorAt(i, shade.setScalar(rock.shade))
        if (large && !visualOnly) appendCollision(variants[variant], transform.matrix, vertices, indices)
      })
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingSphere()
      group.add(mesh)
    }
    group.userData.rockCount = placements.length
    return { group, geometries, material,
      colliderVertices: new Float32Array(vertices), colliderIndices: new Uint32Array(indices) }
  }, [scene, visualOnly])
  useEffect(() => () => {
    landscape.geometries.forEach(geometry => geometry.dispose())
    landscape.group.traverse(node => { if (node instanceof THREE.InstancedMesh) node.dispose() })
    landscape.material.dispose()
  }, [landscape])
  if (visualOnly) return <primitive object={landscape.group} />
  return (
    <RigidBody type="fixed" colliders={false} friction={1} name="MarsGeology">
      <primitive object={landscape.group} />
      <TrimeshCollider args={[landscape.colliderVertices, landscape.colliderIndices]} />
    </RigidBody>
  )
}
