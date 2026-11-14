import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { useWorldStore } from '../../state/useWorldStore'
/** Renderer counters include shadow passes. Throttled DOM evidence, no frame data in Zustand. */
export function WorldDiagnostics() {
  const time = useRef(0), frames = useRef(0)
  useFrame(({ gl, camera }, delta) => {
    time.current += delta; frames.current++
    if (time.current < 1) return
    useWorldStore.setState({ renderStats: { calls: gl.info.render.calls, triangles: gl.info.render.triangles,
      fps: Math.round(frames.current / time.current), x: camera.position.x, z: camera.position.z } })
    time.current = 0; frames.current = 0
  })
  return null
}
