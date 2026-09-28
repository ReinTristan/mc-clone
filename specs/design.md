# How specs are written

MC-Clone is planned spec-first: every pending point is an **acceptance criterion** with a stable ID and a declared verification target. Implementation follows the criterion, not the prose describing the version.

This is not textbook spec-driven development. It is a custom flow shaped around a two-person workflow (see [workflow.md](workflow.md)), kept deliberately lightweight — a criterion is one line, not a document.

## Layout

```
specs/
  design.md      ← you are here: how a spec is written
  workflow.md    how a version is worked and closed
  roadmap.md     what is being built now and next
  decisions.md   decisions taken and rejected, and why
  versions/      not committed — the working plan lives here
    backlog.md   known issues and where each one lands
    0.4.3/
      context.md the reasoning behind the version
      tasks.md   its criteria
```

`specs/versions/` is gitignored on purpose. The method is public; the plan is not. What each released version actually shipped is in [CHANGELOG.md](../CHANGELOG.md), written for players rather than for commits.

Because of that split, the templates below are the only place an outside reader can see the format applied.

## The format

A criterion describes **observable behaviour** and says **where it is verified**. It never says how to implement it — the *how* belongs in the version's prose, which is where it can age without breaking anything.

```markdown
- [ ] `AC-0.5.0-6` Pressing WASD does not re-render `Player` → 🧪 `test/components/Player/Player.test.tsx`
- [ ] `AC-0.5.0-7` With the pause menu open, WASD does not move the player → 🖐️ manual QA
```

Design **decisions** are not criteria — they are not met, they are taken — and live in their own block above the criteria:

```markdown
- [ ] `D-0.5.0-1` Wheel direction: today `deltaY < 0` moves the slot up, the opposite of Minecraft
```

### Notation

| Symbol | Meaning |
|---|---|
| 🧪 `path` | Verified by a vitest test. The path is a target and **may not exist yet** — the criterion is written before the test |
| 🖐️ manual QA | Verified in the browser by ReinTristan. **It has to be asked for before closing the version**, never assumed |
| `AC-x.y.z-n` | Acceptance criterion. Stable ID |
| `D-x.y.z-n` | Open decision |

### The six rules

1. **Observable behaviour, never an implementation instruction.** "Switching hotbar slots does not re-render the cubes", not "use atomic selectors".
2. **One criterion = one assertion.** If it has an "and" in the middle, it is probably two criteria.
3. **Every criterion is born with a target.** Without 🧪 or 🖐️ it is not a criterion, it is a note.
4. **A criterion outlives its open decisions:** it has to stay valid under any branch of its version's `D-` entries. If it doesn't, it was written as implementation.
5. **IDs are stable.** They are never renumbered. A criterion that dies is struck through (`~~AC-0.6.1-3~~`) with a line saying why; its number is not reused.
6. **The test cites its ID in its name:** `it('AC-0.5.0-6 · does not re-render on WASD', …)`, in English like the rest of the suite. That citation is the only link between spec and suite, and it is what `pnpm spec:check` reads.

**Scope:** the format applies from 0.4.3 onward. Versions closed before that (0.4.0, 0.4.1, 0.4.2) carry no IDs — they are historical record, and rewriting them would erase the trail of how they were built.

## Templates

### `tasks.md`

One per version. Mandatory as soon as the version has criteria.

```markdown
# 0.5.0 — Unified input

One or two paragraphs: what the version is for and the direction it takes.
This is the *how*, and it is allowed to age.

**Decisiones**

- [ ] `D-0.5.0-1` …

**Criterios**

- [ ] `AC-0.5.0-1` … → 🧪 `test/store/useInputStore.test.ts`
- [ ] `AC-0.5.0-8` … → 🖐️ QA manual
```

Versions that ship in preview tags may group their criteria under optional `## preview-N` headings, and `spec:check` will then report progress per preview:

```markdown
## preview-0 — iso core

- [ ] `AC-0.4.3-1` …

## preview-1 — the exporter

- [ ] `AC-0.4.3-4` …
```

A criterion outside any preview heading is fine; the grouping is optional and per version.

### `context.md`

The reasoning: what was analysed, what was rejected, what the risks are, and what this version depends on. Written when there is something worth keeping — for far-off versions it is born when the version is opened, and until then its context lives in `backlog.md`.

Anything that spans several versions belongs in `backlog.md`, and `context.md` links to it rather than copying it.

## `pnpm spec:check`

`scripts/spec/check.ts` — plain Node with native type stripping, no dependencies. It cross-references the criteria in `specs/versions/*/tasks.md` with the tests that cite them, and it is what keeps this convention from eroding silently.

It **fails** on:

- a duplicated ID — an ID is an address; if two criteria share one, traceability stops meaning anything
- a criterion whose ID version doesn't match the folder it lives in (a hand-renumbered criterion, which rule 5 forbids)
- a criterion with no target
- a criterion ticked with no test citing it
- a test citing an ID that doesn't exist in any `tasks.md`

It **does not** fail on a 🧪 target pointing at a file that doesn't exist yet, or on an unticked criterion with no test. That is the normal state: the criterion is written first.

The version being worked on comes from `SPEC_VERSION` (see [workflow.md](workflow.md)); a first CLI argument overrides it. `--all` lists every version instead of just the one in progress.

Its own tests live in `scripts/spec/` and run with `pnpm spec:test` (Node's native `node --test`, not vitest). They are deliberately outside `test/`, so the fixture IDs they contain are never scanned as citations.

Run both before calling a version done.
