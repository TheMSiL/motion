import { useCallback, useEffect, useState } from 'react'
import { readStorage, writeStorage, type StorageKey } from '@/lib/storage'

/**
 * State that mirrors localStorage and stays in sync across tabs.
 */
export function useLocalStorage<T>(key: StorageKey, initialValue: T) {
  const [value, setValue] = useState<T>(() => readStorage(key, initialValue))

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        writeStorage(key, resolved)
        return resolved
      })
    },
    [key],
  )

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== key) return
      setValue(readStorage(key, initialValue))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
    // `initialValue` is only a fallback; re-subscribing on identity change is noise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return [value, update] as const
}
