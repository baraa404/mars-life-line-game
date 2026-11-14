import { useStoryStore } from '../state/useStoryStore.ts'
import type { ChatReply, ChatSource } from './chatTypes.ts'

const SOURCES: Record<string, ChatSource> = {
  'mars-trek': {
    id: 'mars-trek',
    title: 'NASA/JPL Mars Trek · Viking mosaic',
    url: 'https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars',
  },
  radlab: {
    id: 'radlab',
    title: 'NASA RadLab · Curiosity radiation archive',
    url: 'https://visualization.osdr.nasa.gov/radlab/api/?trajectory=Mars%20surface&timestamp%3E=2024-05-20&timestamp%3C2024-05-21&absorbed_dose_rate&format=json',
  },
}

export function generateLocalPebbleReply(inputQuestion: string): ChatReply {
  const q = inputQuestion.trim().toLowerCase()
  const story = useStoryStore.getState().state
  const scene = story?.scene ?? 1

  // 1. Objectives / "What should I do now?" / "help" / "where do I go"
  if (
    q.includes('what should i do') ||
    q.includes('what to do') ||
    q.includes('what now') ||
    q.includes('where do i go') ||
    q.includes('where to go') ||
    q.includes('what is my mission') ||
    q.includes('next') ||
    q.includes('stuck') ||
    q.includes('help') ||
    q.includes('objective') ||
    q.includes('task')
  ) {
    switch (scene) {
      case 1:
        return {
          answer:
            'Welcome to Mars, Commander! Walk west along the path and approach the orange airlock hatch on the hab. Press E to cycle the airlock and enter the habitat.',
          sources: [SOURCES['mars-trek']],
        }
      case 2:
        return {
          answer:
            'We have a power crisis! Martian dust has covered our solar arrays. Head outside to the 4 panel rows and hold E on each row to clean them, or hold E on the backup breaker at the battery bank for an instant boost.',
          sources: [],
        }
      case 3:
        return {
          answer:
            'Our life support water recycler needs maintenance! Head outside to the supply crates to grab a fresh water filter, then hold E on the recycler socket to install it, or pull the emergency bypass lever.',
          sources: [],
        }
      case 4:
        return {
          answer:
            'Visit the greenhouse module on the west side! Turn the irrigation valve wheel with E, switch on the grow lights, and inspect the crop trays. If any tray shows a red warning lamp, press E to clear the clogged line!',
          sources: [],
        }
      case 5:
        return {
          answer:
            'We must review our base operations! Inspect the station subsystem board to the right of the hab terminal. Pull the levers to choose Survival, Balanced, or Farming mode, then confirm your plan at the terminal.',
          sources: [],
        }
      case 6:
        return {
          answer:
            'EMERGENCY: A solar radiation storm is sweeping toward us! Run to the underground radiation shelter on the west side and get inside immediately to shield yourself from the high-energy particles.',
          sources: [SOURCES.radlab],
        }
      case 7:
      case 8:
        return {
          answer:
            'The radiation storm has passed and our base is secure! Enter the hab and interact with the log pad on the desk to submit your final mission report.',
          sources: [],
        }
      default:
        return {
          answer:
            'Follow the orange objective markers around the base! You can always press M to open Station View for an aerial map of all modules and power flows.',
          sources: [],
        }
    }
  }

  // 2. Solar panels & dust
  if (q.includes('solar') || q.includes('panel') || q.includes('dust') || q.includes('clean')) {
    const cleanCount = story ? story.panelDust.filter(d => d < 0.15).length : 0
    return {
      answer: `Our solar array has 4 rows. Right now ${cleanCount}/4 rows are clean. Dust blocks Martian sunlight and drops energy output by up to 75%. Walk up to each row outside and hold E to wipe the dust off!`,
      sources: [],
    }
  }

  // 3. Power, battery, energy
  if (q.includes('power') || q.includes('battery') || q.includes('energy') || q.includes('charge') || q.includes('breaker')) {
    const pct = story ? Math.round(story.power) : 40
    return {
      answer: `Current battery charge is ${pct}%. Solar arrays charge the battery during daylight, while life support and station systems draw power continuously. The backup breaker gives +35% instant charge, but cleaning the panels ensures steady power all day!`,
      sources: [],
    }
  }

  // 4. Water & recycling
  if (q.includes('water') || q.includes('recycler') || q.includes('filter') || q.includes('ice') || q.includes('thirst')) {
    const liters = story ? Math.round(story.water) : 60
    return {
      answer: `Station water reserve: ${liters} liters. We recover water from the grey-water recycler and extract ice from the subsurface drill. Installing a clean filter in the recycler socket prevents water shortages!`,
      sources: [],
    }
  }

  // 5. Oxygen & breathing
  if (q.includes('oxygen') || q.includes('air') || q.includes('breathe') || q.includes('suit') || q.includes('o2')) {
    const o2 = story ? Math.round(story.oxygen) : 70
    return {
      answer: `Hab oxygen level is ${o2}%. The oxygen generator uses electricity and water to generate fresh O2, while scrubbers remove exhaled carbon dioxide. Your suit has its own independent oxygen supply for outdoor EVA.`,
      sources: [],
    }
  }

  // 6. Greenhouse, plants, crops & food
  if (q.includes('greenhouse') || q.includes('plant') || q.includes('crop') || q.includes('food') || q.includes('wheat') || q.includes('tray') || q.includes('harvest') || q.includes('valve') || q.includes('light')) {
    return {
      answer:
        'The greenhouse uses aeroponic growing trays for wheat and mizuna greens. Make sure the water valve is turned on and the grow lights are lit. If a drip line clogs (red light), press E to clear it so crops keep growing!',
      sources: [],
    }
  }

  // 7. Radiation, storm, shelter
  if (q.includes('radiation') || q.includes('storm') || q.includes('shelter') || q.includes('dose') || q.includes('cme') || q.includes('sun')) {
    return {
      answer:
        'Solar Particle Events (SPE) launch high-energy protons across interplanetary space. The Martian surface has no magnetic field to deflect them, but our radiation shelter is buried under thick regolith bags that absorb radiation effectively!',
      sources: [SOURCES.radlab],
    }
  }

  // 8. Controls & movement
  if (q.includes('control') || q.includes('walk') || q.includes('look') || q.includes('move') || q.includes('key') || q.includes('wasd') || q.includes('mouse') || q.includes('button')) {
    return {
      answer:
        'Navigation controls: WASD to walk, click the view to look with your mouse (or use I/J/K/L), press E to interact, press M for Station View overview, and Esc to open the pause menu.',
      sources: [],
    }
  }

  // 9. PEBBLE / Who are you
  if (q.includes('who are you') || q.includes('what are you') || q.includes('your name') || q.includes('pebble') || q.includes('robot') || q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return {
      answer:
        "I'm PEBBLE! Your Pneumatic Exploration & Base Buddy for Life Line Station. I monitor station sensors, clean panels, and accompany you on Mars! (*beep-boop*) How can I help you, Commander?",
      sources: [],
    }
  }

  // 10. NASA Science / Map / RadLab
  if (q.includes('nasa') || q.includes('map') || q.includes('science') || q.includes('curiosity') || q.includes('trek') || q.includes('real')) {
    return {
      answer:
        'Mars Life Line uses real NASA data! The global Mars map comes from NASA/JPL Mars Trek Viking orbital mosaics, and our radiation storm models are calibrated against Curiosity’s RAD detector data on Mars.',
      sources: [SOURCES['mars-trek'], SOURCES.radlab],
    }
  }

  // General in-character reply
  const power = story ? Math.round(story.power) : 40
  const oxygen = story ? Math.round(story.oxygen) : 70
  const water = story ? Math.round(story.water) : 60
  return {
    answer: `Telemetry check: Battery is at ${power}%, Oxygen at ${oxygen}%, Water at ${water}L. You can check the current mission objective in the top-right card or press M for Station View. What would you like to investigate?`,
    sources: [],
  }
}
