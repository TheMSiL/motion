import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import type { Place } from '@/types'
import { STORAGE_KEYS } from '@/lib/storage'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { placeService } from '@/services'

interface SavedContextValue {
  savedIds: string[]
  savedPlaces: Place[]
  isSaved: (id: string) => boolean
  /** Returns the new state so callers can pick the right toast copy. */
  toggleSaved: (id: string) => boolean
  clearSaved: () => void
}

const SavedContext = createContext<SavedContextValue | null>(null)

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useLocalStorage<string[]>(STORAGE_KEYS.savedPlaces, [])

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds])

  const toggleSaved = useCallback(
    (id: string) => {
      const willSave = !savedIds.includes(id)
      setSavedIds((prev) => (willSave ? [id, ...prev.filter((p) => p !== id)] : prev.filter((p) => p !== id)))
      return willSave
    },
    [savedIds, setSavedIds],
  )

  const clearSaved = useCallback(() => setSavedIds([]), [setSavedIds])

  const savedPlaces = useMemo(
    () => savedIds.map((id) => placeService.findPlace(id)).filter((p): p is Place => Boolean(p)),
    [savedIds],
  )

  const value = useMemo(
    () => ({ savedIds, savedPlaces, isSaved, toggleSaved, clearSaved }),
    [savedIds, savedPlaces, isSaved, toggleSaved, clearSaved],
  )

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}

export function useSaved() {
  const context = useContext(SavedContext)
  if (!context) throw new Error('useSaved must be used inside <SavedProvider>')
  return context
}
