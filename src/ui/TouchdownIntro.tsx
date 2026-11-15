import { publicUrl } from '../publicUrl'
import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react'
import { chamberPressure, hatchCanOpen, LOCKED_HATCH } from '../game/interaction/airlock'
import type { LandingClock } from '../game/missions/landingFlight'
import { landingDuration, nextLandingStage, type LandingStage } from '../game/missions/m0'
import { useLandingAudio } from '../game/missions/useLandingAudio'
import { useMissionStore } from '../state/useMissionStore'
import { palette } from '../style/tokens'
import './Touchdown.css'
import { LandingCinematic } from './LandingCinematic'

const LandingScene = lazy(() => import('../game/missions/LandingScene'))
const colors = Object.fromEntries(Object.entries(palette).map(([id,value]) => ['--' + id, value])) as CSSProperties
const source = 'https://www.jpl.nasa.gov/news/press_kits/mars_2020/landing/mission/'
const pins = [
  { name: 'Life Line Station', at: [24, 44], className: 'base-pin' },
  { name: 'Perseverance · Jezero', at: [77.45, 18.45], className: 'jezero-pin' },
  { name: 'Curiosity · Gale', at: [137.44, -4.59], className: 'gale-pin' },
]
const beats: Record<LandingStage, [string,string]> = {
  orbit: ['Mars orbit','Landing site locked. Check the map on your console.'],
  earth: ['Mission Control','Good luck, Commander. By the time you hear this, you’ll already be down.'],
  entry: ['Atmospheric entry','Through the dust haze. Watch for the station and landing pad as the surface comes into view.'],
  arm: ['Approach hover','Life Line Station is ahead. Pull the throttle levers or hold ARM to begin the final descent.'],
  thrust: ['Final descent','Braking toward the landing pad. The base outside is the same place you’ll explore on foot.'],
  touchdown: ['Touchdown','You’re on Mars. The ship sent a message to Earth.'],
  signal: ['Message sent','Our signal is on its way. Earth will know in ten Mars minutes.'],
  suit: ['Suit check','Your suit air came from the ship. The hab can refill it later.'],
  seal: ['Ship airlock','Turn the wheel to seal the cabin hatch.'],
  cycle: ['Pressure cycle','Pull the cyan lever beside the hatch wheel. Mars has very low air pressure, so we lower the chamber pressure first to prevent air from rushing out when the outer hatch opens.'],
  exit: ['Step onto Mars','Open the outer hatch. PEBBLE is waiting on the pad.'],
}

function Map({ zoom }: { zoom: boolean }) {
  return <figure className="landing-map">
    <div className={'landing-map-frame' + (zoom ? ' approaching' : '')}>
      <div className="landing-map-image">
        <img src={publicUrl('/ui/touchdown/mars-viking.webp')} alt="Global colour map of Mars" />
        {pins.map(pin => <span key={pin.name} className={'landing-pin ' + pin.className}
          style={{ left: (pin.at[0] + 180) / 3.6 + '%', top: (90 - pin.at[1]) / 1.8 + '%' }}>{pin.name}</span>)}
      </div>
    </div>
    <figcaption><a href="https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars" target="_blank" rel="noreferrer">NASA/JPL Mars Trek · Viking colour mosaic</a></figcaption>
  </figure>
}

