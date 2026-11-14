import assert from 'node:assert/strict'
import test from 'node:test'
import { SimRunner, readSave } from '../../src/sim/index.ts'
import { chamberPressure, hatchCanOpen } from '../../src/game/interaction/airlock.ts'
import { memoryStorage, card } from './helpers.mjs'

test('outer hatch requires less than one percent and a completed cycle', () => {
  assert.equal(chamberPressure('hab'), 1)
  assert.equal(chamberPressure('outside'), 0)
  assert.equal(hatchCanOpen('outside', .01, false), false)
  assert.equal(hatchCanOpen('outside', .009, true), false)
  assert.equal(hatchCanOpen('outside', .009, false), true)
  assert.equal(hatchCanOpen('hab', 0, false), false)
  assert.equal(hatchCanOpen('hab', 1, false), true)
})

test('practice decision pauses, autosaves, and can be replayed from before the choice', () => {
  const storage = memoryStorage()
  const runner = new SimRunner(2026, { storage })
  runner.enqueue({ type: 'practiceCard' })
  runner.update(1)
  assert.equal(runner.runtime.card.id, 'night-plan')
  assert.equal(runner.update(60), 0)
  runner.enqueue({ type: 'choose', cardId: 'night-plan', optionId: 'save' })
  runner.update(1)
  assert.equal(runner.state.power.level.heaters, .5)
  assert.equal(readSave(storage).checkpoints.length, 2)
  runner.rewind(0)
  assert.equal(runner.runtime.card.id, 'night-plan')
  runner.enqueue({ type: 'choose', cardId: 'night-plan', optionId: 'warm' })
  runner.update(1)
  assert.equal(runner.state.power.level.heaters, 1)
})

test('sleep records actual battery samples and keeps an interrupted report in a save', () => {
  const storage = memoryStorage()
  const runner = new SimRunner(2026, { storage })
  runner.state.clock.minute = 1080
  runner.runtime.scheduled.push({ at: 1140, card: card('wake'), domain: 'power', negative: false })
  runner.enqueue({ type: 'sleep' })
  runner.update(1, 2)
  assert.equal(runner.runtime.sleepHistory.samples[0].at, 1080)
  while (!runner.runtime.card) runner.update(1, 10)
  const report = readSave(storage).settings.runtime.wakeReport
  assert.equal(report.interrupted, true)
  assert.equal(report.samples.at(-1).at, 1140)
  assert(report.samples.at(-1).kWh < report.samples[0].kWh)
  assert.equal(runner.runtime.sleepHistory, undefined)
})

test('a Station View job waits for the actor to reach the selected target', () => {
  const runner = new SimRunner(2026)
  runner.enqueue({ type: 'pebbleJob', kind: 'cleanPanels', target: 'solar-1', travel: true })
  runner.update(8)
  assert.equal(runner.state.pebble.job.etaMin, 180)
  runner.enqueue({ type: 'pebbleArrived', target: 'solar-2' })
  runner.update(1)
  assert.equal(runner.state.pebble.job.etaMin, 180)
  runner.enqueue({ type: 'pebbleArrived', target: 'solar-1' })
  runner.update(1)
  assert.equal(runner.runtime.pebbleTravel, undefined)
  assert(runner.state.pebble.job.etaMin < 180)
})
