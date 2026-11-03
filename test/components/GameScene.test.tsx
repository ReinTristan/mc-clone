import { ReactNode } from 'react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react/pure'
import { GameScene } from '@/components/GameScene'
import { loadAllTextures } from '@/lib/textures/registry'
import { useMenuStore } from '@/store/useMenuStore'
import { useWorldStore } from '@/store/useWorldStore'

/**
 * Smoke test, no test de render 3D. Verifica que la escena **monta** —que R3F
 * consigue su contexto WebGL y que el árbol de física, jugador y cubos no
 * revienta al construirse—, nada sobre lo que se ve. El comportamiento del
 * movimiento, la física y el colocar/romper sigue siendo QA manual.
 */

// R3F necesita un contenedor con tamaño para crear el renderer; el `container`
// pelado de la librería de tests mide 0×0.
const Sized = ({ children }: { children: ReactNode }) => (
  <div style={{ width: 800, height: 600 }}>{children}</div>
)

const canvasEl = (container: HTMLElement) => container.querySelector('canvas')

// El panel de `<Stats>` lo cuelga drei de `document.body`, fuera del
// contenedor del test, y trae sus propios `<canvas>` (uno por gráfica). Contar
// los de la página entera es la forma de verlo sin tocar la escena.
const pageCanvases = () => document.body.querySelectorAll('canvas').length

const settle = () => new Promise((resolve) => setTimeout(resolve, 500))

beforeAll(async () => {
  await loadAllTextures()
})

describe('GameScene', () => {
  it('mounts the canvas on the main menu', async () => {
    const screen = await render(<GameScene />, { wrapper: Sized })

    await vi.waitFor(() => {
      expect(canvasEl(screen.container)).not.toBeNull()
    })
  })

  it('mounts physics, player and cubes when entering the world', async () => {
    useMenuStore.setState({ mainMenu: false, pauseMenu: false })
    useWorldStore.setState({
      cubes: [
        { id: 'a', pos: [0, 1, 0], textureId: 1 },
        { id: 'b', pos: [1, 1, 0], textureId: 2 },
      ],
    })

    const screen = await render(<GameScene />, { wrapper: Sized })

    await vi.waitFor(() => {
      expect(canvasEl(screen.container)).not.toBeNull()
    })
    // el crosshair (un '+') solo existe dentro del mundo y sin pausa
    expect(screen.getByText('+').elements()).toHaveLength(1)
  })

  it('hides the crosshair while the pause menu is open', async () => {
    useMenuStore.setState({ mainMenu: false, pauseMenu: true })

    const screen = await render(<GameScene />, { wrapper: Sized })

    await vi.waitFor(() => {
      expect(canvasEl(screen.container)).not.toBeNull()
    })
    expect(screen.getByText('+').elements()).toHaveLength(0)
  })

  it('AC-0.4.4-3 · does not mount the Stats panel on the main menu', async () => {
    const screen = await render(<GameScene />, { wrapper: Sized })

    await vi.waitFor(() => {
      expect(canvasEl(screen.container)).not.toBeNull()
    })
    // drei cuelga el panel un poco después de que exista el canvas, así que
    // la ausencia solo vale tras darle tiempo de sobra para aparecer
    await settle()
    expect(pageCanvases()).toBe(1)

    // control, en la misma escena: dentro del mundo (y en vitest `DEV` es
    // true) el panel sí aparece, así que el detector y la espera sirven
    useMenuStore.setState({ mainMenu: false })
    await vi.waitFor(() => {
      expect(pageCanvases()).toBeGreaterThan(1)
    })
  })
})
