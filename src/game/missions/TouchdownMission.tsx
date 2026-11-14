import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import type { EcctrlHandle } from 'ecctrl'
import { useGLTF } from '@react-three/drei'
import { useMissionStore } from '../../state/useMissionStore'

export function TouchdownMission({ player }: { player: RefObject<EcctrlHandle | null> }) {
  const beat = useRef({ greeted: false, jumped: false, station: false })
  useFrame(() => {
    const ui = useMissionStore.getState()
    const s = ui.snapshot
    if (!s || ui.fading || ui.currentCard || ui.paused || !player.current?.body) return
    if (s.mission === 'm0-walk') {
      if (ui.area === 'outside' && !beat.current.greeted) {
        beat.current.greeted = true
        useMissionStore.setState({ speech: 'Hello, Commander! I’m PEBBLE. Follow me to the base. We have 7 sols until the supply ship comes!' })
      }
      if (ui.area === 'outside' && !beat.current.jumped && player.current.body.linvel().y > 1.5) {
        beat.current.jumped = true
        useMissionStore.setState({ speech: 'Mars gravity is about 38% of Earth’s. That makes jumps floaty.' })
      }
    }
    if (ui.area === 'hab' && !beat.current.station && !ui.openPanel && s.state.clock.sol === 1) {
      beat.current.station = true
      useMissionStore.setState({ speech: 'Welcome inside! The bunk ends the day. The console controls power. Finish today’s missions first.' })
    }
  })
  return null
}

export function TouchdownSiteProps() {
  const plaque = useGLTF('/models/flag-plaque.glb')
  const plaqueModel = useMemo(() => plaque.scene.clone(true), [plaque.scene])
  return <primitive object={plaqueModel} position={[2.8, 2.25, 4.35]} rotation-y={-Math.PI / 2} />
}
