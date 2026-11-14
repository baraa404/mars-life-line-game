import { useGameAudio } from './game/audio/useGameAudio'
import { useMissionStore } from './state/useMissionStore'
import { Leva } from 'leva'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Game } from './game/Game'
import { useWorldStore } from './state/useWorldStore'
import { hasStorySave, useStoryStore } from './state/useStoryStore'
import { StoryHud } from './ui/StoryHud'
import { useGameShortcuts } from './ui/useGameShortcuts'
import { TouchdownIntro } from './ui/TouchdownIntro'
import { useKeyboardMenus } from './ui/useKeyboardMenus'
import { MainMenu } from './ui/MainMenu'
import { SitePicker } from './ui/SitePicker'

const SimDebug = import.meta.env.DEV ? lazy(() => import('./ui/SimDebug')) : null

export default function App() {
  const debug = useWorldStore((s) => s.debug)
  const demo = new URLSearchParams(location.search).get('demo') === 'landing'

  const [mode, setMode] = useState<'home' | 'site' | 'landing' | 'campaign'>(() => (demo ? 'landing' : 'home'))
  const [fromShip, setFromShip] = useState(false)
  const menuMode = mode === 'site' ? 'home' : mode

  useGameAudio(menuMode)
  useKeyboardMenus(menuMode)

  const [resume] = useState(hasStorySave)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (import.meta.env.DEV && e.shiftKey && e.code === 'KeyP') useWorldStore.getState().togglePhysicsDebug()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (mode === 'home') {
    return (
      <MainMenu
        resume={resume}
        onContinue={() => {
          resetMissionPresentation()
          setFromShip(false)
          setMode('campaign')
        }}
        onStartNewGame={() => setMode('site')}
      />
    )
  }

  if (mode === 'site') {
    return (
      <SitePicker
        onBack={() => setMode('home')}
        onPick={(site) => {
          useStoryStore.getState().start(site)
          resetMissionPresentation()
          setMode('landing')
        }}
      />
    )
  }

  if (mode === 'landing') {
    return (
      <TouchdownIntro
        demo={demo}
        replay={false}
        resume={false}
        initialStart={true}
        onBackToMenu={() => setMode('home')}
        onExit={() => {
          setFromShip(true)
          setMode('campaign')
        }}
      />
    )
  }

  return <Surface fromShip={fromShip} debug={debug} />
}

function Surface({ fromShip, debug }: { fromShip: boolean; debug: boolean }) {
  const [ready, setReady] = useState(false)
  useGameShortcuts()

  return (
    <>
      <Game fromShip={fromShip} onReady={() => setReady(true)} />
      <div className={'surface-arrival' + (ready ? ' ready' : '')} aria-hidden="true" />
      <StoryHud />
      {SimDebug && (
        <Suspense fallback={null}>
          <SimDebug />
        </Suspense>
      )}
      <Leva hidden={!debug} collapsed />
    </>
  )
}

function resetMissionPresentation() {
  useMissionStore.setState({ currentCard: null, decisionOpen: false, openPanel: null, panelHistory: [], prompt: null, jobPicker: null, view: 'firstPerson' })
}
