# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is pnpm (v11, Node >= 24).

```bash
pnpm dev        # vite dev server, exposed on the LAN (--host)
pnpm build      # tsc -b (typecheck app + tests + configs, noEmit) && vite build
pnpm biome      # biome check --write  — lint + format + organize imports
pnpm test       # vitest in watch mode
pnpm test:run   # vitest, single run
pnpm preview    # preview the production build
pnpm start      # serve dist/ as an SPA on $PORT
pnpm spec:check # cross specs/versions/'s acceptance criteria against the tests citing them
```

Biome (not ESLint/Prettier) is the only linter/formatter; `biome.json` is the source of truth for style — read it instead of guessing. `.vscode/settings.json` runs it on save with `source.fixAll.biome` and `source.organizeImports.biome`.

**Run `pnpm biome` after creating or editing any file.** Formatting differences are not editor diagnostics, so a misformatted file looks clean until someone saves it in VS Code and gets a whole-file diff.

`pnpm-workspace.yaml` sets `minimumReleaseAge: 1440` (packages must be 24h old before install), pinned security `overrides`, and `onlyBuiltDependencies` (pnpm blocks install scripts by default; `playwright` needs its own to resolve browsers). Keep all three in mind when adding or bumping dependencies.

## Testing

Vitest in **browser mode** (added in 0.4.2): tests run inside a real headless chromium driven by Playwright, **not** jsdom. That's deliberate — jsdom's `getContext('2d')` returns `null`, which would make the entire texture pipeline untestable. Real canvas, real WebGL, real `localStorage` come for free.

- Config lives in `vitest.config.ts`, composed onto `vite.config.ts` with `mergeConfig` so plugins and the `@/*` alias are inherited. **Don't move it into `vite.config.ts`.**
- Tests live in a root **`test/`** directory that mirrors `src/`'s categories (`test/store/`, `test/lib/textures/`, `test/components/UI/Menus/`, …), never colocated. `vitest.config.ts` pins that with `include: ['test/**/*.test.{ts,tsx}']`, so a `*.test.ts` left inside `src/` silently never runs.
- Tests import production code **only through the `@/` alias** — that's what makes the split painless, since the alias resolves to an absolute path and doesn't care where the importer lives. Don't introduce `../../src/...` imports.
- Typechecking them is `tsconfig.test.json` (its own project, `include: ["test"]`, same options as `tsconfig.app.json` plus the `@/*` paths), referenced from `tsconfig.json`. **`pnpm build` runs `tsc -b`, not `tsc`** — the root config is `"files": []` + references, so plain `tsc` checks *nothing at all* and exits 0. If you ever see that flag drop, the build has stopped typechecking.
- **Test info are written in English** — the same split as the rest of the repo, where identifiers and UI copy are English and the explanations are Spanish. `pnpm test:run` output should read entirely in English.
- `render` comes from **`vitest-browser-react/pure`** (not the default entry — only `/pure` exports `configure`, and mixing entries risks two module instances). It is **async**: `const screen = await render(<Foo />)`.
- `test/setup.ts` enables `reactStrictMode` (matching `main.tsx`) and, before each test, clears `localStorage` and resets both stores — **in that order**, since `totalWorlds` is re-read from storage.

Three rules that cost time to rediscover:

- **Don't mock the texture registry or `localStorage`.** Both are real here. `HotBar` and `GameScene` use `await loadAllTextures()` in `beforeAll` and consume the real registry.
- **The stores are module-level singletons**, created once per page and shared by every test in a file. Reset happens in the setup file, not per test.
- New dependencies used by tests must be added to `optimizeDeps.include` in `vitest.config.ts`, or Vite discovers them mid-run, pre-bundles them and **reloads the page**, killing tests that were already running. It only bites on a cold cache, which is the worst time for it.

R3F/cannon behaviour beyond "it mounts" (movement, physics, placing and breaking blocks, pointer lock) is **manual QA**, not covered by the suite.

## Spec-driven development

The plan lives in `specs/`, split by what is public and what is not:

