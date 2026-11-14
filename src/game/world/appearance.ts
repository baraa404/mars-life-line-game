import * as THREE from 'three'
import { useWorldStore } from '../../state/useWorldStore.ts'
import { useMissionStore } from '../../state/useMissionStore.ts'
import { atmosphere, lighting, palette } from '../../style/tokens.ts'
/** All derived appearance uses existing tokens; night-sky remains deferred. */
export function exteriorAppearance(minute: number, tau: number) {
  const hour = minute / 60, elevation = Math.sin(Math.PI * (hour - 6) / 12)
  const day = THREE.MathUtils.smoothstep(elevation, -.12, .25)
  const dusk = (1 - Math.min(1, Math.abs(elevation) / .4)) * day
  const storm = THREE.MathUtils.clamp((tau - .5) / 4, 0, 1)
  const key = new THREE.Color(lighting.key.color).lerp(new THREE.Color(palette['accent-orange']), dusk * .5)
  const top = new THREE.Color(palette['space-deep']).lerp(new THREE.Color(atmosphere['sky-top']), day)
  const horizon = new THREE.Color(palette['shadow-plum']).multiplyScalar(.32).lerp(new THREE.Color(atmosphere['sky-horizon']), day)
  top.lerp(new THREE.Color(palette['regolith-mid']).multiplyScalar(.55), storm * .65)
  horizon.lerp(new THREE.Color(palette['regolith-light']).multiplyScalar(.65), storm * .75)
  return { day, key, top, horizon, keyIntensity: lighting.key.intensity * Math.max(0, elevation) * (1 - .8 * storm),
    hemiIntensity: lighting.hemisphere.intensity * (.10 + .9 * day) * (1 - .25 * storm),
    ambientIntensity: lighting.ambient.intensity * (.15 + .85 * day),
    fogDensity: lighting.fog.density * .66 * (1 + storm * 7),
    // Southern light catches the hab entrance and ground relief from the same sky direction.
    sun: new THREE.Vector3(Math.cos(Math.PI * (hour - 6) / 12) * 70, elevation * 65, 45) }
}

/** Dev preview never changes or saves simulation state. Production always follows the sim. */
let cachedMinute: number | undefined
let cachedTau: number | undefined
let cachedAppearance: ReturnType<typeof exteriorAppearance> | undefined
const presets = { day: [720, .5], dusk: [1065, .5], night: [0, .5], storm: [720, 4.5] } as const

/** Shared read-only result: consumers copy colours/vectors into their own resources. */
export function readWorldAppearance() {
  const s = useMissionStore.getState().snapshot?.state
  const preview = import.meta.env?.DEV ? useWorldStore.getState().preview : 'live'
  const minute = preview === 'live' ? s?.clock.minute ?? 900 : presets[preview][0]
  const tau = preview === 'live' ? s?.env.tau ?? .5 : presets[preview][1]
  if (!cachedAppearance || minute !== cachedMinute || tau !== cachedTau) {
    cachedAppearance = exteriorAppearance(minute, tau)
    cachedMinute = minute
    cachedTau = tau
  }
  return cachedAppearance
}
