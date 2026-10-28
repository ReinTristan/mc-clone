import type { BlockDef } from '@/types/textures'

// Verde propio del césped. Se multiplica sobre los sprites en grises al componer
// la textura, igual que Minecraft tinta su pasto en gris por bioma. El día que
// haya varios verdes serán varios valores de esta constante, no varios sprites.
const GRASS_TINT = '#6d9e46'

// Los ids son el contrato con los mundos ya guardados: ICube.textureId se
// serializa en localStorage. NO renumerar. El orden también importa: la hotbar
// arranca con los 9 primeros.
export const blocks = [
  {
    id: 1,
    name: 'dirt',
    faces: { all: { texture: 'dirt' } },
    type: 'standard',
  },
  {
    id: 2,
    name: 'grass',
    faces: {
      // los 4 lados: base tierra + franja de pasto tintada encima
      all: {
        texture: 'grass_block_side',
        overlays: [{ texture: 'grass_block_side_overlay', tint: GRASS_TINT }],
      },
      top: { texture: 'grass_block_top', tint: GRASS_TINT },
      bottom: { texture: 'dirt' },
    },
    type: 'standard',
  },
  {
    id: 3,
    name: 'cobblestone',
    faces: { all: { texture: 'cobblestone' } },
    type: 'standard',
  },
  {
    id: 4,
    name: 'stone',
    faces: { all: { texture: 'stone' } },
    type: 'standard',
  },
  {
    id: 5,
    name: 'oak_log',
    faces: {
      all: { texture: 'oak_log' },
      top: { texture: 'oak_log_top' },
      bottom: { texture: 'oak_log_top' },
    },
    type: 'standard',
  },
  {
    id: 6,
    name: 'oak_planks',
    faces: { all: { texture: 'oak_planks' } },
    type: 'standard',
  },
  {
    id: 7,
    name: 'glass',
    faces: { all: { texture: 'glass' } },
    type: 'transparent',
  },
  {
    id: 8,
    // el JSON viejo tenía el typo "stone_bicks" en el name (sin efecto funcional)
    name: 'stone_bricks',
    faces: { all: { texture: 'stone_bricks' } },
    type: 'standard',
  },
  {
    id: 9,
    name: 'bricks',
    faces: { all: { texture: 'bricks' } },
    type: 'standard',
  },
] satisfies BlockDef[]

// Bloque al que caen los ids desconocidos (saves con bloques ya eliminados).
export const FALLBACK_BLOCK_ID = 1
