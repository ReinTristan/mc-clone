# Roadmap

Short horizon on purpose: what is being built now and what comes immediately after. The full plan through 1.0.0 is not public — [CHANGELOG.md](../CHANGELOG.md) is the record of what actually shipped.

**Shipped:** up to `v0.4.4` — a cleanup pass that closed the foundations line: dead dependencies gone, the debug performance panel kept out of the menu and the production build, and tests for the spec checker itself.

## In progress — 0.5.x · Input and performance

Two things the project has been carrying since early on. The keyboard hook is instantiated twice — once by the player, once by the menus — which means two sets of listeners that can drift apart. And every component subscribes to the entire store, so changing hotbar slot re-renders every block in the world.

Both get fixed before the world engine is touched, because any performance measurement taken with a re-render storm running measures the storm. The same theme also fixes the pause key (today it takes two presses of Escape, because pointer lock swallows the first), adds the first settings screen, and swaps the block material for one without physically-based lighting, measured against a baseline.

## Next — 0.6.x · World engine

Today every block is its own mesh and its own physics body, which is the main scaling limit of the current design. This theme moves the world to chunks with a compact block format, so the world can grow without the scene growing with it. It also brings a debug overlay to see what the engine is doing, and flat worlds to start from.

## Later, without a number

Flowing water · block lighting (torches, dark caves) · sound · crafting and survival (the planned inventory is creative on purpose) · multiplayer.
