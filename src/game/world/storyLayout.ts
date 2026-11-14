import type { Spot } from '../../sim/story/story.ts'
import { HAB_FLOOR, OUTER_HATCH, type Point } from './habLayout.ts'
import { placementPoint, SITE, STATION_INTERACTION_POINTS, STATION_POINTS } from './siteLayout.ts'

/** World positions for the "Mission Critical" story. Local frames: +X is each model's front. */
export const RECYCLER_PLACEMENT = SITE.find(p => p.id === 'recycler')!
const recycler = (local: readonly [number, number, number]) => placementPoint('recycler', local)
const greenhouse = (local: readonly [number, number, number]) => placementPoint('greenhouse', local)

/** Greenhouse interior: floor slab top, tray soil anchors (local), and the dome's walkable radius. */
export const GREENHOUSE_FLOOR = .48
export const GREENHOUSE_RADIUS = 2.75
export const GREENHOUSE_CENTER = greenhouse([0, 0, 0])
export const TRAY_LOCAL: { at: Point; yaw: number }[] = [
  { at: [-1.2, .86, 0], yaw: 180 },
  { at: [.35, .86, 1.4], yaw: -45 },
  { at: [.35, .86, -1.4], yaw: 45 },
]
export const GH_CONTROL_LOCAL: Point = [1.55, GREENHOUSE_FLOOR, 2.1]
export const GH_BOARD_LOCAL: Point = [1.55, GREENHOUSE_FLOOR, -2.1]
/** Board lever order, left to right as the player faces it. */
export const LEVERS = ['survival', 'balanced', 'farming', 'emergency'] as const
export const LEVER_SPACING = .24

/** Faces the room centre from a local point (rotation about Y, radians). */
export const faceCentre = (local: Point) => Math.atan2(local[2], -local[0])

export const STORY_POINTS = {
  terminal: [0, HAB_FLOOR + 1.25, -2.3] as Point,
  habBoard: [1.45, HAB_FLOOR + 1.3, -2.86] as Point,
  panels: STATION_INTERACTION_POINTS.solar,
  breaker: [15.5, 1.15, -13.45] as Point,
  breakerBase: [15.5, 0, -13.6] as Point,
  filterRack: [-3.35, .95, 13.1] as Point,
  recyclerSocket: recycler([.8, 1.0, .25]),
  recyclerLever: recycler([.95, 1.0, -.55]),
  recyclerLeverBase: recycler([.95, 0, -.55]),
  oxygen: STATION_INTERACTION_POINTS.oxygen[0],
  greenhouseDoorOut: greenhouse([3.7, 1.3, 0]),
  greenhouseDoorIn: greenhouse([2.35, 1.5, 0]),
  greenhouseInside: greenhouse([1.7, GREENHOUSE_FLOOR, 0]),
  greenhouseOutside: greenhouse([4.7, 0, 0]),
  ghValve: greenhouse([GH_CONTROL_LOCAL[0], 1.25, GH_CONTROL_LOCAL[2]]),
  ghLights: greenhouse([GH_CONTROL_LOCAL[0], 1.65, GH_CONTROL_LOCAL[2]]),
  ghBoard: greenhouse([GH_BOARD_LOCAL[0], 1.35, GH_BOARD_LOCAL[2]]),
  trays: TRAY_LOCAL.map(t => greenhouse(t.at)),
  shelter: STATION_INTERACTION_POINTS.shelter[0],
}

/** Where markers float and where PEBBLE drives, for each story spot (outdoor ground points). */
export const SPOT_POINTS: Record<Spot, { at: Point; inside?: 'hab' | 'greenhouse' }> = {
  hab: { at: OUTER_HATCH },
  terminal: { at: STORY_POINTS.terminal, inside: 'hab' },
  'hab-board': { at: STORY_POINTS.habBoard, inside: 'hab' },
  panels: { at: [25, 1.4, -5.6] },
  battery: { at: STORY_POINTS.breaker },
  crates: { at: STORY_POINTS.filterRack },
  recycler: { at: STORY_POINTS.recyclerSocket },
  oxygen: { at: STATION_POINTS.oxygen },
  greenhouse: { at: STORY_POINTS.greenhouseDoorOut },
  'gh-valve': { at: STORY_POINTS.ghValve, inside: 'greenhouse' },
  'gh-lights': { at: STORY_POINTS.ghLights, inside: 'greenhouse' },
  'gh-board': { at: STORY_POINTS.ghBoard, inside: 'greenhouse' },
  trays: { at: STORY_POINTS.trays[0], inside: 'greenhouse' },
  shelter: { at: STATION_POINTS.shelter },
}
