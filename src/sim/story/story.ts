import { SITES, type SiteId } from '../outpost/data.ts'
import { SCRIPT, type Line, type LineId } from './script.ts'

/**
 * "Mars: Mission Critical": a ten-minute guided mission in seven scenes. Pure and deterministic;
 * the store ticks it with real seconds and the world dispatches the player's physical actions.
 */
export type Mode = 'survival' | 'balanced' | 'farming' | 'emergency'
export type Ending = 'success' | 'improve' | 'lost'
/** What ended a lost mission. */
export type Cause = 'oxygen' | 'water' | 'food' | 'radiation'
export type Supply = 'oxygen' | 'water' | 'food'
export interface Tray { growth: number; blocked: boolean; stalled: number; checked: boolean; harvested: boolean; crop: number; dead: boolean }
export interface StoryState {
  version: 2
  site: SiteId
  /** 1–7; 8 once the report has been answered. */
  scene: number
  time: number
  sceneTime: number
  power: number
  water: number
  oxygen: number
  food: number
  dose: number
  inHab: boolean
  terminalSeen: boolean
  panelDust: number[]
  backup: boolean
  powerChoice: 'clean' | 'backup' | null
  filter: 'crate' | 'carried' | 'installed'
  recycler: boolean
  oxygenGen: boolean
  inGreenhouse: boolean
  ghValve: boolean
  ghLights: boolean
  mode: Mode | null
  /** Mode used before the radiation emergency, restored at the all-clear. */
  modeBefore: Mode | null
  trays: Tray[]
  harvested: number
  reviewed: boolean
  confirmed: boolean
  stormChoice: 'emergency' | 'farming' | null
  secured: { oxygen: boolean; recycler: boolean }
  /** Seconds until radiation arrives (positive), then seconds since it arrived (negative). */
  storm: number
  sheltered: boolean
  shelterTime: number
  allClear: boolean
  damaged: string[]
  ending: Ending | null
  cause: Cause | null
  /** Seconds the crew has gone without each supply; recovers at twice the rate once it returns. */
  strain: Record<Supply, number>
  brownout: boolean
  said: string[]
  decisions: string[]
}

export const RATES = {
  /** Battery % per second. */
  solarPerPanel: .11, lifeSupport: .1, recycler: .04, oxygenGen: .06, greenhouse: .1,
  /** Litres per second. */
  crewWater: .05, recovered: .065, oxygenWater: .03, cropWater: .035,
  /** Oxygen % per second. */
  crewOxygen: .08, generator: .15, plantOxygen: .01,
  /** Seconds for a crop to grow in Balanced Mode. */
  growSeconds: 40,
  stormWarning: 55, stormLength: 28, outsideDose: 30, shelterDose: 1.5, minShelter: 10,
  backupCharge: 35, foodPerTray: 4, stallLimit: 15,
  /** Days of food the crew eats per second. */
  crewFood: 1 / 120,
  /** A blocked tray dies after this many seconds without water. */
  witherAt: 40,
  /** Dose that causes fatal radiation sickness. */
  lethalDose: 600,
}
/** Seconds the crew survives with a supply at zero. */
export const SURVIVAL: Record<Supply, number> = { oxygen: 20, water: 60, food: 90 }
const SUPPLIES: Supply[] = ['oxygen', 'water', 'food']
export const MODE_FACTOR: Record<Mode, { greenhouse: number; growth: number; life: number }> = {
  survival: { greenhouse: .3, growth: .35, life: 1 },
  balanced: { greenhouse: 1, growth: 1, life: 1 },
  farming: { greenhouse: 1.8, growth: 1.8, life: 1 },
  emergency: { greenhouse: 0, growth: 0, life: .8 },
}
export const LIMITS = { power: 25, water: 20, oxygen: 50, food: 8, dose: 250 }
/** Growth fraction at which each tray's drip line blocks once. */
const BLOCK_AT = [.3, .55, .75]
const TRAY_COUNT = 3

