/**
 * `pnpm spec:check` — cruza los criterios de aceptación de `specs/versions/`
 * con los tests que los citan.
 *
 * El contrato está escrito en `specs/design.md`: cada criterio es
 * `AC-<versión>-<n>` y declara su destino, 🧪 con ruta de test o 🖐️ QA manual;
 * el test cita el ID en su nombre. Este script es lo que impide que esa
 * convención se erosione en silencio.
 *
 * La versión en curso sale de `SPEC_VERSION` (`.env`), o del primer argumento
 * si se pasa uno. Por defecto imprime solo lo accionable: errores, esa versión
 * al detalle y un resumen del resto. Con `--all` lo lista todo.
 *
 * Corre en Node a pelo (type stripping nativo, Node >= 24): cero deps.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '../..')
const SPECS_DIR = join(ROOT, 'specs/versions')
const TEST_DIR = join(ROOT, 'test')

const VERBOSE = process.argv.includes('--all')

type Target =
  | { kind: 'test'; path: string }
  | { kind: 'manual' }
  | { kind: 'none' }

interface Entry {
  id: string
  type: 'AC' | 'D'
  /** La versión de la carpeta en la que vive el criterio. */
  version: string
  /** La versión que lleva el propio ID. Debería coincidir con la de arriba. */
  idVersion: string
  /** Bajo qué `## preview-N` cayó, si la versión los usa. */
  preview: string | null
  done: boolean
  retired: boolean
  text: string
  target: Target
  file: string
  line: number
}

const VERSION = /^\d+\.\d+\.\d+$/
const ID_LINE =
  /^\s*-\s+\[( |x)\]\s+(~~)?`(AC|D)-(\d+\.\d+\.\d+)-(\d+)`\s*(.*)$/
const ID_ANYWHERE = /\b(?:AC|D)-\d+\.\d+\.\d+-\d+\b/g
const PREVIEW_HEADING = /^\s*##\s+(preview-.*?)\s*$/i
const TEST_TARGET = /🧪\s*`([^`]+)`/
const MANUAL_TARGET = /🖐/
const FENCE = /^\s*```/

const c = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
}

/** Compara `0.4.3` con `0.10.0` por número, no por texto. */
const compareVersions = (a: string, b: string) => {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

const truncate = (text: string, max = 88) =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text

const parseTarget = (rest: string): Target => {
  const test = rest.match(TEST_TARGET)
  if (test) return { kind: 'test', path: test[1] }
  if (MANUAL_TARGET.test(rest)) return { kind: 'manual' }
  return { kind: 'none' }
}

/**
 * Las carpetas de `specs/versions/` con nombre de versión, ordenadas. Una
 * carpeta sin `tasks.md` es normal: las versiones cerradas antes de que
 * existieran los IDs (0.4.0, 0.4.1) solo llevan `context.md`.
 */
const discoverVersions = () => {
  if (!existsSync(SPECS_DIR)) return []

  return readdirSync(SPECS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && VERSION.test(entry.name))
    .map((entry) => entry.name)
    .sort(compareVersions)
}

const tasksFile = (version: string) => join(SPECS_DIR, version, 'tasks.md')

const parseTasks = (version: string): Entry[] => {
  const path = tasksFile(version)
  if (!existsSync(path)) return []

  const entries: Entry[] = []
  let insideFence = false
  let preview: string | null = null

  readFileSync(path, 'utf8')
    .split('\n')
    .forEach((raw, i) => {
      // Los ejemplos de formato viven en bloques de código y no son criterios.
      if (FENCE.test(raw)) {
        insideFence = !insideFence
        return
      }
      if (insideFence) return

      const heading = raw.match(PREVIEW_HEADING)
      if (heading) {
        preview = heading[1]
        return
      }

      const match = raw.match(ID_LINE)
      if (!match) return

      const [, checkbox, strike, type, idVersion, index, rest] = match
      entries.push({
        id: `${type}-${idVersion}-${index}`,
        type: type as 'AC' | 'D',
        version,
        idVersion,
        preview,
        done: checkbox === 'x',
        retired: Boolean(strike),
        text: rest
          .replace(/→.*$/, '')
          .replace(/~~/g, '')
          .replace(/\*\*/g, '')
          .trim(),
        target: parseTarget(rest),
        file: relative(ROOT, path),
        line: i + 1,
      })
    })

  return entries
}

/** IDs citados en los tests → los archivos que los citan. */
const parseTests = (): Map<string, string[]> => {
  const cited = new Map<string, string[]>()
  if (!existsSync(TEST_DIR)) return cited

  const files = readdirSync(TEST_DIR, { recursive: true, encoding: 'utf8' })
    .filter((file) => /\.test\.tsx?$/.test(file))
    .map((file) => join(TEST_DIR, file))

  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    for (const id of source.match(ID_ANYWHERE) ?? []) {
      const where = cited.get(id) ?? []
      where.push(relative(ROOT, file))
      cited.set(id, where)
    }
  }

  return cited
}

