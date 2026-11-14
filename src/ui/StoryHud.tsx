import { useEffect, useState, type CSSProperties } from 'react'
import { useMissionStore } from '../state/useMissionStore'
import { useStoryStore } from '../state/useStoryStore'
import { brief, danger, flows, grade, LIMITS, nextSpots, panelsClean, RATES, type Cause, type StoryState } from '../sim/story/story'
import { BVAD, DONKI_EVENT, MARS_TREK, RADLAB, SITES } from '../sim/outpost/data'
import { palette } from '../style/tokens'
import { STATION_INFO, stationStatus, type OutdoorStation } from '../game/world/Stations'
import { SPOT_POINTS, STORY_POINTS } from '../game/world/storyLayout'
import { closePanel, Fact, Modal } from './Modal'
import { PebbleChat } from './PebbleChat'
import { StoryDialog } from './StoryDialog'
import { SHORTCUTS, toggleShortcut } from './useGameShortcuts'
import { ViewTransition } from './ViewTransition'
import './Hud.css'
import './OutpostHud.css'
import './StoryHud.css'

const colors = Object.fromEntries(Object.entries(palette).map(([name, color]) => ['--' + name, color]))
type Level = 'ok' | 'low' | 'danger'
const level = (value: number, low: number, danger: number): Level => value <= danger ? 'danger' : value <= low ? 'low' : 'ok'
const trend = (perSecond: number, unit: string) => Math.abs(perSecond) < .005 ? 'steady' : `${perSecond > 0 ? '▲' : '▼'} ${Math.abs(perSecond * 60).toFixed(perSecond * 60 > 10 ? 0 : 1)}${unit}/min`

export function meterRows(s: StoryState) {
  const f = flows(s)
  return [
    { id: 'power', name: 'Power', value: Math.round(s.power) + '%', fill: s.power / 100, level: level(s.power, 35, 15), trend: trend(f.power, '%'), up: f.power >= 0 },
    { id: 'water', name: 'Water', value: Math.round(s.water) + ' L', fill: s.water / 100, level: level(s.water, 30, 12), trend: trend(f.water, ' L'), up: f.water >= 0 },
    { id: 'air', name: 'Oxygen', value: Math.round(s.oxygen) + '%', fill: s.oxygen / 100, level: level(s.oxygen, 50, 30), trend: trend(f.oxygen, '%'), up: f.oxygen >= 0 },
    { id: 'food', name: 'Food', value: Math.floor(s.food) + ' days', fill: s.food / 16, level: level(s.food, 2, 1), trend: trend(-RATES.crewFood, ' days'), up: false },
    { id: 'radiation', name: 'Radiation', value: Math.round(s.dose) + ' µGy', fill: s.dose / (LIMITS.dose * 1.6),
      level: (s.dose >= LIMITS.dose ? 'danger' : s.dose >= LIMITS.dose * .5 ? 'low' : 'ok') as Level,
      trend: s.scene === 6 && s.storm <= 0 && !s.allClear ? `▲ ${(s.sheltered ? RATES.shelterDose : RATES.outsideDose) * 60}/min` : '', up: false },
  ]
}

function Meter({ row }: { row: ReturnType<typeof meterRows>[number] }) {
  return <div className={'oh-meter ' + row.level}>
    <img src={'/ui/icons/' + row.id + '.svg'} alt="" />
    <span className="oh-meter-name">{row.name}</span>
    <span className="oh-meter-value">{row.value}</span>
    <span className="oh-bar" role="meter" aria-label={row.name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(1, row.fill) * 100)}>
      <i style={{ width: Math.max(2, Math.min(100, row.fill * 100)) + '%' }} />
    </span>
    <span className={'oh-level story-trend' + (row.trend.startsWith('▼') || row.id === 'radiation' && row.trend ? ' down' : '')}>{row.trend}</span>
  </div>
}

function MissionCard({ s }: { s: StoryState }) {
  const b = brief(s)
  const picked = b.choice?.options.some(o => o.picked)
  return <section className="oh-card story-mission" aria-label="Mission objectives">
    <header>
      <span>SCENE {Math.min(7, s.scene)} OF 7</span>
      <h2>{b.title}</h2>
      {b.time && <p className={'story-timer' + (s.storm <= 0 && !s.sheltered ? ' danger' : '')}>{b.time}</p>}
    </header>
    {b.choice && <div className={'story-choice' + (picked ? ' decided' : '')}>
      <h3>{picked ? 'Your decision' : b.choice.prompt}</h3>
      <div className="story-options">{b.choice.options.map((o, i) => <div key={o.id} className="story-option-wrap">
        {i > 0 && <span className="story-or">OR</span>}
        <article className={'story-option' + (o.picked ? ' picked' : picked ? ' dropped' : '')}>
          <strong>{o.picked && '✓ '}{o.label}{o.progress && !picked ? <small> · {o.progress}</small> : null}</strong>
          <p className="story-how">{o.how}</p>
          <p className="gain">+ {o.gain}</p>
          <p className="cost">− {o.cost}</p>
        </article>
      </div>)}</div>
    </div>}
    {b.goals.length > 0 && <ul>{b.goals.map(goal => <li key={goal.id} className={goal.done ? 'done' : ''}>
      <span aria-hidden="true">{goal.done ? '✓' : '○'}</span>
      <div>{goal.text}{goal.detail && !goal.done && <small>{goal.detail}</small>}</div>
    </li>)}</ul>}
  </section>
}

