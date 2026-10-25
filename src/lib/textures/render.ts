import chroma from 'chroma-js'
import { CanvasTexture, NearestFilter, SRGBColorSpace } from 'three'
import { FaceSpec, SpriteDef } from '@/types/textures'

export const SPRITE_SIZE = 16
const TRANSPARENT_CHAR = '.'

export function createCanvas(size = SPRITE_SIZE) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get 2d context for sprite rendering')
  }
  return { canvas, ctx }
}

export function renderSprite(def: SpriteDef, name = 'sprite') {
  if (def.rows.length !== SPRITE_SIZE) {
    throw new Error(
      `Sprite "${name}" must have ${SPRITE_SIZE} rows, got ${def.rows.length}`
    )
  }
  const { canvas, ctx } = createCanvas()
  const image = ctx.createImageData(SPRITE_SIZE, SPRITE_SIZE)
  def.rows.forEach((row, y) => {
    if (row.length !== SPRITE_SIZE) {
      throw new Error(
        `Sprite "${name}" row ${y} must have ${SPRITE_SIZE} chars, got ${row.length}`
      )
    }
    for (let x = 0; x < SPRITE_SIZE; x++) {
      const char = row[x]
      if (char === TRANSPARENT_CHAR) continue
      const color = def.palette[char]
      if (!color) {
        throw new Error(`Sprite "${name}" uses char "${char}" not in palette`)
      }
      const [r, g, b, a] = chroma(color).rgba()
      const i = (y * SPRITE_SIZE + x) * 4
      image.data[i] = r
      image.data[i + 1] = g
      image.data[i + 2] = b
      image.data[i + 3] = Math.round(a * 255)
    }
  })
  ctx.putImageData(image, 0, 0)
  return canvas
}

export function tintCanvas(source: HTMLCanvasElement, tint: string) {
  const [tintR, tintG, tintB] = chroma(tint).rgb()
  const { canvas, ctx } = createCanvas()
  ctx.drawImage(source, 0, 0)
  const image = ctx.getImageData(0, 0, SPRITE_SIZE, SPRITE_SIZE)
  for (let i = 0; i < image.data.length; i += 4) {
    image.data[i] = (image.data[i] * tintR) / 255
    image.data[i + 1] = (image.data[i + 1] * tintG) / 255
    image.data[i + 2] = (image.data[i + 2] * tintB) / 255
  }
  ctx.putImageData(image, 0, 0)
  return canvas
}

export function composeFace(
  spec: FaceSpec,
  sprites: Record<string, SpriteDef>
) {
  const getSprite = (textureName: string) => {
    const sprite = sprites[textureName]
    if (!sprite) {
      throw new Error(`Sprite "${textureName}" not found`)
    }
    return renderSprite(sprite, textureName)
  }

  let base = getSprite(spec.texture)
  if (spec.tint) {
    base = tintCanvas(base, spec.tint)
  }
  if (spec.overlays) {
    const ctx = base.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get 2d context for overlay composition')
    }
    for (const overlay of spec.overlays) {
      let overlayCanvas = getSprite(overlay.texture)
      if (overlay.tint) {
        overlayCanvas = tintCanvas(overlayCanvas, overlay.tint)
      }
      ctx.drawImage(overlayCanvas, 0, 0)
    }
  }
  return base
}

export function createFaceTexture(canvas: HTMLCanvasElement) {
  const texture = new CanvasTexture(canvas)
  texture.minFilter = NearestFilter
  texture.magFilter = NearestFilter
  texture.generateMipmaps = false
  texture.colorSpace = SRGBColorSpace
  return texture
}
