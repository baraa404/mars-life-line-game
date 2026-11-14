import { useMissionStore } from '../../state/useMissionStore'
import { gameAudio } from './audio'
import './AudioControls.css'

export function AudioControls() {
  const settings = useMissionStore(s => s.settings)
  const update = useMissionStore(s => s.updateSettings)
  return <details className="audio-controls">
    <summary>Sound{settings.muted || settings.volume === 0 ? ' · off' : ''}</summary>
    <div>
      <button type="button" aria-pressed={settings.muted} onClick={() => { gameAudio.unlock(); update({ muted: !settings.muted }) }}>
        {settings.muted ? 'Unmute sound' : 'Mute sound'}
      </button>
      <label>Volume <output>{settings.volume}%</output>
        <input aria-label="Sound volume" type="range" min="0" max="100" value={settings.volume}
          onChange={e => { gameAudio.unlock(); update({ volume: Number(e.target.value) }) }} />
      </label>
      <label>Music <output>{settings.musicVolume}%</output>
        <input aria-label="Music volume" type="range" min="0" max="100" value={settings.musicVolume}
          onChange={e => { gameAudio.unlock(); update({ musicVolume: Number(e.target.value) }) }} />
      </label>
    </div>
  </details>
}
