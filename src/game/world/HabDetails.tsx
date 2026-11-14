import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { prepareCabinModel } from '../missions/cabinModel'
import { BUNK_SHIFT_Z } from './habLayout'

/** These static, texture-free fixtures share the cabin's material batching path. */
export function HabDetails() {
  const { scene } = useGLTF('/models/hab-lived-in.glb')
  const model = useMemo(() => {
    const placed = scene.clone(true)
    placed.traverse(node => {
      if (/^Mesh_(Bunk|UpholsterySeam_|FabricBag_|BagStrap_|ReadingLight)/.test(node.name)) node.position.z += BUNK_SHIFT_Z
    })
    return prepareCabinModel(placed)
  }, [scene])
  useEffect(() => () => model.dispose(), [model])
  return <primitive object={model.root} />
}

useGLTF.preload('/models/hab-lived-in.glb')
