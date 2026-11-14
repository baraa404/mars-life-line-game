import type { ChatSource } from '../../src/pebble/chatTypes.ts'

export const gameGuide = `
Mars Life Line is a fictional future mission at Life Line Station in Deuteronilus Mensae.
The playable story is Touchdown (M0), then base operations. Free Play starts in the hab.
M0 mission states: m0-walk means get from the ship to the hab with PEBBLE through the airlock.
m0-choice means choose the first station load. m0-night means settle in and use the bunk when allowed.
m0-complete means the base is awake. Later campaign missions and science experiments in design docs are plans.
E interacts with a nearby object, M opens Station View, Tab opens the Data Pad, H requests a hint.
Use Station View to inspect modules, change power settings and send PEBBLE on supported jobs.
Solar panels generate in daylight; dust reduces output. Cleaning panels helps. The battery supplies power after dark.
Lower-priority loads lose power first when power runs short. Life Support stays first and keeps the hab air safe.
Night coverage is an estimate at the current load. Switching on more equipment can shorten it.
The bunk is in the hab. Sleep requires a sealed airlock and is available after 17:00 or when tired.
The Why Chain shows recent causes and effects. The Wake report shows what happened while the player rested.
Water is used by the player, plants and electrolysis. The water processor uses stored ice and needs power.
The electrolyser uses water and power to make oxygen; the Oxygen Maker uses carbon dioxide and power.
Greenhouse trays depend on water, suitable temperature and lighting. Discuss tray lights as a load,
and use plantedCrops to establish if there are plants. Explain the power tradeoff without guessing exact outcomes.
PEBBLE can clean panels, scout, carry samples or charge, subject to the targets offered in Station View.
Radiation DP are simulated game points. Shelter reduces exposure in the simulation. Earth messages have a delay.
Avoid implying an event or hazard has occurred unless the snapshot reports it.
`

export const science: (ChatSource & { fact: string })[] = [
  {
    id: 'mars-trek',
    title: 'NASA/JPL Mars Trek · Viking mosaic',
    url: 'https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars',
    fact: 'The landing console uses a Viking global colour mosaic from Mars Trek. The station marker and local playable terrain are game design.',
  },
  {
    id: 'radlab',
    title: 'NASA RadLab · Curiosity radiation archive',
    url: 'https://visualization.osdr.nasa.gov/radlab/api/?trajectory=Mars%20surface&timestamp%3E=2024-05-20&timestamp%3C2024-05-21&absorbed_dose_rate&format=json',
    fact: 'Curiosity measured changing absorbed radiation dose rates in Gale Crater on 20 May 2024. The archive uses µGy/hour; it is historical telemetry from Gale, separate from this fictional base and its DP gauge.',
  },
]
