import { publicUrl } from '../publicUrl'
import { useState, type CSSProperties } from 'react'
import { MARS_TREK, RADLAB, SITES, type SiteId } from '../sim/outpost/data'
import { palette } from '../style/tokens'
import './SitePicker.css'

const colors = Object.fromEntries(Object.entries(palette).map(([id, value]) => ['--' + id, value])) as CSSProperties
const order: SiteId[] = ['gale', 'jezero', 'deuteronilus']
const stars = (n: number) => '●'.repeat(n) + '○'.repeat(3 - n)
const rating = {
  sun: (v: number) => v >= 1 ? 3 : v >= .9 ? 2 : 1,
  ice: (v: number) => v >= 20 ? 3 : v >= 10 ? 2 : 1,
  safe: (v: number) => v <= 1 ? 3 : v <= 1.1 ? 2 : 1,
}

export function SitePicker({ onPick, onBack }: { onPick: (site: SiteId) => void; onBack: () => void }) {
  const [selected, setSelected] = useState<SiteId>('gale')
  const site = SITES[selected]
  return <main className="site-picker" style={colors} data-keyboard-menu aria-label="Choose your base site">
    <header>
      <h1>Choose your base site</h1>
      <p>Every place on Mars is different. Your choice changes your power, water and radiation for the whole mission.</p>
    </header>
    <figure className="site-map">
      <div className="site-map-image">
        <img src={publicUrl('/ui/touchdown/mars-viking.webp')} alt="Map of Mars from NASA Mars Trek" />
        {order.map(id => <span key={id} className={'site-pin' + (id === selected ? ' on' : '')}
          style={{ left: (SITES[id].lon + 180) / 3.6 + '%', top: (90 - SITES[id].lat) / 1.8 + '%' }}>{SITES[id].name}</span>)}
      </div>
      <figcaption><a href={MARS_TREK.url} target="_blank" rel="noreferrer">NASA/JPL Mars Trek</a> · {MARS_TREK.layer}</figcaption>
    </figure>
    <div className="site-cards">
      {order.map(id => {
        const s = SITES[id]
        return <button key={id} className={'site-card' + (id === selected ? ' on' : '')} onFocus={() => setSelected(id)} onMouseEnter={() => setSelected(id)} onClick={() => onPick(id)}>
          <strong>{s.name}</strong>
          <small>{s.rover ? `${s.rover} rover’s home · ` : ''}{Math.abs(s.lat)}°{s.lat >= 0 ? 'N' : 'S'} · {s.elevationM.toLocaleString()} m</small>
          <span className="site-stats">
            <span>☀ Sunlight <b>{stars(rating.sun(s.sun))}</b></span>
            <span>💧 Ice <b>{stars(rating.ice(s.iceL))}</b></span>
            <span>🛡 Radiation safety <b>{stars(rating.safe(s.radiation))}</b></span>
          </span>
        </button>
      })}
    </div>
    <section className="site-detail" aria-live="polite">
      <ul>{site.why.map(line => <li key={line}>{line}</li>)}</ul>
      <p>{site.fact}</p>
      <small>Latitude and height from Mars Trek (MOLA). Radiation baseline: {RADLAB.mars.quietMean} µGy/h measured by Curiosity (NASA OSDR RadLab). Site factors are game estimates.</small>
    </section>
    <nav className="site-actions">
      <button onClick={onBack}>Back</button>
      <button className="primary" onClick={() => onPick(selected)}>Land at {site.name}</button>
    </nav>
  </main>
}