export function createStory(site: SiteId): StoryState {
  return {
    version: 2, site, scene: 1, time: 0, sceneTime: 0,
    power: 40, water: 60, oxygen: 70, food: 3, dose: 0,
    inHab: false, terminalSeen: false, panelDust: [.78, .74, .8, .76], backup: false, powerChoice: null,
    filter: 'crate', recycler: false, oxygenGen: false, inGreenhouse: false, ghValve: false, ghLights: false,
    mode: null, modeBefore: null,
    trays: Array.from({ length: TRAY_COUNT }, () => ({ growth: 0, blocked: false, stalled: 0, checked: false, harvested: false, crop: 1, dead: false })),
    harvested: 0, reviewed: false, confirmed: false, stormChoice: null, secured: { oxygen: false, recycler: false },
    storm: RATES.stormWarning, sheltered: false, shelterTime: 0, allClear: false, damaged: [], ending: null,
    cause: null, strain: { oxygen: 0, water: 0, food: 0 }, brownout: false, said: [], decisions: [],
  }
}

export type StoryAction =
  | { type: 'enterHab' } | { type: 'leaveHab' }
  | { type: 'terminal' }
  | { type: 'cleanPanel'; panel: number }
  | { type: 'backup' }
  | { type: 'takeFilter' } | { type: 'installFilter' } | { type: 'startRecycler' }
  | { type: 'startOxygen' }
  | { type: 'greenhouse'; inside: boolean }
  | { type: 'valve' } | { type: 'lights' }
  | { type: 'mode'; mode: Mode }
  | { type: 'clearTray'; tray: number } | { type: 'checkTray'; tray: number } | { type: 'harvest'; tray: number }
  | { type: 'confirm' }
  | { type: 'override' }
  | { type: 'secure'; system: 'oxygen' | 'recycler' }
  | { type: 'shelter' }
  | { type: 'report' }

export interface StoryResult { state: StoryState; ok: boolean; message: string; lines: Line[] }

const round = (n: number) => Math.round(n)
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))
export const solarOutput = (s: Pick<StoryState, 'panelDust' | 'site'>) =>
  s.panelDust.reduce((sum, dust) => sum + (1 - dust), 0) * RATES.solarPerPanel * SITES[s.site].sun
export const panelsClean = (s: Pick<StoryState, 'panelDust'>) => s.panelDust.filter(d => d < .15).length
export const trayReady = (t: Tray) => t.growth >= 1 && !t.harvested
export const powered = (s: StoryState) => !s.brownout
const greenhouseRunning = (s: StoryState) => s.ghValve && s.ghLights && powered(s) && s.water > 0
const factor = (s: StoryState) => MODE_FACTOR[s.mode ?? 'balanced']

/** Net rates per second, used by the tick, the terminal and the quick-management view. */
export function flows(s: StoryState) {
  const f = factor(s), on = powered(s)
  const gh = greenhouseRunning(s) ? f.greenhouse : 0
  const recycler = s.recycler && on && !s.damaged.includes('recycler')
  const recyclerHalf = s.recycler && on && s.damaged.includes('recycler')
  const generator = s.oxygenGen && on && s.water > 0
  const generatorRate = generator ? RATES.generator * (s.damaged.includes('oxygen') ? .5 : 1) : 0
  const growing = s.trays.filter(t => !t.blocked && t.growth < 1).length
  const use = RATES.lifeSupport * f.life + (s.recycler && on ? RATES.recycler : 0) + (generator ? RATES.oxygenGen : 0) + RATES.greenhouse * gh
  return {
    solar: solarOutput(s), use,
    power: solarOutput(s) - use,
    water: -RATES.crewWater + (recycler ? RATES.recovered : recyclerHalf ? RATES.recovered / 2 : 0) - (generator ? RATES.oxygenWater : 0) - RATES.cropWater * gh,
    oxygen: -RATES.crewOxygen + generatorRate + (gh ? growing * RATES.plantOxygen : 0),
    growth: gh ? f.growth / RATES.growSeconds : 0,
  }
}

