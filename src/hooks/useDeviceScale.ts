import { useEffect, useState } from 'react'
import { clamp } from '@/lib/utils'

/**
 * Scale factor that keeps the desktop device frame fully visible on shorter
 * screens. The app inside never changes size — only the presentation does.
 */
export function useDeviceScale(frameHeight: number, verticalPadding = 96) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    function measure() {
      const available = window.innerHeight - verticalPadding
      setScale(clamp(available / frameHeight, 0.62, 1))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [frameHeight, verticalPadding])

  return scale
}
