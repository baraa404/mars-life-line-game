import * as THREE from 'three'
import { CABLE_ROUTES } from './siteLayout.ts'
import { surfaceHeight } from './landscape.ts'
/** Real CatmullRomCurve3 instances are retained for future animated Station View flows. */
export function createCableSplines() {
  return CABLE_ROUTES.map(route => ({ id: route.id, curve: new THREE.CatmullRomCurve3(route.points.map(([x, z]) => new THREE.Vector3(x, surfaceHeight(x, z) + .02, z)), false, 'catmullrom', 0) }))
}
