import { afterEach, describe, expect, it, vi } from 'vitest'
import { attachInput, useInputStore } from '@/store/useInputStore'
import { useMenuStore } from '@/store/useMenuStore'
import { useWorldStore } from '@/store/useWorldStore'

const INPUT_EVENTS = ['keydown', 'keyup', 'wheel', 'blur']

const pressKey = (code: string) =>
  window.dispatchEvent(new KeyboardEvent('keydown', { code }))
const releaseKey = (code: string) =>
  window.dispatchEvent(new KeyboardEvent('keyup', { code }))
const turnWheel = (deltaY: number) =>
  window.dispatchEvent(new WheelEvent('wheel', { deltaY }))

const slot = () => useWorldStore.getState().hotBarCurrentSlot
const play = () => useMenuStore.setState({ mainMenu: false, pauseMenu: false })

let detachers: (() => void)[] = []
const attach = () => {
  const detach = attachInput()
  detachers.push(detach)
  return detach
}

afterEach(() => {
  for (const detach of detachers) detach()
  detachers = []
  vi.restoreAllMocks()
})

/** Listeners del input vivos en `window`, contados desde que se llama. */
const trackListeners = () => {
  const add = vi.spyOn(window, 'addEventListener')
  const remove = vi.spyOn(window, 'removeEventListener')
  return (type: string) =>
    add.mock.calls.filter(([t]) => t === type).length -
    remove.mock.calls.filter(([t]) => t === type).length
}

describe('useInputStore', () => {
  it('AC-0.5.0-1 · processes each input once, whatever the number of consumers', () => {
    const live = trackListeners()
    play()

    attach()
    attach()
    attach()

    for (const type of INPUT_EVENTS) expect(live(type)).toBe(1)

    turnWheel(-1)
    expect(slot()).toBe(1)
    pressKey('Digit5')
    expect(slot()).toBe(4)
  })

  it('AC-0.5.0-2 · Digit1 to Digit9 select their slot', () => {
    play()
    attach()

    for (let digit = 1; digit <= 9; digit++) {
      pressKey(`Digit${digit}`)
      expect(slot()).toBe(digit - 1)
    }
  })

  it('AC-0.5.0-3 · the wheel wraps from slot 9 to 1, and from 1 to 9', () => {
    play()
    attach()

    useWorldStore.setState({ hotBarCurrentSlot: 8 })
    turnWheel(-1)
    expect(slot()).toBe(0)

    turnWheel(1)
    expect(slot()).toBe(8)
  })

  it('ignores a wheel event with no vertical movement', () => {
    play()
    attach()
    useWorldStore.setState({ hotBarCurrentSlot: 4 })

    turnWheel(0)

    expect(slot()).toBe(4)
  })

  it('AC-0.5.0-4 · changing slot does not register the wheel listener again', () => {
    play()
    attach()
    const add = vi.spyOn(window, 'addEventListener')

    turnWheel(-1)
    pressKey('Digit7')
    useWorldStore.getState().setHotBarCurrentSlot(2)

    expect(add).not.toHaveBeenCalled()
  })

  it('AC-0.5.0-7 · leaves window without input listeners once every consumer is gone', () => {
    const live = trackListeners()
    play()
    const first = attach()
    const second = attach()

    first()
    // sigue vivo mientras quede un consumidor
    turnWheel(-1)
    expect(slot()).toBe(1)

    second()
    for (const type of INPUT_EVENTS) expect(live(type)).toBe(0)
    turnWheel(-1)
    expect(slot()).toBe(1)
    detachers = []
  })

  it.each([
    ['main menu', { mainMenu: true, pauseMenu: false }],
    ['pause menu', { mainMenu: false, pauseMenu: true }],
  ])('AC-0.5.0-14 · slots do not change with the %s open', (_, menus) => {
    useMenuStore.setState(menus)
    useWorldStore.setState({ hotBarCurrentSlot: 4 })
    attach()

    pressKey('Digit1')
    turnWheel(-1)
    turnWheel(1)

    expect(slot()).toBe(4)
  })

  it('tracks movement keys while held', () => {
    attach()

    pressKey('KeyW')
    expect(useInputStore.getState().moveForward).toBe(true)

    releaseKey('KeyW')
    expect(useInputStore.getState().moveForward).toBe(false)
  })

  it('releases held keys when the window loses focus', () => {
    attach()
    pressKey('KeyW')

    window.dispatchEvent(new Event('blur'))

    expect(useInputStore.getState().moveForward).toBe(false)
  })

  it('releases held keys when the pause opens', () => {
    play()
    attach()
    pressKey('KeyW')

    pressKey('Escape')

    expect(useMenuStore.getState().pauseMenu).toBe(true)
    expect(useInputStore.getState().moveForward).toBe(false)
  })
})
