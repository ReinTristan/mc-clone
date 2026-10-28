import { describe, expect, it } from 'vitest'

// Todo el código de `src/` como texto. Los planes viejos (`issues.md`,
// `ToDo.md`) los sustituyó el backlog el 2026-08-16.
const sources = import.meta.glob<string>('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

describe('source comments', () => {
  it('AC-0.4.4-5 · no source comment points to issues.md or ToDo.md', () => {
    // control: un glob vacío pasaría el test sin mirar nada
    expect(Object.keys(sources).length).toBeGreaterThan(0)

    const stale = Object.entries(sources)
      .filter(([, source]) => /issues\.md|ToDo\.md/.test(source))
      .map(([path]) => path)
    expect(stale).toEqual([])
  })
})
