import { publicUrl } from '../../publicUrl'
import manifest from '../../../public/audio/manifest.json'

type Cue = keyof typeof manifest
export type Loop = 'music' | 'ambience' | 'pebble' | 'airlock'
type Voice = { cue: Cue; source: AudioBufferSourceNode; gain: GainNode }

/** One mixer shared by landing, UI and world; playback only unlocks on a gesture. */
class GameAudio {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private music: GainNode | null = null
  private effects: GainNode | null = null
  private buffers = new Map<Cue, Promise<AudioBuffer | null>>()
  private voices = new Map<Loop, Voice>()
  private desired = new Map<Loop, { cue: Cue; level: number }>()
  private pending = new Set<Loop>()
  private last = new Map<string, number>()
  private oneShots = new Set<Voice>()
  private epoch = 0
  private step = 0
  private masterVolume = .8
  private musicVolume = .35
  private hidden = false

  unlock = () => {
    if (typeof AudioContext === 'undefined') return
    if (!this.context) {
      const context = this.context = new AudioContext()
      this.master = context.createGain()
      this.music = context.createGain()
      this.effects = context.createGain()
      const limiter = context.createDynamicsCompressor()
      limiter.threshold.value = -6; limiter.knee.value = 8
      limiter.ratio.value = 12; limiter.attack.value = .003; limiter.release.value = .18
      this.music.connect(this.master); this.effects.connect(this.master)
      this.master.connect(limiter).connect(context.destination)
      this.applyVolumes()
      for (const cue of Object.keys(manifest) as Cue[]) void this.buffer(cue)
    }
    void this.context.resume().then(() => {
      for (const [key, value] of this.desired) this.loop(key, value.cue, value.level)
    }).catch(() => undefined)
  }

  private buffer(cue: Cue) {
    if (!this.context) return Promise.resolve(null)
    if (!this.buffers.has(cue)) {
      const context = this.context
      this.buffers.set(cue, fetch(publicUrl(manifest[cue].url))
        .then(response => { if (!response.ok) throw new Error('Audio unavailable'); return response.arrayBuffer() })
        .then(data => context.decodeAudioData(data)).catch(() => null))
    }
    return this.buffers.get(cue)!
  }

  private applyVolumes() {
    if (!this.context || !this.master || !this.music) return
    this.master.gain.setTargetAtTime(this.hidden ? 0 : this.masterVolume, this.context.currentTime, .035)
    this.music.gain.setTargetAtTime(this.musicVolume, this.context.currentTime, .15)
  }

  volumes(master: number, music: number) {
    this.masterVolume = Math.min(1, Math.max(0, master / 100))
    this.musicVolume = Math.min(1, Math.max(0, music / 100))
    this.applyVolumes()
  }

  visibility(hidden: boolean) { this.hidden = hidden; this.applyVolumes() }

  play(cue: Cue, level = .35, cooldown = .12, group: string = cue) {
    const context = this.context
    if (!context || context.state !== 'running' || this.hidden || !this.masterVolume) return
    const epoch = this.epoch
    const now = performance.now() / 1000
    if (now - (this.last.get(group) ?? -Infinity) < cooldown) return
    this.last.set(group, now)
    void this.buffer(cue).then(buffer => {
      // Do not play a late footstep or a cue from a panel already dismissed.
      if (!buffer || epoch !== this.epoch || !this.masterVolume || context.state !== 'running' || this.hidden || performance.now() / 1000 - now > .35) return
      const source = context.createBufferSource(), gain = context.createGain()
      source.buffer = buffer; gain.gain.value = Math.max(0, level)
      source.connect(gain).connect(this.effects!)
      const voice = { cue, source, gain }
      this.oneShots.add(voice)
      source.onended = () => { this.oneShots.delete(voice); source.disconnect(); gain.disconnect() }
      source.start()
    })
  }

  footstep(outside: boolean) {
    const variant = this.step++ % 4 + 1
    this.play(`footstep-${outside ? 'regolith' : 'cabin'}-${variant}` as Cue, .42, .2, 'footstep')
  }

  loop(key: Loop, cue: Cue, level: number) {
    this.desired.set(key, { cue, level })
    const voice = this.voices.get(key)
    if (voice) {
      if (voice.cue === cue) {
        voice.gain.gain.setTargetAtTime(level, this.context!.currentTime, .12)
        return
      }
      this.stopVoice(key)
    }
    if (!this.context || this.context.state !== 'running' || this.pending.has(key)) return
    this.pending.add(key)
    void this.buffer(cue).then(buffer => {
      this.pending.delete(key)
      const desired = this.desired.get(key), context = this.context
      if (!desired || !context || context.state !== 'running') return
      if (desired.cue !== cue) { this.loop(key, desired.cue, desired.level); return }
      if (!buffer || this.voices.has(key)) return
      const source = context.createBufferSource(), gain = context.createGain()
      source.buffer = buffer; source.loop = true
      gain.gain.setValueAtTime(0, context.currentTime)
      gain.gain.setTargetAtTime(desired.level, context.currentTime, .15)
      source.connect(gain).connect(key === 'music' ? this.music! : this.effects!)
      source.onended = () => { source.disconnect(); gain.disconnect() }
      this.voices.set(key, { cue, source, gain })
      source.start()
    })
  }

  private stopVoice(key: Loop) {
    const voice = this.voices.get(key)
    if (!voice || !this.context) return
    voice.gain.gain.setTargetAtTime(0, this.context.currentTime, .035)
    voice.source.stop(this.context.currentTime + .2)
    this.voices.delete(key)
  }

  stop(key: Loop) { this.desired.delete(key); this.stopVoice(key) }
  stopAll() {
    this.epoch++
    for (const key of ['music', 'ambience', 'pebble', 'airlock'] as const) this.stop(key)
    if (this.context) {
      for (const voice of this.oneShots) {
        voice.gain.gain.setTargetAtTime(0, this.context.currentTime, .035)
        voice.source.stop(this.context.currentTime + .2)
      }
      this.oneShots.clear()
    }
  }
}

export const gameAudio = new GameAudio()
