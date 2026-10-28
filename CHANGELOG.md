# Changelog

All notable changes to MC-Clone, newest first.

> **On the older entries:** versions from 0.4.0 onward are written as they ship. Everything before that was reconstructed from the commit history. Entries marked **†** were never bumped or tagged at the time — their number was assigned retroactively so the history reads in order, and their date is when the work landed rather than when it was released.
>
> **[Project and tooling](#project-and-tooling)**, at the end of this file, collects changes that don't affect the game and don't belong to any version.

---

## 0.4.4 — 2026-10-28 — Cleanup

Housekeeping before the next big step. One thing you'll notice: the frame-rate panel in the corner is gone.

**Removed**
- The performance panel no longer shows up on the main menu, and it never reaches the game you play — it only exists in the dev server, once you're in a world.
- Two libraries the game stopped using a long time ago.

**Project**
- The tool that checks every planned feature against its tests now has tests of its own, and they already caught a bug: it crashed after any failed test run.
- 93 tests in the game suite, up from 88, plus 12 for the checker.

---

## 0.4.3 — 2026-10-25 — Isometric icons

The hotbar finally shows blocks instead of squares.

**Added**
- Hotbar icons are small 3D cubes — the top and two sides, each side shaded differently — instead of the flat top face. They're drawn from the same pixel art as the blocks in the world, when the game starts, so an icon can never drift from its block.
- The browser tab has its own icon: a grass block, drawn by the game itself once textures load. It replaces Vite's placeholder logo.
- Sharing a link to the game now shows a grass block in the preview, instead of Vite's logo.
- The README shows all nine blocks.
- A texture gallery for reviewing the art. It only exists in the dev server (`pnpm dev`) and never reaches the game you play: every block with its sprites and its six faces, each one tiled 3×3 so a pattern that breaks at the seam shows up at a glance. It's also where the social preview and the README image are downloaded from.
- 88 tests, up from 69.

**Changed**
- Hotbar icons are bigger and pixel-sharp instead of blurred, and the slot numbers are larger and easier to read.

---

## 0.4.2 — 2026-08-14

Groundwork. Mostly invisible from the outside, except for one save bug that wasn't.

**Fixed**
- Saving a brand-new world twice created **two** worlds instead of overwriting the first one. Hitting "Save World" a second time now updates the world you already saved.

**Added**
- The project has tests. They run in a real headless browser rather than a simulated DOM, which matters here: every texture is drawn onto a canvas at runtime, and a simulated DOM has no canvas to draw on. So the texture engine is now covered for real — including a pixel-level check that grass keeps its green top edge over a dirt side, the exact thing that was silently broken before 0.4.0.
- 69 tests covering the texture engine, both stores, the menus and the hotbar, plus a check that the 3D scene mounts.

**Changed**
- Saving a world no longer forces the whole scene to re-render.
- The main menu no longer writes to storage while drawing itself.

---

## 0.4.1 — 2026-08-12

Naming, licensing and structure.

**Added**
- `LICENSE.md` (MIT). It covers the code **and** the block artwork, since every texture is pixel art written in TypeScript rather than an image file.
- A License section in the README explaining exactly that.

**Changed**
- The project is now called **MC-Clone** — in the menu, the page title, the social preview tags, `package.json` and the README. Minecraft is still mentioned, but only as a description of what the project is inspired by.
- New font: [Pixelify Sans](https://fontsource.org/fonts/pixelify-sans) (Open Font License), replacing the previous pixel font. Bold weights are now real weights instead of a synthetic thickening.
- The Zustand stores moved to `src/store/`, so `src/hooks/` finally contains only hooks.

**Fixed**
- Removed a leftover debug log that fired on every mouse-wheel scroll.

---

## 0.4.0 — 2026-08-11 — Runtime texture engine

The biggest change since the project started: **there are no image files anymore.**

**Added**
- Every block texture is original pixel art declared in TypeScript — a color palette plus a 16×16 grid of characters — drawn onto a canvas when the game starts. Nothing in the repo derives from Mojang's artwork.
- Tints and overlays are declarative. Grass gets its green from a tint over a grayscale sprite, and its side face layers a real overlay on top of dirt.
- A loading screen while textures are generated.
- Adding a new block is now two edits: draw a sprite, add an entry to the block list.

**Changed**
- Textures load asynchronously instead of blocking at import time.
- All 12 sprites were redrawn after a visual review — stone, cobblestone, planks and the log top were reworked because they read as the wrong material at a glance.
- Glass no longer dims what's behind it. It's still see-through; it just doesn't tint the view.

**Removed**
- Every Mojang-derived image, including the old favicon and the block metadata JSON files they fed.
- Dead files and unused imports left over from the old texture system.

**Fixed**
- The grass side overlay, which had been declared in the data but silently never rendered.
- The ground plane reconfiguring its texture on every render.
- A typo in a block name (`stone_bicks`).

Shipped in four preview tags, `v0.4.0-preview-0` through `-3`.

---

## 0.3.3 — 2026-08-07

Dependency and correctness pass before starting the texture work.

- Upgraded to Vite 8 and TypeScript 7, with the migrations their breaking changes required.
- Set a minimum Node version and sorted out the deployment configuration.
- Fixed memory leaks: the player's physics subscriptions now clean themselves up.
- Removed the browser-detection warning and a batch of unused helpers.
- Switched to releasing from a `dev` branch with proper version numbers.

---

## 0.3.2 † — 2026-02-18

Tooling.

- Moved from npm to pnpm.
- Replaced ESLint + Prettier with [Biome](https://biomejs.dev/) as the single linter and formatter, then applied it across the whole codebase.
- Several rounds of dependency and security updates, mostly React advisories.

---

## 0.3.1 † — 2025-05-19

Blocks stopped being one texture on all six sides.

- Blocks can define a different texture per face, which is what logs and grass need.
- Block metadata moved into a data file instead of living hardcoded in components.
- More blocks: stone, cobblestone, planks, bricks, stone bricks, oak log.
- Texture selection and the hotbar reworked around the new data.
- An info panel on the main menu.
- Fixed textures failing to load in production builds.

---

## 0.3.0 † — 2025-05-12

Styling and layout.

- Styling migrated to Tailwind CSS; the hand-written stylesheet is gone.
- The hotbar was rebuilt — and it finally works in Firefox.
- Components reorganized into UI / World / Player folders.

---

## 0.2.3 † — 2025-05-03

- Dependency refresh after a year away from the project.
- Removed unused PointerLockControls options.

---

## 0.2.2 — 2024-03-02

- Reverted a movement experiment that tied the walking direction to where the camera was pointing; looking up or down no longer changes where you go.
- The game loop stops while the pause menu is open.
- A warning for browsers the game doesn't support.

---

## 0.2.1 — 2024-02-24

- Social preview: Open Graph meta tags and an icon, so shared links render properly.

---

## 0.2.0 — 2024-02-24

Menus and persistence.

- Main menu and pause menu.
- Multiple worlds, saved to and loaded from the browser's local storage.
- A pixel font for the interface.
- Bedrock block.

---

## 0.1.1 — 2024-02-22

- A static server so the built game can actually be deployed.
- Build fixes.

---

## 0.1.0 — 2024-02-22

First playable version — the voxel sandbox from the [freeCodeCamp](https://github.com/danba340/minecraft-freecodecamp) / [Midudev](https://github.com/midudev/minecraft-clone) tutorial, rewritten in TypeScript.

- Pointer-lock camera, WASD movement and jumping, with physics.
- Place and break blocks.
- A texture selector and five block types.
- An infinite-looking ground plane.

---

## Project and tooling

Changes to how the project is built and planned. Nothing here affects the game, and none of it belongs to a version — these land whenever they land, newest first.

### 2026-10-25 — pnpm 12 and a Node security floor

- `package.json` — Node now requires `>= 24.22.1`, after a recent Node CVE, and the project moved from pnpm 11 to pnpm 12.15.
- `pnpm-lock.yaml` — regenerated. Since pnpm 12 the lockfile also records pnpm's own version, so the first deploy after the bump failed: the lockfile still came from pnpm 11, and the deploy installs with `--frozen-lockfile`.
- `specs/workflow.md` — the Definition of Done gains a step: `pnpm install --frozen-lockfile` has to pass, and any change to `package.json` ships with its regenerated lockfile in the same commit.

### 2026-09-27 — Roadmap revised

A full pass over the plan through 1.0.0. The order of the themes didn't change, but most of them gained steps, and one version was rethought from scratch.

- `specs/roadmap.md` — 0.4.3 is no longer a Node script that writes PNGs. Everything happens in the browser: isometric icons for the hotbar, a favicon generated from the same code, and a texture gallery that only exists in the dev server. A short cleanup version, 0.4.4, now sits before 0.5.x. Water and a day-night cycle left the "later" list, because they now have a version.
- `specs/workflow.md`, `specs/design.md` — the Definition of Done adds `pnpm spec:test`, the spec checker's own tests. They run with Node's native test runner instead of vitest, and live outside `test/` so their example IDs are never read as real citations. The script itself arrives with 0.4.4.

### 2026-08-16 — Planning moved to `specs/`

The plan used to live in one large local file that mixed four different things: how a spec is written, how a version is closed, what was decided and why, and what is left to do. It is now split by what each part actually is — the method is committed, the plan itself is not.

- `specs/design.md` — how an acceptance criterion is written, and what the checker rejects.
- `specs/workflow.md` — the Definition of Done and the versioning convention.
- `specs/roadmap.md` — what is being built now and next.
- `specs/decisions.md` — why the code is the way it is, including the options that were rejected and the performance baseline table.
- `pnpm spec:check` cross-references the acceptance criteria against the tests citing them, and reads the version in progress from `SPEC_VERSION`.
