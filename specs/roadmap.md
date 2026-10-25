# Roadmap

Short horizon on purpose: what is being built now and what comes immediately after. The full plan through 1.0.0 is not public — [CHANGELOG.md](../CHANGELOG.md) is the record of what actually shipped.

**Shipped:** up to `v0.4.3` — isometric hotbar icons, a generated favicon and a dev-only texture gallery.

## In progress — 0.4.4 · Cleanup

A short pass that closes the foundations line before 0.5.0 starts the one-theme-per-version rule. Nothing a player would notice:

- Dependencies that nothing imports anymore, and one types package sitting in the wrong section of `package.json`.
- The debug performance panel, which is mounted even on the main menu and shows up in the production build.
- Code comments that still point to planning files replaced months ago.
- Tests for the spec checker itself. It decides whether a version can ship, and so far nothing checked it.

## Next — 0.5.x · Input and performance

Two things the project has been carrying since early on. The keyboard hook is instantiated twice — once by the player, once by the menus — which means two sets of listeners that can drift apart. And every component subscribes to the entire store, so changing hotbar slot re-renders every block in the world.

Both get fixed before the world engine is touched, because any performance measurement taken with a re-render storm running measures the storm. The same theme also fixes the pause key (today it takes two presses of Escape, because pointer lock swallows the first), adds the first settings screen, and swaps the block material for one without physically-based lighting, measured against a baseline.

## Later, without a number

Flowing water · block lighting (torches, dark caves) · sound · crafting and survival (the planned inventory is creative on purpose) · multiplayer.
