import { publicUrl } from '../publicUrl'
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { LoadId, PebbleJob } from '../sim/index'
import { canSleep } from '../sim/time'
import { loadNames, loadPurpose, jobLabels, jobTargets, stationModules } from '../game/world/stationModules'
import { moduleKW, moduleStatus, selectModule } from '../game/world/StationOverlays'
import { useMissionStore, type MissionSnapshot } from '../state/useMissionStore'

export function Icon({ name }: { name: string }) {
  return <img className="system-icon" src={publicUrl('/ui/icons/') + name + '.svg'} alt="" />
}
export function Clock({ minute }: { minute: number }) {
  return <>{String(Math.floor(minute / 60)).padStart(2, '0')}:{String(minute % 60).padStart(2, '0')}</>
}
export function Status({ level }: { level: number }) {
  return <span className={'status level-' + Math.min(level, 2)}>{level >= 2 ? '■ Act' : level === 1 ? '▲ Watch' : '● OK'}</span>
}
export function batteryLevel(s: MissionSnapshot) {
  const ratio = s.state.power.batteryKWh / s.state.power.batteryCapKWh
  return ratio < .15 ? 2 : ratio < .35 ? 1 : 0
}
export function sleepAllowed(s: MissionSnapshot, area: string) {
  return s.mission !== 'm0-walk' && s.mission !== 'm0-choice' && area === 'hab' && canSleep(s.state, s.airlockSealed)
}

function Modal({ title, children, dismiss = true, className = '', style }: {
  title: string; children: ReactNode; dismiss?: boolean; className?: string; style?: CSSProperties
}) {
  const station = useMissionStore(s => s.view === 'station')
  const dialog = useRef<HTMLDialogElement>(null)
  const label = useId()
  useEffect(() => {
    const node = dialog.current!
    const previous = document.activeElement
    node.showModal()
    node.querySelector('h2')?.focus({ preventScroll: true })
    return () => {
      node.close()
      if (previous instanceof HTMLElement && previous !== document.body && previous.isConnected) previous.focus({ preventScroll: true })
      else document.querySelector('canvas')?.focus({ preventScroll: true })
    }
  }, [])
  return <dialog ref={dialog} className={'mission-dialog ' + className} aria-labelledby={label} style={style}
    onCancel={event => event.preventDefault()}>
    <header><h2 id={label} tabIndex={-1}>{title}</h2>
      {dismiss && (station ? <button className="close-panel" onClick={() => useMissionStore.getState().backPanel()}>Close</button> : <span>Back <kbd>Esc</kbd></span>)}
    </header>
    <div className="dialog-content">{children}</div>
  </dialog>
}

function LoadControls({ id, s }: { id: LoadId; s: MissionSnapshot }) {
  const send = useMissionStore(u => u.send)
  const power = s.state.power, level = power.level[id] ?? 1
  const fixed = ['lifeSupport', 'dish', 'roverCharge', 'pebbleCharge', 'shelterPump'].includes(id)
  const [preview, setPreview] = useState<number | null>(null)
  const [requested, setRequested] = useState<boolean | null>(null)
  return <section className="load-control">
    <p>{loadPurpose[id]}</p>
    <p><strong>{s.loads[id].toFixed(2)} kW</strong> · Priority {power.priority.indexOf(id) + 1}</p>
    <label><input type="checkbox" checked={requested ?? power.on[id]} disabled={id === 'lifeSupport'}
      onChange={e => {
        setRequested(e.target.checked)
        send({ type: 'toggleLoad', load: id, on: e.target.checked })
      }} /> {loadNames[id]} on</label>
    {id === 'lifeSupport' && <p>Life Support stays first. It keeps your air safe.</p>}
    {!fixed && <label>Power level · {Math.round((preview ?? level) * 100)}%
      <input type="range" min="0" max="1" step=".05" value={preview ?? level} onChange={e => {
        const value = Number(e.target.value)
        setPreview(value)
        send({ type: 'setLevel', load: id, level: value })
      }} />
    </label>}
    {(requested !== null || preview !== null) && <p role="status">Changes apply when time resumes.</p>}
    <details><summary>Why does this matter?</summary><p>{loadPurpose[id]} Turning it down can save battery power.</p></details>
  </section>
}

