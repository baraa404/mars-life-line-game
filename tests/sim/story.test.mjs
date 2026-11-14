import test from 'node:test'
import assert from 'node:assert/strict'
import { act, brief, createStory, danger, grade, nextSpots, tick, weakened, RATES, SURVIVAL } from '../../src/sim/story/story.ts'

function run(s, ...actions) {
  for (const action of actions) {
    const r = act(s, action)
    assert.ok(r.ok, `${action.type} failed: ${r.message}`)
    s = r.state
  }
  return s
}
function wait(s, seconds, step = .1) {
  for (let t = 0; t < seconds; t += step) s = tick(s, step).state
  return s
}
function growAndHarvest(s) {
  for (let guard = 0; guard < 4000 && s.scene === 4; guard++) {
    s = wait(s, 1)
    s.trays.forEach((t, i) => { if (t.blocked) s = run(s, { type: 'clearTray', tray: i }) })
    s.trays.forEach((t, i) => { if (t.growth >= 1 && !t.harvested && s.scene === 4) s = run(s, { type: 'harvest', tray: i }) })
  }
  return s
}

function playthrough({ power, mode, storm, cover, late }) {
  let s = createStory('gale')
  s = wait(s, 45)
  s = run(s, { type: 'enterHab' }, { type: 'terminal' })
  assert.equal(s.scene, 2)
  s = wait(s, power === 'clean' ? 80 : 50)
  s = power === 'clean'
    ? run(s, ...[0, 1, 2, 3].map(panel => ({ type: 'cleanPanel', panel })))
    : run(s, { type: 'backup' })
  assert.equal(s.scene, 3)
  s = wait(s, 60)
  assert.equal(act(s, { type: 'startOxygen' }).ok, false, 'oxygen needs the recycler first')
  s = run(s, { type: 'takeFilter' }, { type: 'installFilter' }, { type: 'startRecycler' }, { type: 'startOxygen' })
  assert.equal(s.scene, 4)
  s = wait(s, 50)
  s = run(s, { type: 'greenhouse', inside: true }, { type: 'valve' }, { type: 'lights' }, { type: 'mode', mode })
  s = growAndHarvest(s)
  assert.equal(s.scene, 5)
  s = wait(s, 45)
  s = run(s, { type: 'terminal' }, { type: 'confirm' })
  assert.equal(s.scene, 6)
  s = run(s, storm === 'emergency' ? { type: 'mode', mode: 'emergency' } : { type: 'override' })
  if (cover) s = run(s, { type: 'secure', system: 'oxygen' }, { type: 'secure', system: 'recycler' })
  s = wait(s, late ? RATES.stormWarning + 10 : 20)
  s = run(s, { type: 'shelter' })
  for (let guard = 0; guard < 2000 && s.scene === 6; guard++) s = wait(s, .5)
  assert.equal(s.scene, 7)
  s = wait(s, 40)
  s = run(s, { type: 'report' })
  if (process.env.STORY_DEBUG) console.log(Math.round(s.time), grade(s).checks.map(c => c.id + '=' + c.value).join(' '))
  return s
}

test('a careful commander finishes in about ten minutes with Mission Success', () => {
  const s = playthrough({ power: 'clean', mode: 'balanced', storm: 'emergency', cover: true })
  assert.equal(s.ending, 'success', JSON.stringify(grade(s).checks))
  assert.ok(s.time > 300 && s.time < 700, `mission took ${Math.round(s.time)} s`)
  assert.ok(s.dose < 100)
})

test('risky choices show their consequences and end with Improvements Needed', () => {
  const s = playthrough({ power: 'backup', mode: 'farming', storm: 'farming', cover: false, late: true })
  assert.equal(s.ending, 'improve', JSON.stringify(grade(s).checks))
  const failed = grade(s).checks.filter(c => !c.ok).map(c => c.id)
  assert.ok(failed.includes('radiation'))
  assert.ok(failed.includes('power') || failed.includes('water'), failed.join())
  assert.ok(s.damaged.includes('oxygen') && s.damaged.includes('recycler'))
})

