import * as THREE from 'three'
import { seededRandom, smoothstep, valueNoise } from './noise.ts'
import { surfaceHeight } from './landscape.ts'
import { SITE, SITE_ROUTES, segmentDistance } from './siteLayout.ts'

/** Periodic value noise: both the height and its derivatives meet at tile edges. */
function tileNoise(u: number, v: number, cells: number, seed: number) {
  const x = u * cells, y = v * cells, ix = Math.floor(x), iy = Math.floor(y)
  const tx = smoothstep(0, 1, x - ix), ty = smoothstep(0, 1, y - iy)
  const sample = (a: number, b: number) => valueNoise((a + cells) % cells, (b + cells) % cells, seed)
  const a = sample(ix, iy), b = sample(ix + 1, iy), c = sample(ix, iy + 1), d = sample(ix + 1, iy + 1)
  return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty
}

/** Six metres per tile; overlapping wind ripples, broken crust and fine mineral grains. */
export function createRegolithTextures(size = 512) {
  const height = new Float32Array(size * size), shade = new Float32Array(size * size)
  const albedo = new Uint8Array(size * size * 4), normal = new Uint8Array(size * size * 4), roughness = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size, index = y * size + x
    const crust = tileNoise(u, v, 12, 41), grit = tileNoise(u, v, 113, 83)
    const drift = tileNoise(u, v, 5, 17)
    const phase = Math.PI * 2 * (u * 13 + v * 5) + Math.sin(v * Math.PI * 4) * 1.7 + drift * 5
    const ridge = (Math.sin(phase) * .5 + .5) ** 3
    const ripple = ridge * (.35 + drift * .65)
    height[index] = ripple * .018 + crust * .012 + grit * .006
    shade[index] = Math.max(0, Math.min(1, .53 + (crust - .5) * .55 + (grit - .5) * .25 + ripple * .18))
  }
  const at = (x: number, y: number) => height[((y + size) % size) * size + (x + size) % size]
  const n = new THREE.Vector3(), pixel = 6 / size
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = y * size + x, offset = i * 4
    const value = Math.round(212 + shade[i] * 43)
    albedo.set([value, value, value, 255], offset)
    n.set(-(at(x + 1, y) - at(x - 1, y)) / (2 * pixel), -(at(x, y + 1) - at(x, y - 1)) / (2 * pixel), 1).normalize()
    normal.set([Math.round((n.x * .5 + .5) * 255), Math.round((n.y * .5 + .5) * 255), Math.round((n.z * .5 + .5) * 255), 255], offset)
    const r = Math.round(230 + shade[i] * 23)
    roughness.set([r, r, r, 255], offset)
  }
  const texture = (bytes: Uint8Array, color = false) => {
    const t = new THREE.DataTexture(bytes, size, size, THREE.RGBAFormat)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(60, 60)
    t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter
    t.generateMipmaps = true; t.anisotropy = 4
    if (color) t.colorSpace = THREE.SRGBColorSpace
    t.needsUpdate = true
    return t
  }
  return { albedo: texture(albedo, true), normal: texture(normal), roughness: texture(roughness) }
}

/** Centimetre-scale gravel is decorative, with broad bare patches and worn routes. */
export function createSurfaceGravel() {
  const random = seededRandom(76031)
  const stones: { x: number; y: number; z: number; width: number; squash: number; yaw: number; shade: number }[] = []
  for (let i = 0; i < 20000; i++) {
    const x = (random() - .5) * 150 + 10, z = (random() - .5) * 140
    const patch = valueNoise(x * .18, z * .18, 92)
    if (random() > smoothstep(.24, .72, patch) * .85) continue
    // Keep foundations, entrance steps, equipment and cable joints visually clean.
    if (SITE.some(s => Math.hypot(x - s.x, z - s.z) < (s.id === 'hab' ? 5.3 : s.id === 'rover' ? 3 : 1.7))) continue
    const route = SITE_ROUTES.some(r => segmentDistance(x, z, r.from, r.to) < r.width * .5)
    if (route && random() < .88) continue
    const width = .045 + random() ** 2 * .17
    stones.push({ x, z, y: surfaceHeight(x, z) - width * .04, width, squash: .35 + random() * .35,
      yaw: random() * Math.PI * 2, shade: .73 + random() * .34 })
  }
  return stones
}
