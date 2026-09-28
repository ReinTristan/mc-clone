import { describe, expect, it } from 'vitest'
import { ISO_ICON_SIZE, renderIsoIcon } from '@/lib/textures/iso'
import { renderSprite, SPRITE_SIZE } from '@/lib/textures/render'

/** Cara uniforme de 16×16 de un solo color. */
const solidFace = (color: string) =>
  renderSprite({
    palette: { a: color },
    rows: Array(SPRITE_SIZE).fill('a'.repeat(SPRITE_SIZE)),
  })

/** Lee el RGBA del píxel (x, y) de un canvas ya pintado. */
const pixelAt = (canvas: HTMLCanvasElement, x: number, y: number) => {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('no 2d context')
  const [r, g, b, a] = ctx.getImageData(x, y, 1, 1).data
  return { r, g, b, a }
}

// Centro de cada rombo del hexágono de 64×64.
const TOP = [32, 16] as const
const LEFT = [16, 40] as const
const RIGHT = [48, 40] as const

describe('renderIsoIcon', () => {
  it('produces a square canvas of ISO_ICON_SIZE', () => {
    const white = solidFace('#ffffff')
    const canvas = renderIsoIcon({ top: white, left: white, right: white })
    expect(canvas.width).toBe(ISO_ICON_SIZE)
    expect(canvas.height).toBe(ISO_ICON_SIZE)
  })

  it('AC-0.4.3-1 · draws the three visible faces, each lateral shaded differently', () => {
    const white = solidFace('#ffffff')
    const canvas = renderIsoIcon({ top: white, left: white, right: white })
    const top = pixelAt(canvas, ...TOP)
    const left = pixelAt(canvas, ...LEFT)
    const right = pixelAt(canvas, ...RIGHT)

    for (const pixel of [top, left, right]) expect(pixel.a).toBe(255)
    expect(left.r).not.toBe(right.r)
    expect(top.r).toBeGreaterThan(left.r)
    expect(top.r).toBeGreaterThan(right.r)
  })

  it('AC-0.4.3-1 · places each face in its own region', () => {
    const canvas = renderIsoIcon({
      top: solidFace('#ff0000'),
      left: solidFace('#00ff00'),
      right: solidFace('#0000ff'),
    })
    const top = pixelAt(canvas, ...TOP)
    const left = pixelAt(canvas, ...LEFT)
    const right = pixelAt(canvas, ...RIGHT)

    expect(top.r).toBeGreaterThan(Math.max(top.g, top.b))
    expect(left.g).toBeGreaterThan(Math.max(left.r, left.b))
    expect(right.b).toBeGreaterThan(Math.max(right.r, right.g))
  })

  it('AC-0.4.3-2 · leaves the corners outside the hexagon transparent', () => {
    const white = solidFace('#ffffff')
    const canvas = renderIsoIcon({ top: white, left: white, right: white })
    const last = ISO_ICON_SIZE - 1
    const outside = [
      [0, 0],
      [last, 0],
      [0, last],
      [last, last],
      // justo fuera de la arista superior izquierda del rombo de arriba
      [4, 4],
    ] as const

    for (const [x, y] of outside) expect(pixelAt(canvas, x, y).a).toBe(0)
  })

  it('leaves the input faces untouched', () => {
    const white = solidFace('#ffffff')
    renderIsoIcon({ top: white, left: white, right: white })
    expect(pixelAt(white, 0, 0)).toEqual({ r: 255, g: 255, b: 255, a: 255 })
  })
})
