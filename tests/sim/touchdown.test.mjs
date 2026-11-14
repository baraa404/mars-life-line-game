import assert from 'node:assert/strict'
import test from 'node:test'
import { SimRunner, replay } from '../../src/sim/index.ts'
import { landingDuration, nextLandingStage } from '../../src/game/missions/m0.ts'

test('landing pauses for ARM, suit check and the airlock', () => {
  assert.equal(nextLandingStage('entry'), 'arm')
  assert.equal(nextLandingStage('arm'), 'thrust')
  assert.equal(nextLandingStage('signal'), 'suit')
  for (const stage of ['arm', 'suit', 'seal', 'cycle', 'exit']) assert.equal(landingDuration[stage], undefined)
})

test('opening reaches touchdown within 25 timed seconds and suit check within 30', () => {
  const arrival = ['orbit', 'earth', 'entry', 'thrust'].reduce((seconds, stage) => seconds + landingDuration[stage], 0)
  assert(arrival <= 25)
  assert(arrival + landingDuration.touchdown + landingDuration.signal <= 30)
})

for (const plan of ['earth','warm','grow']) {
  test('Touchdown completes at dawn after the ' + plan + ' startup plan and replays deterministically', () => {
    const sim = new SimRunner(2026)
    sim.enqueue({ type: 'm0Land' })
    sim.enqueue({ type: 'setLocation', location: 'outside' })
    sim.tick()
    assert.equal(sim.runtime.mission, 'm0-walk')
    assert(sim.state.you.suitO2Kg > .49)
    assert(sim.state.air.o2Kg > 9.99)
    sim.enqueue({ type: 'setLocation', location: 'hab' })
    sim.enqueue({ type: 'm0WakeStation' })
    sim.tick()
    assert.equal(sim.runtime.card?.id, 'm0-startup')
    assert.equal(sim.update(20), 0)
    sim.enqueue({ type: 'choose', cardId: 'm0-startup', optionId: plan })
    sim.update(1)
    assert.equal(sim.runtime.mission, 'm0-night')
    if (plan === 'earth') assert(sim.state.comms.outbox.some(message => message.id === 'm0-video'))
    if (plan === 'warm') assert.equal(sim.state.power.level.heaters, 1)
    if (plan === 'grow') assert.equal(sim.state.food.trays[0].crop, 'mizuna')
    while (sim.state.clock.minute < 1020) sim.update(1)
    sim.sleep()
    assert.equal(sim.runtime.mission, 'm0-complete')
    assert.equal(sim.runtime.wakeReport.interrupted, false)
    assert.equal(sim.state.clock.minute, 360)
    assert.equal(sim.state.you.energy, plan === 'warm' ? 3 : 2)
    if (plan === 'earth') assert(sim.runtime.wakeReport.messages.some(message => message.id === 'm0-video:reply'))
    assert.deepEqual(replay(2026, sim.decisionLog, sim.runtime.steps).state, sim.state)
  })
}
