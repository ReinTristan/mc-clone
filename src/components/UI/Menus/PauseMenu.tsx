import { useMenuStore } from '@/store/useMenuStore'
import { useWorldStore } from '@/store/useWorldStore'

export const PauseMenu = () => {
  const { saveWorld, resetWorld } = useWorldStore((state) => state)
  const { setMainMenu, setPauseMenu, notify } = useMenuStore((state) => state)

  const handleSave = () => {
    try {
      saveWorld()
    } catch (error) {
      // Normalmente `localStorage` lleno. La pausa sigue abierta: el mundo no se
      // guardó, y el jugador no debería volver al juego creyendo que sí.
      console.error(error)
      notify('Could not save world')
      return
    }
    notify('World saved')
    setPauseMenu(false)
  }

  return (
    <div className='absolute top-1/4 left-1/2 flex -translate-x-1/2 -translate-y-1/4 flex-col gap-4 rounded-lg'>
      <button
        className='bg-neutral-400 p-4 font-bold text-5xl hover:bg-neutral-500'
        onClick={() => {
          setPauseMenu(false)
        }}
      >
        Resume
      </button>
      <button
        className='bg-neutral-400 p-4 font-bold text-5xl hover:bg-neutral-500'
        onClick={handleSave}
      >
        Save World
      </button>
      <button
        className='bg-neutral-400 p-4 font-bold text-5xl hover:bg-neutral-500'
        onClick={() => {
          resetWorld()
          setPauseMenu(false)
        }}
      >
        Reset World
      </button>
      <button
        className='bg-neutral-400 p-4 font-bold text-5xl hover:bg-neutral-500'
        onClick={() => {
          setPauseMenu(false)
          setMainMenu(true)
          resetWorld()
        }}
      >
        Exit World
      </button>
    </div>
  )
}