function Systems({ s }: { s: StoryState }) {
  const goals = nextSpots(s)
  return <ul className="oh-stations">{(Object.keys(STATION_INFO) as OutdoorStation[]).map(id => {
    const isGoal = goals.some(spot => STATION_INFO[id].spots.includes(spot))
    return <li key={id} className={isGoal ? 'goal' : ''}><img src={'/ui/icons/' + STATION_INFO[id].icon + '.svg'} alt="" />
      <span><strong>{STATION_INFO[id].name}</strong><small>{stationStatus(s, id)}</small></span></li>
  })}
    <li><img src="/ui/icons/science.svg" alt="" /><span><strong>Operating priority</strong><small>{s.mode ? s.mode[0].toUpperCase() + s.mode.slice(1) + ' Mode' : 'Not set'}</small></span></li>
  </ul>
}

function Terminal({ s }: { s: StoryState }) {
  const f = flows(s)
  return <Modal title="ARES-7 Control Terminal" icon="power" wide className="story-terminal">
    <div className="story-readouts">{meterRows(s).map(row => <Meter key={row.id} row={row} />)}</div>
    <p className="story-power-line">Solar panels make <b>{(f.solar * 60).toFixed(1)}%</b> per minute ({panelsClean(s)}/4 rows clean). The station uses <b>{(f.use * 60).toFixed(1)}%</b> per minute.</p>
    <Systems s={s} />
    {s.scene === 5 && <>
      <p className="oh-forecast">Change the operating priority with the levers on the board to the right of this terminal, then confirm.</p>
      <button className="oh-primary" disabled={!s.reviewed} onClick={() => { useStoryStore.getState().dispatch({ type: 'confirm' }); closePanel() }}>Confirm plan</button>
    </>}
    {s.scene === 7 && <p className="oh-forecast">Close this screen and hold <kbd>E</kbd> on the terminal to submit your report.</p>}
    <Fact source="NASA BVAD life support values" href={BVAD.url}>One astronaut breathes about {BVAD.o2KgPerDay} kg of oxygen and needs about {BVAD.waterLPerDay} L of water every day. Recycling water is how real stations keep up.</Fact>
  </Modal>
}

function Manage({ s }: { s: StoryState }) {
  return <Modal title="Quick management" icon="power" wide>
    <div className="story-readouts">{meterRows(s).map(row => <Meter key={row.id} row={row} />)}</div>
    <Systems s={s} />
    <p className="oh-help">Machines are switched by hand out in the base. Follow the orange <b>!</b> markers or let PEBBLE lead the way.</p>
    <div className="oh-row">
      <button className="oh-primary" onClick={() => leadMe(s)}>PEBBLE, lead me to the next job</button>
      <button onClick={closePanel}>Close</button>
    </div>
  </Modal>
}

function leadMe(s: StoryState) {
  const spot = brief(s).goals.find(g => !g.done)?.spot ?? brief(s).choice?.options[0].spot
  const ui = useMissionStore.getState()
  if (spot) {
    const place = SPOT_POINTS[spot]
    const at = place.inside === 'hab' ? SPOT_POINTS.hab.at : place.inside === 'greenhouse' ? STORY_POINTS.greenhouseDoorOut : place.at
    useMissionStore.setState({ pebbleGuide: [at[0], 0, at[2]] })
  }
  useMissionStore.setState({ openPanel: null, panelHistory: [] })
  if (ui.view === 'station') ui.setView('firstPerson')
}

