import test from 'node:test'
import assert from 'node:assert/strict'
import { Vector3 } from 'three'
import { availableTargets, aimedTarget, stepInteraction } from '../../src/game/interaction/targeting.ts'
import { nextControlIndex, menuControls } from '../../src/ui/keyboardNavigation.ts'
import { useMissionStore, playerInputBlocked } from '../../src/state/useMissionStore.ts'

const eye = new Vector3(0, 1.6, 0), look = new Vector3(0, 0, -1)
const target = { id: 'console', point: [0, 1.6, -2] }
const input = (overrides = {}) => ({ id: 'console', held: false, pressed: false, toggled: false, duration: 0, ...overrides })

test('targets require range, enabled state, approach side and clear line of sight', () => {
  assert.equal(availableTargets([target], eye).length, 1)
  assert.equal(availableTargets([{ ...target, range: 1 }], eye).length, 0)
  assert.equal(availableTargets([{ ...target, enabled: false }], eye).length, 0)
  assert.equal(availableTargets([target], eye, () => true).length, 0)
  assert.equal(availableTargets([{ ...target, approach: true }], new Vector3(0, 1.6, -3)).length, 0)
  assert.equal(availableTargets([{ ...target, approach: true }], eye).length, 1)
})

test('aim selection returns one closest-to-reticle target, excluding objects behind the player', () => {
  const off = { ...target, id: 'off', point: [.3, 1.6, -2] }
  const behind = { ...target, id: 'behind', point: [0, 1.6, 2] }
  assert.equal(aimedTarget([off, target, behind], eye, look)?.id, target.id)
  assert.equal(aimedTarget([behind], eye, look), undefined)
})

test('a tap activates exactly once and a missing target consumes the input', () => {
  const key = input({ pressed: true })
  assert(stepInteraction(key, target, .016, false).activate)
  assert(!stepInteraction(key, target, .016, false).activate)
  key.pressed = true
  assert(!stepInteraction(key, undefined, .016, false).activate)
  assert(!stepInteraction(key, target, .016, false).activate)
})

test('holds cancel on release, target change, blocking and toggle cancellation', () => {
  const held = { ...target, hold: true }, key = input({ held: true })
  for (let i = 0; i < 4; i++) assert(!stepInteraction(key, held, .1, false).activate)
  key.held = false
  assert.equal(stepInteraction(key, held, .1, false).progress, 0)
  key.held = true
  stepInteraction(key, held, .1, false)
  assert.equal(stepInteraction(key, { ...held, id: 'bunk' }, .1, false).progress, 0)
  key.held = true
  stepInteraction(key, undefined, .1, false)
  assert.equal(key.duration, 0)
  const toggle = input({ pressed: true })
  assert(stepInteraction(toggle, held, .1, true).progress > 0)
  toggle.pressed = true
  assert.equal(stepInteraction(toggle, held, .1, true).progress, 0)
})

test('completed holds activate only once until another press', () => {
  const key = input({ held: true }), held = { ...target, hold: true }
  let activations = 0
  for (let i = 0; i < 30; i++) activations += Number(stepInteraction(key, held, .1, false).activate)
  assert.equal(activations, 1)
})

test('menu selection wraps in either direction and handles empty menus', () => {
  assert.equal(nextControlIndex(2, 3, 1), 0)
  assert.equal(nextControlIndex(0, 3, -1), 2)
  assert.equal(nextControlIndex(0, 0, 1), -1)
})

test('menu controls filters disabled and hidden elements, discovering visible buttons', () => {
  const root = {
    querySelectorAll: () => [
      { matches: () => false, closest: () => null, getClientRects: () => [1] },
      { matches: () => true, closest: () => null, getClientRects: () => [1] },
      { matches: () => false, closest: () => ({}), getClientRects: () => [1] },
      { matches: () => false, closest: () => null, getClientRects: () => [] },
    ]
  }
  const controls = menuControls(root)
  assert.equal(controls.length, 1)
})