function Priorities({ s }: { s: MissionSnapshot }) {
  const [draft, setDraft] = useState<LoadId[]>(s.state.power.priority)
  const send = useMissionStore(u => u.send)
  function move(from: LoadId, to: LoadId) {
    if (from === 'lifeSupport' || to === 'lifeSupport' || from === to) return
    const next = [...draft], start = next.indexOf(from), end = next.indexOf(to)
    next.splice(start, 1)
    next.splice(end, 0, from)
    setDraft(next)
  }
  return <>
    <p>Machines near the bottom turn off first when power runs low.</p>
    <ol className="priority-list">{draft.map((id, index) => <li key={id}>
      <strong>{loadNames[id]}</strong>
      {index === 0 ? <span>Locked · Keeps your air safe</span> : <span className="button-row">
        <button disabled={index <= 1} onClick={() => move(id, draft[index - 1])} aria-label={'Move ' + loadNames[id] + ' up'}>↑</button>
        <button disabled={index === draft.length - 1} onClick={() => move(id, draft[index + 1])} aria-label={'Move ' + loadNames[id] + ' down'}>↓</button>
      </span>}
    </li>)}</ol>
    <button className="primary" onClick={() => { send({ type: 'setPriority', priority: draft }); useMissionStore.getState().setPanel(null) }}>Apply priorities</button>
  </>
}

function WhyChain({ events }: { events: MissionSnapshot['state']['log'] }) {
  const visible = events.filter(event => event.kind !== 'command').slice(-40).reverse()
  return visible.length ? <ol className="why-chain">{visible.map(event => <li key={event.id}>
    <span aria-hidden="true">●</span><div><small>Sol {event.sol} · <Clock minute={event.minute} /></small><p>{event.text}</p>
      {event.causeIds.length > 0 && <details><summary>Why?</summary>
        <ul>{event.causeIds.map(id => <li key={id}>{events.find(cause => cause.id === id)?.text ?? 'Earlier station event'}</li>)}</ul>
      </details>}
    </div>
  </li>)}</ol> : <p>PEBBLE will save station events here.</p>
}

function Wake({ s }: { s: MissionSnapshot }) {
  const report = s.wakeReport
  if (!report) return <p>Sleep in the bunk to get your first report.</p>
  const { samples, events, messages } = report
  const first = samples[0], last = samples.at(-1)!
  const cap = s.state.power.batteryCapKWh
  const coords = samples.map(point => ((point.at - first.at) / Math.max(1, last.at - first.at) * 288 + 16) + ',' + (110 - point.kWh / cap * 96)).join(' ')
  return <>
    {s.mission === 'm0-complete' && <p><strong>Touchdown complete.</strong> Life Line Station is awake.</p>}
    <p>{report.interrupted ? 'PEBBLE woke you for a decision.' : 'You finished your rest.'}</p>
    <figure className="battery-graph">
      <svg viewBox="0 0 320 126" role="img" aria-label="Battery charge over sleep">
        <path d="M16 14V110H304" fill="none" stroke="currentColor" opacity=".4" />
        <polyline points={coords} fill="none" stroke="var(--accent-cyan)" strokeWidth="3" strokeLinejoin="round" />
      </svg>
      <figcaption>{first.kWh.toFixed(1)} → {last.kWh.toFixed(1)} kWh · {Math.round(last.at - first.at)} Mars minutes</figcaption>
    </figure>
    <h3>What happened while you slept</h3>
    <WhyChain events={events} />
    <h3>Earth messages</h3>
    {messages.length ? <ul>{messages.map(message => <li key={message.id}>{message.text}</li>)}</ul> : <p>No new replies.</p>}
    <button onClick={() => useMissionStore.getState().setPanel('why')}>Open the Why Chain</button>
  </>
}

