import type { ConnectedApp, User } from '@/types'

/* Fictional demo persona. The initials stay MS so the monogram avatar reads
   the same everywhere it appears. */
export const user: User = {
  id: 'usr-01',
  name: 'Mara Sinclair',
  handle: '@marasinclair',
  email: 'mara.sinclair@example.com',
  city: 'Riverside District',
  initials: 'MS',
  memberSince: 'March 2024',
  bio: 'Commuter by weekday, long loops on Saturday. Currently chasing 250 km a month.',
  stats: {
    weekStreak: 12,
    dayStreak: 6,
    monthDistance: 328,
    totalDistance: 4126,
    totalActivities: 312,
    longestRide: 84.6,
  },
}

export const connectedApps: ConnectedApp[] = [
  {
    id: 'health',
    name: 'Apple Health',
    description: 'Sync workouts and heart rate',
    connected: true,
  },
  { id: 'wahoo', name: 'Wahoo', description: 'Import rides from your head unit', connected: true },
  { id: 'spotify', name: 'Spotify', description: 'Show what you listened to', connected: false },
  { id: 'calendar', name: 'Calendar', description: 'Block time for planned rides', connected: false },
]