const byVersion = (entries: Entry[]) => {
  const groups = new Map<string, Entry[]>()
  for (const entry of entries) {
    const group = groups.get(entry.version) ?? []
    group.push(entry)
    groups.set(entry.version, group)
  }
  return [...groups.entries()].sort((a, b) => compareVersions(a[0], b[0]))
}

const where = (entry: Entry) => `${entry.file}:${entry.line}`

const icon = (entry: Entry) => {
  if (entry.type === 'D') return '🤔'
  return entry.target.kind === 'manual' ? '🖐️ ' : '🧪'
}

const targetPath = (entry: Entry) =>
  entry.target.kind === 'test' ? entry.target.path : ''

const line = (entry: Entry, note = '') =>
  `    ${entry.done ? c.green('✔') : '☐'} ${icon(entry)} ${c.bold(entry.id)}  ` +
  `${truncate(entry.text)}${note ? c.dim(`  ${note}`) : ''}`

/**
 * De dónde sale la versión en curso, por orden de precedencia. El heurístico
 * final —la primera versión con algo sin cerrar— es el comportamiento viejo,
 * y solo actúa si nadie ha dicho nada.
 */
const resolveCurrent = (pending: Entry[]) => {
  const arg = process.argv.slice(2).find((value) => VERSION.test(value))
  if (arg) return { version: arg, source: 'argumento' }

  const env = process.env.SPEC_VERSION?.trim()
  if (env) return { version: env, source: 'SPEC_VERSION' }

  const [first] = byVersion(pending).map(([version]) => version)
  return first
    ? { version: first, source: 'heurístico' }
    : { version: '', source: 'heurístico' }
}

