import { CanvasTexture } from 'three'
import { beforeAll, describe, expect, it } from 'vitest'
import { FALLBACK_BLOCK_ID } from '@/data/blocks'
import { ISO_ICON_SIZE } from '@/lib/textures/iso'
import {
  createGroundTexture,
  getBlockTextures,
  initialBlockIds,
  loadAllTextures,
} from '@/lib/textures/registry'
import { SPRITE_SIZE } from '@/lib/textures/render'

const DIRT_ID = 1
const GRASS_ID = 2

/** Lee el RGBA del píxel (x, y) del canvas que respalda una CanvasTexture. */
const texturePixel = (texture: CanvasTexture, x: number, y: number) => {
  const canvas = texture.image as HTMLCanvasElement
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('no 2d context')
  const [r, g, b, a] = ctx.getImageData(x, y, 1, 1).data
  return { r, g, b, a }
}

beforeAll(async () => {
  await loadAllTextures()
})

describe('loadAllTextures', () => {
  // El comentario largo de registry.ts sostiene que `use()` necesita **la misma
  // instancia** de promesa en cada render; devolver una nueva suspende en bucle
  // infinito. Nada lo protegía hasta ahora.
  it('memoizes the promise object, not just the result', () => {
    expect(loadAllTextures()).toBe(loadAllTextures())
  })
})

describe('getBlockTextures', () => {
  it('gives the 6 faces of a block', () => {
    const { faces } = getBlockTextures(GRASS_ID)
    expect(Object.keys(faces).sort()).toEqual([
      'back',
      'bottom',
      'front',
      'left',
      'right',
      'top',
    ])
  })

  it('falls back to the fallback block on an unknown id, without throwing', () => {
    expect(getBlockTextures(9999)).toBe(getBlockTextures(FALLBACK_BLOCK_ID))
  })

  it('AC-0.4.3-12 · exposes a runtime-generated PNG data: iconUrl', () => {
    const { iconUrl } = getBlockTextures(DIRT_ID)
    expect(iconUrl.startsWith('data:image/png;base64,')).toBe(true)
    expect(iconUrl.length).toBeGreaterThan(100)
  })

  // Los únicos PNG del repo son los del sitio (`public/`, `docs/`), nunca los
  // del juego: todo lo que pinta el runtime sale de `sprites.ts`.
  it('AC-0.4.3-12 · ships no image files under src/', () => {
    const images = import.meta.glob('/src/**/*.{png,jpg,jpeg,webp,gif}')
    expect(Object.keys(images)).toEqual([])
  })

  // La mitad automática de AC-0.4.3-11: el icono es el cubo iso de 64×64 con
  // las esquinas transparentes, no la cara superior plana de 16×16.
  it('renders the iconUrl as the isometric cube, not the flat top face', async () => {
    const image = new Image()
    image.src = getBlockTextures(GRASS_ID).iconUrl
    await image.decode()
    expect(image.naturalWidth).toBe(ISO_ICON_SIZE)
    expect(image.naturalHeight).toBe(ISO_ICON_SIZE)

    const canvas = document.createElement('canvas')
    canvas.width = ISO_ICON_SIZE
    canvas.height = ISO_ICON_SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('no 2d context')
    ctx.drawImage(image, 0, 0)
    expect(ctx.getImageData(0, 0, 1, 1).data[3]).toBe(0)
    expect(ctx.getImageData(32, 16, 1, 1).data[3]).toBe(255)
  })

  it('marks glass as transparent and everything else as standard', () => {
    expect(getBlockTextures(7).type).toBe('transparent')
    expect(getBlockTextures(DIRT_ID).type).toBe('standard')
  })
})

describe('grass block composition', () => {
  /**
   * El test de **O4**: el overlay del pasto estuvo declarado en los datos y
   * silenciosamente sin dibujar hasta 0.4.0, y solo se descubrió mirando el
   * juego. `grass_block_side_overlay` es opaco en las filas de arriba y todo
   * '.' de la fila 7 hacia abajo, así que la cara lateral tiene que ser verde
   * arriba y tierra abajo. Si el overlay deja de componerse, la fila 0 se
   * vuelve marrón y esto cae.
   */
  it('has a green top and a dirt bottom on the side face', () => {
    const side = getBlockTextures(GRASS_ID).faces.front as CanvasTexture

    const top = texturePixel(side, 0, 0)
    expect(top.g).toBeGreaterThan(top.r)
    expect(top.g).toBeGreaterThan(top.b)

    const bottom = texturePixel(side, 0, 10)
    expect(bottom.r).toBeGreaterThan(bottom.g)
    expect(bottom.g).toBeGreaterThan(bottom.b)
  })

  it('keeps the bottom face pure dirt, with no green', () => {
    const bottom = getBlockTextures(GRASS_ID).faces.bottom as CanvasTexture
    const px = texturePixel(bottom, 0, 0)
    expect(px.r).toBeGreaterThan(px.g)
  })

  it('tints the top face green', () => {
    const top = getBlockTextures(GRASS_ID).faces.top as CanvasTexture
    const px = texturePixel(top, 0, 0)
    expect(px.g).toBeGreaterThan(px.r)
  })
})

describe('face cache', () => {
  it('shares one Texture instance between faces with the same FaceSpec', () => {
    const { faces } = getBlockTextures(GRASS_ID)
    // los 4 lados del césped salen todos de `faces.all`
    expect(faces.left).toBe(faces.right)
    expect(faces.front).toBe(faces.right)
    expect(faces.back).toBe(faces.right)
  })

  it('does not share faces built from different specs', () => {
    const { faces } = getBlockTextures(GRASS_ID)
    expect(faces.top).not.toBe(faces.bottom)
    expect(faces.top).not.toBe(faces.front)
  })

  it('shares a texture between different blocks with the same sprite', () => {
    // la cara inferior del césped es `dirt` a secas, igual que todo el bloque 1
    expect(getBlockTextures(GRASS_ID).faces.bottom).toBe(
      getBlockTextures(DIRT_ID).faces.top
    )
  })
})

describe('createGroundTexture', () => {
  /**
   * El invariante explícito de registry.ts: el suelo aplica RepeatWrapping ×100
   * y el bloque de césped no. Si compartieran `Source`, configurar uno
   * reconfiguraría al otro.
   */
  it('does not share a Source with the grass top face', () => {
    const ground = createGroundTexture()
    const grassTop = getBlockTextures(GRASS_ID).faces.top

    expect(ground).not.toBe(grassTop)
    expect(ground.source).not.toBe(grassTop.source)
  })

  it('draws the same image as the grass top, despite not sharing it', () => {
    const ground = createGroundTexture()
    const grassTop = getBlockTextures(GRASS_ID).faces.top as CanvasTexture
    expect(texturePixel(ground, 3, 3)).toEqual(texturePixel(grassTop, 3, 3))
  })

  it('returns a 16x16 canvas', () => {
    const canvas = createGroundTexture().image as HTMLCanvasElement
    expect(canvas.width).toBe(SPRITE_SIZE)
    expect(canvas.height).toBe(SPRITE_SIZE)
  })
})

describe('initialBlockIds', () => {
  // Los ids son el contrato con los mundos ya guardados: ICube.textureId se
  // serializa en localStorage. Renumerar rompe los guardados existentes.
  it('are the 9 frozen ids, in order', () => {
    expect(initialBlockIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })
})
