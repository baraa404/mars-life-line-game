import { useEffect, useRef, useState } from 'react'
import { useMissionStore } from '../state/useMissionStore'

/** A brief dust-cloud cover hides the perspective/orthographic camera swap. */
export function ViewTransition() {
  const view = useMissionStore(s => s.view)
  const reduced = useMissionStore(s => s.settings.reducedMotion)
  const previous = useRef(view)
  const [wipe, setWipe] = useState({ serial: 0, visible: false })
  useEffect(() => {
    if (previous.current === view) return
    previous.current = view
    setWipe(last => ({ serial: last.serial + 1, visible: !reduced }))
  }, [view, reduced])
  if (!wipe.visible || reduced) return null
  return <div key={wipe.serial} className="view-clouds" aria-hidden="true"
    onAnimationEnd={event => { if (event.target === event.currentTarget) setWipe(last => ({ ...last, visible: false })) }} />
}
