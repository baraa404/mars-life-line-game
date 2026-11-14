import type { LandingStage } from '../game/missions/m0'

const titles: Partial<Record<LandingStage, [string, string]>> = {
  orbit: ['A long way from home', 'MARS · ORBITAL APPROACH'],
  entry: ['Into the red', 'ATMOSPHERIC ENTRY'],
  touchdown: ['A new beginning', 'LIFE LINE STATION · MARS'],
}

/** Decorative film titles never capture input or replace mission instructions. */
export function LandingCinematic({ stage, reduced }: { stage: LandingStage; reduced: boolean }) {
  const title = titles[stage]
  if (reduced) return null
  return <div className="landing-cinematic" aria-hidden="true">
    <div className="cinematic-bar cinematic-bar-top" />
    <div className="cinematic-bar cinematic-bar-bottom" />
    {title && <div className="cinematic-title" key={stage}>
      <span>{title[1]}</span><strong>{title[0]}</strong><i />
    </div>}
  </div>
}