const empty = (s: StoryState, k: Supply) => s[k] <= 0
const exposed = (s: StoryState) => s.scene === 6 && s.storm <= 0 && s.storm > -RATES.stormLength && !s.sheltered

export interface Danger { cause: Cause; left: number; severity: number }
/** The most urgent threat to the crew right now, with seconds left before it is fatal. */
export function danger(s: StoryState): Danger | null {
  let worst: Danger | null = null
  const consider = (cause: Cause, left: number, total: number) => {
    if (!worst || left < worst.left) worst = { cause, left: Math.max(0, left), severity: clamp(1 - left / total, 0, 1) }
  }
  for (const k of SUPPLIES) if (empty(s, k)) consider(k, SURVIVAL[k] - s.strain[k], SURVIVAL[k])
  if (exposed(s)) consider('radiation', (RATES.lethalDose - s.dose) / RATES.outsideDose, RATES.lethalDose / RATES.outsideDose)
  return worst
}
/** The body is suffering: no running or jumping until the supply returns. */
export const weakened = (s: StoryState) => !s.ending && (SUPPLIES.some(k => s.strain[k] > 0) || s.dose >= RATES.lethalDose / 2)

function die(s: StoryState, lines: Line[], cause: Cause) {
  s.ending = 'lost'; s.cause = cause
  s.decisions.push(DEATH_NOTE[cause])
  say(s, lines, `lost_${cause}`); say(s, lines, 'lost')
}
const DEATH_NOTE: Record<Cause, string> = {
  oxygen: 'The oxygen ran out and the crew could not breathe.',
  water: 'The water tank stayed empty until the crew could not go on.',
  food: 'The food ran out and the crew starved.',
  radiation: 'The commander took a fatal radiation dose outside the shelter.',
}

function say(_s: StoryState, lines: Line[], id: LineId, vars?: Record<string, string | number>) {
  for (const line of SCRIPT[id]) lines.push(vars ? { ...line, text: line.text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '')) } : line)
}
function once(s: StoryState, lines: Line[], id: LineId, key: string = id) {
  if (s.said.includes(key)) return
  s.said.push(key)
  say(s, lines, id)
}
function nextScene(s: StoryState) { s.scene++; s.sceneTime = 0 }

