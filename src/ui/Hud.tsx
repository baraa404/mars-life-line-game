import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { status } from '../sim/index'
import { useMissionStore } from '../state/useMissionStore'
import { palette } from '../style/tokens'
import { batteryLevel, Clock, Icon, MissionPanels, sleepAllowed, Status } from './MissionPanels'
import { PebbleChat } from './PebbleChat'
import { airlockGuidance } from '../game/interaction/airlock'
import { ViewTransition } from './ViewTransition'
import './Hud.css'

const colors = Object.fromEntries(Object.entries(palette).map(([name, color]) => ['--' + name, color]))
const format = (value: number, digits = 1) => Number.isFinite(value) ? value.toFixed(digits) : '∞'

function useTrends(values: number[]) {
  const previous = useRef(values)
  const [trends, setTrends] = useState(['→', '→', '→'])
  const [power, air, water] = values
  useEffect(() => {
    const now = [power, air, water]
    const last = previous.current
    setTrends(current => {
      const next = now.map((value, i) => Math.abs(value - last[i]) < .00001 || value === last[i] ? current[i] : value > last[i] ? '↑' : '↓')
      return next.some((trend, i) => trend !== current[i]) ? next : current
    })
    previous.current = now
  }, [power, air, water])
  return trends
}

export function Hud() {
  const s = useMissionStore(u => u.snapshot)
  const area = useMissionStore(u => u.area)
  const airlock = useMissionStore(u => u.airlockStatus)
  const view = useMissionStore(u => u.view)
  const settings = useMissionStore(u => u.settings)
  const prompt = useMissionStore(u => u.prompt)
  const fading = useMissionStore(u => u.fading)
  const captureHint = useMissionStore(u => u.captureHint)
  const speech = useMissionStore(u => u.speech)
  const panel = useMissionStore(u => u.openPanel)
  const currentCard = useMissionStore(u => u.currentCard)
  const decisionOpen = useMissionStore(u => u.decisionOpen)
  const power = s ? s.state.power.batteryKWh / s.state.power.batteryCapKWh : 0
  const trends = useTrends([power, s?.airSols ?? 0, s?.waterSols ?? 0])
  const theme = { ...colors, fontSize: settings.textSize / 100 + 'rem' } as CSSProperties
  if (!s) return <div className="hud" style={theme}><p className="hud-panel loading" role="status">Loading Life Line Station…</p></div>
  const state = s.state, station = view === 'station'
  const chamber = airlockGuidance(airlock.origin, airlock.pressure, airlock.cycling)
  const dose = state.you.doseDP
  const objective = s.mission === 'm0-walk' ? area === 'airlock' ? 'Cycle the hab airlock' : area === 'hab' ? 'Wake the station' : 'Follow PEBBLE to the hab'
    : s.mission === 'm0-night' ? state.clock.minute < 1020 ? 'Get ready for your first night' : 'Return to first person and sleep in the bunk' : null
  const gauges = [
    { id: 'power', name: 'Power', value: Math.round(power * 100) + '%', max: 1, amount: power, level: batteryLevel(s),
      units: state.power.batteryKWh.toFixed(1) + ' kWh', sub: 'Night covered · ' + format(s.nightHours) + ' h' },
    { id: 'air', name: 'Air', value: format(s.airSols) + ' sols', max: 12, amount: s.airSols, level: status(s.airSols).level,
      units: state.air.o2Kg.toFixed(2) + ' kg of oxygen' },
    { id: 'water', name: 'Water', value: format(s.waterSols) + ' sols', max: 12, amount: s.waterSols, level: status(s.waterSols).level,
      units: state.water.liters.toFixed(1) + ' L' },
  ]
  const chips = [
    { id: 'food', name: 'Food', reading: format(state.food.pantrySols, 0) + ' sols', level: status(state.food.pantrySols).level },
    { id: 'radiation', name: 'Sun', reading: state.rad.weather === 'quiet' ? 'Quiet' : state.rad.weather === 'sep' ? 'Particle storm' : 'Flare', level: state.rad.weather === 'sep' ? 2 : state.rad.weather === 'flare' ? 1 : 0 },
    { id: 'earth-link', name: 'Earth', reading: state.comms.blackout ? 'Link blocked' : format(state.comms.oneWayMin) + ' min', level: state.comms.blackout ? 1 : 0 },
    { id: 'you', name: 'You', reading: state.you.energy <= 1 ? 'Tired' : 'Energy ' + state.you.energy + '/3', level: state.you.energy === 0 ? 2 : state.you.energy === 1 ? 1 : 0 },
    { id: 'pebble', name: 'PEBBLE', reading: state.pebble.glitched ? 'Rebooting' : Math.round(state.pebble.batteryPct) + '%', level: state.pebble.glitched || state.pebble.batteryPct === 0 ? 2 : state.pebble.batteryPct < 20 ? 1 : 0 },
  ]
  return <main className={'hud' + (area === 'airlock' ? ' in-airlock' : '') + (settings.reducedMotion ? ' reduced-motion' : '')} style={theme} aria-label="Station controls">
    {area === 'outside' && !station && <div className="helmet" aria-hidden="true" />}
    <div className="hud-readouts">
      <section className="hud-panel readout-tray gauges" aria-label="Life support gauges">
        {gauges.map((gauge, i) => <div key={gauge.id} className="gauge" aria-label={gauge.name + ": " + gauge.units}>
          <span className="readout-heading"><span className="readout-label"><Icon name={gauge.id} />{gauge.name}</span>
            <span className="gauge-value">{gauge.value} <span className="trend" aria-label={trends[i] === '↑' ? 'rising' : trends[i] === '↓' ? 'falling' : 'steady'}>{trends[i]}</span></span></span>
          <meter min={0} max={gauge.max} value={Math.min(gauge.max, gauge.amount)} aria-label={gauge.name} />
          <span className="gauge-sub"><Status level={gauge.level} />{gauge.sub && <span>{gauge.sub}</span>}</span>
        </div>)}
      </section>
      <div className="hud-right">
        <section className="hud-panel readout-tray" aria-label="Mars clock">
          <div className="clock">
            <span className="clock-light" role="img" aria-label={state.clock.minute >= 360 && state.clock.minute < 1080 ? 'Daylight' : 'Night'}>{state.clock.minute >= 360 && state.clock.minute < 1080 ? '☀' : '☾'}</span>
            <span>Sol {state.clock.sol}</span>
            {sleepAllowed(s, area) && <span className="sleep-ready" role="img" aria-label="Sleep is available" title="Sleep is available"><Icon name="sleep" /></span>}
            <strong><Clock minute={state.clock.minute} /></strong>
          </div>
        </section>
        <section className="hud-panel readout-tray chips" aria-label="Station status">
          {chips.map(chip => <div key={chip.id} className="chip">
            <span className="readout-label"><Icon name={chip.id} />{chip.name}</span>
            <span className="chip-reading">{chip.reading}</span><Status level={chip.level} />
          </div>)}
          <div className="chip dose-chip">
            <span className="readout-label"><Icon name="radiation" />Dose</span>
            <span className="chip-reading">{dose.toFixed(1)} DP</span><Status level={dose >= 70 ? 2 : dose >= 50 ? 1 : 0} />
            <meter min={0} max={100} value={dose} aria-label="Radiation dose" />
          </div>
        </section>
      </div>
    </div>
    {!station && !panel && !decisionOpen && !fading && <div className="center-dot" aria-hidden="true" />}
    {objective && <div className="hud-panel touchdown-objective">{objective}</div>}
    <div className="center-status">
      {area === 'airlock' && <div id="chamber-status" className="hud-panel chamber-status">
        <strong>Airlock → {chamber.destination === 'hab' ? 'HAB · Indoor air' : 'MARS · Outside'}</strong>
        <span>{chamber.air} · {Math.round(airlock.pressure * 100)}% pressure</span>
        <meter min={0} max={1} value={airlock.pressure} aria-label="Chamber air pressure" />
        <div className="airlock-door-status">
          <span className={chamber.innerReady ? 'ready' : ''}>HAB · {chamber.innerReady ? 'READY' : 'LOCKED'}</span>
          <span className={chamber.outerReady ? 'ready' : ''}>MARS · {chamber.outerReady ? 'READY' : 'LOCKED'}</span>
        </div>
        <p role="status">{chamber.instruction}</p>
        <small>Look at the labelled control · Hold E to use · F selects nearby controls</small>
        {airlock.message && <small>{airlock.message}</small>}
      </div>}
      {!panel && !decisionOpen && !fading && prompt && <div className="hud-panel interaction-prompt">
        <span className="hold-ring" aria-hidden="true"><kbd>E</kbd></span>
        <span>{prompt.label}{prompt.hold && <small>{settings.toggleHold ? 'Tap to start' : 'Hold to use'}</small>}</span>
      </div>}
    </div>
    {area === 'outside' && !station && <div className="hud-panel suit-air">
      <span className="inline-icon"><Icon name="air" />Suit air · {Math.round(state.you.suitO2Kg / .5 * 100)}%</span>
      <meter min={0} max={.5} value={state.you.suitO2Kg} aria-label="Suit oxygen" />
    </div>}
    <div className="hud-dock">
    <PebbleChat speech={speech} visible={!decisionOpen && !fading && !state.clock.sleeping && (!panel || panel === 'pebble-chat')} />
    {!panel && !decisionOpen && !fading && !state.clock.sleeping && <section className="hud-panel input-help" aria-label="Controls and shortcuts">
      <div className="control-hints">
        {station ? <span><kbd>M</kbd> / <kbd>Esc</kbd> First person</span> : <>
          <span><kbd>WASD</kbd> Walk</span>
          <span><kbd>Shift</kbd> Run</span>
          <span><kbd>Space</kbd> Jump</span>
          <span><kbd>V</kbd> Mouse look · <kbd>IJKL</kbd> Look</span>
          <span><kbd>E</kbd> {settings.toggleHold ? 'Tap to use' : 'Hold to use'}</span>
          <span><kbd>F</kbd> Find nearby controls</span>
          <span><kbd>M</kbd> Isometric view</span>
        </>}
      </div>
      <nav className="hud-tools" aria-label="Game shortcuts">
        <button onClick={() => useMissionStore.getState().askHint()}>Hint</button>
        <button onClick={() => useMissionStore.getState().setPanel('pause')}><kbd>P</kbd> Pause</button>
      </nav>
      {!station && captureHint && <p className="capture-hint" role="status">{captureHint}</p>}
    </section>}
    {currentCard && !decisionOpen && <div className="hud-panel pending-decision" role="status">PEBBLE has a decision · Approach PEBBLE or a data terminal and press E</div>}
    </div>
    <ViewTransition />
    <div className={'scene-fade' + (fading ? ' active' : '')} aria-hidden="true" />
    {state.clock.sleeping && !currentCard && <div className="sleep-overlay">
      <div className="hud-panel"><span className="inline-icon"><Icon name="sleep" />Sleeping</span>
        <strong>Sol {state.clock.sol} · <Clock minute={state.clock.minute} /></strong>
        <svg viewBox="0 0 180 40" role="img" aria-label="Battery charge during sleep">
          <polyline fill="none" stroke="var(--accent-cyan)" strokeWidth="2"
            points={(s.sleepSamples ?? []).map((sample, i, points) => (i / Math.max(1, points.length - 1) * 180) + ',' + (40 - sample.kWh / state.power.batteryCapKWh * 38)).join(' ')} />
        </svg>
      </div>
    </div>}
    <MissionPanels s={s} />
  </main>
}
