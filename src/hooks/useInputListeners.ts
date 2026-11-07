import { useEffect } from 'react'
import { attachInput } from '@/store/useInputStore'

export const useInputListeners = () => {
  useEffect(() => attachInput(), [])
}
