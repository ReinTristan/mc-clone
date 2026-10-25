import { useEffect } from 'react'
import { getBlockTextures, initialBlockIds } from '@/lib/textures/registry'
import { useWorldStore } from '@/store/useWorldStore'
export const HotBar = () => {
  const { slots, setSlots, hotBarCurrentSlot } = useWorldStore((state) => state)
  const slotsPositions = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  useEffect(() => {
    setSlots([...initialBlockIds])
  }, [setSlots])

  return (
    <div className='absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 border-2 border-black bg-black/50 shadow-md'>
      {slotsPositions.map((pos) => (
        <div
          key={pos}
          className={`relative flex size-16 items-center justify-center border-4 border-neutral-500 bg-transparent`}
        >
          <span className='absolute -top-1 right-0.5 z-10 text-lg text-white'>
            {pos}
          </span>
          <div className='size-4/5 object-contain'>
            {slots[pos - 1] && (
              <img
                src={getBlockTextures(slots[pos - 1]).iconUrl}
                alt={`slot${pos}`}
                className='size-full [image-rendering:pixelated]'
              />
            )}
          </div>
          {pos === hotBarCurrentSlot + 1 && (
            <div className='absolute inset-0 border-2 border-white' />
          )}
        </div>
      ))}
    </div>
  )
}
