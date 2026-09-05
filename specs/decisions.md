# Decisions

Why the code is the way it is. Each entry is a decision that has already been taken and that binds what comes next — including the options that were rejected, which are usually the more useful half.

This is not a changelog. [CHANGELOG.md](../CHANGELOG.md) says what changed for players; this file says what was decided and what not to revisit.

---

## Textures and art

### There are no image files

Every texture is drawn at runtime onto a 16×16 canvas from pixel art declared in TypeScript — a palette mapping characters to colors, plus a 16×16 grid of those characters. Nothing in the repo derives from Mojang's artwork.

This started as a licensing cleanup and turned into the most interesting part of the codebase: adding a block is two edits (a sprite, an entry in the block list), tints and overlays are declarative, and the whole pipeline is testable pixel by pixel.

### One sprite per texture — variation goes through `tint`

No sprite variants. When a block needs to exist in several colors, it is one grayscale sprite plus N tint values, the way Minecraft handles grass. N greens cost zero extra artwork.

This is also why the metadata schema keeps `tint` and `overlays` on the face spec rather than baking color into the sprite: an earlier design tinted the *whole face*, which made "dirt at the bottom, green at the top" impossible on a grass side. The fix was the overlay layer, not more color.

### Grass green is `#6d9e46`

A moss green, chosen by eye against the alternatives and baked into `GRASS_TINT`. Not a placeholder.

### Glass does not dim what is behind it

Glass keeps `type: 'transparent'` — its `.` pixels are see-through — but it no longer applies `opacity: 0.5`. That looked bad. It is a deliberate choice, not an oversight.

### Sharing a `CanvasTexture` between blocks is safe; sharing *materials* is not verified

Face composition is cached by `(texture, tint, overlays)`, so faces built from the same spec share one `CanvasTexture`. Verified by hand: breaking one block does not leave the others of the same type black.

⚠️ That validates sharing **textures**, not **materials** — today every cube builds its own. Anything that starts sharing materials has to check whether R3F disposes a shared material when a block is removed.

The ground plane deliberately bypasses that cache: it applies `RepeatWrapping ×100` and must not share a `Source` with the grass block.

---

## Save format

### Block ids 1–9 are frozen

`1` dirt, `2` grass, `3` cobblestone, `4` stone, `5` oak log, `6` oak planks, `7` glass, `8` stone bricks, `9` bricks.

These ids are serialized into `localStorage`. They are the save-format contract: **never renumber them**. New blocks get appended after them.

### Every block in the registry must be reachable

No block exists without a consumer. An earlier test block with id `999` was unreachable because the hotbar only loads nine ids, and it sat there broken and unnoticed. The same thing happened to an `overlayTextures` key that the code never read.

A block that nothing can place, and a data field that nothing consumes, are the same bug.

---

## Testing

### Real browser, not jsdom

Tests run inside a real headless Chromium driven by Playwright, not in a simulated DOM.

The original plan was jsdom + react-testing-library. jsdom's `getContext('2d')` returns `null`, which would have left the entire texture pipeline — the most interesting code in the repo — untestable. Browser mode gives real canvas, real WebGL and real `localStorage` for free: no mocked texture registry, no mocked storage, and the hotbar renders the actual generated icons.

The cost is a heavier runner. It bought pixel-level assertions, including one that catches the grass side overlay silently not rendering — verified by mutation: remove the overlay and the test fails.

### Tests live in a root `test/` directory, not next to the code

`test/` mirrors `src/`'s categories. This was implemented colocated first and moved before tagging; the cost was one extra tsconfig project and an explicit `include`, and the benefit is ordering rather than function. It is a preference, taken knowingly.

It was free to move because tests import production code only through the `@/` alias, which resolves to an absolute path and does not care where the importer lives. That rule stays: no `../../src/...` imports from tests.

### `tsc -b`, not `tsc`

Found while wiring the test tsconfig: the build ran plain `tsc` against a root config of `"files": []` + `references`, so it **typechecked nothing at all** — not the tests, not `src` — and exited 0 every time. Fixed, and verified by mutation.

If that flag ever drops again, the build has silently stopped checking types.

### Rejected: `@react-three/test-renderer` and end-to-end tests

R3F and physics behaviour beyond "it mounts" — movement, collisions, placing and breaking blocks, pointer lock — is manual QA on purpose. A 3D test renderer would assert on a scene graph without proving anything a player would notice, and an e2e suite is more infrastructure than this project earns.

---

## Architecture

### Build the voxel storage rather than adopt an engine

Voxel engines like noa-engine are rejected: they would solve the interesting problem and remove the reason the project exists. Same reasoning for a full NBT / region file format — correct for a real game, overkill here — and for compressing worlds into `localStorage`, which does not escape its ~5MB ceiling or its synchronous parse.

### Physics stays on cannon

Migrating to `@react-three/rapier` would bring a capsule collider and a character controller for free, but it means rewriting all the physics to solve one problem. It stays on the table only if the physics layer ever shrinks enough to make the rewrite small.

For the player collider specifically: a box shape catches on the edges between blocks in cannon, and cannon-es has no capsule. What is left is a compound of stacked spheres with `fixedRotation`.

### Data-driven registries, not class hierarchies or HOCs

When a block type needs to vary — different shapes, different placement rules — the answer is a `Record` of plain definition objects that a single generic component reads, with zero branching by type in JSX. HOCs are legacy in this codebase, and a monolithic component with a switch is the thing being avoided.

Same stance on block metadata: a flat `tags: string[]` if it is ever needed, and an explicit **no** to replicating Minecraft's tag/datapack system with hierarchies and namespaces. For roughly a dozen blocks that is bureaucracy.

### Biome, not ESLint + Prettier

One tool for linting, formatting and import organization. `biome.json` is the source of truth for style, and `.vscode/settings.json` runs it on save.

---

## Licensing

### MIT covers the code **and** the artwork

`LICENSE.md` is MIT, and it covers both — precisely because the art *is* code. There are no image assets to license separately.

The old pixel font turned out **not** to be a licensing risk, but it was replaced anyway, by preference, with `@fontsource-variable/pixelify-sans` (OFL-1.1). That also removed "Minecraft" from the `font-family`.

### The project is called MC-Clone

Minecraft is named only as a description of what the project is inspired by, and in the non-affiliation disclaimer. The repository URL is the one place the old name survives.

---

## Performance baseline

A performance claim without a number can be neither accepted nor rejected, and without a starting row "it improved" means nothing.

**Reference scene:** a new world plus 200 placed blocks, looking at the pile from ~10 blocks away, window maximized. Hardware is recorded because the numbers are only comparable against themselves.

| Version | Scene | Avg FPS | Draw calls | Hardware | Date |
|---|---|---|---|---|---|
| — | _reference, before the material cache_ | — | — | — | — |
| — | _reference, after_ | — | — | — | — |

The rows are filled by the performance work and closed at 1.0.0.
