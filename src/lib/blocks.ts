import { blocks } from '@/data/blocks'

/** Nombre de un bloque para la UI: `stone_bricks` → `Stone Bricks`. */
export function getBlockDisplayName(id: number): string {
  const block = blocks.find((def) => def.id === id)
  if (!block) return ''
  return block.name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
