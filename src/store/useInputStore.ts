import { create } from 'zustand/react'
import { useMenuStore } from '@/store/useMenuStore'
import { useWorldStore } from '@/store/useWorldStore'

const MOVEMENT_KEYS = {
  KeyW: 'moveForward',
  KeyS: 'moveBackward',
  KeyA: 'moveLeft',
  KeyD: 'moveRight',
  Space: 'jump',
} as const

type MovementAction = (typeof MOVEMENT_KEYS)[keyof typeof MOVEMENT_KEYS]

const DIGIT_KEY = /^Digit([1-9])$/

// Girar la rueda hacia arriba (`deltaY < 0`) avanza de slot. Es el único sitio
// que decide el sentido: 0.5.4 lo convierte en un ajuste del jugador.
const WHEEL_SLOT_DIRECTION = -1

const NO_MOVEMENT: Record<MovementAction, boolean> = {
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
  jump: false,
}

export interface IInputStore extends Record<MovementAction, boolean> {
  reset: () => void
}

/**
 * Quien lo consume cada frame lo lee con `getState()`, sin suscribirse: pulsar
 * una tecla no debe re-renderizar nada.
 */
export const useInputStore = create<IInputStore>()((set) => ({
  ...NO_MOVEMENT,
  reset: () => {
    set(NO_MOVEMENT)
  },
}))

const isPlaying = () => {
  const { mainMenu, pauseMenu } = useMenuStore.getState()
  return !mainMenu && !pauseMenu
}

const togglePause = () => {
  const { mainMenu, pauseMenu, setPauseMenu } = useMenuStore.getState()
  // Sin esto, Esc en el menú principal dejaba la pausa abierta para cuando
  // entraras al mundo.
  if (mainMenu) return
  // Se limpia al abrir: el jugador no debe seguir andando al volver si el
  // `keyup` se pierde mientras la pausa está arriba.
  if (!pauseMenu) useInputStore.getState().reset()
  setPauseMenu(!pauseMenu)
}

const handleKeyDown = (e: KeyboardEvent) => {
  const action = MOVEMENT_KEYS[e.code as keyof typeof MOVEMENT_KEYS]
  if (action) {
    useInputStore.setState({ [action]: true })
    return
  }
  // Mantener Esc pulsado es una sola pulsación, no un parpadeo de la pausa.
  if (e.code === 'Escape') {
    if (!e.repeat) togglePause()
    return
  }
  const digit = DIGIT_KEY.exec(e.code)
  if (digit && isPlaying()) {
    useWorldStore.getState().setHotBarCurrentSlot(Number(digit[1]) - 1)
  }
}

const handleKeyUp = (e: KeyboardEvent) => {
  const action = MOVEMENT_KEYS[e.code as keyof typeof MOVEMENT_KEYS]
  if (action) useInputStore.setState({ [action]: false })
}

const handleWheel = (e: WheelEvent) => {
  // `deltaY === 0` es scroll horizontal: no pide cambiar de slot.
  if (e.deltaY === 0 || !isPlaying()) return
  useWorldStore
    .getState()
    .cycleHotBarSlot(Math.sign(e.deltaY) * WHEEL_SLOT_DIRECTION)
}

// Al cambiar de ventana con una tecla pulsada, su `keyup` nunca llega.
const handleBlur = () => {
  useInputStore.getState().reset()
}

let consumers = 0

/**
 * Registra los listeners del input con el primer consumidor y los quita con el
 * último, así da igual cuántos componentes lo usen. Devuelve la limpieza, lista
 * para un `useEffect`; contar consumidores es también lo que aguanta el doble
 * efecto de `<StrictMode>`.
 */
export const attachInput = () => {
  consumers += 1
  if (consumers === 1) {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('blur', handleBlur)
  }
  return () => {
    consumers -= 1
    if (consumers > 0) return
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    window.removeEventListener('wheel', handleWheel)
    window.removeEventListener('blur', handleBlur)
    useInputStore.getState().reset()
  }
}