function IsometricSystems({ s }: { s: StoryState }) {
  const f = flows(s)
  return <section data-mouse className="oh-card story-isometric-systems" aria-label="Station subsystems">
    <div className="story-isometric-header">
      <span>CONTROL TERMINAL</span>
      <strong>Station Subsystems</strong>
    </div>
    <p className="story-power-line">Solar panels make <b>{(f.solar * 60).toFixed(1)}%</b> per minute ({panelsClean(s)}/4 rows clean). The station uses <b>{(f.use * 60).toFixed(1)}%</b> per minute.</p>
    <Systems s={s} />
    {s.scene === 5 && <div className="story-isometric-confirm">
      <p className="oh-forecast">Change the operating priority with the levers on the board to the right of the hab terminal, then confirm.</p>
      <button className="oh-primary" disabled={!s.reviewed} onClick={() => useStoryStore.getState().dispatch({ type: 'confirm' })}>Confirm plan</button>
    </div>}
    <div className="story-isometric-actions">
      <button type="button" onClick={() => leadMe(s)}>PEBBLE, lead me ↗</button>
      <button type="button" className="oh-primary" onClick={() => useMissionStore.getState().setView('firstPerson')}>Back to walking (<kbd>M</kbd>)</button>
    </div>
  </section>
}

function Shelter({ s }: { s: StoryState }) {
  const passing = s.storm > 0 ? `Radiation arrives in ${Math.ceil(s.storm)} s` : `Storm passing… about ${Math.max(0, Math.ceil(RATES.stormLength + s.storm))} s left`
  return <Modal title="Inside the radiation shelter" icon="radiation" closable={false} wide className="story-shelter">
    <p>Thick walls and regolith sandbags stop most of the fast particles from the Sun.</p>
    <div className="story-dose">
      <div><span>Outside</span><b>{RATES.outsideDose * 60} µGy/min</b></div>
      <div className="safe"><span>In here</span><b>{RATES.shelterDose * 60} µGy/min</b></div>
    </div>
    <p className="oh-forecast" role="status">{passing}</p>
    <p>Your dose so far: <b>{Math.round(s.dose)} µGy</b> (safe target: under {LIMITS.dose}).</p>
    <Fact source={'NASA DONKI · CME ' + DONKI_EVENT.id} href={DONKI_EVENT.url}>This storm is modelled on the real 20 May 2024 solar eruption. Curiosity’s RAD detector measured the dose jump on Mars.</Fact>
  </Modal>
}

