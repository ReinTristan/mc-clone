/**
 * Tests de `check.ts` con el runner nativo de Node (`pnpm spec:test`).
 *
 * Cada caso monta un repo de mentira en un directorio temporal —
 * `specs/versions/`, `test/` y una **copia** de `check.ts` en
 * `scripts/spec/`— y lo ejecuta como proceso aparte. Como el script saca su
 * raíz de `import.meta.dirname`, la copia mira el fixture y no el repo real:
 * se prueba el script tal cual, con su `process.exit` y su `argv` de verdad.
 *
 * Las versiones de fixture son `9.x.x` para que salte a la vista que son de
 * mentira. Viven fuera de `test/`, así que `spec:check` nunca las lee como
 * citas.
 */

import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { after, describe, it } from 'node:test'

const CHECKER = join(import.meta.dirname, 'check.ts')
const dirs: string[] = []

after(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true })
})

interface Fixture {
  /** versión → contenido de su `tasks.md`; `null` crea la carpeta sin él. */
  tasks?: Record<string, string | null>
  /** ruta dentro de `test/` → contenido del test. */
  tests?: Record<string, string>
}

const write = (path: string, content: string) => {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
}

const fixture = ({ tasks = {}, tests = {} }: Fixture) => {
  const root = mkdtempSync(join(tmpdir(), 'spec-check-'))
  dirs.push(root)

  const script = join(root, 'scripts/spec/check.ts')
  mkdirSync(dirname(script), { recursive: true })
  copyFileSync(CHECKER, script)

  for (const [version, content] of Object.entries(tasks)) {
    const folder = join(root, 'specs/versions', version)
    mkdirSync(folder, { recursive: true })
    if (content !== null) write(join(folder, 'tasks.md'), content)
  }
  for (const [path, content] of Object.entries(tests)) {
    write(join(root, 'test', path), content)
  }

  return script
}

