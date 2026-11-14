import { publicUrl } from '../publicUrl'
import { memo, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { buildContext } from '../pebble/buildContext'
import { HISTORY_LIMIT, QUESTION_LIMIT } from '../pebble/chatTypes'
import type { ChatMessage, ChatReply, ChatSource } from '../pebble/chatTypes'
import { generateLocalPebbleReply } from '../pebble/offlineResponder'
import { useMissionStore } from '../state/useMissionStore'
import './PebbleChat.css'

type PebbleTurn = ChatMessage & { sources?: ChatSource[] }

const starters = [
  'What should I do now?',
  'How does solar power work?',
  'Tell me about the radiation shelter',
  'What are the station controls?',
]

export const PebbleChat = memo(function PebbleChat({ visible, speech }: { visible: boolean; speech: string }) {
  const [enabled, setEnabled] = useState(true)
  const [turns, setTurns] = useState<PebbleTurn[]>([])
  const expanded = useMissionStore(s => s.openPanel === 'pebble-chat')
  const setPanel = useMissionStore(s => s.setPanel)
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState('')
  const [error, setError] = useState('')
  const inFlight = useRef<AbortController | null>(null)
  const transcript = useRef<HTMLOListElement>(null)
  const composer = useRef<HTMLInputElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const request = new AbortController()
    void fetch('/api/pebble/chat', { signal: request.signal })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (!request.signal.aborted && data?.enabled !== undefined) {
          setEnabled(true)
        }
      })
      .catch(() => {
        // Local responder ensures PEBBLE is always online
        if (!request.signal.aborted) setEnabled(true)
      })
    return () => request.abort()
  }, [])

  useEffect(() => () => inFlight.current?.abort(), [])
  useEffect(() => {
    if (transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight
  }, [turns, pending, expanded, visible])
  useEffect(() => {
    if (enabled && visible && expanded) composer.current?.focus({ preventScroll: true })
  }, [enabled, visible, expanded])

  function openChat() {
    setPanel('pebble-chat')
    if (document.pointerLockElement) document.exitPointerLock()
  }

  function collapse() {
    setPanel(null)
    toggle.current?.focus({ preventScroll: true })
  }

  async function ask(value: string) {
    const question = value.trim()
    const context = buildContext()
    if (!question || inFlight.current) return
    openChat()
    const request = new AbortController()
    inFlight.current = request
    setPending(question)
    setDraft('')
    setError('')
    let answered = false

    try {
      const response = await fetch('/api/pebble/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history: turns.slice(-HISTORY_LIMIT), context }),
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(6_000)]),
      })
      if (response.ok) {
        const reply: ChatReply = await response.json()
        if (typeof reply.answer === 'string' && Array.isArray(reply.sources)) {
          if (!request.signal.aborted) {
            setTurns(previous => [
              ...previous.slice(-18),
              { role: 'user', content: question },
              { role: 'assistant', content: reply.answer, sources: reply.sources },
            ])
            answered = true
          }
        }
      }
    } catch {
      // API call failed or timed out — seamlessly use onboard local responder
    }

    if (!answered && !request.signal.aborted) {
      const reply = generateLocalPebbleReply(question)
      setTurns(previous => [
        ...previous.slice(-18),
        { role: 'user', content: question },
        { role: 'assistant', content: reply.answer, sources: reply.sources },
      ])
      answered = true
    }

    if (!request.signal.aborted) {
      inFlight.current = null
      setPending('')
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void ask(draft)
  }

  if (!visible) return null
  return <section data-mouse data-keyboard-menu={expanded || undefined} className={'hud-panel pebble-chat' + (expanded ? ' is-expanded' : '')} aria-label="PEBBLE"
    onKeyDown={event => {
      if (event.key === 'Escape' && expanded) { event.stopPropagation(); collapse() }
    }}>
    <button ref={toggle} type="button" className="pebble-chat-card" aria-expanded={expanded} aria-controls="pebble-chat-details"
      onClick={expanded ? collapse : openChat}>
      <img src={publicUrl('/ui/pebble-faces/happy.svg')} alt="" />
      <span className="pebble-chat-who">
        <strong>PEBBLE</strong>
        {speech ? <span className="pebble-chat-hint" role="status">{speech}</span>
          : <span className="pebble-chat-hint">{expanded ? 'Ask me anything about the mission.' : 'Need help? Click or press P to chat.'}</span>}
      </span>
      {expanded ? <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="m4 10 4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg> : <kbd aria-hidden="true">P</kbd>}
    </button>
    <div id="pebble-chat-details" className="pebble-chat-details" hidden={!expanded}>
    <div className="pebble-chat-messages">
      {turns.length || pending ? (
        <ol ref={transcript} className="pebble-transcript" aria-label="Conversation" aria-live="polite">
          {[...turns, ...(pending ? [{ role: 'user', content: pending } as PebbleTurn] : [])].map((turn, index) =>
            <li key={index} className={turn.role === 'user' ? 'from-player' : 'from-pebble'}>
              <strong>{turn.role === 'user' ? 'You' : 'PEBBLE'}</strong>
              <p dir="auto">{turn.content}</p>
              {turn.sources?.map(source => <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.title}</a>)}
            </li>)}
        </ol>
      ) : (
        <div className="pebble-chat-welcome">
          <p className="pebble-welcome-text">
            👋 <strong>Hi Commander!</strong> I’m PEBBLE, your autonomous station companion on Mars. Click a question below or ask me anything!
          </p>
          <div className="button-row">
            {starters.map(question =>
              <button key={question} type="button" onClick={() => void ask(question)}>{question}</button>)}
          </div>
        </div>
      )}
      {pending ? <p role="status">PEBBLE is thinking…</p> : null}
      {error ? <p role="alert" className="pebble-chat-error">{error}</p> : null}
    </div>
    <form onSubmit={submit}>
      <div className="pebble-chat-input">
        <input ref={composer} id="pebble-question" dir="auto" value={draft} onChange={e => setDraft(e.target.value)}
          aria-label="Your question for PEBBLE" placeholder="Ask PEBBLE…"
          maxLength={QUESTION_LIMIT} autoComplete="off" readOnly={!!pending} />
        <button className="primary" type="submit" disabled={!draft.trim() || !!pending}>Send</button>
      </div>
      <p className="pebble-chat-note">Keep personal details out of the chat.</p>
    </form>
    </div>
  </section>
})
