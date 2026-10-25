import { lazy, Suspense, useEffect } from 'react'
import { MainMenu } from '@/components/UI/Menus/MainMenu'
import { PauseMenu } from '@/components/UI/Menus/PauseMenu'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useMenuStore } from '@/store/useMenuStore'
import { HotBar } from '../HUD/HotBar'

// La galería de texturas es una herramienta de dev. En el build de producción
// Vite reemplaza `import.meta.env.DEV` por `false`, la rama muere y el
// `import()` no se emite: ni su código ni sus helpers llegan a `dist/`.
const Gallery = import.meta.env.DEV
  ? lazy(() =>
      import('@/components/UI/Gallery/Gallery').then((m) => ({
        default: m.Gallery,
      }))
    )
  : null

export function Menus() {
  const { mainMenu, pauseMenu, textureMenu, setPauseMenu } = useMenuStore(
    (state) => state
  )
  const { pause } = useKeyboard()
  useEffect(() => {
    if (pause) {
      setPauseMenu(!pauseMenu)
    }
  }, [pause, setPauseMenu])

  return (
    <>
      {!mainMenu && (
        <>
          <span className='absolute top-8 left-8 font-bold text-5xl'>
            Double Esc to pause
          </span>
          <HotBar />
          {pauseMenu && <PauseMenu />}
        </>
      )}
      {/* Suspense propio: el de App cambiaría todo el árbol por la pantalla de
          carga mientras llega el chunk, y desmontaría el canvas. */}
      {mainMenu &&
        (textureMenu && Gallery ? (
          <Suspense fallback={null}>
            <Gallery />
          </Suspense>
        ) : (
          <MainMenu />
        ))}
    </>
  )
}
