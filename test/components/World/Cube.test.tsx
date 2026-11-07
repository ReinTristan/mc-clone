import { Physics } from '@react-three/cannon'
import { Canvas } from '@react-three/fiber'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react/pure'
import { Cube } from '@/components/World/Cube'
import { loadAllTextures } from '@/lib/textures/registry'
import { useWorldStore } from '@/store/useWorldStore'
import { ICube } from '@/types/cubes'

const AIMED_CUBE: ICube = { id: 'aimed', pos: [0, 0, 0], textureId: 5 }
const LEFT = 0
const MIDDLE = 1
const RIGHT = 2

const world = () => useWorldStore.getState()

// La cámara por defecto de R3F mira al origen, donde está el cubo: el centro
// del canvas siempre le apunta.
const clickCenter = (canvas: HTMLCanvasElement, button: number) => {
  const { left, top, width, height } = canvas.getBoundingClientRect()
  canvas.dispatchEvent(
    new PointerEvent('pointerdown', {
      bubbles: true,
      button,
      clientX: left + width / 2,
      clientY: top + height / 2,
    })
  )
}

// Por defecto, una hotbar sin el bloque apuntado.
const renderCube = async (slots = [1, 2, 3, 4, 6, 7, 8, 9, 10]) => {
  useWorldStore.setState({
    cubes: [AIMED_CUBE],
    slots,
    hotBarCurrentSlot: 3,
  })
  const screen = await render(
    <div style={{ width: 800, height: 600 }}>
      <Canvas>
        <Physics>
          <Cube {...AIMED_CUBE} />
        </Physics>
      </Canvas>
    </div>
  )
  const canvas = await vi.waitFor(() => {
    const element = screen.container.querySelector('canvas')
    expect(element).not.toBeNull()
    return element as HTMLCanvasElement
  })
  // deja que corra un frame, sin el que la cámara aún no tiene matrices
  await new Promise((resolve) => setTimeout(resolve, 300))
  return canvas
}

beforeAll(async () => {
  await loadAllTextures()
})

describe('Cube', () => {
  it('AC-0.5.0-11 · the middle button selects the slot of a block already in the hotbar, without changing the slots', async () => {
    const slots = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    const canvas = await renderCube(slots)

    clickCenter(canvas, MIDDLE)

    await vi.waitFor(() => expect(world().hotBarCurrentSlot).toBe(4))
    expect(world().slots).toEqual(slots)
    expect(world().cubes).toEqual([AIMED_CUBE])
  })

  it('AC-0.5.0-16 · the middle button puts a block missing from the hotbar in the current slot', async () => {
    const canvas = await renderCube()

    clickCenter(canvas, MIDDLE)

    await vi.waitFor(() => expect(world().slots[3]).toBe(5))
    expect(world().slots).toEqual([1, 2, 3, 5, 6, 7, 8, 9, 10])
    expect(world().hotBarCurrentSlot).toBe(3)
    expect(world().cubes).toEqual([AIMED_CUBE])
  })

  it('the left button breaks the block', async () => {
    const canvas = await renderCube()

    clickCenter(canvas, LEFT)

    await vi.waitFor(() => expect(world().cubes).toEqual([]))
  })

  it('the right button places a block from the current slot', async () => {
    const canvas = await renderCube()

    clickCenter(canvas, RIGHT)

    await vi.waitFor(() => expect(world().cubes).toHaveLength(2))
    expect(world().cubes[1].textureId).toBe(4)
  })
})
