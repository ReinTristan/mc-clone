import { Physics } from '@react-three/cannon'
import { Sky, Stats } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Fvp } from '@/components/Player/FVP'
import { Player } from '@/components/Player/Player'
import { CrossHair } from '@/components/UI/HUD/CrossHair'
import { Cubes } from '@/components/World/Cubes'
import { Ground } from '@/components/World/Ground'
import { useMenuStore } from '@/store/useMenuStore'

export function GameScene() {
  const { mainMenu, pauseMenu } = useMenuStore((state) => state)
  return (
    <>
      <Canvas>
        <Sky sunPosition={[100, 100, 20]} />
        {!mainMenu && (
          <>
            <ambientLight intensity={1} />
            <Fvp />
            <Physics>
              <Ground />
              <Player />
              <Cubes />
            </Physics>
          </>
        )}
        {/* Solo en dev y dentro del mundo: en el menú no mide nada útil, y el
            build de producción lo elimina entero. */}
        {import.meta.env.DEV && !mainMenu && <Stats />}
      </Canvas>
      {!mainMenu && !pauseMenu && <CrossHair />}
    </>
  )
}
