import { publicUrl } from '../../publicUrl'
import manifestJson from './assetManifest.json'

export type AssetCollider = 'hull' | 'trimesh' | 'cuboid' | 'none'

export type GameAsset = {
  id: string
  name: string
  /** Public URL of the optimized GLB. */
  file: string
  /** Exact Kiln revision this GLB was exported from. */
  kiln: { collection: string; assetId: string; revisionId: string }
  placement: {
    /** null = auto-placed in the gallery row on the test pad. */
    position: [number, number, number] | null
    rotationY: number
    scale: number
    collider?: AssetCollider
  }
  stats: { triangles: number; bytes: number; rawBytes: number; materials: string[] }
  ingestedAt: string
}

export const gameAssets = (manifestJson as unknown as { assets: GameAsset[] }).assets.map(asset => ({ ...asset, file: publicUrl(asset.file) }))