test('backup power drains while clean panels keep charging', () => {
  let clean = run(createStory('gale'), { type: 'terminal' }, ...[0, 1, 2, 3].map(panel => ({ type: 'cleanPanel', panel })))
  let backup = run(createStory('gale'), { type: 'terminal' }, { type: 'backup' })
  for (const s of [clean, backup]) assert.equal(s.scene, 3)
  clean = run(clean, { type: 'takeFilter' }, { type: 'installFilter' }, { type: 'startRecycler' }, { type: 'startOxygen' })
  backup = run(backup, { type: 'takeFilter' }, { type: 'installFilter' }, { type: 'startRecycler' }, { type: 'startOxygen' })
  const before = backup.power
  clean = wait(clean, 120); backup = wait(backup, 120)
  assert.ok(clean.power > 60, `clean ${clean.power}`)
  assert.ok(backup.power < before, `backup ${before} -> ${backup.power}`)
})

test('the scene 2 choice offers two options and actions are pure', () => {
  const s = run(createStory('jezero'), { type: 'terminal' })
  const b = brief(s)
  assert.equal(b.choice.options.length, 2)
  assert.deepEqual(nextSpots(s).sort(), ['battery', 'panels'])
  const copy = structuredClone(s)
  act(s, { type: 'cleanPanel', panel: 0 })
  assert.deepEqual(s, copy)
  assert.equal(act(createStory('gale'), { type: 'takeFilter' }).ok, false, 'later scenes stay locked')
})

test('a blocked drip line stalls a tray until it is cleared', () => {
  let s = run(createStory('gale'), { type: 'terminal' }, { type: 'backup' }, { type: 'takeFilter' }, { type: 'installFilter' }, { type: 'startRecycler' }, { type: 'startOxygen' })
  s = run(s, { type: 'valve' }, { type: 'lights' }, { type: 'mode', mode: 'balanced' })
  s = wait(s, RATES.growSeconds * .4)
  assert.ok(s.trays[0].blocked)
  const growth = s.trays[0].growth
  s = wait(s, 5)
  assert.equal(s.trays[0].growth, growth)
  s = run(s, { type: 'clearTray', tray: 0 })
  s = wait(s, 2)
  assert.ok(s.trays[0].growth > growth)
})

test('an idle commander runs out of food and the mission is lost', () => {
  let s = createStory('gale')
  for (let guard = 0; guard < 800 && !s.ending; guard++) s = wait(s, 1)
  assert.equal(s.ending, 'lost')
  assert.equal(s.cause, 'food')
  assert.ok(s.time > 3 / RATES.crewFood, `starved at ${Math.round(s.time)} s`)
  assert.equal(act(s, { type: 'terminal' }).ok, false, 'nothing works after the mission is lost')
})

test('an empty supply is fatal only after its grace period, and recovery resets it', () => {
  let s = createStory('gale')
  s.oxygen = 0
  s = wait(s, SURVIVAL.oxygen / 2)
  assert.equal(s.ending, null)
  assert.ok(weakened(s))
  assert.equal(danger(s).cause, 'oxygen')
  s = wait(s, SURVIVAL.oxygen / 2 + 1)
  assert.equal(s.cause, 'oxygen')

  let w = createStory('gale')
  w.water = 0
  w = wait(w, SURVIVAL.water * .6)
  assert.equal(w.ending, null)
  w.water = 50
  w = wait(w, SURVIVAL.water * .4)
  assert.equal(w.strain.water, 0)
  assert.equal(weakened(w), false)
})

test('staying outside in the radiation storm is fatal', () => {
  let s = createStory('gale')
  Object.assign(s, { scene: 6, storm: 0 })
  s = wait(s, RATES.stormLength)
  assert.equal(s.ending, 'lost')
  assert.equal(s.cause, 'radiation')
})

test('a tray left blocked too long dies for good', () => {
  let s = run(createStory('gale'), { type: 'terminal' }, { type: 'backup' }, { type: 'takeFilter' }, { type: 'installFilter' }, { type: 'startRecycler' }, { type: 'startOxygen' })
  s = run(s, { type: 'valve' }, { type: 'lights' }, { type: 'mode', mode: 'balanced' })
  s = wait(s, RATES.growSeconds * .4 + RATES.witherAt + 1)
  assert.ok(s.trays[0].dead)
  const food = s.food
  s = run(s, { type: 'harvest', tray: 0 })
  assert.equal(s.food, food)
})
