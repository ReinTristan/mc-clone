# Roadmap

Short horizon on purpose: what is being built now and what comes immediately after. The full plan through 1.0.0 is not public — [CHANGELOG.md](../CHANGELOG.md) is the record of what actually shipped.

**Shipped:** up to `v0.5.0` — the first step of the input and performance theme: all input now goes through a single set of listeners, a few input bugs are gone, and the middle mouse button picks the block you're looking at.

## In progress — 0.5.x · Input and performance

The input half of a debt the project has been carrying since early on is paid: the duplicated keyboard hook is gone. The other half is next: every component subscribes to the entire store, so changing hotbar slot re-renders every block in the world.

That gets fixed before the world engine is touched, because any performance measurement taken with a re-render storm running measures the storm. The same theme also fixes the pause key (today it takes two presses of Escape, because pointer lock swallows the first), adds the first settings screen, and swaps the block material for one without physically-based lighting, measured against a baseline.

## Next — 0.6.x · World engine

Today every block is its own mesh and its own physics body, which is the main scaling limit of the current design. This theme moves the world to chunks with a compact block format, so the world can grow without the scene growing with it. It also brings a debug overlay to see what the engine is doing, and flat worlds to start from.

## Later, without a number

Flowing water · block lighting (torches, dark caves) · sound · crafting and survival (the planned inventory is creative on purpose) · multiplayer.
