import { afterEach, beforeEach } from 'vitest'
// Todo desde `/pure`, que es el único subpath que exporta `configure`. Mezclarlo
// con el entry por defecto arriesga dos instancias del módulo, y entonces el
// `reactStrictMode` de abajo se aplicaría a una config que nadie lee.
import { cleanup, configure } from 'vitest-browser-react/pure'
import { useMenuStore } from '@/store/useMenuStore'
import { readTotalWorlds, useWorldStore } from '@/store/useWorldStore'

/**
 * La app real se monta dentro de `<StrictMode>` (`main.tsx`), así que los tests
 * también: es donde los efectos se invocan dos veces en dev y donde asoman los
 * efectos secundarios en fase de render, que es exactamente la clase de bug que
 * era O3.
 */
configure({ reactStrictMode: true })

/**
 * Los dos stores son singletons a nivel de módulo: se crean una vez por página
 * y sobreviven a todos los tests del archivo. Por eso el reset va aquí y no en
 * cada test.
 *
 * El orden importa: primero se limpia `localStorage`, y solo después se relee
 * `totalWorlds` — al revés se arrastraría el contador del test anterior.
 */
beforeEach(() => {
  localStorage.clear()
  useWorldStore.setState({
    cubes: [],
    currentWorld: null,
    totalWorlds: readTotalWorlds(),
    slots: [],
    hotBarCurrentSlot: 0,
  })
  useMenuStore.setState({
    mainMenu: true,
    pauseMenu: false,
    textureMenu: false,
    notification: null,
  })
})

afterEach(async () => {
  await cleanup()
})
