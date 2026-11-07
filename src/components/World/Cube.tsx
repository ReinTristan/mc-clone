import { useBox } from '@react-three/cannon'
import { ThreeEvent } from '@react-three/fiber'
import { useState } from 'react'
import { Mesh, MeshStandardMaterial } from 'three'
import { getBlockTextures } from '@/lib/textures/registry'
import { useWorldStore } from '@/store/useWorldStore'
import { ICube } from '@/types/cubes'
import { FACES } from '@/types/textures'

const FACE_DIRECTION_VALUES = {
  face0: [1, 0, 0],
  face1: [-1, 0, 0],
  face2: [0, 1, 0],
  face3: [0, -1, 0],
  face4: [0, 0, 1],
  face5: [0, 0, -1],
} as const
export const Cube = ({ id, pos: position, textureId }: ICube) => {
  const {
    removeCube,
    addCube,
    setToSlot,
    setHotBarCurrentSlot,
    slots,
    hotBarCurrentSlot,
  } = useWorldStore((state) => state)
  const [isHovered, setIsHovered] = useState(false)
  const [ref] = useBox<Mesh>(() => ({
    type: 'Static',
    position,
  }))
  const block = getBlockTextures(textureId)
  // FACES está en el orden de índices de material de BoxGeometry:
  // +X, -X, +Y, -Y, +Z, -Z. No reordenar sin mover también los materiales.
  const materials = FACES.map(
    (face) =>
      new MeshStandardMaterial({
        map: block.faces[face],
        // el tinte viene horneado en la textura, así que el color base es
        // blanco y solo se usa para oscurecer en hover
        color: isHovered ? '#BBBBBB' : '#FFFFFF',
        transparent: block.type === 'transparent',
        opacity: block.opacity,
      })
  )
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e?.stopPropagation()
    if (e.button === 0) {
      removeCube(id)
      return
    }
    if (e.button === 1) {
      // Si ya está en la hotbar solo se salta a su slot: reemplazar el actual
      // perdería ese bloque, y sin inventario no habría cómo recuperarlo.
      const slotWithBlock = slots.indexOf(textureId)
      if (slotWithBlock === -1) {
        setToSlot(hotBarCurrentSlot, textureId)
      } else {
        setHotBarCurrentSlot(slotWithBlock)
      }
      return
    }
    if (e.button === 2) {
      const faceIndex = e.faceIndex ?? 1
      const clickedFace = Math.floor(faceIndex / 2)
      const faceValues =
        FACE_DIRECTION_VALUES[
          `face${clickedFace}` as keyof typeof FACE_DIRECTION_VALUES
        ]
      const fullPosition = [
        position[0] + faceValues[0],
        position[1] + faceValues[1],
        position[2] + faceValues[2],
      ] as [number, number, number]
      const textureId = slots[hotBarCurrentSlot]
      if (!textureId) return
      addCube({ pos: fullPosition, textureId })
    }
  }
  return (
    <mesh
      ref={ref}
      onPointerMove={(e) => {
        e.stopPropagation()
        setIsHovered(true)
      }}
      onPointerLeave={(e) => {
        e.stopPropagation()
        setIsHovered(false)
      }}
      onPointerDown={handleClick}
    >
      <boxGeometry attach='geometry' />
      <primitive object={materials} attach='material' />
    </mesh>
  )
}
