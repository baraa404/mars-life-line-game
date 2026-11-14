import test from 'node:test'
import assert from 'node:assert/strict'
import { airlockGuidance, hatchCanOpen } from '../../src/game/interaction/airlock.ts'

test('leaving hab explains emptying the chamber, then opening the Mars hatch', () => {
  const full = airlockGuidance('hab', 1, false)
  assert.equal(full.destination, 'outside')
  assert.match(full.air, /full/)
  assert.match(full.instruction, /lever.*empty/)
  assert.equal(full.outerReady, false)
  const empty = airlockGuidance('hab', 0, false)
  assert.match(empty.air, /empty/)
  assert.match(empty.instruction, /MARS hatch.*hold E/)
  assert.equal(empty.outerReady, true)
})
test('arriving from Mars explains filling, then opening the hab hatch', () => {
  const empty = airlockGuidance('outside', 0, false)
  assert.equal(empty.destination, 'hab')
  assert.match(empty.instruction, /lever.*fill/)
  assert.equal(empty.innerReady, false)
  const full = airlockGuidance('outside', 1, false)
  assert.match(full.instruction, /HAB hatch.*hold E/)
  assert.equal(full.innerReady, true)
})
test('guidance and door indicators always respect actual hatch interlocks', () => {
  for (const origin of ['hab', 'outside']) for (const pressure of [0, .009, .01, .5, .989, .99, 1]) for (const cycling of [true, false]) {
    const g = airlockGuidance(origin, pressure, cycling)
    assert.equal(g.innerReady, hatchCanOpen('hab', pressure, cycling))
    assert.equal(g.outerReady, hatchCanOpen('outside', pressure, cycling))
    if (cycling) assert.match(g.instruction, /Wait/)
  }
})
