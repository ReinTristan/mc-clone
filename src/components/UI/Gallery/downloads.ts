import { blocks } from '@/data/blocks'
import { getBlockTextures } from '@/lib/textures/registry'
import { createCanvas } from '@/lib/textures/render'

// Los dos PNG que el sitio necesita como archivo, no como `data:`: el og:image
// (`public/og-image.png`) y el contact sheet del README
// (`docs/contact-sheet.png`). Salen del `iconUrl` del registry, o sea del mismo
// módulo iso que la hotbar y el favicon. Hay que volver a descargarlos cuando
// cambien los sprites.

const OG_IMAGE_SIZE = 512

const SHEET_COLUMNS = 3
const SHEET_CELL = 176
const SHEET_ICON = 128
const SHEET_PADDING = 16
const SHEET_BACKGROUND = '#171717'
const SHEET_TEXT = '#e5e5e5'
const SHEET_FONT = '20px "Pixelify Sans Variable"'

function loadImage(url: string) {
  const image = new Image()
  image.src = url
  return image.decode().then(() => image)
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}

/** El cubo iso de césped a 512×512, agrandado sin suavizar. */
export async function downloadIcon() {
  const grass = blocks.find((block) => block.name === 'grass')
  if (!grass) throw new Error('No hay un bloque "grass" en blocks.ts')

  const icon = await loadImage(getBlockTextures(grass.id).iconUrl)
  const { canvas, ctx } = createCanvas(OG_IMAGE_SIZE)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(icon, 0, 0, OG_IMAGE_SIZE, OG_IMAGE_SIZE)
  downloadCanvas(canvas, 'og-image.png')
}

/**
 * Todos los bloques en una rejilla de 3 columnas: el icono iso al doble y su
 * nombre debajo. Fondo oscuro sólido para que se lea igual en el tema claro y
 * en el oscuro de GitHub.
 */
export async function downloadContactSheet() {
  await document.fonts.load(SHEET_FONT)
  const icons = await Promise.all(
    blocks.map((block) => loadImage(getBlockTextures(block.id).iconUrl))
  )

  const rows = Math.ceil(blocks.length / SHEET_COLUMNS)
  const canvas = document.createElement('canvas')
  canvas.width = SHEET_COLUMNS * SHEET_CELL + SHEET_PADDING * 2
  canvas.height = rows * SHEET_CELL + SHEET_PADDING * 2
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get 2d context for the contact sheet')

  ctx.fillStyle = SHEET_BACKGROUND
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.imageSmoothingEnabled = false
  ctx.font = SHEET_FONT
  ctx.fillStyle = SHEET_TEXT
  ctx.textAlign = 'center'

  blocks.forEach((block, i) => {
    const x = SHEET_PADDING + (i % SHEET_COLUMNS) * SHEET_CELL
    const y = SHEET_PADDING + Math.floor(i / SHEET_COLUMNS) * SHEET_CELL
    const iconX = x + (SHEET_CELL - SHEET_ICON) / 2
    ctx.drawImage(icons[i], iconX, y + 8, SHEET_ICON, SHEET_ICON)
    ctx.fillText(block.name, x + SHEET_CELL / 2, y + SHEET_CELL - 16)
  })

  downloadCanvas(canvas, 'contact-sheet.png')
}
