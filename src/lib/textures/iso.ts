import { createCanvas, tintCanvas } from '@/lib/textures/render'
import type { IsoFaces } from '@/types/textures'

export const ISO_ICON_SIZE = 64

// Sombreado por cara: luz desde arriba a la izquierda, como los iconos de
// inventario de Minecraft. Se multiplica con `tintCanvas`, así que conserva el
// alpha del sprite (el cristal sigue siendo cristal).
const LEFT_SHADE = '#cccccc' // 80%
const RIGHT_SHADE = '#999999' // 60%

/**
 * Proyección isométrica (dimétrica 2:1) de un bloque sobre un canvas de
 * 64×64. Recibe las tres caras visibles ya compuestas (lo que devuelve
 * `composeFace`); qué cara del bloque va a cada lado lo decide quien llama.
 *
 * Cada texel avanza 2px por eje iso, así que el cubo ocupa el hexágono
 * (32,0)(64,16)(64,48)(32,64)(0,48)(0,16) y las cuatro esquinas quedan
 * transparentes.
 */
export function renderIsoIcon(faces: IsoFaces) {
  const { canvas, ctx } = createCanvas(ISO_ICON_SIZE)
  ctx.imageSmoothingEnabled = false

  // arriba: rombo (0,16)(32,0)(64,16)(32,32)
  ctx.setTransform(2, -1, 2, 1, 0, 16)
  ctx.drawImage(faces.top, 0, 0)

  // izquierda: (0,16)(32,32)(32,64)(0,48)
  ctx.setTransform(2, 1, 0, 2, 0, 16)
  ctx.drawImage(tintCanvas(faces.left, LEFT_SHADE), 0, 0)

  // derecha: (32,32)(64,16)(64,48)(32,64)
  ctx.setTransform(2, -1, 0, 2, 32, 32)
  ctx.drawImage(tintCanvas(faces.right, RIGHT_SHADE), 0, 0)

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  return canvas
}
