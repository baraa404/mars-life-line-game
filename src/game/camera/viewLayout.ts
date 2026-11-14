/** Keep the orthographic near plane above the ground, including its lower corners. */
export const STATION_PITCH = 35.264 * Math.PI / 180
export const stationCameraDistance = (span: number) => Math.max(80, span * 3)

/** Eye rests above the mattress inside the bunk, looking towards its foot and ceiling. */
export const SLEEP_EYE = [-2.18, 2.02, -1.4] as const
export const SLEEP_ROTATION = [.28, Math.PI, 0] as const