/** Advance real time. Returns new dialogue lines triggered by the passage of time. */
export function tick(input: StoryState, dt: number): { state: StoryState; lines: Line[] } {
  if (input.ending || dt <= 0) return { state: input, lines: [] }
  const s = structuredClone(input), lines: Line[] = []
  s.time += dt; s.sceneTime += dt
  const flow = flows(s)
  s.power = clamp(s.power + flow.power * dt, 0, 100)
  s.water = clamp(s.water + flow.water * dt, 0, 100)
  s.oxygen = clamp(s.oxygen + flow.oxygen * dt, 0, 100)
  if (!s.brownout && s.power <= 0) { s.brownout = true; say(s, lines, 'brownout'); s.decisions.push('The battery ran empty and the machines shut down.') }
  else if (s.brownout && s.power >= 8) { s.brownout = false; say(s, lines, 'powerBack') }
  s.food = Math.max(0, s.food - RATES.crewFood * dt)
  if (s.oxygen < 30) once(s, lines, 'oxygenLow')
  if (s.food < 1) once(s, lines, 'foodLow')
  for (const k of SUPPLIES) {
    s.strain[k] = empty(s, k) ? s.strain[k] + dt : Math.max(0, s.strain[k] - 2 * dt)
    if (empty(s, k)) once(s, lines, `${k}Empty`)
    if (s.strain[k] >= SURVIVAL[k] / 2) once(s, lines, `${k}Weak`)
  }

  if (flow.growth) s.trays.forEach((tray, i) => {
    if (tray.dead || tray.harvested && s.scene < 6) return
    if (tray.blocked) {
      tray.stalled += dt
      if (tray.stalled >= RATES.witherAt) {
        tray.dead = true; tray.blocked = false; tray.growth = 1
        s.decisions.push(`Tray ${i + 1} died: its drip line stayed blocked for ${RATES.witherAt} seconds.`)
        say(s, lines, 'trayDied', { n: i + 1 })
      }
      return
    }
    tray.growth = Math.min(1, tray.growth + flow.growth * dt)
    if (tray.crop === 1 && !tray.harvested && tray.growth >= BLOCK_AT[i] && !s.said.includes('block' + i)) {
      tray.blocked = true; s.said.push('block' + i)
      say(s, lines, 'trayBlocked', { n: i + 1 })
    }
  })
  if (s.scene === 4 && s.mode === 'survival' && s.sceneTime > 30) once(s, lines, 'slowGrowth')
  if (s.scene === 4 && s.mode && s.trays.every(t => t.growth >= 1 || t.harvested) && s.harvested < TRAY_COUNT) once(s, lines, 'ready')

  if (s.scene === 6) {
    s.storm -= dt
    if (s.storm <= 0 && !s.sheltered) once(s, lines, 'arrived')
    if (s.storm <= 0 && s.storm > -RATES.stormLength) s.dose += (s.sheltered ? RATES.shelterDose : RATES.outsideDose) * dt
    if (s.dose >= RATES.lethalDose / 2) once(s, lines, 'doseHigh')
    if (s.sheltered) s.shelterTime += dt
    if (s.storm <= -RATES.stormLength && (!s.sheltered || s.shelterTime >= RATES.minShelter) && !s.allClear) {
      if (!s.sheltered && !s.said.includes('sheltered')) s.decisions.push('Stayed outside for the whole radiation storm.')
      s.allClear = true; s.sheltered = false
      for (const system of ['oxygen', 'recycler'] as const) if (!s.secured[system]) {
        s.damaged.push(system); s.decisions.push(`The ${system === 'oxygen' ? 'oxygen generator' : 'water recycler'} was left uncovered and lost half its output.`)
      }
      if (s.mode === 'emergency' && s.modeBefore) s.mode = s.modeBefore
      say(s, lines, 'allClear')
      nextScene(s)
      say(s, lines, 'report')
    }
  }
  const fatal = s.dose >= RATES.lethalDose ? 'radiation' : SUPPLIES.find(k => s.strain[k] >= SURVIVAL[k])
  if (fatal) die(s, lines, fatal)
  return { state: s, lines }
}

