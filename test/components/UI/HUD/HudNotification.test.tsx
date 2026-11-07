import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react/pure'
import { Menus } from '@/components/UI/Menus/Menus'
import { loadAllTextures } from '@/lib/textures/registry'
import { useMenuStore } from '@/store/useMenuStore'
import { useWorldStore } from '@/store/useWorldStore'
// `test/setup.ts` no carga estilos, y sin ellos no hay animación que comprobar.
import '@/index.css'

const menu = () => useMenuStore.getState()
const world = () => useWorldStore.getState()

// `Menus` monta la hotbar, que consume el registry real.
beforeAll(async () => {
  await loadAllTextures()
})

afterEach(() => {
  vi.restoreAllMocks()
})

const paused = async () => {
  useMenuStore.setState({ mainMenu: false, pauseMenu: true })
  return render(<Menus />)
}

type Screen = Awaited<ReturnType<typeof paused>>

const save = (screen: Screen) =>
  screen.getByRole('button', { name: 'Save World' }).click()

/**
 * Llena el `localStorage` real hasta el último byte, así el próximo guardado
 * falla con el `QuotaExceededError` del navegador y no con un error simulado.
 * Los trozos se van partiendo a la mitad hasta que ya no cabe ni un carácter.
 */
const fillStorage = () => {
  let chunk = 'x'.repeat(1024 * 1024)
  let index = 0
  while (chunk.length > 0) {
    try {
      localStorage.setItem(`filler_${index++}`, chunk)
    } catch {
      chunk = chunk.slice(0, Math.floor(chunk.length / 2))
    }
  }
  // El error se registra a propósito; aquí solo ensuciaría la salida.
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
}

describe('HudNotification', () => {
  it('AC-0.4.5-10 · Save World shows the notice with the pause closed', async () => {
    const screen = await paused()
    expect(screen.getByText('World saved').elements()).toHaveLength(0)

    await save(screen)

    await expect.element(screen.getByText('World saved')).toBeVisible()
    expect(menu().pauseMenu).toBe(false)
  })

  it('AC-0.4.5-11 · is no longer visible once the animation ends', async () => {
    const screen = await paused()
    await save(screen)
    const notice = screen.getByText('World saved')
    await expect.element(notice).toBeVisible()

    const animations = notice.element().getAnimations()
    // control: sin animación real este test no comprobaría nada
    expect(animations).toHaveLength(1)
    for (const animation of animations) animation.finish()

    expect(getComputedStyle(notice.element()).opacity).toBe('0')
  })

  it('AC-0.4.5-12 · a second save shows the notice again', async () => {
    const screen = await paused()
    await save(screen)
    const notice = screen.getByText('World saved')
    await expect.element(notice).toBeVisible()
    for (const animation of notice.element().getAnimations()) {
      animation.finish()
    }

    menu().setPauseMenu(true)
    await save(screen)

    await expect
      .poll(() => getComputedStyle(notice.element()).opacity)
      .toBe('1')
  })

  it('AC-0.4.5-13 · saving, exiting and entering again does not repeat it', async () => {
    const screen = await paused()
    await save(screen)
    await expect.element(screen.getByText('World saved')).toBeVisible()

    menu().setPauseMenu(true)
    await screen.getByRole('button', { name: 'Exit World' }).click()
    menu().setMainMenu(false)

    await expect.element(screen.getByText('Double Esc to pause')).toBeVisible()
    expect(screen.getByText('World saved').elements()).toHaveLength(0)
  })

  it('AC-0.4.5-15 · a failed save says so instead of confirming it', async () => {
    const screen = await paused()
    world().addCube({ pos: [0, 0, 0], textureId: 1 })
    fillStorage()

    await save(screen)

    await expect.element(screen.getByText('Could not save world')).toBeVisible()
    expect(screen.getByText('World saved').elements()).toHaveLength(0)
  })

  it('AC-0.4.5-16 · a failed save keeps the pause open', async () => {
    const screen = await paused()
    world().addCube({ pos: [0, 0, 0], textureId: 1 })
    fillStorage()

    await save(screen)

    await expect.element(screen.getByText('Could not save world')).toBeVisible()
    expect(menu().pauseMenu).toBe(true)
  })

  it('AC-0.4.5-17 · a failed save leaves the last save intact', async () => {
    const screen = await paused()
    world().addCube({ pos: [0, 0, 0], textureId: 1 })
    await save(screen)
    const lastSave = localStorage.getItem('world_1')
    // control: sin un guardado previo no habría nada que proteger
    expect(lastSave).not.toBeNull()

    menu().setPauseMenu(true)
    world().addCube({ pos: [1, 0, 0], textureId: 1 })
    fillStorage()
    await save(screen)

    await expect.element(screen.getByText('Could not save world')).toBeVisible()
    expect(localStorage.getItem('world_1')).toBe(lastSave)
  })
})
