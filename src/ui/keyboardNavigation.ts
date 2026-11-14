/** Stable menu order shared by keyboard-only menus and object panels. */
export function nextControlIndex(current: number, count: number, direction: number) {
  return count ? (current + direction + count) % count : -1
}

export function menuControls(root: ParentNode) {
  return [...root.querySelectorAll<HTMLElement>('button,input,select,textarea,summary,a[href]')]
    .filter(node => !node.matches(':disabled,[aria-disabled="true"]') &&
      !node.closest('[hidden],details:not([open]) > :not(summary)') && node.getClientRects().length > 0)
}
