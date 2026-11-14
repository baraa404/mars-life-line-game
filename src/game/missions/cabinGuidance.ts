import type { LandingStage } from './m0.ts'

export const CABIN_CONTROLS = {
  arm: [1.23, 1.54, .66],
  throttle: [-1.46, 1.8, .66],
  suit: [2, 1.9, -.8],
  hatch: [0, 2.05, -2.77],
  cycle: [.92, 2.05, -2.65],
} satisfies Record<string, [number, number, number]>

export function cabinObjective(stage: LandingStage, cycling: boolean) {
  switch (stage) {
    case 'arm': return { point: CABIN_CONTROLS.throttle, label: 'Descent throttle' }
    case 'suit': return { point: CABIN_CONTROLS.suit, label: 'Suit rack' }
    case 'seal': return { point: CABIN_CONTROLS.hatch, label: 'Hatch wheel' }
    case 'cycle': return cycling ? null : { point: CABIN_CONTROLS.cycle, label: 'Cycle lever' }
    case 'exit': return { point: CABIN_CONTROLS.hatch, label: 'Outer hatch' }
    default: return null
  }
}

/** Clockwise screen bearing: ahead is up; a target behind asks for a turn. */
export function cabinObjectiveBearing(dx: number, dz: number, lookX: number, lookZ: number) {
  const angle = Math.atan2(dx, -dz) - Math.atan2(lookX, -lookZ)
  return Math.atan2(Math.sin(angle), Math.cos(angle))
}
