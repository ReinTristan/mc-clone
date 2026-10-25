export type Face = 'top' | 'bottom' | 'left' | 'right' | 'front' | 'back'

export const FACES: Face[] = ['right', 'left', 'top', 'bottom', 'front', 'back']

export interface SpriteDef {
  // char → color CSS/hex (chroma lo parsea, '#rrggbbaa' incluido).
  // '.' está reservado para píxel transparente y no puede estar en la paleta.
  palette: Record<string, string>
  // 16 strings de 16 chars; cada char debe existir en la paleta o ser '.'
  rows: string[]
}

export interface OverlaySpec {
  texture: string
  tint?: string
}

export interface FaceSpec {
  texture: string
  // multiplica el sprite por canal preservando alpha (se hornea en la textura)
  tint?: string
  overlays?: OverlaySpec[]
}

// Las tres caras visibles del cubo iso, ya compuestas (lo que devuelve
// `composeFace`). Qué cara del bloque va a cada lado lo decide quien las arma.
export interface IsoFaces {
  top: HTMLCanvasElement
  left: HTMLCanvasElement
  right: HTMLCanvasElement
}

export interface BlockDef {
  id: number
  name: string
  // 'all' cubre las 6 caras; una clave por cara la pisa
  faces: { all: FaceSpec } & Partial<Record<Face, FaceSpec>>
  type: 'standard' | 'transparent'
  opacity?: number
}
