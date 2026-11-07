import { Physics } from '@react-three/cannon'
import { Canvas } from '@react-three/fiber'
import { Profiler } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react/pure'
import { Player } from '@/components/Player/Player'

const settle = () => new Promise((resolve) => setTimeout(resolve, 300))

const Scene = ({ onRender }: { onRender: () => void }) => (
  <div style={{ width: 800, height: 600 }}>
    <Canvas>
      <Physics>
        <Profiler id='player' onRender={onRender}>
          <Player />
        </Profiler>
      </Physics>
    </Canvas>
  </div>
)

describe('Player', () => {
  it('AC-0.5.0-6 · does not re-render on WASD', async () => {
    const onRender = vi.fn()
    const screen = await render(<Scene onRender={onRender} />)
    await vi.waitFor(() => expect(onRender).toHaveBeenCalled())
    await settle()
    onRender.mockClear()

    for (const code of ['KeyW', 'KeyA', 'KeyS', 'KeyD']) {
      window.dispatchEvent(new KeyboardEvent('keydown', { code }))
      window.dispatchEvent(new KeyboardEvent('keyup', { code }))
    }
    await settle()
    expect(onRender).not.toHaveBeenCalled()

    // control: un render de verdad sí lo ve, así que el silencio de arriba
    // significa algo
    await screen.rerender(<Scene onRender={onRender} />)
    await vi.waitFor(() => expect(onRender).toHaveBeenCalled())
  })
})
