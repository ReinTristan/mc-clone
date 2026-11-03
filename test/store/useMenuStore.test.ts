import { describe, expect, it } from 'vitest'
import { useMenuStore } from '@/store/useMenuStore'

const menu = () => useMenuStore.getState()

// El código de `src/` como texto, sin el propio store: un campo que solo se
// lee donde se declara es un campo que nadie lee.
const consumers = Object.entries(
  import.meta.glob<string>('/src/**/*.{ts,tsx}', {
    query: '?raw',
    import: 'default',
    eager: true,
  })
)
  .filter(([path]) => !path.startsWith('/src/store/'))
  .map(([, source]) => source)

describe('useMenuStore', () => {
  it('starts on the main menu', () => {
    expect(menu().mainMenu).toBe(true)
    expect(menu().pauseMenu).toBe(false)
    expect(menu().textureMenu).toBe(false)
  })

  it('setMainMenu toggles the main layer', () => {
    menu().setMainMenu(false)
    expect(menu().mainMenu).toBe(false)
  })

  it('setPauseMenu toggles the pause without touching the rest', () => {
    menu().setMainMenu(false)
    menu().setPauseMenu(true)

    expect(menu().pauseMenu).toBe(true)
    expect(menu().mainMenu).toBe(false)
  })

  it('setTextureMenu toggles the texture menu', () => {
    menu().setTextureMenu(true)
    expect(menu().textureMenu).toBe(true)
  })

  it('AC-0.4.4-6 · every state field is read outside the store', () => {
    const fields = Object.entries(menu())
      .filter(([, value]) => typeof value !== 'function')
      .map(([key]) => key)
    // control: si el filtro se comiera todo, el test no comprobaría nada
    expect(fields.length).toBeGreaterThan(0)

    const unread = fields.filter(
      (field) =>
        !consumers.some((source) => new RegExp(`\\b${field}\\b`).test(source))
    )
    expect(unread).toEqual([])
  })
})
