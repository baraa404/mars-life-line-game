import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

type AssetModelProps = { url: string; castShadow?: boolean; receiveShadow?: boolean }

/**
 * Loads an optimized GLB (meshopt-compressed; drei registers the decoder by default)
 * and returns an independent clone so the same asset can be placed many times.
 */
export function AssetModel({ url, castShadow = true, receiveShadow = true }: AssetModelProps) {
  const { scene, animations } = useGLTF(url)
  const instance = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = castShadow
        o.receiveShadow = receiveShadow
      }
    })
    return clone
  }, [scene, castShadow, receiveShadow])
  const wave = useMemo(() => animations.find((clip) => clip.name === 'Friendly_Wave'), [animations])
  const mixer = useMemo(() => wave ? new THREE.AnimationMixer(instance) : null, [instance, wave])
  useFrame((_, delta) => { mixer?.update(delta) })
  useEffect(() => {
    if (!wave || !mixer) return
    mixer.clipAction(wave).reset().play()
    return () => {
      mixer.stopAllAction()
      mixer.uncacheRoot(instance)
    }
  }, [wave, instance, mixer])
  return <primitive object={instance} />
}
