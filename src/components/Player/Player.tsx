import { useSphere } from '@react-three/cannon'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Mesh, Vector3 } from 'three'
import { useInputListeners } from '@/hooks/useInputListeners'
import { useInputStore } from '@/store/useInputStore'
import { useMenuStore } from '@/store/useMenuStore'

const CHARACTER_SPEED = 5
const CHARACTER_JUMP_FORCE = 5

// Reutilizados entre frames para no generar basura en cada uno.
const direction = new Vector3()
const frontVector = new Vector3()
const sideVector = new Vector3()

export const Player = () => {
  useInputListeners()
  const { camera } = useThree()
  const [ref, api] = useSphere<Mesh>(() => ({
    mass: 1,
    type: 'Dynamic',
    args: [0.4],
    position: [0, 0.5, 0],
  }))
  const pos = useRef([0, 0, 0])
  useEffect(() => {
    return api.position.subscribe((p) => {
      pos.current = p
    })
  }, [api.position])

  const vel = useRef([0, 0, 0])

  useEffect(() => {
    return api.velocity.subscribe((v) => {
      vel.current = v
    })
  }, [api.velocity])

  const rot = useRef([0, 0, 0])

  useEffect(() => {
    return api.rotation.subscribe((r) => {
      rot.current = r
    })
  }, [api.rotation])

  useFrame(() => {
    if (useMenuStore.getState().pauseMenu) return
    camera.position.set(pos.current[0], pos.current[1] + 1, pos.current[2])

    const { moveForward, moveBackward, moveLeft, moveRight, jump } =
      useInputStore.getState()
    const appliedRotation = camera.rotation
    frontVector.set(0, 0, (moveBackward ? 1 : 0) - (moveForward ? 1 : 0))
    sideVector.set((moveLeft ? 1 : 0) - (moveRight ? 1 : 0), 0, 0)
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(CHARACTER_SPEED)
      .applyEuler(appliedRotation)

    api.velocity.set(direction.x, vel.current[1], direction.z)
    api.rotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z)
    if (jump && Math.abs(vel.current[1]) < 0.05) {
      api.velocity.set(vel.current[0], CHARACTER_JUMP_FORCE, vel.current[2])
    }
  })

  return (
    <mesh ref={ref}>
      {/* <sphereGeometry args={[0.4]} />
      <meshStandardMaterial color='blue' /> */}
    </mesh>
  )
}
