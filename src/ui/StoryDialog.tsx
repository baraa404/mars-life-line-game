import { publicUrl } from '../publicUrl'
import { memo, useEffect, useState } from 'react'
import { gameAudio } from '../game/audio/audio'
import { useMissionStore } from '../state/useMissionStore'
import { useStoryStore } from '../state/useStoryStore'
import type { Mood } from '../sim/story/script'

const CHARS_PER_SECOND = 48
const PEBBLE_CUE: Record<Mood, 'pebble-hello' | 'pebble-happy' | 'pebble-worried' | 'pebble-think'> = {
  neutral: 'pebble-hello', happy: 'pebble-happy', 'very-happy': 'pebble-happy', worried: 'pebble-worried', thinking: 'pebble-think', alarm: 'pebble-worried',
}
/** Reading time after the text is fully shown. */
const holdSeconds = (text: string) => Math.max(2.4, text.split(/\s+/).length * .33)

/**
 * The story speaker box. It never disappears: once the queue is read, the last line stays
 * (dimmed) so the current instruction is always on screen. Every new line plays a cue.
 */
export const StoryDialog = memo(function StoryDialog() {
  const line = useStoryStore(s => s.line)
  const waiting = useStoryStore(s => s.queue.length)
  const reduced = useMissionStore(s => s.settings.reducedMotion)
  const [shown, setShown] = useState(0)
  const fresh = !!line && line.id > 0
  const text = line?.text ?? ''
  const typing = fresh && shown < text.length

  useEffect(() => {
    if (!line || line.id <= 0) return
    setShown(reduced ? line.text.length : 0)
    if (line.who === 'control') gameAudio.play('message', .45, .05, 'dialog')
    else gameAudio.play(PEBBLE_CUE[line.mood ?? 'happy'], .4, .05, 'dialog')
  }, [line, reduced])

  useEffect(() => {
    if (!fresh) return
    if (typing) {
      const timer = setTimeout(() => setShown(n => Math.min(text.length, n + 2)), 2000 / CHARS_PER_SECOND)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => useStoryStore.getState().advance(), holdSeconds(text) * 1000)
    return () => clearTimeout(timer)
  }, [fresh, typing, text, shown])

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.code !== 'Enter' || event.repeat) return
      const panel = useMissionStore.getState().openPanel
      if (panel && panel !== 'shelter') return
      event.preventDefault()
      next()
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })

  function next() {
    if (!line || line.id <= 0) return
    if (shown < line.text.length) setShown(line.text.length)
    else useStoryStore.getState().advance()
  }

  if (!line) return null
  const control = line.who === 'control'
  const face = control ? publicUrl('/ui/icons/earth-link.svg') : publicUrl(`/ui/pebble-faces/${line.mood === 'very-happy' ? 'very-happy' : line.mood ?? 'happy'}.svg`)
  return <section data-mouse className={'story-dialog' + (control ? ' control' : '') + (fresh ? '' : ' idle')} aria-live="polite" onClick={next}>
    <img className="story-face" src={face} alt="" />
    <div className="story-words">
      <strong>{control ? 'MISSION CONTROL' : 'PEBBLE'}{!fresh && <small> · last message</small>}</strong>
      <p>{fresh ? text.slice(0, shown) : text}<span className="story-caret" aria-hidden="true">{typing ? '▌' : ''}</span></p>
    </div>
    {fresh && <span className="story-next">{waiting ? `${waiting} more · ` : ''}<kbd>Enter</kbd></span>}
  </section>
})
