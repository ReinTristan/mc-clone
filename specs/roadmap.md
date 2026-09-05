# Roadmap

Short horizon on purpose: what is being built now and what comes immediately after. The full plan through 1.0.0 is not public — [CHANGELOG.md](../CHANGELOG.md) is the record of what actually shipped.

**Shipped:** up to `v0.4.2`.

## In progress — 0.4.3 · Texture and icon exporter

The texture engine draws every block at runtime onto a canvas, from pixel art declared in TypeScript. This version turns that into a tool that also runs outside the browser: a Node script that writes PNGs — an isometric block icon, the composed faces of every block, a labelled contact sheet, and 3×3 tiling previews that show whether a pattern breaks at the seam.

It started as a one-off script to generate the site's own favicon during 0.4.0's close, and turned out not to be one-off at all. The isometric projection it needs is the same one the hotbar and, later, the inventory want for their icons.

## Next — 0.5.x · Input and performance

Two things the project has been carrying since early on. The keyboard hook is instantiated twice — once by the player, once by the menus — which means two sets of listeners that can drift apart. And every component subscribes to the entire store, so changing hotbar slot re-renders every block in the world.

Both get fixed before the world engine is touched, because any performance measurement taken with a re-render storm running measures the storm.

## Later, without a number

Water and fluids · day-night cycle · sound · crafting and survival (the planned inventory is creative on purpose) · multiplayer.
