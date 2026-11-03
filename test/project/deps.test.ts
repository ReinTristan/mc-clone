import { describe, expect, it } from 'vitest'

/**
 * `package.json` se lee con `import.meta.glob` y no con un `import` directo:
 * así Vite lo resuelve desde la raíz del proyecto y `tsc` no tiene que saber
 * importar JSON ni resolver una ruta absoluta.
 */
interface PackageJson {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}

const [pkg] = Object.values(
  import.meta.glob<PackageJson>('/package.json', {
    eager: true,
    import: 'default',
  })
)

describe('package.json', () => {
  it('AC-0.4.4-1 · ua-parser-js and its types are not dependencies', () => {
    for (const name of ['ua-parser-js', '@types/ua-parser-js']) {
      expect(pkg.dependencies).not.toHaveProperty(name)
      expect(pkg.devDependencies).not.toHaveProperty(name)
    }
  })

  it('AC-0.4.4-2 · @types/three is a devDependency', () => {
    expect(pkg.devDependencies).toHaveProperty('@types/three')
    expect(pkg.dependencies).not.toHaveProperty('@types/three')
  })
})
