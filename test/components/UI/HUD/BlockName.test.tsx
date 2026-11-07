import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react/pure'
import { BlockName } from '@/components/UI/HUD/BlockName'
import { initialBlockIds } from '@/lib/textures/registry'
import { useWorldStore } from '@/store/useWorldStore'
// `test/setup.ts` no carga estilos, y sin ellos no hay animación que comprobar.
import '@/index.css'

const world = () => useWorldStore.getState()

describe('BlockName', () => {
  it('AC-0.4.5-6 · shows the block name when the slot changes', async () => {
    world().setSlots([...initialBlockIds])
    const screen = await render(<BlockName />)
    await expect.element(screen.getByText('Dirt')).toBeVisible()

    world().setHotBarCurrentSlot(2)

    await expect.element(screen.getByText('Cobblestone')).toBeVisible()
    expect(screen.getByText('Dirt').elements()).toHaveLength(0)
  })

  it('AC-0.4.5-7 · reads the name in title case', async () => {
    world().setSlots([...initialBlockIds])
    world().setHotBarCurrentSlot(7)

    const screen = await render(<BlockName />)

    await expect.element(screen.getByText('Stone Bricks')).toBeVisible()
  })

  it('AC-0.4.5-8 · is no longer visible once the animation ends', async () => {
    world().setSlots([...initialBlockIds])
    const screen = await render(<BlockName />)
    const name = screen.getByText('Dirt')
    await expect.element(name).toBeVisible()

    const animations = name.element().getAnimations()
    // control: sin animación real este test no comprobaría nada
    expect(animations).toHaveLength(1)
    for (const animation of animations) animation.finish()

    expect(getComputedStyle(name.element()).opacity).toBe('0')
  })

  it('AC-0.4.5-9 · shows nothing on a slot without a block', async () => {
    const screen = await render(<BlockName />)

    expect(screen.container.textContent).toBe('')
  })
})
