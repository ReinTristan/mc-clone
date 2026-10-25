import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react/pure'
import { MainMenu } from '@/components/UI/Menus/MainMenu'
import { useMenuStore } from '@/store/useMenuStore'
import { useWorldStore } from '@/store/useWorldStore'
import { ICube } from '@/types/cubes'

const world = () => useWorldStore.getState()
const menu = () => useMenuStore.getState()

/** Deja N mundos guardados y el store sincronizado con ellos. */
const withSavedWorlds = (count: number, cubes: ICube[] = []) => {
  localStorage.setItem('totalWorlds', String(count))
  for (let n = 1; n <= count; n++) {
    localStorage.setItem(`world_${n}`, JSON.stringify(cubes))
  }
  useWorldStore.setState({ totalWorlds: count })
}

describe('with no saved worlds', () => {
  it('disables Load World', async () => {
    const screen = await render(<MainMenu />)

    await expect
      .element(screen.getByRole('button', { name: 'Load World' }))
      .toBeDisabled()
  })

  it('enters an empty world through New World', async () => {
    const screen = await render(<MainMenu />)

    await screen.getByRole('button', { name: 'New World' }).click()

    expect(world().cubes).toEqual([])
    expect(world().currentWorld).toBeNull()
    expect(menu().mainMenu).toBe(false)
  })
})

describe('with saved worlds', () => {
  it('enables Load World', async () => {
    withSavedWorlds(1)
    const screen = await render(<MainMenu />)

    await expect
      .element(screen.getByRole('button', { name: 'Load World' }))
      .toBeEnabled()
  })

  it('lists exactly one button per world', async () => {
    withSavedWorlds(3)
    const screen = await render(<MainMenu />)

    await screen.getByRole('button', { name: 'Load World' }).click()

    const worlds = screen.getByRole('button', { name: /^World \d+$/ })
    expect(worlds.elements()).toHaveLength(3)
    await expect
      .element(screen.getByRole('button', { name: 'Back' }))
      .toBeVisible()
  })

  it('returns to the first screen through Back', async () => {
    withSavedWorlds(2)
    const screen = await render(<MainMenu />)

    await screen.getByRole('button', { name: 'Load World' }).click()
    await screen.getByRole('button', { name: 'Back' }).click()

    await expect
      .element(screen.getByRole('button', { name: 'New World' }))
      .toBeVisible()
  })

  it('loads the chosen world and leaves the menu', async () => {
    withSavedWorlds(3, [{ id: 'a', pos: [1, 2, 3], textureId: 5 }])
    const screen = await render(<MainMenu />)

    await screen.getByRole('button', { name: 'Load World' }).click()
    await screen.getByRole('button', { name: 'World 2' }).click()

    expect(world().currentWorld).toBe('world_2')
    expect(world().cubes).toHaveLength(1)
    expect(world().cubes[0].textureId).toBe(5)
    expect(menu().mainMenu).toBe(false)
  })
})

describe('texture gallery button', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('AC-0.4.3-14 · shows the Texture Gallery button in dev', async () => {
    const screen = await render(<MainMenu />)

    await expect
      .element(screen.getByRole('button', { name: 'Texture Gallery' }))
      .toBeVisible()
  })

  // En producción Vite reemplaza `import.meta.env.DEV` por `false` al compilar;
  // aquí se simula en runtime.
  it('AC-0.4.3-14 · hides the Texture Gallery button outside dev', async () => {
    vi.stubEnv('DEV', false)
    const screen = await render(<MainMenu />)

    await expect
      .element(screen.getByRole('button', { name: 'New World' }))
      .toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Texture Gallery' }).elements()
    ).toHaveLength(0)
  })

  it('opens the gallery without leaving the main menu', async () => {
    const screen = await render(<MainMenu />)

    await screen.getByRole('button', { name: 'Texture Gallery' }).click()

    expect(menu().textureMenu).toBe(true)
    expect(menu().mainMenu).toBe(true)
  })
})
