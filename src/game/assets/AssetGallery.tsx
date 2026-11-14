import { useGLTF } from '@react-three/drei'
import { ConvexHullCollider, CuboidCollider, RigidBody, TrimeshCollider } from '@react-three/rapier'
import { Suspense, useMemo } from 'react'
import { AssetModel } from './AssetModel'
import { buildAssetCollisionParts } from './colliders'
import { gameAssets, type GameAsset } from './manifest'

const ROW_Z = -4
const ROW_SPACING = 6

// Phase 2 uses the same five-panel row four times, spaced along the clear test pad.
const placedAssets = gameAssets.flatMap(asset => {
  if (asset.id !== 'solar-array-row' || !asset.placement.position) return [asset]
  const [x, y, z] = asset.placement.position
  return Array.from({ length: 4 }, (_, row) => ({
    ...asset,
    placement: { ...asset.placement, position: [x, y, z - row * 3] as [number, number, number] },
  }))
})

function autoPosition(index: number, count: number): [number, number, number] {
  return [(index - (count - 1) / 2) * ROW_SPACING, 0, ROW_Z]
}

function PlacedAsset({ asset, index, count }: { asset: GameAsset; index: number; count: number }) {
  const { position, rotationY, scale, collider = 'hull' } = asset.placement
  const { scene } = useGLTF(asset.file)
  const collisionParts = useMemo(
    () => collider === 'none' ? [] : buildAssetCollisionParts(scene),
    [scene, collider],
  )
  const model = <AssetModel url={asset.file} />
  const transform = {
    position: position ?? autoPosition(index, count),
    rotation: [0, (rotationY * Math.PI) / 180, 0] as [number, number, number],
    scale,
  }

  if (collider === 'none') return <group {...transform} name={asset.id}>{model}</group>
  return (
    <RigidBody type="fixed" colliders={false} {...transform} name={asset.id}>
      {model}
      {collisionParts.map((part) => {
        if (collider === 'trimesh') return <TrimeshCollider key={part.key} args={[part.vertices, part.indices]} />
        if (collider === 'cuboid') return <CuboidCollider key={part.key} args={part.halfExtents} position={part.center} />
        return <ConvexHullCollider key={part.key} args={[part.vertices]} />
      })}
    </RigidBody>
  )
}

/** Every asset listed in assetManifest.json, placed on the test pad. */
export function AssetGallery() {
  return (
    <>
      {placedAssets.map((asset, i) => (
        <Suspense key={`${asset.id}-${i}`} fallback={null}>
          <PlacedAsset asset={asset} index={i} count={placedAssets.length} />
        </Suspense>
      ))}
    </>
  )
}
