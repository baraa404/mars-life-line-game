import assert from 'node:assert/strict'
import { createInitialState } from '../../src/sim/state.ts'
import { createRuntime } from '../../src/sim/commands.ts'
export const fresh = () => [createInitialState(42), createRuntime()]
export const near = (actual, expected, tolerance = 1e-9) => assert(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected} ± ${tolerance}`)
export const memoryStorage = () => {
  const data = new Map()
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
}
export const card = id => ({ id, text: 'Test a decision', options: [{ id: 'a', label: 'Keep plan', effects: [] }, { id: 'b', label: 'Dim heaters', effects: [{ type: 'setLevel', load: 'heaters', level: 0.5 }] }] })