function Decision() {
  const card = useMissionStore(u => u.currentCard)!
  const nearby = useMissionStore(u => u.pebbleNearby)
  const origin = useMissionStore(u => u.cardOrigin)
  const send = useMissionStore(u => u.send)
  const [later, setLater] = useState(false)
  const style = origin ? { '--card-x': origin[0] + 'vw', '--card-y': origin[1] + 'vh' } as CSSProperties : undefined
  return <Modal title={nearby ? 'PEBBLE' : 'PEBBLE on your Data Pad'} dismiss={false} style={style}
    className={'decision-dialog ' + (nearby ? 'pebble-delivery' : '')}>
    <div className="decision-face"><img src={publicUrl('/ui/pebble-faces/neutral.svg')} alt="" /></div>
    <p className="decision-question">{card.text}</p>
    {card.details && <p>{card.details.info}</p>}
    <div className="option-grid">{card.options.map(option => <button key={option.id} className="decision-option"
      onClick={() => send({ type: 'choose', cardId: card.id, optionId: option.id })}>
      <strong>{option.label}</strong>
      {option.systems && <span className="option-icons">{option.systems.map(icon => <Icon key={icon} name={icon} />)}</span>}
      {option.benefit && <span><b>You get</b> {option.benefit}</span>}
      {option.cost && <span><b>You give up</b> {option.cost}</span>}
      {later && <span>{option.later} {option.recovery}</span>}
    </button>)}</div>
    <button className="later-button" aria-expanded={later} onClick={() => setLater(!later)}>What happens later?</button>
    <details><summary>Why?</summary><p>{card.details?.science ?? 'Look for the systems this choice changes.'}</p>
      {card.details && <span className="inline-icon"><Icon name={'source-' + card.details.source} />{card.details.source.replaceAll('-', ' ')}</span>}
    </details>
    <details><summary>Give me a hint</summary><p>{card.details?.hint ?? 'Which resource is running lowest?'}</p></details>
  </Modal>
}

function Messages({ s }: { s: MissionSnapshot }) {
  const { inbox, outbox } = s.state.comms
  return <><h3>Messages</h3>{inbox.length || outbox.length ? <ul>
    {[...inbox].reverse().map(message => <li key={'in:' + message.id}>Earth · {message.text}</li>)}
    {[...outbox].reverse().map(message => <li key={'out:' + message.id}>{message.sentAt === null ? 'Waiting for relay' : 'Sent'} · {message.text}</li>)}
  </ul> : <p>No messages yet.</p>}</>
}

function Pad({ s }: { s: MissionSnapshot }) {
  const power = s.state.power
  return <>
    <dl className="quick-readings">
      <div><dt>Power</dt><dd>{Math.round(power.batteryKWh / power.batteryCapKWh * 100)}%</dd></div>
      <div><dt>Air</dt><dd>{s.airSols.toFixed(1)} sols</dd></div>
      <div><dt>Water</dt><dd>{s.waterSols.toFixed(1)} sols</dd></div>
    </dl>
    <Messages s={s} />
    <div className="module-list">{['power','air','water','food','radiation','earth-link','you'].map(id => <button key={id} onClick={() => useMissionStore.getState().setPanel(id)}>{titles[id]}</button>)}</div>
    <div className="button-row">
      <button onClick={() => useMissionStore.getState().setPanel('why')}>Why Chain</button>
      <button onClick={() => useMissionStore.getState().setPanel('wake')}>Wake report</button>
      <button onClick={() => { const ui = useMissionStore.getState(); ui.send({ type: 'practiceCard' }); ui.setPanel(null) }}>Ask PEBBLE about night power</button></div>
  </>
}

function Detail({ id, s }: { id: string; s: MissionSnapshot }) {
  const state = s.state
  if (id === 'power') return <><p>{state.power.batteryKWh.toFixed(1)} / {state.power.batteryCapKWh} kWh stored.</p>
    <p>{Number.isFinite(s.nightHours) ? s.nightHours.toFixed(1) + ' hours at the current night load.' : 'No night power demand.'}</p>
    <details><summary>Why?</summary><p>Solar panels make power in daylight. The battery stores it for later.</p></details></>
  if (id === 'air') return <><p>{state.air.o2Kg.toFixed(2)} kg of oxygen in the hab.</p><p>Filter life · {Math.round(state.air.scrubberLife * 100)}%</p>
    <details><summary>Why?</summary><p>The filter removes carbon dioxide from the air you breathe.</p></details></>
  if (id === 'water') return <><p>{state.water.liters.toFixed(1)} L of usable water.</p><p>{state.water.iceKg.toFixed(1)} kg of ice.</p>
    <details><summary>Why?</summary><p>You and your plants need water. Making oxygen can use water too.</p></details></>
  if (id === 'food') return <p>{state.food.pantrySols.toFixed(1)} sols of food in the pantry.</p>
  if (id === 'radiation') return <><p>Sun activity · {state.rad.weather}</p><p>Dose · {state.you.doseDP.toFixed(1)} DP</p>
    <meter className="dose-meter" min={0} max={100} low={50} high={70} optimum={0} value={state.you.doseDP} /><p>50 Watch · 70 Act · 90 EVA limit</p></>
  if (id === 'earth-link') return <><p>{state.comms.blackout ? 'Link blocked' : state.comms.oneWayMin.toFixed(1) + ' min to Earth'}</p><Messages s={s} /></>
  if (id === 'you') return <p>Energy {state.you.energy}/3 · Health {state.you.health}/3 · Spirit {state.you.spirit}/3</p>
  return null
}

