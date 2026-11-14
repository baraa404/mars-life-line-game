import type { CSSProperties } from 'react'
import { palette } from '../style/tokens'
import './MainMenu.css'
import { useMissionStore } from '../state/useMissionStore'

const colors = Object.fromEntries(
  Object.entries(palette).map(([id, value]) => ['--' + id, value]),
) as CSSProperties

type MainMenuProps = {
  resume: boolean
  onContinue: () => void
  onStartNewGame: () => void
}

export function MainMenu({ resume, onContinue, onStartNewGame }: MainMenuProps) {
  const reduced = useMissionStore(s => s.settings.reducedMotion)
  return (
    <main data-keyboard-menu className={'main-menu' + (reduced ? ' reduced-motion' : '')} style={colors} aria-label="Mars Life Line">
      <div className="menu-backdrop" aria-hidden="true" />
      <div className="menu-atmosphere" aria-hidden="true" />
      <div className="menu-content">
        <nav className="menu-actions" aria-label="Main menu">
          {resume && (
            <button className="menu-btn menu-btn-primary" onClick={onContinue} autoFocus>
              Continue Game
            </button>
          )}
          <button
            className={`menu-btn${resume ? '' : ' menu-btn-primary'}`}
            onClick={onStartNewGame}
            autoFocus={!resume}
          >
            New Game
          </button>
        </nav>
      </div>
    </main>
  )
}
