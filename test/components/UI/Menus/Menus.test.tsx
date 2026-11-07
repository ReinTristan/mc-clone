import { beforeAll, describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react/pure'
import { Menus } from '@/components/UI/Menus/Menus'
import { loadAllTextures } from '@/lib/textures/registry'
import { useMenuStore } from '@/store/useMenuStore'

const pressEscape = (repeat = false) =>
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', repeat }))
const releaseEscape = () =>
  window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape' }))

const paused = () => useMenuStore.getState().pauseMenu

beforeAll(async () => {
  await loadAllTextures()
})

describe('Menus', () => {
  it('AC-0.5.0-5 · Escape toggles the pause on every press, N times in a row', async () => {
    useMenuStore.setState({ mainMenu: false })
    await render(<Menus />)

    for (let press = 1; press <= 7; press++) {
      pressEscape()
      releaseEscape()
      expect(paused()).toBe(press % 2 === 1)
    }
  })

  it('AC-0.5.0-5 · holding Escape counts as a single press', async () => {
    useMenuStore.setState({ mainMenu: false })
    await render(<Menus />)

    pressEscape()
    // un número impar de repeticiones: si alternaran, acabaría sin pausa
    pressEscape(true)

    expect(paused()).toBe(true)
  })

  it('AC-0.5.0-13 · Escape on the main menu does not leave the pause open', async () => {
    await render(<Menus />)

    pressEscape()
    useMenuStore.getState().setMainMenu(false)

    expect(paused()).toBe(false)
  })
})