const main = () => {
  const versions = discoverVersions()
  const entries = versions.flatMap(parseTasks)
  const cited = parseTests()
  const errors: string[] = []

  const live = entries.filter((entry) => !entry.retired)
  const criteria = live.filter((entry) => entry.type === 'AC')
  const decisions = live.filter((entry) => entry.type === 'D')

  // Un ID es una dirección: si dos criterios comparten uno, la trazabilidad
  // deja de significar nada.
  const seen = new Map<string, Entry>()
  for (const entry of entries) {
    const previous = seen.get(entry.id)
    if (previous) {
      errors.push(
        `ID duplicado ${c.bold(entry.id)} — ${where(previous)} y ${where(entry)}`
      )
    }
    seen.set(entry.id, entry)
  }

  // Un criterio en la carpeta equivocada suele ser un ID renumerado a mano,
  // que es justo lo que la regla 5 prohíbe.
  for (const entry of entries) {
    if (entry.idVersion !== entry.version) {
      errors.push(
        `${c.bold(entry.id)} vive en la carpeta ${c.blue(entry.version)} — ${where(entry)}`
      )
    }
  }

  const untested: Entry[] = []
  for (const entry of criteria) {
    if (entry.target.kind === 'none') {
      errors.push(
        `${c.bold(entry.id)} no declara destino (🧪 o 🖐️) — ${where(entry)}`
      )
      continue
    }
    if (entry.target.kind !== 'test') continue

    if (!cited.has(entry.id)) {
      // Tildado sin test es trazabilidad rota; sin tildar es lo normal en SDD:
      // el criterio se escribe antes que el test.
      if (entry.done) {
        errors.push(
          `${c.bold(entry.id)} está tildado pero ningún test cita su ID — ${where(entry)}`
        )
      } else {
        untested.push(entry)
      }
    }
  }

  // Un test que cita un ID inexistente es un criterio borrado o renumerado.
  const known = new Set(entries.map((entry) => entry.id))
  for (const [id, files] of cited) {
    if (!known.has(id)) {
      errors.push(
        `${c.bold(id)} lo citan ${files.join(', ')} pero no existe en specs/versions/`
      )
    }
  }

  const pending = criteria.filter((entry) => !entry.done)
  const manualPending = pending.filter(
    (entry) => entry.target.kind === 'manual'
  )
  const openDecisions = decisions.filter((entry) => !entry.done)

  const current = resolveCurrent([...pending, ...openDecisions])
  if (current.version && !versions.includes(current.version)) {
    errors.push(
      `la versión en curso ${c.bold(current.version)} (${current.source}) no tiene carpeta en specs/versions/`
    )
  } else if (current.version && !existsSync(tasksFile(current.version))) {
    errors.push(
      `la versión en curso ${c.bold(current.version)} (${current.source}) no tiene tasks.md`
    )
  }

  console.log(c.bold('\nspec:check — specs/versions/ ↔ test/\n'))

  if (errors.length > 0) {
    console.log(c.red(c.bold(`✖ ${errors.length} error(es)`)))
    for (const error of errors) console.log(`  ${c.red('•')} ${error}`)
    console.log('')
  }

  const group = live.filter((entry) => entry.version === current.version)

  if (group.length > 0) {
    const closed = group.filter((entry) => entry.done).length
    const origin =
      current.source === 'heurístico'
        ? c.yellow(' — sin SPEC_VERSION, deducida')
        : c.dim(` — vía ${current.source}`)

    console.log(
      c.bold(`▶ En curso: ${current.version}`) +
        c.dim(` — ${closed}/${group.length} cerrados`) +
        origin
    )

    const note = (entry: Entry) =>
      entry.target.kind === 'test' && !cited.has(entry.id)
        ? `sin test · ${entry.target.path}`
        : ''

    // Las decisiones y los criterios sueltos van arriba; los previews, si la
    // versión los usa, se listan con su propio avance.
    const previews = new Map<string | null, Entry[]>()
    for (const entry of group) {
      const bucket = previews.get(entry.preview) ?? []
      bucket.push(entry)
      previews.set(entry.preview, bucket)
    }

    for (const [preview, bucket] of previews) {
      if (preview !== null) {
        const done = bucket.filter((entry) => entry.done).length
        console.log(
          `  ${c.blue(preview)}${c.dim(`  ${done}/${bucket.length}`)}`
        )
      }
      for (const entry of bucket) console.log(line(entry, note(entry)))
    }
    console.log('')
  }

  // Este bloque existe porque la QA de 0.4.1 y 0.4.2 se hizo y no se
  // documentó: se imprime siempre, aunque no haya nada que decir.
  console.log(c.bold('🖐️  QA manual pendiente'))
  if (manualPending.length === 0) {
    console.log(`  ${c.green('nada pendiente')}`)
  } else if (VERBOSE) {
    for (const [version, bucket] of byVersion(manualPending)) {
      console.log(`  ${c.blue(version)}`)
      for (const entry of bucket) console.log(line(entry))
    }
  } else {
    const counts = byVersion(manualPending)
      .map(([version, bucket]) => `${c.blue(version)} ${bucket.length}`)
      .join(c.dim(' · '))
    console.log(`  ${counts}`)
    console.log(c.dim('  (--all para verlos uno a uno)'))
  }
  console.log('')

  if (VERBOSE && untested.length > 0) {
    console.log(c.bold('🧪 Criterios sin test todavía'))
    for (const [version, bucket] of byVersion(untested)) {
      console.log(`  ${c.blue(version)}`)
      for (const entry of bucket) console.log(line(entry, targetPath(entry)))
    }
    console.log('')
  }

  if (VERBOSE && openDecisions.length > 0) {
    console.log(c.bold('🤔 Decisiones sin tomar'))
    for (const [version, bucket] of byVersion(openDecisions)) {
      console.log(`  ${c.blue(version)}`)
      for (const entry of bucket) console.log(line(entry))
    }
    console.log('')
  }

  const done = criteria.length - pending.length
  const covered = criteria.filter(
    (entry) => entry.target.kind === 'test' && cited.has(entry.id)
  ).length
  const withTasks = versions.filter((version) =>
    existsSync(tasksFile(version))
  ).length

  console.log(
    c.dim(
      `${criteria.length} criterios en ${withTasks} versiones · ` +
        `${done} tildados · ${covered} con test · ` +
        `${manualPending.length} 🖐️ pendientes · ` +
        `${openDecisions.length} decisiones abiertas`
    )
  )
  console.log(
    errors.length === 0
      ? c.green('✔ trazabilidad íntegra\n')
      : c.red('✖ trazabilidad rota\n')
  )

  process.exit(errors.length > 0 ? 1 : 0)
}

main()
