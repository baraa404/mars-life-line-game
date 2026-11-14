import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { createInitialState, loadRecord } from '../sim/index.ts'
import { flows } from '../sim/story/story.ts'
import { useMissionStore } from '../state/useMissionStore.ts'
import { useStoryStore } from '../state/useStoryStore.ts'

/** Mission clock shown in the sky: the ten-minute mission spans one Martian afternoon. */
const START_MINUTE = 13 * 60
const GAME_MINUTES_PER_SECOND = .5

/**
 * Ticks the story with real seconds and fills the legacy snapshot that the world
 * (sky, lighting, battery lamps, PEBBLE) already reads.
 */
export function StoryBridge({ fromShip }: { fromShip: boolean }) {
  const last = useRef('')
  useEffect(() => {
    const story = useStoryStore.getState()
    if (!story.state) story.load()
    const s = useStoryStore.getState().state
    const area = fromShip || !s?.inHab ? 'outside' : 'hab'
    useMissionStore.setState(m => ({ area, arrival: m.arrival + 1, arrivalSpot: null, shipArrival: area === 'outside' && fromShip, openPanel: null, panelHistory: [], fading: false, airlockCycle: null }))
  }, [fromShip])

  useFrame((_, delta) => {
    const ui = useMissionStore.getState(), story = useStoryStore.getState()
    if (ui.commands.length) useMissionStore.setState({ commands: [] })
    if (!story.state) return
    if (!ui.paused && ui.openPanel !== 'pause') story.tick(Math.min(delta, .1))
    const s = useStoryStore.getState().state!
    const minute = Math.floor(START_MINUTE + s.time * GAME_MINUTES_PER_SECOND)
    const dust = s.panelDust.reduce((a, b) => a + b, 0) / s.panelDust.length
    const key = [minute, Math.round(s.power), dust.toFixed(2), Math.round(s.oxygen), Math.round(s.water), Math.floor(s.food), Math.round(s.dose), s.scene, s.storm > 0, ui.area].join('|')
    if (key === last.current) return
    last.current = key
    const state = createInitialState(2026)
    state.clock = { sol: 1, minute, sleeping: false }
    state.env.tau = Math.max(.5, 1.6 - s.time / 120)
    state.env.stormPhase = 'none'
    state.power.batteryCapKWh = 100
    state.power.batteryKWh = s.power
    state.power.panelDust = dust
    state.air.o2Kg = s.oxygen / 100 * 8
    state.water.liters = s.water
    state.food.pantrySols = s.food
    state.you.doseDP = s.dose
    state.you.location = ui.area === 'hab' ? 'hab' : 'outside'
    state.you.suitO2Kg = .5
    state.rad.weather = s.scene === 6 && s.storm <= 0 && !s.allClear ? 'sep' : 'quiet'
    useMissionStore.setState({
      snapshot: {
        state, airSols: s.oxygen / 10, waterSols: s.water / 9, nightHours: 12, nightWatch: false, airlockSealed: true,
        loads: loadRecord(0), solarKW: flows(s).solar, fastForward: false, mission: 'm0-complete',
      },
    })
  }, -30)
  return null
}
