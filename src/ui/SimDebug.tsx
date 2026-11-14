import { useMissionStore } from '../state/useMissionStore'
import { useWorldStore } from '../state/useWorldStore'
import { LOAD_IDS, status } from '../sim/index.ts'
import './SimDebug.css'
const fmt = (value: number, digits = 1) => Number.isFinite(value) ? value.toFixed(digits) : '∞'
/** Developer diagnostics only; gameplay HUD and decision-card presentation are Phase 3. */
export default function SimDebug() {
  const { debug, preview, setPreview, siteView, setSiteView, renderStats } = useWorldStore()
  const { snapshot, currentCard, paused, openPanel, events, send, setPaused, setPanel } = useMissionStore()
  if (!debug || !snapshot) return null
  const { state: s } = snapshot
  const clock = `${String(Math.floor(s.clock.minute / 60)).padStart(2, '0')}:${String(s.clock.minute % 60).padStart(2, '0')}`
  return <aside className="sim-debug" aria-label="Simulation debug" onPointerDown={() => { if (document.pointerLockElement) void document.exitPointerLock() }}>
    <h2>Simulation · Sol {s.clock.sol} · {clock}</h2>
    <p>{paused || openPanel || currentCard ? 'Paused' : '60× · 1 Mars minute / second'} · {s.you.location}</p>
    <details><summary>World review · preview only</summary>
      <label>Lighting <select value={preview} onChange={e => setPreview(e.target.value as typeof preview)}>
        {['live', 'day', 'dusk', 'night', 'storm'].map(v => <option key={v}>{v}</option>)}
      </select></label>
      <label>Visit <select value={siteView} onChange={e => setSiteView(e.target.value as typeof siteView)}>
        {['base', 'array', 'ship', 'greenhouse', 'ice'].map(v => <option key={v}>{v}</option>)}
      </select></label>
      {renderStats && <p>{renderStats.calls} draw calls · {renderStats.triangles.toLocaleString()} triangles · {renderStats.fps} fps · position {renderStats.x.toFixed(1)}, {renderStats.z.toFixed(1)}</p>}
    </details>
    <dl>
      <dt>Power</dt><dd>{fmt(s.power.batteryKWh)} / 80 kWh · night {fmt(snapshot.nightHours)} h</dd>
      <dt>Air</dt><dd>{status(snapshot.airSols).shape} {status(snapshot.airSols).text} · {fmt(snapshot.airSols)} sols ({fmt(s.air.o2Kg, 2)} kg)</dd>
      <dt>Water</dt><dd>{status(snapshot.waterSols).shape} {status(snapshot.waterSols).text} · {fmt(snapshot.waterSols)} sols ({fmt(s.water.liters)} L)</dd>
      <dt>Food</dt><dd>{fmt(s.food.pantrySols)} sols · trays {s.food.trays.map(t => `${t.crop ?? 'empty'} ${fmt(t.growth * 100, 0)}%`).join(' / ')}</dd>
      <dt>Radiation</dt><dd>{fmt(s.you.doseDP, 2)} DP · {s.rad.weather}</dd>
      <dt>You</dt><dd>energy {s.you.energy} · health {s.you.health} · spirit {s.you.spirit} · suit {fmt(s.you.suitO2Kg, 2)} kg</dd>
      <dt>PEBBLE</dt><dd>{fmt(s.pebble.batteryPct, 0)}% · {s.pebble.job?.kind ?? 'idle'} · watch {snapshot.nightWatch ? 'on' : 'off'}</dd>
      <dt>Earth</dt><dd>{s.comms.blackout ? 'Blackout' : `${fmt(s.comms.oneWayMin)} min each way`} · inbox {s.comms.inbox.length}</dd>
      <dt>Weather</dt><dd>{fmt(s.env.outsideC)} °C · τ {fmt(s.env.tau)} · {s.env.stormPhase}</dd>
      <dt>Maintenance</dt><dd>scrubber {fmt(s.air.scrubberLife * 100, 0)}% · CO₂ {fmt(s.air.co2, 2)} · filter {fmt(s.water.filterLife * 100, 0)}%</dd>
    </dl>
    <div className="sim-actions">
      <button onClick={() => setPaused(!paused)}>{paused ? 'Resume' : 'Pause'}</button>
      <button onClick={() => setPanel(openPanel ? null : 'debug-plan')}>{openPanel ? 'Close planning panel' : 'Open planning panel'}</button>
      <button disabled={!!currentCard || paused || !!openPanel} onClick={() => send({ type: 'sleep' })}>Sleep</button>
      {[1, 2, 4].map(hours => <button key={hours} disabled={!!currentCard || paused || !!openPanel} onClick={() => send({ type: 'wait', hours: hours as 1 | 2 | 4 })}>Wait {hours}h</button>)}
    </div>
    {currentCard && <section aria-label="Pending decision"><h3>{currentCard.text}</h3>{currentCard.options.map(o => <button key={o.id} onClick={() => send({ type: 'choose', cardId: currentCard.id, optionId: o.id })}>{o.label}</button>)}</section>}
    <details><summary>Loads · first priority sheds last</summary>{LOAD_IDS.map(id => <label key={id}>
      <input type="checkbox" checked={s.power.on[id]} disabled={id === 'lifeSupport' || !!currentCard} onChange={e => send({ type: 'toggleLoad', load: id, on: e.target.checked })} />{id}
    </label>)}</details>
    <details><summary>Recent events</summary><ul>{s.log.slice(-6).map(e => <li key={e.id}>Sol {e.sol}: {e.text}</li>)}{events.slice(-3).map((e, i) => <li key={`notice-${i}`}>{e.text}</li>)}</ul></details>
  </aside>
}