export function TouchdownIntro({
  demo,
  replay,
  resume,
  initialStart = false,
  onExit,
  onBackToMenu,
}: {
  demo: boolean
  replay: boolean
  resume: boolean
  initialStart?: boolean
  onExit: (campaign: boolean, fresh?: boolean) => void
  onBackToMenu?: () => void
}) {
  const prompt = useMissionStore(s => s.prompt)
  const captureHint = useMissionStore(s => s.captureHint)
  const [menu, setMenu] = useState(false)
  const settings = useMissionStore(s => s.settings)
  const [start, setStart] = useState(demo || initialStart)
  const [sceneReady, setSceneReady] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const flightClock = useRef<LandingClock>({ stage: 'orbit', seconds: 0 })
  const exitTimer = useRef<number | null>(null)
  const [stage, setStage] = useState<LandingStage>('orbit')
  const [callsign, setCallsign] = useState('')
  const [suit, setSuit] = useState<'accent-orange' | 'accent-cyan' | 'structure-white'>('accent-orange')
  const [pressure, setPressure] = useState(chamberPressure('hab'))
  const [cycling, setCycling] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [demoComplete, setDemoComplete] = useState(false)
  const caption = useRef<HTMLHeadingElement>(null)
  const advance = () => setStage(previous => nextLandingStage(previous))
  const enableAudio = useLandingAudio(stage, settings.volume)
  useEffect(() => {
    if (start) caption.current?.focus({ preventScroll: true })
  }, [stage, start])

  useEffect(() => { flightClock.current = { stage, seconds: 0 } }, [stage])
  useEffect(() => {
    if (!start || !sceneReady || demoComplete || menu) return
    let previous = performance.now(), frame = 0
    const duration = landingDuration[stage]
    const tick = (now: number) => {
      flightClock.current.seconds += (document.visibilityState === 'hidden' ? 0 : Math.min(1, Math.max(0, now - previous) / 1000))
      previous = now
      if (duration !== undefined && flightClock.current.seconds >= duration) {
        if (demo && stage === 'signal') setDemoComplete(true)
        else setStage(previousStage => nextLandingStage(previousStage))
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [demo, demoComplete, sceneReady, stage, start, menu])
  useEffect(() => () => { if (exitTimer.current !== null) clearTimeout(exitTimer.current) }, [])

  useEffect(() => {
    if (!cycling || menu) return
    const initialPressure = pressure
    const started = performance.now()
    const timer = window.setInterval(() => {
      const next = Math.max(0, initialPressure - (performance.now() - started) / 2150)
      setPressure(next)
      if (next === 0) {
        setCycling(false)
        setFeedback('Outer hatch unlocked.')
        setStage('exit')
      }
    }, 70)
    return () => window.clearInterval(timer)
  }, [cycling, menu])

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.code === 'Escape' && start && !event.repeat) { event.preventDefault(); setMenu(value => !value) }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [start])
  function leave() {
    if (!hatchCanOpen('outside', pressure, cycling)) {
      setFeedback(LOCKED_HATCH)
      return
    }
    if (leaving) return
    setLeaving(true)
    if (document.pointerLockElement) document.exitPointerLock()
    exitTimer.current = window.setTimeout(() => onExit(true, true), 700)
  }

  return <main className={'touchdown ' + (settings.reducedMotion ? 'reduced-motion' : '')}
    style={{...colors,fontSize:settings.textSize / 100 + 'rem'}}>
    <div className="landing-scene">
      <Suspense fallback={null}><LandingScene active={start && !leaving && !menu && !demoComplete} flightClock={flightClock} onReady={() => setSceneReady(true)} onDescent={() => { if (stage === 'arm') { enableAudio(); setStage('thrust') } }} stage={stage} reduced={settings.reducedMotion} pressure={pressure} suitColor={palette[suit]} onSuit={advance} onSeal={advance} onCycle={() => { setFeedback('Air leaving the chamber…'); setCycling(true) }} onExit={leave} cycling={cycling}/></Suspense>
    </div>
    {start && sceneReady && !menu && !demoComplete && <LandingCinematic stage={stage} reduced={settings.reducedMotion} />}
    {!sceneReady && <div className="landing-loading" role="status"><span className="landing-loading-indicator" aria-hidden="true" />Loading…</div>}
    <div className={'landing-departure' + (leaving ? ' leaving' : '')} aria-hidden="true" />
    {!start ? <section data-keyboard-menu className="landing-panel landing-title">
      <p className="landing-kicker">Touchdown</p><h1>Mars Life Line</h1>
      <p>This story is set in the future. Today, only robots explore Mars. The science is real.</p>
      <form onSubmit={event => {
        event.preventDefault()
        try { localStorage.setItem('marslifeline.commander', JSON.stringify({callsign: callsign.trim() || 'Commander', suit})) } catch { /* The profile is optional. */ }
        enableAudio()
        setStart(true)
      }}>
        <label>Callsign <input maxLength={24} value={callsign} onChange={event => setCallsign(event.target.value)} placeholder="Commander"/></label>
        <label>Suit-pad colour <select value={suit} onChange={event => setSuit(event.target.value as typeof suit)}>
          <option value="accent-orange">Orange</option><option value="accent-cyan">Cyan</option><option value="structure-white">Ivory</option>
        </select></label>
        <button className="landing-primary" type="submit">{resume ? 'Replay Touchdown' : 'Play Touchdown'}</button>
      </form>
      <div className="landing-actions">
        {resume && <button onClick={() => onExit(true)}>Continue Touchdown</button>}
      </div>
    </section> : <div className="landing-interface">
      <header className="landing-panel landing-header">
        <strong>Touchdown</strong><span>{beats[stage][0]}</span>
      </header>
      <p className="landing-walk-help">WASD walk · Mouse / IJKL look · E interact · F nearby controls · Esc menu · Shift hurry</p>
      {['orbit','earth'].includes(stage) && <section className="landing-panel landing-console" aria-label="Landing screen">
        <Map zoom={stage !== 'orbit'}/>
        <div className="landing-readings">
          <span>Signal delay <strong>10 min</strong> <small>Story</small></span>
          <a href={source} target="_blank" rel="noreferrer">Perseverance landing <strong>~7 min</strong> <small>NASA fact</small></a>
        </div>
      </section>}
      <section className="landing-panel landing-caption">
        <h1 ref={caption} tabIndex={-1}>{demoComplete ? 'Landing demo complete' : beats[stage][0]}</h1>
        <p role="status">{stage === 'earth' && callsign.trim() ? beats[stage][1].replace('Commander', () => callsign.trim()) : beats[stage][1]}</p>
        {(stage === 'touchdown' || stage === 'signal') && <div className="landing-signal" aria-label="Signal travelling from Mars to Earth"><span>Mars</span><i/><span>Earth</span></div>}
        {stage === 'suit' && <span>Suit air 100% · Approach the suit rack</span>}
        {(stage === 'cycle' || stage === 'exit') && <>
          <div className="landing-pressure"><span>Pressure</span><meter min={0} max={1} value={pressure}/><strong>{Math.round(pressure * 100)}%</strong></div>
          <p role="status">{feedback}</p>
        </>}
      </section>
    </div>}
    {!menu && !demoComplete && prompt && <div className="landing-panel landing-interaction"><span className="hold-ring"><kbd>E</kbd></span> {prompt.label}{prompt.hold && <small>{settings.toggleHold ? 'Tap to start' : 'Hold to use'}</small>}</div>}
    {!menu && captureHint && <p className="landing-capture-hint">{captureHint}</p>}
    {(menu || demoComplete) && <section data-keyboard-menu className="landing-panel landing-pause" aria-label="Landing menu">
      <h2>{demoComplete ? 'Landing demo complete' : 'Paused'}</h2>
      {!demoComplete && <button onClick={() => setMenu(false)}>Resume</button>}
      {onBackToMenu && <button onClick={onBackToMenu}>Main menu</button>}
      {!demo && <button onClick={() => onExit(true, true)}>Skip to Mars surface</button>}
      {replay && !demo && <button onClick={() => { setStage('suit'); setMenu(false) }}>Skip landing</button>}
      {demoComplete && <button onClick={() => { setDemoComplete(false); setStage('orbit'); setMenu(false); enableAudio() }}>Replay landing</button>}
      {demo && <button onClick={enableAudio}>Enable sound</button>}
    </section>}
  </main>
}
