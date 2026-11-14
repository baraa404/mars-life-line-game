import { useEffect } from 'react'
import { useMissionStore } from '../../state/useMissionStore'
import type { Command } from '../../sim/commands'
import { gameAudio } from './audio'

const commandCues: Partial<Record<Command['type'], Parameters<typeof gameAudio.play>[0]>> = {
  pebbleJob: 'pebble-hello', choose: 'ui-confirm', plant: 'harvest', harvest: 'harvest',
  replaceScrubber: 'tool', waterWall: 'switch', toggleLoad: 'switch', setPriority: 'ui-confirm',
  sendMessage: 'message', missionComplete: 'complete', m0Startup: 'ui-confirm',
}

export function useGameAudio(mode: 'home' | 'landing' | 'campaign') {
  useEffect(() => {
    const sync = () => {
      const s = useMissionStore.getState()
      gameAudio.volumes(s.settings.muted ? 0 : s.settings.volume, s.settings.musicVolume)
      const quiet = mode === 'campaign' && (s.paused || s.openPanel === 'pause')
      if (quiet) { gameAudio.stopAll(); return }
      gameAudio.loop('music', 'pale-blue-morning', mode === 'landing' ? .18 : .32)
      if (mode !== 'campaign') return
      gameAudio.loop('ambience', s.area === 'outside' ? 'suit-ambience' : 'hab-ambience', .12)
      if (s.airlockStatus.cycling) gameAudio.loop('airlock', 'airlock', .28)
      else gameAudio.stop('airlock')
    }
    sync()
    const unsubscribe = useMissionStore.subscribe((s, previous) => {
      if (s.settings !== previous.settings || s.paused !== previous.paused || s.openPanel !== previous.openPanel ||
          s.area !== previous.area || s.airlockStatus.cycling !== previous.airlockStatus.cycling) sync()
      if (mode !== 'campaign' || s.paused || s.openPanel === 'pause') return
      if (s.area !== previous.area) gameAudio.play('door', .4)
      if (s.openPanel !== previous.openPanel) {
        gameAudio.play(s.openPanel === 'pebble' ? 'pebble-hello' : s.openPanel ? 'ui-open' : 'ui-close', .3)
      }
      if (s.currentCard && s.currentCard.id !== previous.currentCard?.id) gameAudio.play('ui-notice', .34, 4)
      if (s.speech !== previous.speech && s.speech && s.pebbleNearby) gameAudio.play('pebble-think', .24, 6)
      if (s.commands !== previous.commands && s.commands.length > previous.commands.length) {
        for (const command of s.commands.slice(previous.commands.length)) {
          const cue = commandCues[command.type]
          if (cue) gameAudio.play(cue, .35, .4)
        }
      }
      const robot = s.snapshot?.state.pebble, old = previous.snapshot?.state.pebble
      if (robot && old) {
        if (old.job && !robot.job && !robot.glitched && s.pebbleNearby) gameAudio.play('pebble-happy', .32, 3)
        if (robot.glitched && !old.glitched && s.pebbleNearby) gameAudio.play('pebble-reboot', .3, 6)
        if (robot.batteryPct < 20 && old.batteryPct >= 20 && s.pebbleNearby) gameAudio.play('pebble-worried', .26, 30)
      }
      if (s.snapshot?.mission === 'm0-complete' && previous.snapshot?.mission !== 'm0-complete') gameAudio.play('complete', .4, 10)
    })
    const gesture = () => gameAudio.unlock()
    const click = (event: MouseEvent) => {
      const target = event.target
      if (target instanceof Element && target.closest('button:not(:disabled), summary')) gameAudio.play('ui-click', .2)
    }
    const key = (event: KeyboardEvent) => { if (!event.repeat && !event.metaKey && !event.ctrlKey) gesture() }
    const visibility = () => gameAudio.visibility(document.hidden)
    window.addEventListener('pointerdown', gesture)
    window.addEventListener('keydown', key)
    window.addEventListener('click', click)
    document.addEventListener('visibilitychange', visibility)
    visibility()
    return () => {
      unsubscribe(); gameAudio.stopAll()
      window.removeEventListener('pointerdown', gesture)
      window.removeEventListener('keydown', key)
      window.removeEventListener('click', click)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [mode])
}
