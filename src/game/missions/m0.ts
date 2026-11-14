import { LANDING_PAD_X } from '../world/siteLayout.ts'

export const M0_STAGES = ['orbit','earth','entry','arm','thrust','touchdown','signal','suit','seal','cycle','exit'] as const
export type LandingStage = typeof M0_STAGES[number]
export const landingDuration: Partial<Record<LandingStage, number>> = { orbit: 3, earth: 5, entry: 8, thrust: 8, touchdown: 2, signal: 3 }
export function nextLandingStage(stage: LandingStage) {
  return M0_STAGES[M0_STAGES.indexOf(stage) + 1] ?? stage
}
export const SHIP_EXIT = [LANDING_PAD_X - 7, 0, 5.8] as const
export const PEBBLE_ARRIVAL = [LANDING_PAD_X - 11, 6] as const
export const SHIP_ROUTE = [9, 6] as const
