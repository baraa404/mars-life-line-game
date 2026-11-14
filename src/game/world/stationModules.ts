import type { LoadId, PebbleJob } from '../../sim/index'
import type { Point } from '../world/habLayout'
import { PEBBLE_DOCK } from './pebbleMotion'

export const loadNames: Record<LoadId, string> = {
  lifeSupport: 'Life Support', heaters: 'Heaters', electrolyser: 'Electrolyser', oxygenMaker: 'Oxygen Maker',
  waterProcessor: 'Water Processor', trayClimate: 'Tray Climate', trayLights1: 'Tray 1 Lights',
  trayLights2: 'Tray 2 Lights', trayLights3: 'Tray 3 Lights', pebbleCharge: 'PEBBLE Charger',
  shelterPump: 'Shelter Pump', dish: 'Earth Dish', roverCharge: 'Rover Charger', lab: 'Lab',
}
export const loadPurpose: Record<LoadId, string> = {
  lifeSupport: 'Keeps the hab air safe.', heaters: 'Keeps the hab warm.',
  electrolyser: 'Uses water and power to make oxygen.', oxygenMaker: 'Uses carbon dioxide to make oxygen.',
  waterProcessor: 'Turns ice into water you can use.', trayClimate: 'Keeps the plants warm.',
  trayLights1: 'Gives the first tray light.', trayLights2: 'Gives the second tray light.', trayLights3: 'Gives the third tray light.',
  pebbleCharge: 'Fills PEBBLE’s battery at the outdoor dock.', shelterPump: 'Fills the shelter’s water wall.',
  dish: 'Sends messages to Earth.', roverCharge: 'Fills the rover’s battery.', lab: 'Runs experiments on Mars.',
}
export const stationModules: Record<string, { label: string; icon: string; load?: LoadId; why: string }> = {
  hab: { label: 'Hab', icon: 'air', load: 'lifeSupport', why: 'You need clean air to live here.' },
  shelter: { label: 'Shelter', icon: 'radiation', load: 'shelterPump', why: 'Water helps block harmful particles.' },
  battery: { label: 'Battery', icon: 'power', why: 'It stores power for the dark.' },
  dock: { label: 'Dock', icon: 'pebble', load: 'pebbleCharge', why: 'A full battery lets PEBBLE work longer.' },
  rover: { label: 'Rover', icon: 'you', load: 'roverCharge', why: 'Driving uses stored power.' },
  ship: { label: 'Ship', icon: 'you', why: 'The ship brought you to Mars.' },
  repair: { label: 'Junction', icon: 'power', why: 'Cables carry power between machines.' },
  overhang: { label: 'Overhang', icon: 'radiation', why: 'The rock above blocks some particles.' },
  ...Object.fromEntries([1, 2, 3, 4].map(i => ['solar-' + i, { label: 'Solar ' + i, icon: 'power', why: 'Panels turn sunlight into power. Dust blocks some light.' }])),
}
export const jobLabels: Record<PebbleJob['kind'], string> = { cleanPanels: 'Clean panels', scout: 'Scout', carry: 'Carry a sample', charge: 'Charge' }
export const jobTargets: Record<string, { label: string; point: Point; jobs: PebbleJob['kind'][] }> = {
  ...Object.fromEntries([1, 2, 3, 4].map(i => ['solar-' + i, { label: 'Solar ' + i, point: [19 + (i - 1) * 4, 0, -7], jobs: ['cleanPanels', 'scout'] }])),
  repair: { label: 'Junction', point: [1.3, 0, -147.5], jobs: ['scout', 'carry'] },
  overhang: { label: 'Overhang', point: [2, 0, -105], jobs: ['scout'] },
  supply: { label: 'Supply crate', point: [-6, 0, 5.8], jobs: ['carry'] },
  hab: { label: 'Outdoor charging dock', point: [...PEBBLE_DOCK], jobs: ['charge'] },
}
