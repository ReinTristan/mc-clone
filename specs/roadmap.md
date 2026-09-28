# Roadmap

Short horizon on purpose: what is being built now and what comes immediately after. The full plan through 1.0.0 is not public — [CHANGELOG.md](../CHANGELOG.md) is the record of what actually shipped.

**Shipped:** up to `v0.4.2`.

## In progress — 0.4.3 · Isometric icons, favicon and a texture gallery

The texture engine draws every block at runtime onto a canvas, from pixel art declared in TypeScript. This version adds an isometric projection of a block — the three visible faces, each shaded differently — and puts it to work in two places: the hotbar icons, which stop being the flat top face, and the site's favicon, which stops being Vite's placeholder and becomes a `data:` PNG generated from the same code.

It also adds a texture gallery that only exists in the dev server: every block's faces, its isometric icon and each sprite tiled 3×3, so a pattern that breaks at the seam is visible at a glance. That last view is what revealed that two of the original sprites read as a brick grid when repeated. The gallery is an art-review tool, not part of the game, and it is where the few PNGs the site needs as files (the social preview image, the README's contact sheet) get downloaded from.

An earlier draft of this version was a Node script writing PNGs to disk. It was never the idea: everything happens in the browser.

## Next — 0.4.4 · Cleanup, then 0.5.x · Input and performance

A short cleanup pass closes the foundations line: dead dependencies, a debug panel that is always mounted, and tests for the spec checker itself, which gates every release and had none.

Then two things the project has been carrying since early on. The keyboard hook is instantiated twice — once by the player, once by the menus — which means two sets of listeners that can drift apart. And every component subscribes to the entire store, so changing hotbar slot re-renders every block in the world.

Both get fixed before the world engine is touched, because any performance measurement taken with a re-render storm running measures the storm. The same theme also fixes the pause key (today it takes two presses of Escape, because pointer lock swallows the first), adds the first settings screen, and swaps the block material for one without physically-based lighting, measured against a baseline.

## Later, without a number

Flowing water · block lighting (torches, dark caves) · sound · crafting and survival (the planned inventory is creative on purpose) · multiplayer.