function End({ s }: { s: StoryState }) {
  const result = grade(s)
  const success = s.ending === 'success'
  const [showDetails, setShowDetails] = useState(false)

  const sheltered = s.said.includes('sheltered')
  const shelterTiming = s.decisions.find(d => d.includes('Reached the shelter')) ?? (sheltered ? 'Sheltered inside regolith habitat' : 'Remained exposed')

  // Kid-friendly colorful system cards
  const kidVitals = [
    {
      id: 'power',
      name: 'POWER',
      emoji: '⚡',
      value: Math.round(s.power) + '%',
      fill: Math.min(100, Math.max(0, s.power)),
      color: '#FF9F1C',
      colorGrad: 'linear-gradient(90deg, #FFD166, #FF9F1C)',
      bg: 'rgba(255, 159, 28, 0.12)',
      border: '#FF9F1C',
      status: s.power >= LIMITS.power ? 'FULL BATTERY!' : 'LOW POWER',
      ok: s.power >= LIMITS.power,
      tip: s.backup ? 'Auxiliary battery active' : 'Solar panels shiny clean!',
    },
    {
      id: 'water',
      name: 'WATER',
      emoji: '💧',
      value: Math.round(s.water) + ' L',
      fill: Math.min(100, Math.max(0, (s.water / 80) * 100)),
      color: '#00B4D8',
      colorGrad: 'linear-gradient(90deg, #90E0EF, #0077B6)',
      bg: 'rgba(0, 180, 216, 0.12)',
      border: '#00B4D8',
      status: s.water >= LIMITS.water ? 'LOTS TO DRINK!' : 'RUNNING LOW',
      ok: s.water >= LIMITS.water,
      tip: s.recycler ? 'Recycler making fresh water!' : 'Recycler needs filter',
    },
    {
      id: 'air',
      name: 'OXYGEN',
      emoji: '🫁',
      value: Math.round(s.oxygen) + '%',
      fill: Math.min(100, Math.max(0, s.oxygen)),
      color: '#06D6A0',
      colorGrad: 'linear-gradient(90deg, #A7F3D0, #059669)',
      bg: 'rgba(6, 214, 160, 0.12)',
      border: '#059669',
      status: s.oxygen >= LIMITS.oxygen ? 'FRESH & CLEAN!' : 'LOW AIR',
      ok: s.oxygen >= LIMITS.oxygen,
      tip: s.oxygenGen ? 'Oxygen maker pumping fresh air!' : 'Oxygen maker idle',
    },
    {
      id: 'food',
      name: 'FOOD',
      emoji: '🥕',
      value: Math.floor(s.food) + ' Days',
      fill: Math.min(100, Math.max(0, (s.food / 18) * 100)),
      color: '#FF70A6',
      colorGrad: 'linear-gradient(90deg, #FDE68A, #F59E0B)',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: '#F59E0B',
      status: s.food >= LIMITS.food ? 'YUMMY HARVEST!' : 'NEED MORE FOOD',
      ok: s.food >= LIMITS.food,
      tip: `${s.harvested}/3 crop trays harvested!`,
    },
    {
      id: 'radiation',
      name: 'SHIELD',
      emoji: '🛡️',
      value: Math.round(s.dose) + ' µGy',
      fill: Math.min(100, Math.max(10, 100 - (s.dose / LIMITS.dose) * 100)),
      color: '#7B2CBF',
      colorGrad: 'linear-gradient(90deg, #C77DFF, #7B2CBF)',
      bg: 'rgba(123, 44, 191, 0.12)',
      border: '#7B2CBF',
      status: s.dose < LIMITS.dose && !s.damaged.length ? 'SUPER SAFE!' : 'STORM DAMAGE',
      ok: s.dose < LIMITS.dose && !s.damaged.length,
      tip: sheltered ? `${shelterTiming.replace(/\.$/, '')}!` : 'Radiation exposure outside',
    },
  ]

  // Kid-friendly simple decision milestones
  const kidMilestones = [
    {
      emoji: s.powerChoice === 'backup' ? '🔋' : '☀️',
      title: s.powerChoice === 'backup' ? 'Switched On Backup Battery' : 'Cleaned Dusty Solar Panels',
      detail: s.powerChoice === 'backup' ? 'Gave the base an instant boost of electricity!' : 'Scrubbed red dust off 4 rows of panels—plenty of sunshine energy!',
      tag: s.powerChoice === 'backup' ? 'QUICK POWER' : 'SOLAR HERO',
      color: '#FF9F1C',
    },
    {
      emoji: '💧',
      title: 'Fixed Water Recycler & Oxygen Maker',
      detail: 'Put in a clean filter so everyone has fresh water to drink and clean air to breathe!',
      tag: 'FRESH LIFE SUPPORT',
      color: '#00B4D8',
    },
    {
      emoji: '🌱',
      title: `Grew Fresh Mars Crops (${(s.mode ?? 'balanced').toUpperCase()} Mode)`,
      detail: `Turned on water valves & pink grow lights. Harvested ${s.harvested} trays—food for ${Math.floor(s.food)} whole days!`,
      tag: 'GREENHOUSE MASTER',
      color: '#059669',
    },
    {
      emoji: '🏰',
      title: sheltered ? 'Raced to the Rock Bunker' : 'Stayed Outside in the Storm',
      detail: sheltered ? 'Protected by thick Martian rock from the solar eruption. All machines safe!' : 'Stayed outside during the solar storm.',
      tag: sheltered ? 'SAFE & SOUND' : 'RISKY MOVE',
      color: '#7B2CBF',
    },
  ]

  const pebbleCheer = success
    ? 'HIGH FIVE, ASTRONAUT! 🚀 Station ARES-7 is running with power, clean water, fresh air, and yummy food. The crew is cleared to land!'
    : 'Good effort, Astronaut! ARES-7 survived the solar storm, but a couple systems ran low on supplies. We can try again to get 5/5 stars!'

  // Detailed advanced science data
  const advancedVitals = [
    { name: 'Electrical Battery Bank', val: Math.round(s.power) + '%', limit: `Target: ≥ ${LIMITS.power}%`, ok: s.power >= LIMITS.power, note: s.backup ? 'Backup connected (+35%)' : 'Primary solar arrays' },
    { name: 'Potable Water Reclamation', val: Math.round(s.water) + ' L', limit: `Target: ≥ ${LIMITS.water} L`, ok: s.water >= LIMITS.water, note: s.recycler ? 'Active closed loop (+0.065 L/s)' : 'Inactive' },
    { name: 'Atmospheric O₂ Saturation', val: Math.round(s.oxygen) + '%', limit: `Target: ≥ ${LIMITS.oxygen}%`, ok: s.oxygen >= LIMITS.oxygen, note: s.oxygenGen ? 'Generator active (+0.15%/s)' : 'Generator offline' },
    { name: 'Hydroponic Biomass Reserve', val: Math.floor(s.food) + ' Days', limit: `Target: ≥ ${LIMITS.food} Days`, ok: s.food >= LIMITS.food, note: `${s.harvested} of 3 trays harvested` },
    { name: 'Cumulative Ionizing Dose', val: Math.round(s.dose) + ' µGy', limit: `Ceiling: < ${LIMITS.dose} µGy`, ok: s.dose < LIMITS.dose && !s.damaged.length, note: s.damaged.length ? `${s.damaged.join(', ')} damaged` : '0 hardware casualties' },
  ]

  const advancedDecisions = [
    {
      domain: 'ENERGY GRID',
      choice: s.powerChoice === 'backup' ? 'Tripped emergency battery breaker' : 'Manual solar array scrubbing',
      gain: s.powerChoice === 'backup' ? '+ Instant +35% electrical reserve' : '+ 100% sustainable solar capture',
      cost: s.powerChoice === 'backup' ? '− Uncleaned dust degrades ongoing solar capture' : '− Required extended physical EVA time',
    },
    {
      domain: 'LIFE SUPPORT',
      choice: 'Fitted core filter, booted water recycler & oxygen synthesis',
      gain: '+ Closed loop water recovery (+0.065 L/s) & O₂ (+0.15%/s)',
      cost: '− Continuous baseline electrical load (0.10%/s)',
    },
    {
      domain: 'AGRICULTURE',
      choice: `${(s.mode ?? 'balanced').toUpperCase()} cultivation regime`,
      gain: s.mode === 'farming' ? '+ Accelerated growth speed' : '+ Balanced resource consumption',
      cost: s.mode === 'farming' ? '− High power & moisture draw' : '− Standard 40s maturation cycle',
    },
    {
      domain: 'CME SURVIVAL',
      choice: s.stormChoice === 'emergency' ? 'Emergency circuit shutoff' : 'Greenhouse override',
      gain: s.stormChoice === 'emergency' ? '+ Battery storage strictly reserved for life support' : '+ Continuous crop maturation',
      cost: s.stormChoice === 'emergency' ? '− Crop growth halted during solar storm' : '− Elevated electrical strain',
    },
    {
      domain: 'SHIELDING',
      choice: sheltered ? 'Subsurface regolith bunker retreat' : 'Exposed surface presence',
      gain: s.dose < LIMITS.dose ? `+ Absorbed dose ${Math.round(s.dose)} µGy safely below ${LIMITS.dose} µGy` : '− Exceeded safe radiation margin',
      cost: s.damaged.length ? `− Machinery damaged: ${s.damaged.join(', ')}` : '+ All external equipment covers deployed',
    },
  ]

  const nasaCitations = [
    { title: 'OSDR RadLab', tag: 'SPACE WEATHER', desc: 'Curiosity RAD in-situ Mars radiation data (May 2024 CME)', href: RADLAB.url },
    { title: 'Mars Trek', tag: 'TOPOGRAPHY', desc: `Orbital elevation & solar irradiance of ${SITES[s.site].name}`, href: MARS_TREK.url },
    { title: 'NASA DONKI', tag: 'SOLAR PHYSICS', desc: 'Space weather notification & CME model database', href: DONKI_EVENT.url },
    { title: 'NASA BVAD', tag: 'LIFE SUPPORT', desc: 'NASA Baseline Values & Assumptions Document', href: BVAD.url },
  ]

  return <Modal
    title={success ? '🎉 MISSION COMPLETE · MISSION SUCCESS!' : '⚠️ MISSION COMPLETE · IMPROVEMENTS NEEDED'}
    icon="earth-link"
    closable={false}
    wide
    className="story-end-modal"
  >
    <div className="story-end-dashboard">
      {/* 1. Cheerful Mission Grade Banner */}
      <div className={'kid-banner ' + (success ? 'pass' : 'warn')}>
        <div className="kid-banner-stars">
          {[1, 2, 3, 4, 5].map(n => (
            <span key={n} className={'kid-star ' + (n <= result.passed ? 'gold' : 'dim')}>★</span>
          ))}
          <span className="kid-score-badge">
            {result.passed} / 5 SYSTEMS READY! 🚀
          </span>
        </div>
        <h2 className="kid-banner-title">
          {success ? 'ARES-7 BASE IS 100% READY FOR CREW!' : 'BASE SURVIVED, BUT SOME SYSTEMS NEED HELP!'}
        </h2>
        <p className="kid-banner-subtitle">
          {success
            ? 'Awesome piloting, Junior Astronaut! Power is flowing, water is recycled, air is fresh, and your crops are ready to eat!'
            : 'You protected the base through the solar storm, but a few meters fell below safety levels. Review the numbers and try again!'}
        </p>
      </div>

      {/* 2. Bright & Colorful System Cards */}
      <div className="kid-vitals-section">
        <div className="kid-section-label">
          <span>🌟 YOUR 5 CRITICAL SYSTEMS</span>
          <span className="kid-hint-label">Check each meter below</span>
        </div>
        <div className="kid-vitals-grid">
          {kidVitals.map(v => (
            <div
              key={v.id}
              className="kid-vital-card"
              style={{
                borderColor: v.border,
                backgroundColor: v.bg,
              }}
            >
              <div className="kid-vital-header">
                <span className="kid-vital-emoji">{v.emoji}</span>
                <span className="kid-vital-title" style={{ color: v.color }}>{v.name}</span>
              </div>
              <div className="kid-vital-number" style={{ color: v.color }}>{v.value}</div>
              <div className="kid-vital-bar-track">
                <div
                  className="kid-vital-bar-fill"
                  style={{ width: `${v.fill}%`, background: v.colorGrad }}
                />
              </div>
              <div
                className="kid-vital-badge"
                style={{
                  backgroundColor: v.ok ? v.color : '#E63946',
                  color: '#FFFFFF',
                }}
              >
                {v.ok ? '✓ ' + v.status : '✗ ' + v.status}
              </div>
              <div className="kid-vital-tip">{v.tip}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Simple, Fun Decisions Highlights */}
      {!showDetails && (
        <div className="kid-milestones-section">
          <div className="kid-section-label">
            <span>🏆 WHAT YOU ACCOMPLISHED</span>
            <span className="kid-hint-label">Your decisions on Mars</span>
          </div>
          <div className="kid-milestones-grid">
            {kidMilestones.map((m, i) => (
              <div key={i} className="kid-milestone-card" style={{ borderLeftColor: m.color }}>
                <span className="kid-milestone-emoji">{m.emoji}</span>
                <div className="kid-milestone-info">
                  <div className="kid-milestone-top">
                    <strong>{m.title}</strong>
                    <span className="kid-milestone-tag" style={{ backgroundColor: m.color }}>{m.tag}</span>
                  </div>
                  <p>{m.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PEBBLE Cheerful Companion Transmission */}
      <div className="kid-pebble-card">
        <div className="kid-pebble-icon">
          <img src="/ui/icons/pebble.svg" alt="PEBBLE" />
          <span>PEBBLE</span>
        </div>
        <div className="kid-pebble-bubble">
          <p>“{pebbleCheer}”</p>
          <small>Your Autonomous Robot Buddy · ARES-7 Station</small>
        </div>
      </div>

      {/* 5. Detailed Scientific Report (Toggleable via prominent button) */}
      <div className="kid-details-toggle-row">
        <button
          className={'kid-toggle-btn ' + (showDetails ? 'active' : '')}
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails
            ? '⬆️ Hide Full Science Report (Back to Simple View)'
            : '📋 View Full Scientific Report (NASA Citations & Detailed Telemetry)'}
        </button>
      </div>

      {showDetails && (
        <div className="story-advanced-report">
          <div className="story-advanced-header">
            <h4>ADVANCED MISSION TELEMETRY & FLIGHT READINESS</h4>
            <p>Precise engineering rates, NASA standards, and tactical decision consequences.</p>
          </div>

          <div className="story-advanced-table">
            {advancedVitals.map(v => (
              <div key={v.name} className={'story-advanced-row ' + (v.ok ? 'pass' : 'fail')}>
                <div>
                  <strong>{v.name}</strong>
                  <small>{v.note}</small>
                </div>
                <div className="story-advanced-val">
                  <span>{v.val}</span>
                  <em>{v.limit}</em>
                </div>
                <span className={'story-advanced-pill ' + (v.ok ? 'ok' : 'bad')}>
                  {v.ok ? 'PASSED' : 'DEFICIT'}
                </span>
              </div>
            ))}
          </div>

          <h4 className="story-advanced-subtitle">TACTICAL TRADEOFF ANALYSIS</h4>
          <div className="story-advanced-decisions">
            {advancedDecisions.map(d => (
              <div key={d.domain} className="story-advanced-decision-item">
                <span className="story-adv-domain">{d.domain}</span>
                <p><strong>Choice:</strong> {d.choice}</p>
                <div className="story-adv-tradeoff">
                  <span className="gain">{d.gain}</span>
                  <span className="cost">{d.cost}</span>
                </div>
              </div>
            ))}
          </div>

          <h4 className="story-advanced-subtitle">AUTHENTIC NASA RESEARCH DATA</h4>
          <div className="story-sources-grid">
            {nasaCitations.map(c => (
              <a key={c.title} href={c.href} target="_blank" rel="noreferrer" className="story-source-card">
                <div className="story-source-top">
                  <strong>{c.title}</strong>
                  <span className="story-source-tag">{c.tag}</span>
                </div>
                <p>{c.desc}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      <p className="story-beginning">YOUR MISSION IS ONLY THE BEGINNING.</p>

      {/* 6. Big Friendly Action Buttons */}
      <EndActions again={success ? '🚀 Play Again!' : '↺ Try Again!'} />
    </div>
  </Modal>
}

function EndActions({ again }: { again: string }) {
  return <div className="kid-actions-row">
    <button
      className="kid-btn-play"
      onClick={() => { useStoryStore.getState().clear(); location.reload() }}
    >
      {again}
    </button>
    <button
      className="kid-btn-menu"
      onClick={() => {
        useStoryStore.getState().clear()
        useMissionStore.setState({ openPanel: null, panelHistory: [] })
        location.reload()
      }}
    >
      🏠 Main Menu
    </button>
  </div>
}

const LOST: Record<Cause, { title: string; text: string; tip: string }> = {
  oxygen: { title: 'THE AIR RAN OUT', text: 'The oxygen tank hit zero and stayed there. Without air, the crew blacked out.',
    tip: 'The oxygen generator needs power AND water. Keep the battery above zero and the water recycler running.' },
  water: { title: 'THE WATER RAN OUT', text: 'The water tank stayed empty for too long. Nobody could drink, and the oxygen generator stopped too.',
    tip: 'Recover water before you spend it. Farming Mode and a damaged recycler drain the tank fast.' },
  food: { title: 'THE FOOD RAN OUT', text: 'The crew eats every minute. The pantry emptied before enough food was harvested.',
    tip: 'Get the greenhouse growing early, keep the drip lines clear, and harvest the replanted trays too.' },
  radiation: { title: 'FATAL RADIATION DOSE', text: 'The solar storm hit while the commander was outside. Radiation sickness ended the mission.',
    tip: 'Head for the shelter before the countdown ends. If time is short, skip a cover: machines can be repaired, people cannot.' },
}

function Lost({ s }: { s: StoryState }) {
  const info = LOST[s.cause ?? 'oxygen']
  const minutes = Math.floor(s.time / 60), seconds = String(Math.floor(s.time % 60)).padStart(2, '0')
  return <Modal title="⚠️ MISSION LOST" icon="earth-link" closable={false} wide className="story-end-modal">
    <div className="story-end-dashboard">
      <div className="kid-banner warn">
        <h2 className="kid-banner-title">{info.title}</h2>
        <p className="kid-banner-subtitle">{info.text}</p>
        <p className="kid-banner-subtitle">Lost during scene {Math.min(7, s.scene)} of 7, {minutes}:{seconds} into the mission.</p>
      </div>
      <h4 className="story-advanced-subtitle">THE CHOICES THAT LED HERE</h4>
      <ol className="story-lost-chain">{s.decisions.slice(-6).map((d, i) => <li key={i}>{d}</li>)}</ol>
      <p className="story-lost-tip"><b>Next time:</b> {info.tip}</p>
      <EndActions again="↺ Try Again!" />
    </div>
  </Modal>
}

const THREAT: Record<Cause, [string, string]> = {
  oxygen: ['NO OXYGEN', 'until you black out'],
  water: ['NO WATER', 'until the crew collapses'],
  food: ['NO FOOD', 'until the crew starves'],
  radiation: ['RADIATION', 'until the dose is fatal'],
}

/** The body failing: a darkening vignette and a countdown to the fatal moment. */
function Vitals({ s }: { s: StoryState }) {
  const d = danger(s)
  if (!d || s.ending) return null
  const [label, fate] = THREAT[d.cause]
  return <>
    <div className="story-vignette" style={{ '--danger': d.severity } as CSSProperties} aria-hidden="true" />
    <p className="oh-card story-vitals" role="alert">⚠ {label}: {Math.ceil(d.left)} s {fate}</p>
  </>
}

function Pause() {
  const settings = useMissionStore(m => m.settings)
  const update = useMissionStore(m => m.updateSettings)
  return <Modal title="Paused">
    <div className="oh-col">
      <button className="oh-primary" onClick={closePanel}>Resume</button>
      <button onClick={() => update({ textSize: settings.textSize === 150 ? 100 : settings.textSize + 25 })}>Text size: {settings.textSize}%</button>
      <button onClick={() => update({ muted: !settings.muted })}>Sound: {settings.muted ? 'Off' : 'On'}</button>
      <button onClick={() => location.reload()}>Save and quit to menu</button>
    </div>
    <p className="oh-help">Walk with WASD and look with the mouse. Point the dot at something and press E (or hold E when it says so) to do it with your own hands. M shows the base from above, P talks to PEBBLE, Enter skips a message.</p>
  </Modal>
}

function Panels({ s }: { s: StoryState }) {
  const panel = useMissionStore(m => m.openPanel)
  switch (panel) {
    case 'terminal': return <Terminal s={s} />
    case 'manage': return <Manage s={s} />
    case 'shelter': return <Shelter s={s} />
    case 'end': return s.ending === 'lost' ? <Lost s={s} /> : <End s={s} />
    case 'pause': return <Pause />
    default: return null
  }
}

/** Opens the shelter view and the ending when the story needs them. */
function useAutoPanels(s: StoryState | null) {
  const panel = useMissionStore(m => m.openPanel)
  const fading = useMissionStore(m => m.fading)
  const finished = useStoryStore(o => !!o.state?.ending && !o.queue.length && (o.line?.id ?? 0) <= 0)
  const sheltered = !!s?.sheltered
  useEffect(() => {
    if (fading) return
    const wanted = finished ? 'end' : sheltered ? 'shelter' : null
    if (wanted && panel !== wanted) {
      if (document.pointerLockElement) document.exitPointerLock()
      useMissionStore.setState({ openPanel: wanted, panelHistory: [] })
    } else if (!wanted && panel === 'shelter') closePanel()
  }, [finished, sheltered, panel, fading])
}

function Toast() {
  const toast = useStoryStore(o => o.toast)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!toast) return
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 2600)
    return () => clearTimeout(timer)
  }, [toast])
  return toast && visible ? <p key={toast.id} className={'story-toast' + (toast.ok ? '' : ' bad')} role="status">{toast.text}</p> : null
}

export function StoryHud() {
  const s = useStoryStore(o => o.state)
  const area = useMissionStore(m => m.area)
  const station = useMissionStore(m => m.view === 'station')
  const settings = useMissionStore(m => m.settings)
  const prompt = useMissionStore(m => m.prompt)
  const panel = useMissionStore(m => m.openPanel)
  const fading = useMissionStore(m => m.fading)
  const airlock = useMissionStore(m => m.airlockCycle)
  const captureHint = useMissionStore(m => m.captureHint)
  useAutoPanels(s)
  const theme = { ...colors, fontSize: settings.textSize / 100 + 'rem' } as CSSProperties
  if (!s) return <div className="hud" style={theme}><p className="hud-panel loading" role="status">Loading ARES-7…</p></div>
  const quiet = !panel && !fading
  const radiation = s.scene === 6 && s.storm <= 0 && !s.allClear && !s.sheltered
  return <main className={'hud oh story' + (station ? ' oh-isometric' : '') + (settings.reducedMotion ? ' reduced-motion' : '') + (radiation ? ' story-radiation' : '')} style={theme} aria-label="Mission status">
    {area === 'outside' && !station && <div className="helmet" aria-hidden="true" />}
    <div className={'story-left-col' + (station ? ' is-isometric' : '')}>
      <section className="oh-card oh-meters" aria-label="Station resources">
        {meterRows(s).map(row => <Meter key={row.id} row={row} />)}
      </section>
      {quiet && station && <IsometricSystems s={s} />}
    </div>
    <MissionCard s={s} />
    {s.filter === 'carried' && <p className="oh-card story-carry"><img src="/ui/icons/water.svg" alt="" />Carrying: new water filter</p>}
    {s.brownout && <p className="oh-card story-alert" role="alert">⚠ BATTERY EMPTY: machines are off</p>}
    <Vitals s={s} />
    {quiet && !station && <div className="center-dot" aria-hidden="true" />}
    {quiet && !station && prompt && <div className="oh-prompt">
      {prompt.hold ? <span className="hold-ring"><kbd>E</kbd></span> : <kbd>E</kbd>}{prompt.label}{prompt.hold && <small className="story-hold">{settings.toggleHold ? 'tap to start' : 'hold'}</small>}
    </div>}
    <Toast />
    <div className="story-dock"><StoryDialog /></div>
    <div className="oh-dock">
      <PebbleChat speech="" visible={!fading && (!panel || panel === 'pebble-chat')} />
      {!fading && <ul className="oh-shortcuts" aria-label="Shortcuts" data-mouse>
        {SHORTCUTS.map(k => <li key={k.key}><button type="button" className={(k.code === 'KeyM' ? station : panel === k.panel) ? 'on' : ''} aria-pressed={k.code === 'KeyM' ? station : panel === k.panel} onClick={() => toggleShortcut(k.panel)}>
          <kbd>{k.key}</kbd>{k.code === 'KeyM' && station ? 'Back to walking' : k.label}
        </button></li>)}
      </ul>}
    </div>
    {quiet && station && <p className="oh-keys"><kbd>WASD</kbd> pan · scroll to zoom · <kbd>Q</kbd> <kbd>E</kbd> rotate · <kbd>M</kbd> walk</p>}
    {quiet && !station && captureHint && <p className="oh-capture" role="status">{captureHint}</p>}
    {airlock && <div className="oh-airlock" role="status">
      <strong>Airlock</strong>
      <span>{airlock === 'hab' ? 'Pumping air in… the inner door opens when the pressure is safe.' : 'Pumping air out… so the hab keeps its precious air.'}</span>
      <span className={'oh-airlock-bar ' + (airlock === 'hab' ? 'fill' : 'empty')}><i /></span>
    </div>}
    <div className={'scene-fade' + (fading ? ' active' : '')} aria-hidden="true" />
    <Panels s={s} />
    <ViewTransition />
  </main>
}
