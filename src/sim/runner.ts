import { createInitialState, type SimState } from './state.ts'
import { createRuntime, type Command, type Runtime } from './commands.ts'
import { validCommand } from './applyCommand.ts'
import { step } from './step.ts'
import type { EventDefinition } from './events/director.ts'
import { SAVE_KEY, readSave, type Checkpoint, type DecisionRecord, type SaveData, type StoragePort } from './save.ts'
import { canSleep } from './time.ts'
export class SimRunner {
  state: SimState
  runtime: Runtime
  decisionLog: DecisionRecord[] = []
  checkpoints: Checkpoint[] = []
  settings: Record<string, unknown> = {}
  paused = false
  accumulator = 0
  private queue: Command[] = []
  private storage?: StoragePort
  readonly deck: EventDefinition[]
  constructor(seed = 1, options: { storage?: StoragePort; deck?: EventDefinition[]; restore?: boolean } = {}) {
    this.state = createInitialState(seed); this.runtime = createRuntime()
    this.storage = options.storage; this.deck = options.deck ?? []
    if (options.restore && this.storage) {
      try {
        const save = readSave(this.storage)
        if (save) this.restore(save)
      } catch { this.runtime.notices.push({ kind: 'saveError', text: 'Saved game could not be loaded. Started fresh.' }) }
    }
  }
  enqueue(command: Command) {
    if (!validCommand(command)) throw new Error('Invalid simulation command')
    this.queue.push(structuredClone(command))
  }
  tick() {
    if (this.paused) return false
    // Physical navigation remains usable while a pending decision freezes time.
    if (this.runtime.card && !this.queue.some(c => c.type === 'choose')) {
      const navigation = this.queue.filter(c => c.type === 'setLocation' || c.type === 'setAirlock')
      this.queue = this.queue.filter(c => c.type !== 'setLocation' && c.type !== 'setAirlock')
      if (navigation.length) {
        for (const command of navigation) this.decisionLog.push({ atStep: this.runtime.steps, command: structuredClone(command) })
        step(this.state, this.runtime, navigation, this.deck)
      }
      return false
    }

    const commands = this.queue.splice(0)
    const card = this.runtime.card
    if (card && commands.some(command => command.type === 'choose' && command.cardId === card.id &&
      card.options.some(option => option.id === command.optionId))) this.checkpoint('decision')
    if (!card && !this.runtime.fastForward && canSleep(this.state, this.runtime.airlockSealed) &&
      commands.some(command => command.type === 'sleep')) this.checkpoint('sleep')
    for (const command of commands) this.decisionLog.push({ atStep: this.runtime.steps, command: structuredClone(command) })
    const advanced = step(this.state, this.runtime, commands, this.deck)
    if (this.runtime.checkpoint) { this.runtime.checkpoint = false; this.checkpoint(); this.save() }
    return advanced
  }
  /** One real second is one Mars minute. Paused time never accumulates. */
  update(realSeconds: number, stepLimit = 2000) {
    if (!Number.isFinite(realSeconds) || realSeconds < 0) throw new Error('Invalid frame delta')
    if (this.runtime.card && !this.paused && !this.queue.some(c => c.type === 'choose')) this.tick()
    if (this.paused || this.runtime.card && !this.queue.some(c => c.type === 'choose')) { this.accumulator = 0; return 0 }
    this.accumulator += realSeconds
    let count = 0
    while ((this.accumulator >= 1 || this.runtime.fastForward) && count < stepLimit) {
      const fast = !!this.runtime.fastForward
      if (!this.tick()) { this.accumulator = 0; break }
      if (!fast) this.accumulator = Math.max(0, this.accumulator - 1)
      count++
      if (this.runtime.card) { this.accumulator = 0; break }
    }
    return count
  }
  sleep() { this.enqueue({ type: 'sleep' }); this.runQueuedJump() }
  wait(hours: 1 | 2 | 4) { this.enqueue({ type: 'wait', hours }); this.runQueuedJump() }
  skipSols(sols: number) { this.enqueue({ type: 'skipSols', sols }); this.runQueuedJump() }
  private runQueuedJump() {
    if (!this.tick()) return
    while (this.runtime.fastForward && !this.runtime.card && !this.paused) this.tick()
  }
  checkpoint(before?: Checkpoint['before']) {
    this.checkpoints.push({ simState: structuredClone(this.state), runtime: structuredClone(this.runtime),
      decisionCount: this.decisionLog.length, ...(before ? { before } : {}) })
    this.checkpoints = this.checkpoints.slice(-20)
  }
  rewind(index: number) {
    const c = this.checkpoints[index]
    if (!c) throw new Error('Missing checkpoint')
    this.state = structuredClone(c.simState); this.runtime = structuredClone(c.runtime)
    this.decisionLog = this.decisionLog.slice(0, c.decisionCount); this.checkpoints = this.checkpoints.slice(0, index + 1)
    this.queue = []; this.accumulator = 0; this.save()
  }
  exportSave(): SaveData {
    return structuredClone({ simState: this.state, decisionLog: this.decisionLog, checkpoints: this.checkpoints, settings: { ...this.settings, runtime: this.runtime } })
  }
  save() {
    if (!this.storage) return
    try { this.storage.setItem(SAVE_KEY, JSON.stringify(this.exportSave())) }
    catch { this.runtime.notices.push({ kind: 'saveError', text: 'Could not save on this device.' }) }
  }
  private restore(data: SaveData) {
    this.state = data.simState; this.runtime = data.settings.runtime
    this.decisionLog = data.decisionLog; this.checkpoints = data.checkpoints
    const { runtime: _runtime, ...settings } = data.settings; this.settings = settings
  }
}
export function replay(seed: number, decisions: DecisionRecord[], steps: number, deck: EventDefinition[] = []) {
  const runner = new SimRunner(seed, { deck })
  let i = 0
  while (runner.runtime.steps < steps) {
    while (i < decisions.length && decisions[i].atStep === runner.runtime.steps) runner.enqueue(decisions[i++].command)
    if (!runner.tick()) throw new Error('Replay is waiting for an unrecorded decision')
  }
  return runner
}
