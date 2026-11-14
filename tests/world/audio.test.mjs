import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'

// Exercise the real mixer against a small Web Audio model: asynchronous decoding,
// source lifecycle, mute and suspension are the regression-sensitive boundaries.
async function fixture() {
  const sources = [], contexts = []
  const parameter = () => ({ value: 0, setTargetAtTime(v) { this.value = v }, setValueAtTime(v) { this.value = v } })
  const node = () => ({ connect() { return this }, disconnect() {}, gain: parameter() })
  class AudioContext {
    state = 'running'; currentTime = 0; destination = node()
    constructor() { contexts.push(this) }
    createGain() { return node() }
    createDynamicsCompressor() { return { ...node(), threshold: parameter(), knee: parameter(), ratio: parameter(), attack: parameter(), release: parameter() } }
    createBufferSource() {
      const s = { ...node(), loop: false, buffer: null, started: false, stopped: false,
        start() { this.started = true }, stop() { this.stopped = true; this.onended?.() } }
      sources.push(s); return s
    }
    resume() { this.state = 'running'; return Promise.resolve() }
    decodeAudioData(bytes) { return Promise.resolve({ bytes }) }
  }
  globalThis.AudioContext = AudioContext
  const fetchBefore = globalThis.fetch
  globalThis.fetch = async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(4) })
  const manifest = JSON.parse(await readFile(new URL('../../public/audio/manifest.json', import.meta.url), 'utf8'))
  let source = await readFile(new URL('../../src/game/audio/audio.ts', import.meta.url), 'utf8')
  source = source.replace(/^import manifest .*$/m, 'const manifest = ' + JSON.stringify(manifest))
  source = source.replace(/^import \{ publicUrl \} .*$/m, 'import { publicUrl } from ' + JSON.stringify(new URL('../../src/publicUrl.ts', import.meta.url).href))
  const js = stripTypeScriptTypes(source)
  const { gameAudio } = await import('data:text/javascript,' + encodeURIComponent(js) + '#' + Math.random())
  const flush = () => new Promise(resolve => setImmediate(resolve))
  return { gameAudio, sources, contexts, flush, cleanup() { globalThis.fetch = fetchBefore; delete globalThis.AudioContext } }
}

test('mixer waits for a gesture and decoding cannot resurrect a stopped loop', async () => {
  const f = await fixture()
  try {
    f.gameAudio.loop('music', 'pale-blue-morning', .3)
    assert.equal(f.contexts.length, 0)
    f.gameAudio.unlock()
    f.gameAudio.stopAll()
    await f.flush()
    assert.equal(f.sources.length, 0)
    f.gameAudio.loop('music', 'pale-blue-morning', .3)
    await f.flush()
    assert.equal(f.sources.length, 1)
    for (let i=0;i<100;i++) f.gameAudio.loop('music', 'pale-blue-morning', .2)
    assert.equal(f.sources.length, 1, 'frame updates reuse the playing source')
    f.gameAudio.stopAll()
    assert.equal(f.sources[0].stopped, true)
  } finally { f.cleanup() }
})

test('latest cue wins while decoding, footsteps rotate, and mute suppresses one-shots', async () => {
  const f = await fixture()
  try {
    f.gameAudio.unlock(); await f.flush()
    f.gameAudio.loop('pebble', 'pebble-drive', .3)
    f.gameAudio.loop('pebble', 'pebble-clean', .2)
    await f.flush(); await f.flush()
    assert.equal(f.sources.length, 1)
    assert.equal(f.sources[0].loop, true)
    f.gameAudio.footstep(true); f.gameAudio.footstep(true)
    await f.flush()
    assert.equal(f.sources.length, 2, 'same-frame steps do not pile up')
    f.gameAudio.volumes(0, 35)
    f.gameAudio.play('door'); await f.flush()
    assert.equal(f.sources.length, 2)
    f.gameAudio.volumes(80, 35); f.gameAudio.visibility(true)
    f.gameAudio.play('door'); await f.flush()
    assert.equal(f.sources.length, 2)
    f.gameAudio.visibility(false)
    f.gameAudio.play('ui-confirm')
    f.gameAudio.stopAll()
    await f.flush()
    assert.equal(f.sources.length, 2, 'a pending one-shot is cancelled on pause or route change')
    assert.equal(f.sources[1].stopped, true, 'already playing one-shots fade out too')
  } finally { f.cleanup() }
})
