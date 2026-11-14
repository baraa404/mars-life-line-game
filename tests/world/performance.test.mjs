import test from 'node:test'
import assert from 'node:assert/strict'
import { Vector3 } from 'three'
import { exteriorAppearance, readWorldAppearance } from '../../src/game/world/appearance.ts'
import { useMissionStore } from '../../src/state/useMissionStore.ts'
import { aimedTarget, availableTargets } from '../../src/game/interaction/targeting.ts'

test('shared appearance stays identical to the original calculation and invalidates on either input', () => {
  const previous = useMissionStore.getState().snapshot
  try {
    for (const [minute, tau] of [[900, .5], [900, 4.5], [1065, 4.5], [0, .5], [720, .5]]) {
      useMissionStore.setState({ snapshot: { state: { clock: { minute }, env: { tau } } } })
      const appearance = readWorldAppearance()
      assert.deepEqual(appearance, exteriorAppearance(minute, tau))
      assert.equal(readWorldAppearance(), appearance)
    }
    useMissionStore.setState({ snapshot: null })
    assert.deepEqual(readWorldAppearance(), exteriorAppearance(900, .5))
  } finally {
    useMissionStore.setState({ snapshot: previous })
  }
})

// The pre-optimization vector implementation provides a behavior oracle for
// varied views, tie breaks, ranges, precise controls and forgiving equipment.
function originalAim(targets, eye, look) {
  let best = Infinity, bestDepth = Infinity, selected
  for (const target of targets) {
    const ray = new Vector3(...target.point).sub(eye), depth = ray.dot(look)
    if (depth <= 0) continue
    const offset = ray.addScaledVector(look, -depth).length()
    const radius = target.aimRadius === undefined ? Math.min(.5, depth * .2) : Math.min(target.aimRadius, depth * .8)
    const score = offset / radius
    if (score < 1 && (score < best - .001 || Math.abs(score - best) <= .001 && depth < bestDepth)) {
      best = score; bestDepth = depth; selected = target
    }
  }
  return selected
}

test('allocation-free aim math preserves target selection and leaves inputs untouched', () => {
  let seed = 713
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296)
  for (let view = 0; view < 1000; view++) {
    const eye = new Vector3(random() * 8, random() * 3, random() * 8)
    const look = new Vector3(random() - .5, random() - .5, random() - .5).normalize()
    const targets = Array.from({ length: 24 }, (_, id) => ({
      id: String(id), point: [random() * 10, random() * 4, random() * 10],
      aimRadius: id % 2 ? .85 : undefined, range: id % 3 ? 3.4 : 8,
      enabled: id % 5 !== 0, approach: id % 7 === 0,
    }))
    const before = structuredClone(targets), eyeBefore = eye.clone(), lookBefore = look.clone()
    const expected = targets.filter(t => t.enabled !== false && new Vector3(...t.point).sub(eye).length() <= t.range &&
      new Vector3(...t.point).sub(eye).length() >= .05 && (!t.approach || eye.z >= t.point[2] && Math.abs(eye.x - t.point[0]) < 2))
    assert.deepEqual(availableTargets(targets, eye), expected)
    assert.equal(aimedTarget(expected, eye, look), originalAim(expected, eye, look))
    assert.deepEqual(targets, before)
    assert(eye.equals(eyeBefore)); assert(look.equals(lookBefore))
  }
})