// biome-ignore lint/suspicious/noControlCharactersInRegex: son los códigos ANSI del script
const ANSI = /\x1b\[\d+m/g

/**
 * Corre la copia del checker. El entorno se construye a mano para que un
 * `SPEC_VERSION` exportado en la shell no se cuele en los casos que no lo
 * piden.
 */
const run = (
  script: string,
  { args = [], specVersion }: { args?: string[]; specVersion?: string } = {}
) => {
  const env: NodeJS.ProcessEnv = { PATH: process.env.PATH }
  if (specVersion !== undefined) env.SPEC_VERSION = specVersion

  const result = spawnSync(process.execPath, [script, ...args], {
    env,
    encoding: 'utf8',
  })
  return {
    status: result.status,
    output: `${result.stdout}${result.stderr}`.replace(ANSI, ''),
  }
}

const criterion = (id: string, target = '🧪 `test/a.test.ts`', done = false) =>
  `- [${done ? 'x' : ' '}] \`${id}\` Something observable → ${target}\n`

const citing = (id: string) => `it('${id} · does something', () => {})\n`

describe('spec:check — a clean repo', () => {
  it('exits 0 when every ticked criterion has a test citing it', () => {
    const script = fixture({
      tasks: {
        '9.0.0':
          criterion('AC-9.0.0-1', undefined, true) +
          criterion('AC-9.0.0-2', '🖐️ QA manual'),
      },
      tests: { 'a.test.ts': citing('AC-9.0.0-1') },
    })

    const { status, output } = run(script, { specVersion: '9.0.0' })

    assert.equal(status, 0, output)
    assert.match(output, /trazabilidad íntegra/)
  })

  it('does not fail on an unticked criterion whose test does not exist yet', () => {
    const script = fixture({
      tasks: { '9.0.0': criterion('AC-9.0.0-1', '🧪 `test/missing.test.ts`') },
    })

    const { status, output } = run(script, { specVersion: '9.0.0' })

    assert.equal(status, 0, output)
  })

  it('skips the screenshot folders vitest leaves after a failed run', () => {
    const script = fixture({
      tasks: { '9.0.0': criterion('AC-9.0.0-1', undefined, true) },
      tests: {
        'deep/a.test.ts': citing('AC-9.0.0-1'),
        'deep/__screenshots__/a.test.ts/shot.png': '',
      },
    })

    const { status, output } = run(script, { specVersion: '9.0.0' })

    assert.equal(status, 0, output)
  })
})

describe('spec:check — the six failures', () => {
  it('fails on a duplicated ID', () => {
    const script = fixture({
      tasks: {
        '9.0.0':
          criterion('AC-9.0.0-1', '🖐️ QA manual') +
          criterion('AC-9.0.0-1', '🖐️ QA manual'),
      },
    })

    const { status, output } = run(script, { specVersion: '9.0.0' })

    assert.equal(status, 1, output)
    assert.match(output, /ID duplicado AC-9\.0\.0-1/)
  })

  it('fails on an ID living in a folder of another version', () => {
    const script = fixture({
      tasks: {
        '9.0.0': criterion('AC-9.0.0-1', '🖐️ QA manual'),
        '9.1.0': criterion('AC-9.0.0-2', '🖐️ QA manual'),
      },
    })

    const { status, output } = run(script, { specVersion: '9.0.0' })

    assert.equal(status, 1, output)
    assert.match(output, /AC-9\.0\.0-2 vive en la carpeta 9\.1\.0/)
  })

  it('fails on a criterion with no target', () => {
    const script = fixture({
      tasks: { '9.0.0': '- [ ] `AC-9.0.0-1` Something with no target\n' },
    })

    const { status, output } = run(script, { specVersion: '9.0.0' })

    assert.equal(status, 1, output)
    assert.match(output, /AC-9\.0\.0-1 no declara destino/)
  })

  it('fails on a ticked criterion that no test cites', () => {
    const script = fixture({
      tasks: { '9.0.0': criterion('AC-9.0.0-1', undefined, true) },
    })

    const { status, output } = run(script, { specVersion: '9.0.0' })

    assert.equal(status, 1, output)
    assert.match(output, /AC-9\.0\.0-1 está tildado pero ningún test cita/)
  })

  it('fails on a test citing an ID that does not exist', () => {
    const script = fixture({
      tasks: { '9.0.0': criterion('AC-9.0.0-1', '🖐️ QA manual') },
      tests: { 'deep/b.test.tsx': citing('AC-9.0.0-7') },
    })

    const { status, output } = run(script, { specVersion: '9.0.0' })

    assert.equal(status, 1, output)
    assert.match(output, /AC-9\.0\.0-7 lo citan test\/deep\/b\.test\.tsx/)
  })

  it('fails when the version in progress has no folder', () => {
    const script = fixture({
      tasks: { '9.0.0': criterion('AC-9.0.0-1', '🖐️ QA manual') },
    })

    const { status, output } = run(script, { specVersion: '9.5.0' })

    assert.equal(status, 1, output)
    assert.match(
      output,
      /versión en curso 9\.5\.0 \(SPEC_VERSION\) no tiene carpeta/
    )
  })
})

describe('spec:check — resolving the version in progress', () => {
  // Dos versiones con algo pendiente: el heurístico elegiría la primera, así
  // que elegir la segunda solo puede venir del argumento o de SPEC_VERSION.
  const twoVersions = () =>
    fixture({
      tasks: {
        '9.0.0': criterion('AC-9.0.0-1', '🖐️ QA manual'),
        '9.1.0': criterion('AC-9.1.0-1', '🖐️ QA manual'),
        '9.2.0': criterion('AC-9.2.0-1', '🖐️ QA manual'),
      },
    })

  it('takes the CLI argument over SPEC_VERSION', () => {
    const { status, output } = run(twoVersions(), {
      args: ['9.2.0'],
      specVersion: '9.1.0',
    })

    assert.equal(status, 0, output)
    assert.match(output, /▶ En curso: 9\.2\.0 — .* — vía argumento/)
  })

  it('takes SPEC_VERSION when there is no argument', () => {
    const { status, output } = run(twoVersions(), { specVersion: '9.1.0' })

    assert.equal(status, 0, output)
    assert.match(output, /▶ En curso: 9\.1\.0 — .* — vía SPEC_VERSION/)
  })

  it('falls back to the first version with something open', () => {
    const { status, output } = run(twoVersions())

    assert.equal(status, 0, output)
    assert.match(
      output,
      /▶ En curso: 9\.0\.0 — .* — sin SPEC_VERSION, deducida/
    )
  })
})
