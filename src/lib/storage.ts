/**
 * Namespaced localStorage access. Every read is defensive — a corrupted or
 * unavailable store must never take the app down.
 */

export const STORAGE_KEYS = {
  settings: 'motion.settings',
  savedPlaces: 'motion.savedPlaces',
  notifications: 'motion.notifications',
  goals: 'motion.goals',
  activities: 'motion.activities',
  recentSearches: 'motion.recentSearches',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

function available() {
  try {
    return typeof window !== 'undefined' && !!window.localStorage
  } catch {
    return false
  }
}

export function readStorage<T>(key: StorageKey, fallback: T): T {
  if (!available()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: StorageKey, value: T) {
  if (!available()) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* Quota exceeded or private mode — the app keeps working in memory. */
  }
}

export function removeStorage(key: StorageKey) {
  if (!available()) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* no-op */
  }
}

export function clearAppStorage() {
  Object.values(STORAGE_KEYS).forEach(removeStorage)
}
