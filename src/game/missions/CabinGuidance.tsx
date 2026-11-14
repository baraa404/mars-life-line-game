import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Group, Vector3 } from 'three'
import { cabinObjective, cabinObjectiveBearing } from './cabinGuidance'
import type { LandingStage } from './m0'

export function CabinGuidance({ stage, cycling, active }: { stage: LandingStage; cycling: boolean; active: boolean }) {
  const objective = cabinObjective(stage, cycling)
  const arrow = useRef<SVGSVGElement>(null)
  const detail = useRef<HTMLSpanElement>(null)
  const hudAnchor = useRef<Group>(null)
  const look = useMemo(() => new Vector3(), [])
  useFrame(({ camera }) => {
    if (!objective || !active) return
    camera.getWorldDirection(look)
    // Keep the fullscreen overlay in front of the camera, independent of world position.
    hudAnchor.current?.position.copy(camera.position).add(look)
    if (!arrow.current || !detail.current) return
    const dx = objective.point[0] - camera.position.x, dz = objective.point[2] - camera.position.z
    const bearing = cabinObjectiveBearing(dx, dz, look.x, look.z)
    arrow.current.style.transform = `rotate(${bearing}rad)`
    const distance = Math.hypot(dx, objective.point[1] - camera.position.y, dz)
    const turn = Math.abs(bearing) > 2.3 ? 'Turn around' : Math.abs(bearing) > .5 ? `Turn ${bearing > 0 ? 'right' : 'left'}` : 'Look toward the marker'
    detail.current.textContent = `${turn} · ${distance.toFixed(1)} m`
  }, -2)
  if (!objective || !active) return null
  return <>
    <group ref={hudAnchor}><Html fullscreen calculatePosition={(_, __, size) => [size.width / 2, size.height / 2]}
      style={{ pointerEvents: 'none' }} zIndexRange={[8, 0]}>
      <div className="cabin-guide" role="status" aria-label={`Next: ${objective.label}`}>
        <svg ref={arrow} width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3 5 11h5v10h4V11h5Z" fill="currentColor" />
        </svg>
        <div><strong>{objective.label}</strong><span ref={detail} /></div>
      </div>
    </Html></group>
    <Html position={[objective.point[0], objective.point[1] + .28, objective.point[2]]} center
      style={{ pointerEvents: 'none' }} zIndexRange={[7, 0]}>
      <span className="cabin-guide-marker" aria-hidden="true">⌄</span>
    </Html>
  </>
}