/** Pure: never mutates the input. A failed action returns the input unchanged. */
export function act(input: StoryState, action: StoryAction): StoryResult {
  const s = structuredClone(input), lines: Line[] = []
  const fail = (message: string): StoryResult => ({ state: input, ok: false, message, lines: [] })
  const done = (message = ''): StoryResult => ({ state: s, ok: true, message, lines })
  if (s.ending) return fail('The mission is complete.')
  switch (action.type) {
    case 'enterHab':
      s.inHab = true
      if (s.scene === 1 && !s.terminalSeen) once(s, lines, 'enteredHab')
      return done()
    case 'leaveHab':
      s.inHab = false
      return done()
    case 'terminal':
      if (s.scene === 1 && !s.terminalSeen) {
        s.terminalSeen = true
        say(s, lines, 'terminal'); nextScene(s); say(s, lines, 'power')
      } else if (s.scene === 5 && !s.reviewed) {
        s.reviewed = true
        const flow = flows(s)
        if (s.power < 35 || flow.power < -.05) say(s, lines, 'lowPower')
        if (s.water < 30 || flow.water < -.04) say(s, lines, 'lowWater')
        if (lines.length === 0) say(s, lines, 'stable')
        say(s, lines, 'adjust')
      }
      return done()
    case 'cleanPanel': {
      const dust = s.panelDust[action.panel]
      if (dust === undefined) return fail('')
      if (dust < .15) return fail('This row is already clean.')
      s.panelDust[action.panel] = .05
      if (s.scene === 2 && !s.powerChoice) {
        const clean = panelsClean(s)
        if (clean === 1) once(s, lines, 'cleanedOne')
        if (clean === s.panelDust.length) {
          s.powerChoice = 'clean'; s.decisions.push('Cleaned all four solar panel rows by hand.')
          say(s, lines, 'cleaned'); finishPower(s, lines)
        }
        return done(`Panel row ${action.panel + 1} clean (${clean}/${s.panelDust.length}).`)
      }
      return done(`Panel row ${action.panel + 1} clean.`)
    }
    case 'backup':
      if (s.backup) return fail('The backup battery is already in use.')
      s.backup = true; s.power = Math.min(100, s.power + RATES.backupCharge); s.brownout = false
      if (s.scene === 2 && !s.powerChoice) {
        s.powerChoice = 'backup'; s.decisions.push('Switched on the backup battery instead of cleaning the panels.')
        say(s, lines, 'backup'); finishPower(s, lines)
      }
      return done(`Backup battery connected: +${RATES.backupCharge}% power.`)
    case 'takeFilter':
      if (s.scene < 3) return fail('PEBBLE: We’ll need those supplies later.')
      if (s.filter !== 'crate') return fail(s.filter === 'carried' ? 'You are already carrying a filter.' : 'The new filter is already installed.')
      s.filter = 'carried'; say(s, lines, 'filterTaken')
      return done('Picked up a water filter.')
    case 'installFilter':
      if (s.filter === 'crate') return fail('The recycler needs a new filter. Get one from the supply crates.')
      if (s.filter === 'installed') return fail('')
      s.filter = 'installed'; say(s, lines, 'filterInstalled')
      return done('Filter installed.')
    case 'startRecycler':
      if (s.filter !== 'installed') return fail('Install a new filter first.')
      if (s.recycler) return fail('')
      s.recycler = true; say(s, lines, 'recycler'); s.decisions.push('Restored the water recycler.')
      checkLifeSupport(s, lines)
      return done('Water recycler running.')
    case 'startOxygen':
      if (s.scene < 3) return fail('PEBBLE: Let’s fix the power first.')
      if (s.oxygenGen) return fail('')
      if (!s.recycler) { say(s, lines, 'oxygenNeedsWater'); return { state: s, ok: false, message: 'Start the water recycler first.', lines } }
      s.oxygenGen = true; s.decisions.push('Started the oxygen generator.')
      checkLifeSupport(s, lines)
      return done('Oxygen generator running.')
    case 'greenhouse':
      s.inGreenhouse = action.inside
      if (action.inside && s.scene === 4) once(s, lines, 'greenhouse')
      return done()
    case 'valve':
      if (s.ghValve) return fail('')
      s.ghValve = true
      if (s.ghLights) startGrowing(s, lines)
      return done('Water is flowing to the trays.')
    case 'lights':
      if (s.ghLights) return fail('')
      s.ghLights = true
      if (s.ghValve) startGrowing(s, lines)
      return done('Grow lights on.')
    case 'mode': {
      if (action.mode === 'emergency') {
        if (s.scene !== 6 || s.stormChoice) return fail(s.scene === 6 ? '' : 'Only for emergencies!')
        s.modeBefore = s.mode; s.mode = 'emergency'; s.stormChoice = 'emergency'
        s.decisions.push('Switched to Emergency Mode for the radiation storm.')
        say(s, lines, 'emergencyMode')
        return done('Emergency Mode on.')
      }
      if (!s.ghValve || !s.ghLights) return fail('Start the greenhouse first: open the water valve and switch on the lights.')
      if (s.scene === 6 && !s.allClear) return fail('Not now! Pull EMERGENCY or override the greenhouse.')
      if (s.mode === action.mode) return fail('')
      const first = !s.mode
      s.mode = action.mode
      say(s, lines, action.mode)
      if (first) { s.decisions.push(`Chose ${action.mode[0].toUpperCase() + action.mode.slice(1)} Mode for the greenhouse.`); say(s, lines, 'monitor') }
      else s.decisions.push(`Changed to ${action.mode} mode.`)
      return done()
    }
    case 'checkTray': {
      const tray = s.trays[action.tray]
      if (!tray) return fail('')
      tray.checked = true
      if (tray.dead && !trayReady(tray)) return done('This tray died of thirst. Nothing will grow here again.')
      return done(tray.harvested ? 'New seedlings sprouting.' : trayReady(tray) ? 'Ready to harvest!' : `Growing: ${round(tray.growth * 100)}%. Drip line OK.`)
    }
    case 'clearTray': {
      const tray = s.trays[action.tray]
      if (!tray?.blocked) return fail('')
      tray.blocked = false; tray.checked = true
      if (tray.stalled > RATES.stallLimit) s.decisions.push(`Tray ${action.tray + 1} went thirsty for ${round(tray.stalled)} seconds.`)
      return done(`Drip line cleared. Tray ${action.tray + 1} is drinking again.`)
    }
    case 'harvest': {
      const tray = s.trays[action.tray]
      if (!tray || tray.harvested) return fail('')
      if (!trayReady(tray)) return fail(tray.blocked ? 'This tray is thirsty. Clear its drip line first.' : `Not ready yet: ${round(tray.growth * 100)}%.`)
      const food = tray.dead ? 0 : tray.stalled > RATES.stallLimit ? RATES.foodPerTray / 2 : RATES.foodPerTray
      tray.harvested = true; tray.growth = 0; tray.crop = 2; s.food += food; s.harvested++
      if (s.harvested === TRAY_COUNT) {
        s.decisions.push(`Harvested the first crops: food for ${round(s.food)} days.`)
        for (const t of s.trays) t.harvested = false
        say(s, lines, 'harvested'); nextScene(s); say(s, lines, 'review')
      }
      return done(tray.dead ? 'Only dry stalks. This tray is dead for the rest of the mission.' : `Harvested! +${food} days of food.`)
    }
    case 'confirm':
      if (s.scene !== 5 || !s.reviewed) return fail('')
      s.confirmed = true; say(s, lines, 'confirmed')
      s.decisions.push(`Confirmed ${s.mode} mode after reviewing the station.`)
      nextScene(s); say(s, lines, 'emergency')
      return done()
    case 'override':
      if (s.scene !== 6 || s.stormChoice) return fail('')
      s.stormChoice = 'farming'; if (s.mode !== 'farming') { s.modeBefore = s.mode; s.mode = 'farming' }
      s.decisions.push('Kept the greenhouse farming through the radiation storm.')
      say(s, lines, 'keepFarming')
      return done('Greenhouse override: farming continues.')
    case 'secure':
      if (s.scene !== 6 || s.allClear) return fail('')
      if (s.secured[action.system]) return fail('Already covered.')
      s.secured[action.system] = true
      once(s, lines, 'securedOne')
      return done(action.system === 'oxygen' ? 'Radiation cover closed on the oxygen generator.' : 'Radiation cover closed on the water recycler.')
    case 'shelter':
      if (s.scene !== 6 || s.allClear) return fail('PEBBLE: We only need the shelter during a radiation storm.')
      if (s.sheltered) return fail('')
      if (!s.stormChoice) { s.stormChoice = 'farming'; s.decisions.push('Left every system running during the storm.') }
      s.sheltered = true; s.said.push('sheltered')
      if (s.storm <= 0) s.decisions.push(`Reached the shelter ${round(-s.storm)} seconds after the radiation arrived.`)
      else s.decisions.push(`Reached the shelter ${round(s.storm)} seconds before the radiation arrived.`)
      say(s, lines, 'sheltered')
      return done()
    case 'report': {
      if (s.scene !== 7) return fail('')
      const result = grade(s)
      s.ending = result.success ? 'success' : 'improve'
      s.scene = 8
      say(s, lines, 'reportSent'); say(s, lines, s.ending); say(s, lines, 'final')
      return done()
    }
  }
}

