import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Settings, ThemePreference, Units } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'
import { STORAGE_KEYS } from '@/lib/storage'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface SettingsContextValue {
  settings: Settings
  /** Resolved theme after applying the system preference. */
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: ThemePreference) => void
  setUnits: (units: Units) => void
  setNotification: (key: keyof Settings['notifications'], value: boolean) => void
  setPrivacy: <K extends keyof Settings['privacy']>(key: K, value: Settings['privacy'][K]) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function systemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(theme: ThemePreference) {
  const dark = theme === 'dark' || (theme === 'system' && systemPrefersDark())
  const root = document.documentElement
  root.classList.toggle('dark', dark)
  root.style.colorScheme = dark ? 'dark' : 'light'
  return dark ? ('dark' as const) : ('light' as const)
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS)

  // Merge in case an older persisted shape is missing newer keys.
  const merged = useMemo<Settings>(
    () => ({
      ...DEFAULT_SETTINGS,
      ...settings,
      notifications: { ...DEFAULT_SETTINGS.notifications, ...settings.notifications },
      privacy: { ...DEFAULT_SETTINGS.privacy, ...settings.privacy },
    }),
    [settings],
  )

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    merged.theme === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : merged.theme,
  )

  useEffect(() => {
    setResolvedTheme(applyTheme(merged.theme))
  }, [merged.theme])

  // Follow the OS when the preference is "system".
  useEffect(() => {
    if (merged.theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setResolvedTheme(applyTheme('system'))
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [merged.theme])

  const setTheme = useCallback(
    (theme: ThemePreference) => setSettings((prev) => ({ ...prev, theme })),
    [setSettings],
  )

  const setUnits = useCallback(
    (units: Units) => setSettings((prev) => ({ ...prev, units })),
    [setSettings],
  )

  const setNotification = useCallback(
    (key: keyof Settings['notifications'], value: boolean) =>
      setSettings((prev) => ({
        ...prev,
        notifications: { ...DEFAULT_SETTINGS.notifications, ...prev.notifications, [key]: value },
      })),
    [setSettings],
  )

  const setPrivacy = useCallback(
    <K extends keyof Settings['privacy']>(key: K, value: Settings['privacy'][K]) =>
      setSettings((prev) => ({
        ...prev,
        privacy: { ...DEFAULT_SETTINGS.privacy, ...prev.privacy, [key]: value },
      })),
    [setSettings],
  )

  const resetSettings = useCallback(() => setSettings(DEFAULT_SETTINGS), [setSettings])

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings: merged,
      resolvedTheme,
      setTheme,
      setUnits,
      setNotification,
      setPrivacy,
      resetSettings,
    }),
    [merged, resolvedTheme, setTheme, setUnits, setNotification, setPrivacy, resetSettings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used inside <SettingsProvider>')
  return context
}

/** Convenience accessor for the unit preference, used by every formatter call. */
export function useUnits() {
  return useSettings().settings.units
}
