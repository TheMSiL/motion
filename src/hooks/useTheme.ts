import { useCallback } from 'react'
import type { ThemePreference } from '@/types'
import { useSettings } from '@/store/settings-store'

export interface ThemeControls {
  /** What the user chose: system, light or dark. */
  theme: ThemePreference
  /** What is actually rendered right now. */
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: ThemePreference) => void
  /** Flips between light and dark, leaving "system" behind. */
  toggleTheme: () => void
}

export function useTheme(): ThemeControls {
  const { settings, resolvedTheme, setTheme } = useSettings()

  const toggleTheme = useCallback(
    () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
    [resolvedTheme, setTheme],
  )

  return { theme: settings.theme, resolvedTheme, setTheme, toggleTheme }
}
