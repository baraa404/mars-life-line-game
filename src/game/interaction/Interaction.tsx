import { useEffect, useRef } from 'react'
import { useRapier } from '@react-three/rapier'
import { playerInputBlocked, useMissionStore, type Area } from '../../state/useMissionStore'
import { InteractionController, type InteractionTarget } from './InteractionController'

export interface Target extends InteractionTarget { area: Area }
const providers = new Set<() => Target[]>()

/** Providers register targets; only the Hab scene controller consumes E. */
export function useInteractionTargets(targets: () => Target[]) {
  const current = useRef(targets)
  current.current = targets
  useEffect(() => {
    const get = () => current.current()
    providers.add(get)
    return () => { providers.delete(get) }
  }, [])
}

export function Interaction({ targets }: { targets: Target[] }) {
  const { world, rapier } = useRapier()
  return <InteractionController
    blocked={() => playerInputBlocked(useMissionStore.getState())}
    targets={() => [...targets, ...[...providers].flatMap(get => get())].filter(t => t.area === useMissionStore.getState().area)}
    obstructed={(eye, direction, distance) => !!world.castRay(new rapier.Ray(eye, direction), Math.max(0, distance - .35), true, rapier.QueryFilterFlags.ONLY_FIXED)}
  />
}