function finishPower(s: StoryState, lines: Line[]) {
  say(s, lines, 'powerDone'); nextScene(s); say(s, lines, 'lifeSupport')
}
function checkLifeSupport(s: StoryState, lines: Line[]) {
  if (s.recycler && s.oxygenGen && s.scene === 3) { say(s, lines, 'oxygen'); nextScene(s) }
}
function startGrowing(s: StoryState, lines: Line[]) {
  if (s.scene === 4) { say(s, lines, 'growing'); s.decisions.push('Restarted the greenhouse water and lights.') }
}

export interface Check { id: string; label: string; value: string; ok: boolean }
/** The mission report: five checks; four or more passing means the station is ready. */
export function grade(s: StoryState) {
  const checks: Check[] = [
    { id: 'power', label: 'Power', value: round(s.power) + '%', ok: s.power >= LIMITS.power },
    { id: 'water', label: 'Water', value: round(s.water) + ' L', ok: s.water >= LIMITS.water },
    { id: 'air', label: 'Oxygen', value: round(s.oxygen) + '%', ok: s.oxygen >= LIMITS.oxygen },
    { id: 'food', label: 'Food', value: Math.floor(s.food) + ' days', ok: s.food >= LIMITS.food },
    { id: 'radiation', label: 'Radiation safety', value: round(s.dose) + ' µGy' + (s.damaged.length ? ', gear damaged' : ''), ok: s.dose < LIMITS.dose && !s.damaged.length },
  ]
  const passed = checks.filter(c => c.ok).length
  return { checks, passed, success: passed >= 4 && s.power > 0 && s.water > 0 && s.oxygen > 30 }
}

