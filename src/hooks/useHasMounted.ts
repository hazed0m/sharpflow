import { useRef, useEffect } from 'react'

export function useHasMounted() {
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
  }, [])

  return mountedRef.current
}
