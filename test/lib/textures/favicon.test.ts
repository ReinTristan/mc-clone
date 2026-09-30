import { beforeEach, describe, expect, it } from 'vitest'
import { setFavicon } from '@/lib/textures/favicon'
import { getBlockTextures, loadAllTextures } from '@/lib/textures/registry'

const GRASS_ID = 2

const iconLinks = () =>
  document.head.querySelectorAll<HTMLLinkElement>('link[rel="icon"]')

describe('favicon', () => {
  it('AC-0.4.3-13 · points the icon link at the iso data: PNG after loading', async () => {
    await loadAllTextures()

    const [link] = iconLinks()
    expect(link.href.startsWith('data:image/png;base64,')).toBe(true)
    // la misma cadena que pinta la hotbar: sale del mismo módulo, no de una copia
    expect(link.href).toBe(getBlockTextures(GRASS_ID).iconUrl)
  })
})

describe('setFavicon', () => {
  beforeEach(() => {
    for (const link of iconLinks()) link.remove()
  })

  it('creates the icon link when the document has none', () => {
    setFavicon('data:image/png;base64,AAAA')

    expect(iconLinks()).toHaveLength(1)
    expect(iconLinks()[0].type).toBe('image/png')
  })

  it('reuses the existing link instead of adding another one', () => {
    setFavicon('data:image/png;base64,AAAA')
    setFavicon('data:image/png;base64,BBBB')

    expect(iconLinks()).toHaveLength(1)
    expect(iconLinks()[0].href).toBe('data:image/png;base64,BBBB')
  })
})