/** World places the story can point at; the 3D world maps each to markers and PEBBLE's route. */
export type Spot = 'hab' | 'terminal' | 'panels' | 'battery' | 'crates' | 'recycler' | 'oxygen' | 'greenhouse' | 'gh-valve' | 'gh-lights' | 'gh-board' | 'trays' | 'hab-board' | 'shelter'
export interface Objective { id: string; text: string; done: boolean; spot?: Spot; detail?: string }
export interface Option { id: string; label: string; how: string; gain: string; cost: string; spot: Spot; picked: boolean; progress?: string }
export interface SceneBrief { scene: number; title: string; time: string; goals: Objective[]; choice?: { prompt: string; options: Option[] } }

export const SCENE_TITLES = ['', 'Arrival on Mars', 'Restore the Power', 'Life Support', 'Growing Food on Mars', 'Your Decisions Matter', 'Radiation Emergency', 'Mission Complete', 'Mission Complete']

export function brief(s: StoryState): SceneBrief {
  const base = { scene: s.scene, title: SCENE_TITLES[s.scene], time: '' }
  switch (s.scene) {
    case 1: return { ...base, goals: [
      { id: 'enter', text: 'Enter the ARES-7 hab', done: s.inHab || s.terminalSeen, spot: 'hab' },
      { id: 'terminal', text: 'Check the station status at the control terminal', done: s.terminalSeen, spot: 'terminal' },
    ] }
    case 2: return { ...base, goals: [], choice: { prompt: 'Restore power: pick ONE way', options: [
      { id: 'clean', label: 'Clean the solar panels', how: 'Walk to the 4 panel rows and hold E on each', gain: 'Lots of power for the whole mission', cost: 'Takes time outside', spot: 'panels', picked: s.powerChoice === 'clean', progress: `${panelsClean(s)}/4 rows` },
      { id: 'backup', label: 'Switch on backup power', how: 'Hold E on the breaker at the battery bank', gain: `Instant +${RATES.backupCharge}% power`, cost: 'Panels stay dusty, so power drains later', spot: 'battery', picked: s.powerChoice === 'backup' },
    ] } }
    case 3: return { ...base, goals: [
      { id: 'filter', text: 'Take a new filter from the supply crates', done: s.filter !== 'crate', spot: 'crates' },
      { id: 'install', text: 'Install the filter in the water recycler', done: s.filter === 'installed', spot: 'recycler' },
      { id: 'recycler', text: 'Pull the recycler’s start lever', done: s.recycler, spot: 'recycler' },
      { id: 'oxygen', text: 'Start the oxygen generator', done: s.oxygenGen, spot: 'oxygen', detail: s.recycler ? undefined : 'Needs water from the recycler' },
    ] }
    case 4: {
      const goals: Objective[] = [
        { id: 'enter', text: 'Go inside the greenhouse', done: s.inGreenhouse || s.said.includes('greenhouse'), spot: 'greenhouse' },
        { id: 'valve', text: 'Open the water valve', done: s.ghValve, spot: 'gh-valve' },
        { id: 'lights', text: 'Switch on the grow lights', done: s.ghLights, spot: 'gh-lights' },
      ]
      if (s.ghValve && s.ghLights && s.mode) {
        const blocked = s.trays.filter(t => t.blocked).length
        const growth = Math.min(...s.trays.map(t => t.harvested ? 1 : t.growth))
        goals.push({ id: 'monitor', text: blocked ? `Clear ${blocked} blocked drip line${blocked > 1 ? 's' : ''} (red light)` : 'Monitor the crops', done: growth >= 1, spot: 'trays', detail: `Growing ${round(growth * 100)}%` })
        goals.push({ id: 'harvest', text: `Harvest the trays (${s.harvested}/${TRAY_COUNT})`, done: s.harvested >= TRAY_COUNT, spot: 'trays' })
      }
      const choice = s.ghValve && s.ghLights && !s.mode ? { prompt: 'Pull ONE lever on the priority board', options: [
        { id: 'survival', label: 'Survival', how: 'Green lever', gain: 'Saves power and water', cost: 'Plants grow very slowly', spot: 'gh-board' as Spot, picked: false },
        { id: 'balanced', label: 'Balanced', how: 'Blue lever', gain: 'Fair share for everything', cost: 'Normal growing speed', spot: 'gh-board' as Spot, picked: false },
        { id: 'farming', label: 'Farming', how: 'Orange lever', gain: 'Plants grow almost twice as fast', cost: 'Uses lots of water and power', spot: 'gh-board' as Spot, picked: false },
      ] } : undefined
      return { ...base, goals, choice }
    }
    case 5: return { ...base, goals: [
      { id: 'terminal', text: 'Return to the control terminal and review the station', done: s.reviewed, spot: 'terminal' },
      { id: 'adjust', text: 'Adjust the priority board if needed (optional)', done: s.confirmed, spot: 'hab-board' },
      { id: 'confirm', text: 'Confirm your plan on the terminal', done: s.confirmed, spot: 'terminal' },
    ] }
    case 6: {
      const time = s.sheltered ? 'Sheltering…' : s.storm > 0 ? `Radiation arrives in ${Math.ceil(s.storm)} s` : 'RADIATION HERE: get to the shelter!'
      return { ...base, time, goals: [
        { id: 'oxygen', text: 'Cover the oxygen generator', done: s.secured.oxygen, spot: 'oxygen' },
        { id: 'recycler', text: 'Cover the water recycler', done: s.secured.recycler, spot: 'recycler' },
        { id: 'shelter', text: 'Reach the radiation shelter', done: s.sheltered || s.allClear, spot: 'shelter' },
      ], choice: { prompt: 'Emergency priority: pick ONE', options: [
        { id: 'emergency', label: 'Emergency Mode', how: 'Pull the red lever on a priority board', gain: 'Saves power for life support', cost: 'Greenhouse pauses', spot: 'gh-board', picked: s.stormChoice === 'emergency' },
        { id: 'farming', label: 'Keep farming', how: 'Hold E on the greenhouse override switch', gain: 'New crops keep growing', cost: 'Uses much more power', spot: 'gh-lights', picked: s.stormChoice === 'farming' },
      ] } }
    }
    default: return { ...base, goals: [
      { id: 'report', text: 'Submit the mission report at the control terminal', done: !!s.ending, spot: 'terminal' },
    ] }
  }
}

/** The next unfinished place to go, for markers and PEBBLE's guide. */
export function nextSpots(s: StoryState): Spot[] {
  const b = brief(s)
  const spots = new Set<Spot>()
  if (b.choice && !b.choice.options.some(o => o.picked)) b.choice.options.forEach(o => spots.add(o.spot))
  for (const goal of b.goals) if (!goal.done && goal.spot) { spots.add(goal.spot); if (s.scene !== 6) break }
  return [...spots]
}
