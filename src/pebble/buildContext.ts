import { useMissionStore } from '../state/useMissionStore'
import { jobLabels, loadNames } from '../game/world/stationModules'

const round = (n: number) => Number.isFinite(n) ? Number(n.toFixed(1)) : null

export function buildContext() {
  const { snapshot, area, prompt, currentCard } = useMissionStore.getState()
  if (!snapshot) return null
  const { state, mission, airSols, waterSols, nightHours, airlockSealed, solarKW } = snapshot
  const { power, air, water, food, env, rad, you, pebble, comms, clock } = state
  return {
    mission: mission ?? 'free play',
    area, location: you.location, nearbyAction: prompt?.label, airlockSealed,
    sol: clock.sol, minuteOfSol: clock.minute,
    batteryPercent: Math.round(power.batteryKWh / power.batteryCapKWh * 100),
    batteryKWh: round(power.batteryKWh),
    nightCoverageHoursAtCurrentLoad: round(nightHours),
    solarKW: round(solarKW), solarPanelDustPercent: Math.round(power.panelDust * 100),
    oxygenKg: round(air.o2Kg), airSols: round(airSols),
    waterLiters: round(water.liters), waterSols: round(waterSols),
    iceKg: round(water.iceKg), suitOxygenKg: round(you.suitO2Kg),
    foodSols: round(food.pantrySols),
    plantedCrops: food.trays.map(t => t.crop),
    outsideC: round(env.outsideC), dustStorm: env.stormPhase,
    radiationWeather: rad.weather, doseGamePoints: round(you.doseDP),
    earthDelayMinutesOneWay: round(comms.oneWayMin), earthLinkBlocked: comms.blackout,
    pebbleBatteryPercent: Math.round(pebble.batteryPct),
    pebbleJob: pebble.job ? jobLabels[pebble.job.kind] : null,
    pebbleRebooting: pebble.glitched, pebbleOnNightWatch: snapshot.nightWatch,
    powerLoads: power.priority.map(id => ({
      name: loadNames[id], switchedOn: power.on[id], demandKW: round(snapshot.loads[id]),
    })),
    pendingDecision: currentCard?.text,
    recentEvents: state.log.filter(e => e.kind !== 'command').slice(-6)
      .map(e => ({ sol: e.sol, text: e.text.slice(0, 180) })),
  }
}
