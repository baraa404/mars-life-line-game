export type Side = 'hab' | 'outside'
export const OUTER_HATCH_LIMIT = .01
export const LOCKED_HATCH = 'Locked. The air would rush out.'
export const chamberPressure = (origin: Side) => origin === 'hab' ? 1 : 0
export const hatchCanOpen = (side: Side, pressure: number, cycling: boolean) =>
  !cycling && (side === 'outside' ? pressure < OUTER_HATCH_LIMIT : pressure >= .99)

/** Guidance uses the same pressure limits as the physical hatch interlocks. */
export function airlockGuidance(origin: Side, pressure: number, cycling: boolean) {
  const destination: Side = origin === 'hab' ? 'outside' : 'hab'
  const innerReady = hatchCanOpen('hab', pressure, cycling)
  const outerReady = hatchCanOpen('outside', pressure, cycling)
  const ready = destination === 'hab' ? innerReady : outerReady
  const name = destination === 'hab' ? 'HAB' : 'MARS'
  return {
    destination, innerReady, outerReady,
    air: cycling ? 'Air pressure changing' : outerReady ? 'Chamber empty of air' : innerReady ? 'Chamber full of air' : 'Chamber partly filled',
    instruction: cycling ? 'Wait for the pressure cycle to finish.' : ready
      ? `Go to the ${name} hatch and hold E to open it.`
      : `Hold E on the lever to ${destination === 'hab' ? 'fill' : 'empty'} the chamber.`,
  }
}
