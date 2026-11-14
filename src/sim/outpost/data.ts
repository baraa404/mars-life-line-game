import { RADLAB } from './radlab.ts'

export { RADLAB }
export type SiteId = 'gale' | 'jezero' | 'deuteronilus'
export type CropKind = 'lettuce' | 'potato'

/** Real coordinates; elevations are MOLA values rounded for display. Factors are game estimates. */
export const SITES: Record<SiteId, {
  name: string; rover?: string; lat: number; lon: number; elevationM: number
  sun: number; iceL: number; radiation: number; why: string[]; fact: string
}> = {
  gale: {
    name: 'Gale Crater', rover: 'Curiosity', lat: -5.4, lon: 137.8, elevationM: -4500,
    sun: 1, iceL: 8, radiation: 1,
    why: ['Near the equator: strongest sunlight', 'Very low ground: most air above you, least radiation', 'Dry ground: little ice to drill'],
    fact: 'Curiosity’s RAD detector measured the radiation numbers used in this game right here.',
  },
  jezero: {
    name: 'Jezero Crater', rover: 'Perseverance', lat: 18.4, lon: 77.5, elevationM: -2600,
    sun: .95, iceL: 12, radiation: 1.15,
    why: ['Good sunlight', 'Higher ground: thinner air above you, more radiation', 'Some ice in the old lake mud'],
    fact: 'Jezero was a lake 3.5 billion years ago. Perseverance’s MOXIE made oxygen from Mars air here.',
  },
  deuteronilus: {
    name: 'Deuteronilus Mensae', lat: 44, lon: 24, elevationM: -3500,
    sun: .75, iceL: 22, radiation: 1.08,
    why: ['Far north: weaker sunlight', 'Middle height: medium radiation', 'Buried glaciers: lots of ice'],
    fact: 'Radar on NASA’s Mars Reconnaissance Orbiter found glaciers of water ice hidden under the dust here.',
  },
}

export const CROPS: Record<CropKind, { name: string; sols: number; food: number; emoji: string }> = {
  lettuce: { name: 'Lettuce', sols: 2, food: 2, emoji: '🥬' },
  potato: { name: 'Potatoes', sols: 4, food: 5, emoji: '🥔' },
}

/** NASA Life Support Baseline Values and Assumptions Document (NTRS 20210024855). */
export const BVAD = { o2KgPerDay: .84, waterLPerDay: 3, url: 'https://ntrs.nasa.gov/citations/20210024855' }

export const DONKI_EVENT = {
  id: '2024-05-20T05:36:00-CME-001',
  speedKmS: 2678,
  url: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/CME/31034/-1',
  text: 'A fast cloud of solar particles left the far side of the Sun, facing Mars.',
}

export const MARS_TREK = {
  url: 'https://trek.nasa.gov/mars/',
  layer: 'Viking VIS Global Color Mosaic',
}

/** Game values. Labelled as game rules in the UI. */
export const RULES = {
  sols: 7,
  battery: { start: 80, cap: 100, solarPerSol: 66, lifeSupport: 20, lights: 12, oxygenMaker: 15, drill: 6 },
  air: { start: 4, cap: 8, makerKg: 1.5, plantKg: .15 },
  water: { start: 30, cap: 60, perCrop: 2, oxygenMaker: 2 },
  food: { start: 5 },
  dust: { perSol: .1, storm: .2, max: .8 },
  stormSols: [4, 5],
  sepSol: 6,
  doseBudget: 1300,
  safeDose: 900,
  /** Fraction of outside dose received in each place. */
  shielding: { outside: 1, greenhouse: .9, hab: .5, shelter: [.35, .22, .12] },
  actionHours: 2.5,
  dayStart: 7 * 60,
}
