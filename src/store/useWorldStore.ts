import { nanoid } from 'nanoid'
import { create } from 'zustand/react'
import { ICube, PositionType } from '@/types/cubes'

export interface IWorldStore {
  cubes: ICube[]
  currentWorld: string | null
  totalWorlds: number
  addCube: ({
    pos,
    textureId,
  }: {
    pos: PositionType
    textureId: number
  }) => void
  removeCube: (id: string) => void
  saveWorld: () => void
  resetWorld: () => void
  setWorld: (worldName?: string) => void
  slots: number[]
  setSlots: (slots: number[]) => void
  setToSlot: (slot: number, textureId: number) => void
  hotBarCurrentSlot: number
  setHotBarCurrentSlot: (slot: number) => void
  cycleHotBarSlot: (dir: number) => void
}

const HOTBAR_SIZE = 9

export const TOTAL_WORLDS_KEY = 'totalWorlds'
export const worldKey = (n: number) => `world_${n}`

const getLocalStorage = <T>(key: string): T | null => {
  const item = localStorage.getItem(key)
  if (!item) return null
  try {
    return JSON.parse(item) as T
  } catch {
    // Una clave corrupta no debe tumbar el menú principal: se trata como
    // ausente y el mundo arranca vacío.
    return null
  }
}
const setLocalStorage = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value))
}

/**
 * Lee el contador de mundos. **Solo lee**: la versión anterior escribía el cero
 * cuando la clave no existía, y encima se llamaba en pleno render de
 * `MainMenu`, donde `<StrictMode>` no garantiza que un efecto ocurra una sola
 * vez. No hace falta persistir un cero — con `?? 0` basta.
 *
 * Se exporta porque es también lo que permite resetear el store en los tests:
 * `totalWorlds` se inicializa al crear el store, y el `create` corre una única
 * vez a nivel de módulo.
 */
export const readTotalWorlds = (): number =>
  getLocalStorage<number>(TOTAL_WORLDS_KEY) ?? 0

export const useWorldStore = create<IWorldStore>()((set, get) => ({
  cubes: [],
  currentWorld: null,
  totalWorlds: readTotalWorlds(),
  hotBarCurrentSlot: 0,
  slots: [],

  addCube: ({ pos, textureId }) => {
    set((state) => ({
      cubes: [
        ...state.cubes,
        {
          id: nanoid(),
          textureId: textureId,
          pos,
        },
      ],
    }))
  },
  removeCube: (id) => {
    set((state) => ({
      cubes: state.cubes.filter((cube) => cube.id !== id),
    }))
  },

  /**
   * Escribe **fuera** de `set`. Antes el `localStorage.setItem` vivía dentro
   * del updater, que además devolvía `state` sin tocar: un updater impuro que
   * notificaba igual a todos los suscriptores, o sea un re-render global de
   * regalo cada vez que guardabas.
   *
   * Guardar un mundo nuevo también fija `currentWorld`. Sin eso, pulsar "Save
   * World" dos veces creaba `world_1` **y** `world_2`.
   */
  saveWorld: () => {
    const { cubes, currentWorld, totalWorlds } = get()
    if (currentWorld) {
      setLocalStorage<ICube[]>(currentWorld, cubes)
      return
    }
    const next = totalWorlds + 1
    const name = worldKey(next)
    setLocalStorage<ICube[]>(name, cubes)
    setLocalStorage<number>(TOTAL_WORLDS_KEY, next)
    set({ currentWorld: name, totalWorlds: next })
  },
  resetWorld: () => {
    set(() => ({
      cubes: [],
    }))
  },
  setWorld: (worldName = '') => {
    set(() => ({
      cubes: getLocalStorage<ICube[]>(worldName) ?? [],
      currentWorld: worldName || null,
    }))
  },
  setSlots: (slots) => {
    set(() => ({
      slots,
    }))
  },
  setToSlot: (slot, textureId) => {
    set((state) => ({
      slots: state.slots.map((s, i) => (i === slot ? textureId : s)),
    }))
  },
  setHotBarCurrentSlot: (slot) => {
    set(() => ({
      hotBarCurrentSlot: slot,
    }))
  },
  cycleHotBarSlot: (dir) => {
    set((state) => ({
      hotBarCurrentSlot:
        (state.hotBarCurrentSlot + dir + HOTBAR_SIZE) % HOTBAR_SIZE,
    }))
  },
}))
