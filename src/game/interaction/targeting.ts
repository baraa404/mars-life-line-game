import { Vector3 } from 'three'

export interface SpatialTarget {
  id: string
  point: [number, number, number]
  range?: number
  aimRadius?: number
  approach?: boolean
  enabled?: boolean
}

export function availableTargets<T extends SpatialTarget>(targets: T[], eye: Vector3,
  obstructed?: (point: Vector3, distance: number) => boolean) {
  return targets.filter(target => {
    if (target.enabled === false) return false
    const x = target.point[0] - eye.x, y = target.point[1] - eye.y, z = target.point[2] - eye.z
    const distance = Math.sqrt(x * x + y * y + z * z)
    if (distance > (target.range ?? 3.4) || distance < .05) return false
    if (target.approach && !(eye.z >= target.point[2] && Math.abs(eye.x - target.point[0]) < 2)) return false
    return !obstructed || !obstructed(new Vector3(x, y, z).normalize(), distance)
  })
}

export function aimedTarget<T extends SpatialTarget>(targets: T[], eye: Vector3, look: Vector3) {
  let best = Infinity, bestDepth = Infinity, selected: T | undefined
  for (const target of targets) {
    const x = target.point[0] - eye.x, y = target.point[1] - eye.y, z = target.point[2] - eye.z
    const depth = x * look.x + y * look.y + z * look.z
    if (depth <= 0) continue
    const dx = x - look.x * depth, dy = y - look.y * depth, dz = z - look.z * depth
    const offset = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const viewCone = depth * .8
    const baseRadius = target.aimRadius ?? .5
    const radius = target.aimRadius === undefined
      ? Math.min(baseRadius, depth * .2)
      : Math.min(target.aimRadius, viewCone)
    const score = offset / radius
    if (score < 1 && (score < best - .001 || Math.abs(score - best) <= .001 && depth < bestDepth)) {
      best = score; bestDepth = depth; selected = target
    }
  }
  return selected
}

export const HOLD_SECONDS = .75
export function advanceHold(duration: number, dt: number, active: boolean, seconds = HOLD_SECONDS) {
  return active ? Math.min(seconds, duration + Math.min(dt, .1)) : 0
}

export interface InteractionInput {
  id: string
  held: boolean
  pressed: boolean
  toggled: boolean
  duration: number
}

/** Consume a press once, and never carry a hold across objects or blocked frames. */
export function stepInteraction(input: InteractionInput, target: (SpatialTarget & { hold?: boolean; holdSeconds?: number }) | undefined, dt: number, toggleHold: boolean) {
  if (input.id !== (target?.id ?? '')) {
    input.id = target?.id ?? ''
    input.duration = 0; input.toggled = false; input.held = false
  }
  if (!target) { input.held = input.pressed = input.toggled = false; input.duration = 0 }
  if (target?.hold && input.pressed && toggleHold) input.toggled = !input.toggled
  const seconds = target?.holdSeconds ?? HOLD_SECONDS
  input.duration = advanceHold(input.duration, dt, !!target?.hold && (toggleHold ? input.toggled : input.held), seconds)
  const progress = input.duration / seconds
  const activate = !!target && (target.hold ? progress >= 1 : input.pressed)
  if (activate) { input.toggled = input.held = false; input.duration = 0 }
  input.pressed = false
  return { activate, progress }
}
