import { getBlockDisplayName } from '@/lib/blocks'
import { useWorldStore } from '@/store/useWorldStore'

export function BlockName() {
  const slot = useWorldStore((state) => state.hotBarCurrentSlot)
  const blockId = useWorldStore((state) => state.slots[state.hotBarCurrentSlot])
  const name = blockId ? getBlockDisplayName(blockId) : ''
  if (!name) return null

  // La `key` monta un elemento nuevo en cada cambio, y eso reinicia el fade sin
  // timers ni estado local.
  return (
    <span
      key={`${slot}-${blockId}`}
      className='pointer-events-none absolute bottom-30 left-1/2 z-10 -translate-x-1/2 animate-delay-1500 animate-fade-out font-bold text-3xl text-white [text-shadow:2px_2px_black]'
    >
      {name}
    </span>
  )
}
