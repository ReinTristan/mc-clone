import { type ReactNode, Suspense, use } from 'react'
import { GameScene } from '@/components/GameScene'
import { Info } from '@/components/UI/HUD/Info'
import { LoadingScreen } from '@/components/UI/LoadingScreen'
import { Menus } from '@/components/UI/Menus/Menus'
import { loadAllTextures } from '@/lib/textures/registry'
import { useMenuStore } from '@/store/useMenuStore'

/**
 * Suspende hasta que el registry haya compuesto todas las texturas. Nada se
 * carga en import-time: montar la escena antes de esto dejaría a Cube, Ground
 * y HotBar leyendo un registry vacío.
 */
function TexturesGate({ children }: { children: ReactNode }) {
  use(loadAllTextures())
  return children
}

function App() {
  const { mainMenu } = useMenuStore((state) => state)

  return (
    <Suspense fallback={<LoadingScreen />}>
      <TexturesGate>
        <main className='fixed h-full w-full select-none font-mc'>
          <GameScene />
          <Menus />
          {mainMenu && <Info />}
        </main>
      </TexturesGate>
    </Suspense>
  )
}

export default App