| Path | Committed? | Language | What it is |
|---|---|---|---|
| `specs/design.md` | yes | EN | How a criterion is written — format, the six rules, `spec:check`'s contract |
| `specs/workflow.md` | yes | EN | Definition of Done, versioning convention, roles |
| `specs/roadmap.md` | yes | EN | Current version and the next one. Short horizon on purpose |
| `specs/decisions.md` | yes | EN | Decisions taken and rejected, plus the performance baseline table |
| `specs/versions/backlog.md` | **no** | ES | The O#/P#/N# registry, the full version map, hard dependency rules |
| `specs/versions/<v>/tasks.md` | **no** | ES | That version's criteria — the spec you implement against |
| `specs/versions/<v>/context.md` | **no** | ES | Its reasoning: alternatives, risks, what it depends on |

**Read `specs/design.md` and `specs/workflow.md` before planning any version.** They are the authority; this section is a pointer, not a copy. The rules that bite most often:

- **Implement against the criterion**, not against the version's prose description. The prose is allowed to age; the criterion isn't.
- **Every test cites its criterion in the test name**: `it('AC-0.5.0-6 · does not re-render on WASD', …)`. That citation is the only link between spec and suite, and it's what `pnpm spec:check` reads.
- **Targets pointing at files that don't exist yet are normal** — the criterion is written before the test. That's a pending, not an error.
- **Never renumber an ID**, and never move one to another version's folder — `spec:check` rejects both.
- **Closed versions (0.4.0–0.4.2) carry no IDs.** They predate the format. Don't retrofit them.
- **Manual QA has to be asked for, not assumed.** Before declaring any version ready, list ReinTristan the pending 🖐️ criteria and wait for them to be ticked. The QA for 0.4.1 and 0.4.2 was actually performed and never written down, and the record was lost — that's why this is step 6 of the Definition of Done.
- **Anything spanning several versions goes in `backlog.md`**, and the version's `context.md` links to it. Don't duplicate it into both.
- New durable decisions go in `specs/decisions.md` — but only what is already true of the code. It's public, so it must not leak the plan.

## Environment

`.env` (gitignored) holds two version numbers, different on purpose:

- `VITE_CURRENT_VERSION` — the **released** version, rendered by `src/components/UI/HUD/Info.tsx` on the main menu. Bump it alongside `package.json` `version` when releasing.
- `SPEC_VERSION` — the version **being implemented**, read by `pnpm spec:check` (which runs with `--env-file-if-exists=.env`). It moves when a version is opened, not when it's tagged, so during 0.4.3's development `VITE_CURRENT_VERSION` still reads `0.4.2`. A CLI argument overrides it: `pnpm spec:check 0.6.0`.

`index.html` also substitutes `%VITE_DOMAIN_URL%` into the og:url meta tag.

## Architecture

React 19 + `@react-three/fiber` / `drei` / `cannon` (Three.js), Tailwind v4 (via the Vite plugin, configured in `src/index.css` with `@theme`, not a tailwind.config), Zustand for state. `@/*` aliases `./src/*` — declared in `vite.config.ts` and in `tsconfig.app.json` / `tsconfig.test.json` / `tsconfig.json`; changing it requires editing all of them.

The app runs under `<StrictMode>`, so effects double-invoke in dev — the cannon `api.*.subscribe` calls in `Player` must keep returning their unsubscribe.

### Two stores drive everything

- `useMenuStore` — which UI layer is up (`mainMenu`, `pauseMenu`, `textureMenu`). This gates the 3D scene: `GameScene` renders the `<Canvas>` and `<Sky>` always, but only mounts `<Physics>`, `Ground`, `Player`, `Cubes`, and pointer-lock (`Fvp`) when `mainMenu` is false. `pauseMenu` also short-circuits `Player`'s `useFrame` and unmounts `PointerLockControls`.
- `useWorldStore` — the world (`cubes: ICube[]`), the current save slot, and the hotbar (`slots`, `hotBarCurrentSlot`).

