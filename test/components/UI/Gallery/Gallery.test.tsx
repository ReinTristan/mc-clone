import { beforeAll, describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react/pure'
import { Gallery } from '@/components/UI/Gallery/Gallery'
import { Menus } from '@/components/UI/Menus/Menus'
import { blocks } from '@/data/blocks'
import { getBlockTextures, loadAllTextures } from '@/lib/textures/registry'
import { useMenuStore } from '@/store/useMenuStore'
import { FACES } from '@/types/textures'

const menu = () => useMenuStore.getState()

beforeAll(async () => {
  await loadAllTextures()
})

describe('opening the gallery', () => {
  // `GameScene` solo monta física, jugador y cubos con `mainMenu` en false.
  // La galería se abre encima del menú principal sin cerrarlo, y el HUD del
  // mundo (hotbar, aviso de pausa) tampoco aparece.
  it('AC-0.4.3-16 · opening the gallery keeps the world unmounted', async () => {
    useMenuStore.setState({ textureMenu: true })
    const screen = await render(<Menus />)

    await expect
      .element(screen.getByRole('heading', { name: 'Texture Gallery' }))
      .toBeVisible()
    expect(menu().mainMenu).toBe(true)
    expect(
      screen.getByRole('button', { name: 'New World' }).elements()
    ).toHaveLength(0)
    expect(screen.getByAltText('slot1').elements()).toHaveLength(0)
    expect(screen.getByText('Double Esc to pause').elements()).toHaveLength(0)
  })

  it('goes back to the main menu through Back', async () => {
    useMenuStore.setState({ textureMenu: true })
    const screen = await render(<Menus />)

    await screen.getByRole('button', { name: 'Back' }).click()

    expect(menu().textureMenu).toBe(false)
    await expect
      .element(screen.getByRole('button', { name: 'New World' }))
      .toBeVisible()
  })
})

// Los tests no cargan `index.css`: sin Tailwind, los tiles 3×3 (un div con
// background-image y sin contenido) miden 0×0 y nunca cuentan como visibles.
// Por eso se comprueba que estén en el DOM; cómo se ven es QA manual (AC-18).
describe('Gallery', () => {
  it('AC-0.4.3-17 · shows every block with its name and iso icon', async () => {
    const screen = await render(<Gallery />)

    for (const block of blocks) {
      const icon = screen.getByAltText(`${block.name} icon`, { exact: true })
      await expect.element(icon).toBeVisible()
      expect(icon.element().getAttribute('src')).toBe(
        getBlockTextures(block.id).iconUrl
      )
      await expect
        .element(screen.getByText(block.name, { exact: true }))
        .toBeVisible()
    }
  })

  it('AC-0.4.3-17 · expanding a block shows its six composed faces', async () => {
    const screen = await render(<Gallery />)

    await screen.getByRole('button', { name: 'grass', exact: true }).click()

    for (const face of FACES) {
      await expect
        .element(screen.getByRole('img', { name: `grass ${face}` }))
        .toBeInTheDocument()
    }
  })

  it('shows the raw sprites of the expanded block, overlays included', async () => {
    const screen = await render(<Gallery />)

    await screen.getByRole('button', { name: 'grass', exact: true }).click()

    await expect
      .element(screen.getByRole('img', { name: 'grass_block_side_overlay' }))
      .toBeInTheDocument()
  })

  it('keeps a single block expanded at a time', async () => {
    const screen = await render(<Gallery />)

    await screen.getByRole('button', { name: 'grass', exact: true }).click()
    await screen.getByRole('button', { name: 'dirt', exact: true }).click()

    await expect
      .element(screen.getByRole('img', { name: 'dirt top' }))
      .toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'grass top' }).elements()
    ).toHaveLength(0)
  })
})
