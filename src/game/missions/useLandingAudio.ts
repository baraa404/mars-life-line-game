import { useEffect } from 'react'
import { gameAudio } from '../audio/audio'
import type { LandingStage } from './m0'

/** Landing shares the game's mixer and original asset bank. */
export function useLandingAudio(stage: LandingStage, _volume: number) {
  useEffect(() => {
    const cue = {
      earth: 'pebble-hello', signal: 'message', arm: 'ui-confirm',
      entry: 'landing-entry', thrust: 'landing-thrust', touchdown: 'landing-touchdown',
      suit: 'switch', seal: 'door', cycle: 'airlock', exit: 'door',
    } as const
    const sound = cue[stage as keyof typeof cue]
    if (sound) gameAudio.play(sound, .45, .2)
  }, [stage])
  return gameAudio.unlock
}
