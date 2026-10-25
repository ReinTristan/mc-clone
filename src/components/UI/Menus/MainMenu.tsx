import { useState } from 'react'
import { useMenuStore } from '@/store/useMenuStore'
import { useWorldStore, worldKey } from '@/store/useWorldStore'

export const MainMenu = () => {
  const setWorld = useWorldStore((state) => state.setWorld)
  const totalWorlds = useWorldStore((state) => state.totalWorlds)
  const setMainMenu = useMenuStore((state) => state.setMainMenu)
  const setTextureMenu = useMenuStore((state) => state.setTextureMenu)
  const [worldSelection, setWorldSelection] = useState(false)
  return (
    <>
      <div className='absolute top-1/4 left-1/2 z-10 flex w-fit -translate-x-1/2 -translate-y-1/4 flex-col'>
        <h1 className='text-center text-8xl'>MC-Clone</h1>
        <div className='mt-4 flex flex-col gap-4'>
          {!worldSelection && (
            <>
              <button
                className='cursor-pointer bg-neutral-400 p-4 font-bold text-5xl hover:bg-neutral-500'
                onClick={() => {
                  setWorld()
                  setMainMenu(false)
                }}
              >
                New World
              </button>
              <button
                className='cursor-pointer bg-neutral-400 p-4 font-bold text-5xl hover:bg-neutral-500 disabled:cursor-default disabled:bg-neutral-500'
                disabled={totalWorlds <= 0}
                onClick={() => setWorldSelection(true)}
              >
                Load World
              </button>
              {import.meta.env.DEV && (
                <button
                  className='cursor-pointer bg-neutral-400 p-4 font-bold text-5xl hover:bg-neutral-500'
                  onClick={() => setTextureMenu(true)}
                >
                  Texture Gallery
                </button>
              )}
            </>
          )}

          {worldSelection && (
            <>
              {Array(totalWorlds)
                .fill(0)
                .map((_, index) => (
                  <button
                    className='cursor-pointer bg-neutral-400 p-4 font-bold text-5xl hover:bg-neutral-500 disabled:cursor-default disabled:bg-neutral-500'
                    key={worldKey(index + 1)}
                    onClick={() => {
                      setWorld(worldKey(index + 1))
                      setMainMenu(false)
                    }}
                  >
                    World {index + 1}
                  </button>
                ))}
              <button
                className='cursor-pointer bg-neutral-400 p-4 font-bold text-5xl hover:bg-neutral-500 disabled:cursor-default disabled:bg-neutral-500'
                onClick={() => setWorldSelection(false)}
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
