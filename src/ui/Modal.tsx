import { publicUrl } from '../publicUrl'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useMissionStore } from '../state/useMissionStore'

/** Return the mouse to look mode right after a menu closes (keyboard press counts as a gesture). */
function relock() {
  if (useMissionStore.getState().view !== 'firstPerson') return
  const canvas = document.querySelector('canvas')
  try { void canvas?.requestPointerLock()?.catch(() => undefined) } catch { /* Click the view to look around again. */ }
}
export function closePanel() {
  useMissionStore.setState({ openPanel: null, panelHistory: [] })
  relock()
}

export function Modal({ title, icon, children, closable = true, wide = false, className = '' }: { title: string; icon?: string; children: ReactNode; closable?: boolean; wide?: boolean; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const label = useId()
  useEffect(() => {
    const node = dialog.current!
    node.showModal()
    node.querySelector<HTMLElement>('button:not(:disabled)')?.focus({ preventScroll: true })
    return () => node.close()
  }, [])
  return <dialog ref={dialog} data-mouse="" className={'oh-dialog' + (wide ? ' wide' : '') + (className ? ' ' + className : '')} aria-labelledby={label} onCancel={event => event.preventDefault()}>
    <header>
      {icon && <img src={publicUrl('/ui/icons/') + icon + '.svg'} alt="" />}
      <h2 id={label}>{title}</h2>
    </header>
    <div className="oh-dialog-body">{children}</div>
    <footer><kbd>↑</kbd><kbd>↓</kbd> choose · <kbd>E</kbd> select{closable && <> · <kbd>Esc</kbd> close</>}</footer>
  </dialog>
}

export function Fact({ children, source, href }: { children: ReactNode; source: string; href?: string }) {
  return <aside className="oh-fact">
    <span className="oh-tag">NASA</span>
    <p>{children}</p>
    {href ? <a href={href} target="_blank" rel="noreferrer">{source}</a> : <small>{source}</small>}
  </aside>
}
