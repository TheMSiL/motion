export type ThemePreference = 'system' | 'light' | 'dark'
export type Units = 'km' | 'mi'
export type ActivityVisibility = 'public' | 'followers' | 'private'

export interface Settings {
  theme: ThemePreference
  units: Units
  notifications: {
    activityReminders: boolean
    goalReminders: boolean
    weeklySummary: boolean
    newRoutes: boolean
  }
  privacy: {
    activityVisibility: ActivityVisibility
    hideStartEnd: boolean
    shareStats: boolean
  }
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  units: 'km',
  notifications: {
    activityReminders: true,
    goalReminders: true,
    weeklySummary: true,
    newRoutes: false,
  },
  privacy: {
    activityVisibility: 'followers',
    hideStartEnd: true,
    shareStats: true,
  },
}
