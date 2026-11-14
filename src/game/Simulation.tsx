import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { SimRunner, airSols, nightCovered, waterSols, type StoragePort } from '../sim/index.ts'
import { demand } from '../sim/loads.ts'
import { solarKW } from '../sim/power.ts'
import { useMissionStore, type Recovery } from '../state/useMissionStore.ts'

function checkpointIndex(sim: SimRunner, kind: Recovery) {
  return sim.checkpoints.findLastIndex(checkpoint => checkpoint.before === kind)
}

export const TOUCHDOWN_SAVE = 'marslifeline.touchdown.v2'

export function Simulation({ touchdown }: { touchdown: boolean }) {
  const runner = useRef<SimRunner | null>(null)
  const elapsed = useRef(.25)
  const sleepBudget = useRef(0)
  useEffect(() => {
    let storage: StoragePort | undefined
    try {
      const local = window.localStorage
      storage = touchdown ? { getItem: () => local.getItem(TOUCHDOWN_SAVE), setItem: (_, value) => local.setItem(TOUCHDOWN_SAVE, value) } : local
    } catch { /* Private browsing may deny access. */ }
    const sim = new SimRunner(2026, { storage, restore: true })
    if (touchdown && !sim.runtime.mission) {
      sim.enqueue({ type: 'm0Land' })
      sim.enqueue({ type: 'setLocation', location: 'outside' })
      sim.tick()
      sim.save()
    }
    runner.current = sim
    const area = sim.state.you.location === 'hab' ? 'hab' : 'outside'
    if (!sim.runtime.airlockSealed) sim.enqueue({ type: 'setAirlock', sealed: true })
    useMissionStore.setState(s => ({ area, arrival: s.arrival + 1, shipArrival: sim.runtime.mission === 'm0-walk' && area === 'outside' }))
    useMissionStore.setState({ decisionOpen: false, openPanel: null, panelHistory: [] })
    return () => { runner.current = null }
  }, [touchdown])
  useFrame((_frame, delta) => {
    const sim = runner.current
    if (!sim) return
    const ui = useMissionStore.getState()
    if (ui.recovery) {
      const index = checkpointIndex(sim, ui.recovery)
      if (index >= 0) {
        sim.rewind(index)
        useMissionStore.setState({ area: sim.state.you.location === 'hab' ? 'hab' : 'outside', arrival: ui.arrival + 1,
          paused: false, openPanel: null, currentCard: null, decisionOpen: false, panelHistory: [], fading: false })
        elapsed.current = .25
      }
      useMissionStore.setState({ recovery: null, commands: [] })
    }
    sim.paused = !sim.runtime.card && (ui.paused || ui.openPanel !== null)
    if (!ui.recovery) for (const command of ui.commands) sim.enqueue(command)
    if (ui.commands.length) useMissionStore.setState({ commands: [] })
    if (sim.runtime.fastForward?.kind === 'sleep' && !ui.settings.reducedMotion && !sim.paused) {
      sleepBudget.current += Math.min(delta, 1) * 210
      const steps = Math.floor(sleepBudget.current)
      sleepBudget.current -= sim.update(delta, steps)
    } else {
      sleepBudget.current = 0
      const timeScale = sim.runtime.mission === 'm0-night' && !sim.runtime.fastForward ? 2 : 1
      sim.update(delta * timeScale, ui.settings.reducedMotion ? 2000 : 20)
    }
    elapsed.current += delta
    const cardChanged = ui.currentCard?.id !== sim.runtime.card?.id
    if (elapsed.current < .25 && !cardChanged && !sim.runtime.notices.length) return
    elapsed.current %= .25
    const notices = sim.runtime.notices.splice(0)
    const needsRecovery = notices.some(event => event.kind === 'returnToShip')
    const woke = notices.some(event => event.kind === 'wokeUp')
    const truth = notices.find(event => event.kind === 'marsTruth')
    const feedback = notices.find(event => event.kind === 'evaBlocked' || event.kind === 'saveError')
    useMissionStore.setState({
      snapshot: { state: structuredClone(sim.state), waterSols: waterSols(sim.state, sim.runtime),
        airSols: airSols(sim.state), nightHours: nightCovered(sim.state, sim.runtime), nightWatch: sim.runtime.nightWatch,
        airlockSealed: sim.runtime.airlockSealed, loads: demand(sim.state, sim.runtime), solarKW: solarKW(sim.state),
        fastForward: !!sim.runtime.fastForward, pebbleTravel: sim.runtime.pebbleTravel, sleepSamples: structuredClone(sim.runtime.sleepHistory?.samples),
        wakeReport: structuredClone(sim.runtime.wakeReport), mission: sim.runtime.mission },
      currentCard: sim.runtime.card ? structuredClone(sim.runtime.card) : null,
      ...(cardChanged ? { decisionOpen: false, cardOrigin: null } : {}),
      events: [...ui.events, ...notices].slice(-20),
      recoveryAvailable: { sleep: checkpointIndex(sim, 'sleep') >= 0, decision: checkpointIndex(sim, 'decision') >= 0 },
      ...(needsRecovery ? { openPanel: 'recovery', panelHistory: [] } : woke ? { speech: 'Wake report ready at the data terminal.' } : {}),
      ...(truth || feedback ? { speech: (truth ?? feedback)!.text } : {}),
    })
  }, -30)
  return null
}
