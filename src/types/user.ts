export interface User {
  id: string
  name: string
  handle: string
  email: string
  city: string
  /** Two-letter monogram shown when no photo is set. */
  initials: string
  memberSince: string
  bio: string
  stats: {
    weekStreak: number
    dayStreak: number
    monthDistance: number
    totalDistance: number
    totalActivities: number
    longestRide: number
  }
}

export interface ConnectedApp {
  id: string
  name: string
  description: string
  connected: boolean
}
