import type { Area } from '../../state/useMissionStore'
import { surfaceHeight } from './landscape.ts'
import { SHIP_EXIT } from '../missions/m0.ts'

export type Point = [number, number, number]
export const HAB_FLOOR = 1.26
export const BUNK_SHIFT_Z = .45
export const BUNK_Z = -.8 + BUNK_SHIFT_Z
// Infill overlaps the window frame; only the glazed aperture stays open.
export const WINDOW_INFILL = [
  { y: .525, z: -2, height: 1.05, width: 2 },
  { y: 2.105, z: -2, height: .99, width: 2 },
  { y: 1.33, z: -2.69, height: .56, width: .62 },
  { y: 1.33, z: -1.31, height: .56, width: .62 },
]
export const CHAMBER_FLOOR = -18
export const NOOK: Point = [2.8, HAB_FLOOR, -2]
export const OUTER_HATCH: Point = [-.1, 2.55, 6.4]

export function arrivalPose(area: Area, returning: boolean, ship = false): { foot: Point; facing: number } {
  if (area === 'airlock') return { foot: [.68, CHAMBER_FLOOR, -.55], facing: 2.32 }
  if (area === 'hab') return { foot: [0, HAB_FLOOR, returning ? 1.6 : .65], facing: 0 }
  if (ship) return { foot: [SHIP_EXIT[0], surfaceHeight(SHIP_EXIT[0], SHIP_EXIT[2]), SHIP_EXIT[2]], facing: Math.PI / 2 }
  return { foot: [-.1, surfaceHeight(-.1, 8.75), 8.75], facing: Math.PI }
}
