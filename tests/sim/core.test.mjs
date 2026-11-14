import assert from 'node:assert/strict'
import test from 'node:test'
import { createHash } from 'node:crypto'
import { createInitialState, LOAD_IDS } from '../../src/sim/state.ts'
import { SimRunner, replay } from '../../src/sim/runner.ts'
import { random } from '../../src/sim/rng.ts'
import { step } from '../../src/sim/step.ts'
import { SAVE_KEY, assertInvariants, migrateSave, readSave } from '../../src/sim/save.ts'
import { absoluteMinute, advanceClock, daylight } from '../../src/sim/time.ts'
import { card, fresh, memoryStorage, near } from './helpers.mjs'
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
test('version-2 initial schema and exact starting stocks; no mode field', () => {
  const s = createInitialState(42)
  assert.equal(s.version, 2); assert(!('mode' in s))
  assert.equal(s.power.batteryKWh, 48); assert.equal(s.power.batteryCapKWh, 80)
  assert.equal(s.air.o2Kg, 10); assert.equal(s.water.liters, 60); assert.equal(s.food.pantrySols, 50)
  assert.equal(s.power.panelDust, 0.05); assert.equal(s.air.scrubberLife, 1); assert.equal(s.pebble.batteryPct, 100)
  assert.equal(s.food.trays.length, 3); assert.deepEqual(Object.keys(s.power.on), [...LOAD_IDS])
  assertInvariants(s)
})
test('mulberry32 known output and repeatability', () => {
  const a = { rng: 1 }, b = { rng: 1 }
  near(random(a), 0.6270739405881613)
  random(b)
  for (let i = 0; i < 100; i++) assert.equal(random(a), random(b))
})
test('clock wraps exactly every 1440 minutes; daylight never leaks into night', () => {
  const [s] = fresh(); const before = absoluteMinute(s)
  for (let i = 0; i < 1440; i++) advanceClock(s)
  assert.equal(absoluteMinute(s) - before, 1440); assert.equal(s.clock.sol, 2)
  for (const h of [0, 5, 6, 18, 23, 24]) assert.equal(daylight(h), 0)
  near(daylight(12), 1)
})
test('command queue applies next step, normal fixed accumulation and pause discard time', () => {
  const r = new SimRunner()
  r.enqueue({ type: 'toggleLoad', load: 'lab', on: true }); assert.equal(r.state.power.on.lab, false)
  assert.equal(r.update(0.6), 0); assert.equal(r.update(0.4), 1); assert(r.state.power.on.lab)
  const time = absoluteMinute(r.state); r.paused = true; r.update(900)
  assert.equal(absoluteMinute(r.state), time); r.paused = false; assert.equal(r.update(0.9), 0)
  assert.throws(() => r.enqueue({ type: 'setLevel', load: 'heaters', level: NaN }))
  assert.throws(() => r.update(Infinity))
})
test('fixed accumulator caps at 2000 steps and preserves remaining elapsed time', () => {
  const r = new SimRunner(); r.state.power.fissionOnline = true
  assert.equal(r.update(2500), 2000); assert.equal(r.update(0), 500)
})
test('priority order remains complete; life support cannot be switched or dimmed by player', () => {
  const r = new SimRunner()
  r.enqueue({ type: 'setPriority', priority: [...LOAD_IDS].reverse() })
  r.enqueue({ type: 'toggleLoad', load: 'lifeSupport', on: false })
  r.enqueue({ type: 'setLevel', load: 'lifeSupport', level: 0 }); r.tick()
  assert.equal(r.state.power.priority[0], 'lifeSupport'); assert.equal(r.state.power.on.lifeSupport, true)
  assert.equal(r.state.power.level.lifeSupport, undefined)
  assert.throws(() => r.enqueue({ type: 'setPriority', priority: ['lifeSupport'] }))
})
test('sleep and awake nights use exactly the same resource steps', () => {
  const asleep = new SimRunner(), awake = new SimRunner()
  for (const r of [asleep, awake]) { r.state.clock.minute = 1080; r.state.power.batteryKWh = 80 }
  asleep.sleep()
  while (absoluteMinute(awake.state) < absoluteMinute(asleep.state)) awake.tick()
  for (const key of ['power', 'air', 'water', 'food', 'rad', 'rover']) assert.deepEqual(asleep.state[key], awake.state[key])
  assert.equal(asleep.state.clock.minute, 360); assert.equal(asleep.state.you.energy, 3)
  assert.equal(awake.state.you.energy, 2) // 02:00 crossed; 06:00 has not yet been processed.
})
test('sleep validates location, seal, time; tired daytime nap lasts three hours', () => {
  for (const setup of [r => { r.state.you.location = 'outside' }, r => { r.runtime.airlockSealed = false }, () => {}]) {
    const r = new SimRunner(); setup(r); r.sleep(); assert(!r.runtime.fastForward); assert(!r.state.clock.sleeping)
  }
  const r = new SimRunner(); r.state.you.energy = 1
  const start = absoluteMinute(r.state); r.sleep(); assert.equal(absoluteMinute(r.state) - start, 180); assert.equal(r.state.you.energy, 3)
})
test('wait is daytime, inside, 1/2/4 hours and cannot cross sunset', () => {
  const r = new SimRunner(); const start = absoluteMinute(r.state); r.wait(2)
  assert.equal(absoluteMinute(r.state) - start, 120)
  r.wait(4); assert(!r.runtime.fastForward); assert.equal(r.runtime.steps, 121)
  assert.throws(() => r.wait(3))
  r.state.you.location = 'outside'; const at = r.runtime.steps; r.wait(1); assert.equal(r.runtime.steps, at + 1)
})
test('sleep and wait stop at decision events; pre-existing cards never advance', () => {
  for (const type of ['sleep', 'wait']) {
    const r = new SimRunner(); if (type === 'sleep') r.state.clock.minute = 1080
    const start = absoluteMinute(r.state)
    r.runtime.scheduled.push({ at: start + 10, card: card('alarm'), domain: 'test', negative: true })
    if (type === 'sleep') r.sleep()
    else r.wait(1)
    assert.equal(r.runtime.card.id, 'alarm'); assert.equal(absoluteMinute(r.state), start + 11)
    assert.equal(r.state.clock.sleeping, false); assert.equal(r.runtime.fastForward, null)
    const before = r.runtime.steps; assert.equal(r.tick(), false); r.update(100); assert.equal(r.runtime.steps, before)
    if (type === 'sleep') assert(r.runtime.notices.some(n => n.kind === 'wokeUp'))
    r.enqueue({ type: 'choose', cardId: 'alarm', optionId: 'b' }); r.tick()
    assert.equal(r.runtime.card, null); assert.equal(r.state.power.level.heaters, 0.5)
  }
})
test('mission skip runs standing orders and interrupts cards', () => {
  const r = new SimRunner(); r.state.power.fissionOnline = true
  r.skipSols(2); assert.equal(r.runtime.steps, 2880); assert.equal(r.state.clock.sol, 3)
  r.runtime.scheduled.push({ at: absoluteMinute(r.state) + 4, card: card('skip'), domain: 'test', negative: true })
  r.skipSols(2); assert.equal(r.runtime.card.id, 'skip'); assert.equal(r.runtime.steps, 2885)
  assert.throws(() => r.skipSols(8))
})
test('autosaves sleep/decisions, checkpoint ring <=20, reload and rewind preserve continuation', () => {
  const storage = memoryStorage(), r = new SimRunner(1, { storage })
  r.state.clock.minute = 1080; r.state.power.batteryKWh = 80; r.sleep()
  assert(storage.getItem(SAVE_KEY)); assert(r.checkpoints.length >= 1)
  for (let i = 0; i < 24; i++) {
    r.runtime.card = card(`choice-${i}`); r.enqueue({ type: 'choose', cardId: `choice-${i}`, optionId: 'a' }); r.tick()
  }
  assert.equal(r.checkpoints.length, 20)
  const loaded = new SimRunner(0, { storage, restore: true })
  assert.deepEqual(loaded.state, r.state); assert.deepEqual(loaded.runtime, r.runtime)
  for (let i = 0; i < 10; i++) { r.tick(); loaded.tick() }
  assert.deepEqual(loaded.state, r.state); assert.deepEqual(loaded.runtime, r.runtime)
  loaded.rewind(0); assert.deepEqual(loaded.state, loaded.checkpoints[0].simState)
})
test('malformed/unsupported saves rejected, denied storage does not crash', () => {
  const r = new SimRunner(), data = r.exportSave()
  assert.equal(migrateSave(data).simState.version, 2)
  for (const corrupt of [d => { d.simState.version = 1 }, d => { d.simState.air.o2Kg = -1 }, d => { delete d.settings.runtime }, d => { d.simState.power.batteryKWh = 100 }, d => { d.simState.power.on.heaters = 'yes' }]) {
    const d = structuredClone(data); corrupt(d); assert.throws(() => migrateSave(d))
  }
  const bad = { getItem() { throw new Error('denied') }, setItem() { throw new Error('full') } }
  const safe = new SimRunner(1, { storage: bad, restore: true }); safe.save(); assert.equal(safe.runtime.notices.length, 2)
  const m = memoryStorage(); m.setItem(SAVE_KEY, '{bad'); assert.throws(() => readSave(m))
})
test('same seed + queued command log replay yields identical state and runtime hashes', () => {
  const r = new SimRunner(77)
  r.enqueue({ type: 'startSep', eventId: 'test' }); r.tick()
  r.enqueue({ type: 'sendMessage', text: 'Hello' }); r.enqueue({ type: 'toggleLoad', load: 'dish', on: true }); r.tick()
  r.wait(2); r.sleep()
  for (let i = 0; i < 1000; i++) {
    if (r.runtime.card) r.enqueue({ type: 'choose', cardId: r.runtime.card.id, optionId: r.runtime.card.options[0].id })
    r.tick()
  }
  const copy = replay(77, r.decisionLog, r.runtime.steps)
  assert.equal(hash(copy.state), hash(r.state)); assert.equal(hash(copy.runtime), hash(r.runtime))
})
test('low-stock return is preceded by warning, decision and a full sol of notice', () => {
  const [s, r] = fresh(); s.air.o2Kg = 0.1; s.power.fissionOnline = true
  step(s, r); assert.equal(r.card.id, 'air:1')
  step(s, r, [{ type: 'choose', cardId: r.card.id, optionId: 'review' }]); assert.equal(r.card.id, 'air:2')
  step(s, r, [{ type: 'choose', cardId: r.card.id, optionId: 'review' }])
  for (let i = 0; i < 1441; i++) {
    if (r.card) step(s, r, [{ type: 'choose', cardId: r.card.id, optionId: 'review' }]); else step(s, r)
  }
  const stop = s.log.find(e => e.kind === 'returnToShip'); assert(stop)
  const yellow = s.log.find(e => e.kind === 'threshold'); assert((stop.sol - yellow.sol) * 1440 + stop.minute - yellow.minute >= 1440)
})
test('headless policy executes all 86400 minutes for 60 sols with finite bounded stocks', async () => {
  const { runCampaignCheck } = await import('../../scripts/sim-check.mjs')
  const result = runCampaignCheck(2026, 60)
  assert.equal(result.steps, 60 * 1440); assert.equal(result.sols, 60)
  assert(result.decisions > 0); assert(result.batteryKWh >= 0 && result.batteryKWh <= 80)
})
test('freshly woken astronaut keeps restored energy when the 06:00 step runs', () => {
  const r = new SimRunner(); r.state.clock.minute = 1080; r.state.power.batteryKWh = 80
  r.sleep(); assert.equal(r.state.you.energy, 3); r.tick(); assert.equal(r.state.you.energy, 3)
})
test('save loader rejects malformed jobs, crops, pending skips and scheduled cards', () => {
  const data = new SimRunner().exportSave()
  for (const corrupt of [d => { d.simState.food.trays[0].crop = 'invalid' }, d => { d.simState.pebble.job = {kind:'bogus',etaMin:2,target:'x'} }, d => { d.settings.runtime.fastForward = {} }, d => { d.settings.runtime.scheduled = [{at:1,card:{},domain:'x',negative:true}] }]) {
    const d = structuredClone(data); corrupt(d); assert.throws(() => migrateSave(d))
  }
})
test('seeded weighted event deck and choices replay across sol boundaries', () => {
  const deck = [
    { id: 'one', domain: 'test-one', negative: true, cooldownSols: 2, forecastLead: 10, weight: () => 1, card: card('one') },
    { id: 'two', domain: 'test-two', negative: true, cooldownSols: 2, forecastLead: 10, weight: () => 3, card: card('two') },
  ]
  const r = new SimRunner(1234, { deck })
  for (let i = 0; i < 4000; i++) {
    if (r.runtime.card) r.enqueue({ type: 'choose', cardId: r.runtime.card.id, optionId: r.runtime.card.options[0].id })
    r.tick()
  }
  assert(r.state.log.some(e => e.kind === 'event'))
  const copy = replay(1234, r.decisionLog, r.runtime.steps, deck)
  assert.equal(hash(copy.state), hash(r.state)); assert.equal(hash(copy.runtime), hash(r.runtime))
})