Both are read as `useStore((state) => state)` throughout, i.e. components subscribe to the whole store.

### Save format

Worlds live in `localStorage`: a `totalWorlds` counter plus keys `world_1`, `world_2`, … each holding a serialized `ICube[]`. `saveWorld()` writes to `currentWorld` if set, otherwise creates `world_{totalWorlds+1}` and increments the counter. `MainMenu` enumerates worlds purely from the counter, so the counter and the `world_N` keys must stay in sync.

### Block/texture pipeline

There are **no image files**. Every texture is drawn at runtime onto a 16×16 `<canvas>` from pixel-art defined in code, so nothing here derives from Mojang assets.

- `src/types/textures.ts` — the shared vocabulary: `Face`, `FACES` (ordered `+X, -X, +Y, -Y, +Z, -Z`, i.e. `BoxGeometry`'s material-index order), `SpriteDef`, `FaceSpec`, `BlockDef`.
- `src/lib/textures/sprites.ts` — `sprites: Record<string, SpriteDef>`. Each sprite is a `palette` (char → CSS color, `'.'` reserved for transparent) plus `rows`: exactly 16 strings of exactly 16 chars.
- `src/lib/textures/render.ts` — `renderSprite` rasterizes a `SpriteDef` (validating dimensions and palette chars, throwing on violations), `composeFace` layers tint + overlays, `createFaceTexture` wraps the canvas in a `CanvasTexture` with `NearestFilter` and `SRGBColorSpace`. Uses `chroma-js` for color math.
- `src/data/blocks.ts` — `blocks`, the ordered `BlockDef[]`. Per-face specs: `faces.all` is required, any named face overrides it.
- `src/lib/textures/registry.ts` — composes everything once into a module-level `Map<number, BlockTextures>` and exposes `loadAllTextures()`, `getBlockTextures(id)`, `createGroundTexture()`, `initialBlockIds`.

Adding a block: add sprite(s) to `sprites.ts`, then an entry to `blocks.ts`. That's it.

Two invariants: **block ids are the save-format contract** (`ICube.textureId` is serialized to localStorage — never renumber), and **order matters** (`initialBlockIds` is the first 9 entries, which seeds the hotbar).

Loading is gated, not import-time: `App.tsx` wraps the tree in `<TexturesGate>`, which calls `use(loadAllTextures())` inside a `<Suspense fallback={<LoadingScreen />}>`. `loadAllTextures` memoizes the *promise object* at module level — see the long comment on it before touching that function; returning a fresh promise per call infinite-loops `use()`, and the `async` IIFE exists so a thrown `build()` memoizes its failure instead of retrying forever. `getBlockTextures` falls back to `FALLBACK_BLOCK_ID` (dirt) for unknown ids, and throws if called before the gate resolves.

Face composition is cached by `(texture, tint, overlays)`, so faces sharing a sprite share one `CanvasTexture`. `createGroundTexture()` deliberately bypasses that cache: the ground plane applies `RepeatWrapping ×100` and must not share a `Source` with the grass block.

### Input and block interaction

`useKeyboard` maps `KeyW/A/S/D`, `Space`, `Escape` to a boolean action object and `Digit1`–`Digit9` / mouse wheel directly to `setHotBarCurrentSlot`. It's called independently by `Player` and `Menus`, so each caller gets its own listener pair and its own `actions` state — the `pause` action is edge-detected in a `Menus` effect, which is why the HUD says "Double Esc to pause" (pointer lock swallows the first Escape).

Placement/removal is handled per-mesh in `Cube.tsx` and `Ground.tsx` via `onPointerDown`: `e.button === 2` (right click) places the block in `slots[hotBarCurrentSlot]`, anything else removes. `Cube` derives the neighbouring cell from `Math.floor(e.faceIndex / 2)` (12 box triangles → 6 faces) looked up in `FACE_DIRECTION_VALUES`; `Ground` uses `Math.ceil` on the intersection point. Every cube is its own `useBox` static body and rebuilds its six `MeshStandardMaterial`s on each render, which is the main scaling limit of the current design.
