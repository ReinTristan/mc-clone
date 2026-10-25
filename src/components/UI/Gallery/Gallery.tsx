import { useMemo, useState } from 'react'
import {
  downloadContactSheet,
  downloadIcon,
} from '@/components/UI/Gallery/downloads'
import { blocks } from '@/data/blocks'
import { getBlockTextures } from '@/lib/textures/registry'
import { renderSprite } from '@/lib/textures/render'
import { sprites } from '@/lib/textures/sprites'
import { useMenuStore } from '@/store/useMenuStore'
import { type BlockDef, FACES } from '@/types/textures'

// Misma vista ensanchada que usa registry.ts: `blocks` conserva sus tipos
// literales por el `satisfies` y no deja recorrer `faces` genéricamente.
const defs: BlockDef[] = blocks

const BUTTON =
  'cursor-pointer bg-neutral-400 p-4 font-bold text-3xl text-black hover:bg-neutral-500'

/** Los sprites crudos que usa un bloque: base de cada cara + sus overlays. */
function blockSprites(block: BlockDef) {
  const names = new Set<string>()
  for (const spec of Object.values(block.faces)) {
    if (!spec) continue
    names.add(spec.texture)
    for (const overlay of spec.overlays ?? []) names.add(overlay.texture)
  }
  return [...names]
}

/**
 * Una textura repetida 3×3. La del centro es la textura sola, así que la misma
 * vista enseña la pieza y si el patrón corta en la costura.
 */
function Tile3x3({ url, label }: { url: string; label: string }) {
  return (
    <figure className='flex flex-col items-center gap-2'>
      <div
        role='img'
        aria-label={label}
        className='size-36 border-2 border-neutral-500 [image-rendering:pixelated]'
        style={{
          backgroundImage: `url(${url})`,
          backgroundSize: '33.333%',
          backgroundRepeat: 'repeat',
        }}
      />
      <figcaption className='text-lg'>{label}</figcaption>
    </figure>
  )
}

function BlockDetail({ block }: { block: BlockDef }) {
  const spriteUrls = useMemo(
    () =>
      blockSprites(block).map((name) => ({
        name,
        url: renderSprite(sprites[name], name).toDataURL(),
      })),
    [block]
  )
  const faceUrls = useMemo(() => {
    const { faces } = getBlockTextures(block.id)
    return FACES.map((face) => ({
      face,
      url: (faces[face].image as HTMLCanvasElement).toDataURL(),
    }))
  }, [block])

  return (
    <div className='flex flex-col gap-6 p-4'>
      <section className='flex flex-col gap-3'>
        <h3 className='text-2xl'>Sprites</h3>
        <div className='flex flex-wrap gap-4'>
          {spriteUrls.map(({ name, url }) => (
            <Tile3x3 key={name} url={url} label={name} />
          ))}
        </div>
      </section>
      <section className='flex flex-col gap-3'>
        <h3 className='text-2xl'>Faces</h3>
        <div className='flex flex-wrap gap-4'>
          {faceUrls.map(({ face, url }) => (
            <Tile3x3 key={face} url={url} label={`${block.name} ${face}`} />
          ))}
        </div>
      </section>
    </div>
  )
}

/**
 * Galería de texturas: la sección de debug de arte. Solo existe en `pnpm dev`
 * (ver el `lazy` de `Menus.tsx`) y no monta el mundo: se pinta sobre el menú
 * principal, que sigue abierto por debajo.
 */
export function Gallery() {
  const setTextureMenu = useMenuStore((state) => state.setTextureMenu)
  const [openId, setOpenId] = useState<number | null>(null)

  return (
    <div className='fixed inset-0 z-20 flex flex-col gap-8 overflow-y-auto bg-neutral-900 p-8 font-mc text-neutral-200'>
      <header className='flex flex-wrap items-center gap-4'>
        <button className={BUTTON} onClick={() => setTextureMenu(false)}>
          Back
        </button>
        <h1 className='flex-1 text-center text-7xl'>Texture Gallery</h1>
        <button className={BUTTON} onClick={() => downloadIcon()}>
          Download icon
        </button>
        <button className={BUTTON} onClick={() => downloadContactSheet()}>
          Download contact sheet
        </button>
      </header>

      <div className='grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-4'>
        {defs.map((block) => {
          const open = block.id === openId
          return (
            <div
              key={block.id}
              className={`border-4 border-neutral-500 bg-black/50 ${open ? 'col-span-full' : ''}`}
            >
              <button
                className='flex w-full cursor-pointer flex-col items-center gap-2 p-4 hover:bg-white/10'
                aria-label={block.name}
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : block.id)}
              >
                <img
                  src={getBlockTextures(block.id).iconUrl}
                  alt={`${block.name} icon`}
                  className='size-32 [image-rendering:pixelated]'
                />
                <span className='text-2xl'>{block.name}</span>
              </button>
              {open && <BlockDetail block={block} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