test('pending decisions allow movement even during interrupted sleep; opening blocks input', () => {
  useMissionStore.setState({ view: 'firstPerson', openPanel: null, paused: false, fading: false, decisionOpen: false,
    currentCard: { id: 'decision', options: [] }, snapshot: { fastForward: true } })
  assert.equal(playerInputBlocked(useMissionStore.getState()), false)
  useMissionStore.getState().openDecision()
  assert.equal(playerInputBlocked(useMissionStore.getState()), true)
  useMissionStore.setState({ decisionOpen: false, currentCard: null, snapshot: null })
  assert.equal(playerInputBlocked(useMissionStore.getState()), false)
})

test('nested panels return to their parent, and closing or switching views clears history', () => {
  const ui = useMissionStore.getState()
  ui.setPanel('pause'); ui.setPanel('guide'); ui.setPanel('why')
  ui.backPanel(); assert.equal(useMissionStore.getState().openPanel, 'guide')
  ui.backPanel(); assert.equal(useMissionStore.getState().openPanel, 'pause')
  ui.setPanel(null); assert.deepEqual(useMissionStore.getState().panelHistory, [])
  ui.setPanel('module:battery'); ui.setPanel('power'); ui.setView('station')
  assert.deepEqual(useMissionStore.getState().panelHistory, [])
  assert.equal(useMissionStore.getState().openPanel, null)
})

test('pending decisions allow airlock navigation without advancing simulation time', async () => {
  const { SimRunner } = await import('../../src/sim/runner.ts')
  const sim = new SimRunner(2026)
  sim.enqueue({ type: 'practiceCard' }); sim.update(1)
  const card = structuredClone(sim.runtime.card)
  assert(card)
  const minute = sim.state.clock.minute, battery = sim.state.power.batteryKWh
  sim.enqueue({ type: 'setLocation', location: 'outside' })
  sim.enqueue({ type: 'setAirlock', sealed: false })
  sim.update(10)
  assert.equal(sim.state.you.location, 'outside')
  assert.equal(sim.runtime.airlockSealed, false)
  assert.equal(sim.state.clock.minute, minute)
  assert.equal(sim.state.power.batteryKWh, battery)
  assert.deepEqual(sim.runtime.card, card)
  sim.enqueue({ type: 'setLocation', location: 'hab' })
  sim.enqueue({ type: 'setAirlock', sealed: true }); sim.update(10)
  assert.equal(sim.state.you.location, 'hab')
  assert.equal(sim.runtime.airlockSealed, true)
  assert.equal(sim.state.clock.minute, minute)
})

test('equipment has forgiving aim bounds while cabin controls stay precise', () => {
  const equipment = { ...target, point: [.65, 1.6, -3], aimRadius: .85 }
  assert.equal(aimedTarget([equipment], eye, look)?.id, target.id)
  assert.equal(aimedTarget([{ ...equipment, aimRadius: undefined }], eye, look), undefined)
  assert.equal(aimedTarget([{ ...equipment, point: [.65, 1.6, -.2] }], eye, look), undefined)
})
test('overlapping targets on the reticle select the nearer object independent of order', () => {
  const far = { ...target, id: 'far', point: [0, 1.6, -3] }
  assert.equal(aimedTarget([far, target], eye, look)?.id, target.id)
  assert.equal(aimedTarget([target, far], eye, look)?.id, target.id)
})

test('control terminal switches view to station mode instead of opening terminal panel', () => {
  useMissionStore.setState({ view: 'firstPerson', openPanel: null })
  useMissionStore.getState().setView('station')
  assert.equal(useMissionStore.getState().view, 'station')
  assert.equal(useMissionStore.getState().openPanel, null)
})

test('offline Pebble responder provides instant, contextual answers for gameplay and science', async () => {
  const { generateLocalPebbleReply } = await import('../../src/pebble/offlineResponder.ts')
  const objective = generateLocalPebbleReply('What should I do now?')
  assert.equal(typeof objective.answer, 'string')
  assert(objective.answer.length > 10)

  const solar = generateLocalPebbleReply('How do solar panels work?')
  assert(solar.answer.toLowerCase().includes('solar') || solar.answer.toLowerCase().includes('dust'))

  const radiation = generateLocalPebbleReply('Tell me about the radiation shelter')
  assert(radiation.answer.toLowerCase().includes('radiation') || radiation.answer.toLowerCase().includes('shelter'))
  assert(radiation.sources && radiation.sources.length > 0)
})

