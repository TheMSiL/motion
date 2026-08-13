import type { Route } from './route'

export type ActivityType = 'cycling' | 'running' | 'walking'

export interface ActivitySplit {
  /** 1-based kilometre index. */
  km: number
  /** Seconds spent on this kilometre. */
  seconds: number
}

export interface Activity {
  id: string
  type: ActivityType
  title: string
  /** Kilometres. */
  distance: number
  /** Seconds. */
  duration: number
  calories: number
  /** km/h. */
  averageSpeed: number
  maxSpeed: number
  /** ISO 8601 timestamp of the activity start. */
  date: string
  route: Route
  splits: ActivitySplit[]
  /** Average heart rate in bpm. */
  heartRate: number
  /** Weather note shown on the detail screen. */
  weather: string
  /** Locally recorded sessions are flagged so the UI can label them. */
  isLocal?: boolean
}

export interface ActivityTotals {
  distance: number
  duration: number
  calories: number
  trips: number
}

export interface DailyActivity {
  /** ISO date, YYYY-MM-DD. */
  date: string
  /** Mon, Tue, … */
  label: string
  fullLabel: string
  distance: number
  duration: number
  calories: number
  trips: number
}

/** Payload accepted by `activityService.createActivity`. */
export interface NewActivityInput {
  type: ActivityType
  title: string
  distance: number
  duration: number
  calories: number
  averageSpeed: number
  route?: Route
}
