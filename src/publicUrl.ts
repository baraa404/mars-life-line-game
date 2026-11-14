/** Resolve runtime public assets for both root hosting and GitHub Pages. */
export function publicUrl(path: string): string {
  const base = import.meta.env?.BASE_URL ?? '/'
  return base + path.replace(/^\//, '')
}
