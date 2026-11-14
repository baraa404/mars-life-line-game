import type { KeyboardControlsEntry } from '@react-three/drei'

export type ControlName = 'forward' | 'backward' | 'leftward' | 'rightward' | 'jump' | 'run'

export const keyboardMap: KeyboardControlsEntry<ControlName>[] = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'run', keys: ['ShiftLeft', 'ShiftRight'] },
]
