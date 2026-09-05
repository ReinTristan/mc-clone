# How a version is worked and closed

## Roles

Claude implements each part and leaves the working tree ready, with the version's `tasks.md` updated. ReinTristan does the manual QA, the commits, the version bumps and the tags. Nothing gets committed on Claude's initiative.

## Versioning

- `X.Y.0` is a **big element**: a new theme. `X.Y.Z` are **smaller steps inside that same theme**.
- It is not restrictive: loose fixes and configuration work can travel in any subversion. The 0.4.x line is explicitly the foundations one — the theme rule starts for real at 0.5.0.
- **Every subversion leaves the game playable.** A half-migrated state is never tagged. This constrains the internal order of a theme more than anything else.
- A version may ship in **preview tags** (`v0.4.0-preview-0`, `-1`, …) before its final tag. 0.4.0 shipped in four.

## `SPEC_VERSION`

`.env` (gitignored) holds two version numbers, and they are different on purpose:

| Variable | Means |
|---|---|
| `VITE_CURRENT_VERSION` | The **released** version, rendered by `src/components/UI/HUD/Info.tsx` on the main menu |
| `SPEC_VERSION` | The version **being implemented**, read by `pnpm spec:check` |

`SPEC_VERSION` moves when a version is opened, not when it is tagged — so during 0.4.3's development `VITE_CURRENT_VERSION` still reads `0.4.2`. A CLI argument overrides it for a one-off look at another version: `pnpm spec:check 0.6.0`.

## Definition of Done

The gate **every** version crosses before being tagged. In order:

1. `pnpm biome` clean.
2. `pnpm build` green. ⚠️ The script is `tsc -b`, **not** `tsc`: with a root config of `"files": []` + `references`, plain `tsc` typechecks nothing at all and exits 0. If that flag ever disappears, the build has stopped checking types.
3. `pnpm test:run` green.
4. `pnpm spec:check` with no errors: no ghost IDs, no criteria ticked without a test.
5. **Every 🧪 `AC-` of the version ticked**, each with a test citing its ID.
6. **Every 🖐️ `AC-` executed and ticked by ReinTristan.** → Claude **does not declare a version ready** without first listing the pending 🖐️ criteria and waiting for them to be ticked. This is not a formality: the manual QA for 0.4.1 and 0.4.2 was performed and never written down, and the record was lost. That is why this is step 6.
7. The version's `D-` decisions taken — and written down in [decisions.md](decisions.md) with their reasoning if they are durable, or in the private backlog if they are not.
8. A new entry in [CHANGELOG.md](../CHANGELOG.md), written for players (what changes when you play), not for commits.
9. [roadmap.md](roadmap.md) updated: the version moves to shipped, and the next one becomes current.
10. Bump `version` in `package.json` **and** `VITE_CURRENT_VERSION` in `.env`; move `SPEC_VERSION` to the next version.
11. Commit + tag by ReinTristan.

A criterion that isn't met doesn't get ticked: it moves to the next version **keeping its ID**, with a line saying where it came from.
