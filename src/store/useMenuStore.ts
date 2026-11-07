import { create } from 'zustand/react'

export interface IHudNotification {
  id: number
  message: string
}

export interface IMenuStore {
  mainMenu: boolean
  pauseMenu: boolean
  textureMenu: boolean
  notification: IHudNotification | null
  setMainMenu: (value: boolean) => void
  setPauseMenu: (value: boolean) => void
  setTextureMenu: (value: boolean) => void
  notify: (message: string) => void
}

export const useMenuStore = create<IMenuStore>()((set) => ({
  mainMenu: true,
  pauseMenu: false,
  textureMenu: false,
  // Un solo mensaje a la vez: uno nuevo reemplaza al anterior. `HudNotification`
  // usa el `id` como `key` para reiniciar la animación. Vive aquí y no en
  // `useWorldStore` para que guardar no notifique a los cubos.
  notification: null,
  setMainMenu: (value) => {
    // Se limpia: al volver a entrar al mundo `HudNotification` se monta de nuevo,
    // y si no repetiría el último aviso.
    set(() => ({
      mainMenu: value,
      notification: null,
    }))
  },
  setPauseMenu: (value) => {
    set(() => ({
      pauseMenu: value,
    }))
  },
  setTextureMenu: (value) => {
    set(() => ({
      textureMenu: value,
    }))
  },
  notify: (message) => {
    set((state) => ({
      notification: { id: (state.notification?.id ?? 0) + 1, message },
    }))
  },
}))
