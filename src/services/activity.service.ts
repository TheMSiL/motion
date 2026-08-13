import type {
  Activity,
  ActivityTotals,
  ActivityType,
  DailyActivity,
  NewActivityInput,
} from '@/types'
import { activities as seedActivities, buildWeeklySeries } from '@/data/activities'
import { generateRoute } from '@/lib/route-gen'
import { isoDate, startOfDay } from '@/lib/format'
import { round } from '@/lib/utils'
import { readStorage, writeStorage, STORAGE_KEYS } from '@/lib/storage'
import { notFound, request } from './client'

/** Activities recorded inside the app, persisted so they survive a reload. */
function readLocal(): Activity[] {
  return readStorage<Activity[]>(STORAGE_KEYS.activities, [])
}

function writeLocal(items: Activity[]) {
  // Keep the persisted slice small — only locally recorded sessions are stored.
  writeStorage(STORAGE_KEYS.activities, items.slice(0, 40))
}

function all(): Activity[] {
  return [...readLocal(), ...seedActivities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

export interface ActivityQuery {
  type?: ActivityType | 'all'
  search?: string
  limit?: number
}

export const activityService = {
  async getActivities(query: ActivityQuery = {}): Promise<Activity[]> {
    return request(() => {
      let items = all()
      if (query.type && query.type !== 'all') items = items.filter((a) => a.type === query.type)
      if (query.search) {
        const term = query.search.trim().toLowerCase()
        items = items.filter(
          (a) =>
            a.title.toLowerCase().includes(term) ||
            a.route.startLabel.toLowerCase().includes(term) ||
            a.route.endLabel.toLowerCase().includes(term),
        )
      }
      return query.limit ? items.slice(0, query.limit) : items
    })
  },

  async getActivity(id: string): Promise<Activity> {
    return request(() => {
      const activity = all().find((a) => a.id === id)
      if (!activity) notFound('Activity', id)
      return activity
    })
  },

  async createActivity(input: NewActivityInput): Promise<Activity> {
    return request(() => {
      const now = new Date()
      const seed = Math.floor(now.getTime() / 1000)
      const activity: Activity = {
        id: `local-${seed}`,
        type: input.type,
        title: input.title,
        distance: round(input.distance, 1),
        duration: Math.round(input.duration),
        calories: Math.round(input.calories),
        averageSpeed: round(input.averageSpeed, 1),
        maxSpeed: round(input.averageSpeed * 1.32, 1),
        date: now.toISOString(),
        route: input.route ?? generateRoute(seed),
        splits: [],
        heartRate: 138,
        weather: 'Recorded live',
        isLocal: true,
      }
      writeLocal([activity, ...readLocal()])
      return activity
    }, 260)
  },

  async deleteActivity(id: string): Promise<void> {
    return request(() => {
      writeLocal(readLocal().filter((a) => a.id !== id))
    })
  },

  /** Totals for a single calendar day — powers the Home summary row. */
  async getDayTotals(date: Date = new Date()): Promise<ActivityTotals> {
    return request(() => {
      const key = isoDate(startOfDay(date))
      const items = all().filter((a) => isoDate(new Date(a.date)) === key)
      return {
        distance: round(
          items.reduce((sum, a) => sum + a.distance, 0),
          1,
        ),
        duration: items.reduce((sum, a) => sum + a.duration, 0),
        calories: items.reduce((sum, a) => sum + a.calories, 0),
        trips: items.length,
      }
    })
  },

  async getWeeklySeries(): Promise<DailyActivity[]> {
    return request(() => buildWeeklySeries(all()))
  },

  /** Percentage change against the previous seven days. */
  async getWeeklyTrend(): Promise<number> {
    return request(() => {
      const items = all()
      const today = startOfDay(new Date())
      const sumBetween = (fromDaysAgo: number, toDaysAgo: number) => {
        const from = new Date(today)
        from.setDate(from.getDate() - fromDaysAgo)
        const to = new Date(today)
        to.setDate(to.getDate() - toDaysAgo)
        return items
          .filter((a) => {
            const d = new Date(a.date)
            return d >= from && d < to
          })
          .reduce((sum, a) => sum + a.distance, 0)
      }
      const thisWeek = sumBetween(6, -1)
      const lastWeek = sumBetween(13, 6)
      if (lastWeek === 0) return thisWeek > 0 ? 100 : 0
      return Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
    })
  },
}