const titles: Record<string, string> = {
  power: 'Power', air: 'Air', water: 'Water', food: 'Food', radiation: 'Sun & dose',
  'earth-link': 'Earth link', you: 'You', pad: 'Data Pad', pause: 'Paused',
  priorities: 'Power priorities', station: 'Station modules', why: 'Why Chain', wake: 'Wake-up report',
  wait: 'Wait in the galley', sleep: 'Rest in the bunk', pebble: 'PEBBLE', recovery: 'Return to Ship', guide: 'Field Guide',
}

export function MissionPanels({ s }: { s: MissionSnapshot }) {
  const panel = useMissionStore(u => u.openPanel)
  const card = useMissionStore(u => u.currentCard)
  const area = useMissionStore(u => u.area)
  const checkpoints = useMissionStore(u => u.recoveryAvailable)
  const open = useMissionStore(u => u.setPanel)
  const send = useMissionStore(u => u.send)
  const decisionOpen = useMissionStore(u => u.decisionOpen)
  if (card && decisionOpen) return <Decision key={card.id} />
  if (!panel || panel === 'debug-plan' || panel === 'pebble-chat') return null
  const state = s.state
  let title = titles[panel] ?? panel, content: ReactNode
  if (panel === 'pause') content = <div className="menu-buttons">
    <button className="primary" onClick={() => open(null)}>Resume</button>
    <button onClick={() => open('guide')}>Field Guide</button>
    <button disabled={!checkpoints.sleep} onClick={() => useMissionStore.setState({ recovery: 'sleep' })}>Try again from last sleep</button>
    <button onClick={() => window.location.reload()}>Main Menu</button>
  </div>
  else if (panel === 'guide') content = <><p>One sol is one day on Mars.</p><p>The battery keeps the hab running at night.</p><p>Check the Why Chain to see what changed.</p><button onClick={() => open('why')}>Open the Why Chain</button></>
  else if (panel === 'pad') content = <Pad s={s} />
  else if (panel === 'why') content = <WhyChain events={state.log} />
  else if (panel === 'wake') content = <Wake s={s} />
  else if (panel === 'priorities') content = <Priorities s={s} />
  else if (panel === 'recovery') content = <>
    <p>Your reserves are very low. Review what happened before you choose.</p><WhyChain events={state.log} />
    <div className="button-row">
      <button disabled={!checkpoints.sleep} onClick={() => useMissionStore.setState({ recovery: 'sleep' })}>Try again from last sleep</button>
      <button disabled={!checkpoints.decision} onClick={() => useMissionStore.setState({ recovery: 'decision' })}>Try again from a decision</button>
      <button onClick={() => { open('why'); useMissionStore.setState({ speech: 'Check what used the most power. Which machine can you spare?' }) }}>Continue with help</button>
    </div>
  </>
  else if (panel === 'sleep') content = <><p>{sleepAllowed(s, area) ? 'Rest while the station keeps running.' : 'Seal the airlock. Rest after 17:00 or when tired.'}</p>
    <button className="primary" disabled={!sleepAllowed(s, area)} onClick={() => { send({ type: 'sleep' }); open(null) }}>Sleep</button></>
  else if (panel === 'wait') content = <><p>Wait inside with the airlock sealed. You can wait until sunset.</p><div className="button-row">
    {([1, 2, 4] as const).map(hours => <button key={hours} disabled={!s.airlockSealed || state.clock.minute < 360 || state.clock.minute + hours * 60 > 1080}
      onClick={() => { send({ type: 'wait', hours }); open(null) }}>{hours} {hours === 1 ? 'hour' : 'hours'}</button>)}</div></>
  else if (panel === 'station') content = <><div className="module-list">{Object.entries(stationModules).map(([id, module]) =>
    <button key={id} onClick={() => selectModule(id)}><Icon name={module.icon} />{module.label}</button>)}</div>
    <button onClick={() => open('priorities')}>Power priorities</button><button onClick={() => open('pad')}>Data terminal</button><button onClick={() => open('pebble')}>PEBBLE</button>
    {card && <button onClick={() => useMissionStore.getState().openDecision()}>Read pending decision</button>}
    <h3>Power controls</h3><div className="module-list">{state.power.priority.map(id =>
      <button key={id} onClick={() => open('load:' + id)}>{loadNames[id]}</button>)}</div></>
  else if (panel.startsWith('module:')) {
    const id = panel.slice(7), module = stationModules[id], kw = moduleKW(id, s)
    const status = moduleStatus(id, s)
    title = module.label
    content = <><p><span className={'status level-' + status.level}>{status.text}</span> {kw !== null && Math.abs(kw).toFixed(2) + ' kW'}</p>
      {id.startsWith('solar-') && <p>Dust · {Math.round(state.power.panelDust * 100)}% · Health · {Math.round(state.power.arrayHealth * 100)}%</p>}
      {id === 'battery' && <p>{state.power.batteryKWh.toFixed(1)} kWh stored · {(kw ?? 0) >= 0 ? 'Charging' : 'Discharging'}</p>}
      {module.load && <LoadControls id={module.load} s={s} />}
      <details><summary>Why does this matter?</summary><p>{module.why}</p></details>
      {id === 'hab' && <button onClick={() => open('station')}>All power controls</button>}</>
  } else if (panel.startsWith('load:')) {
    const id = panel.slice(5) as LoadId
    title = loadNames[id]
    content = <><LoadControls key={id} id={id} s={s} /><button onClick={() => open('station')}>All power controls</button></>
  } else if (panel === 'pebble') {
    const pebble = state.pebble
    content = <><button onClick={() => open('pebble-chat')}>Chat with PEBBLE</button><button onClick={() => useMissionStore.getState().askHint()}>Ask for a hint</button>
      {card && <button onClick={() => useMissionStore.getState().openDecision()}>Read pending decision</button>}
      <p>Battery {Math.round(pebble.batteryPct)}% · Dust {Math.round(pebble.dust * 100)}%</p>
      <p>{pebble.glitched ? 'Rebooting' : pebble.job ? jobLabels[pebble.job.kind] + ' · ' + (s.pebbleTravel ? 'On the way' : Math.ceil(pebble.job.etaMin) + ' min left') : s.nightWatch ? 'On night watch' : 'Ready'}</p>
      {!pebble.job && !pebble.glitched && pebble.batteryPct > 0 && <div className="module-list">{(Object.keys(jobLabels) as PebbleJob['kind'][]).map(kind =>
        <button key={kind} onClick={() => {
          useMissionStore.setState({ jobPicker: kind })
          open('job-target')
        }}>{jobLabels[kind]}</button>)}</div>}</>
  } else if (panel === 'job-target') { title = 'Choose a PEBBLE destination'; content = <JobTargetPicker /> }
  else content = <Detail id={panel} s={s} />
  return <Modal key={panel} title={title}>{content}</Modal>
}

export function JobTargetPicker() {
  const kind = useMissionStore(u => u.jobPicker)
  const panel = useMissionStore(u => u.openPanel)
  if (!kind || panel !== 'job-target') return null
  return <section className="job-picker hud-panel" aria-label="PEBBLE job target">
    <strong>{jobLabels[kind]} · Choose a target</strong>
    <div className="button-row">{Object.entries(jobTargets).filter(([, target]) => target.jobs.includes(kind)).map(([id, target]) =>
      <button key={id} onClick={() => selectModule(id)}>{target.label}</button>)}
      <button onClick={() => useMissionStore.setState({ jobPicker: null })}>Cancel</button>
    </div>
  </section>
}
