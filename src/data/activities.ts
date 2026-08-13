import type { Activity, ActivitySplit, ActivityType, DailyActivity } from '@/types'
import { generateRoute } from '@/lib/route-gen'
import { isoDate, startOfDay } from '@/lib/format'
import { mulberry32, pick, round } from '@/lib/utils'

/**
 * The dataset is deterministic: seeded values, generated exactly once when the
 * module is first imported. Only the *dates* are anchored to the current day so
 * the product reads as live ("Today", "Yesterday").
 */

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const DAY_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

const WEATHER = [
  '18° · Clear',
  '14° · Light breeze',
  '21° · Sunny',
  '11° · Overcast',
  '16° · Partly cloudy',
  '9° · Cold and dry',
  '23° · Warm',
] as const

const TITLES: Record<ActivityType, readonly string[]> = {
  cycling: [
    'City ride',
    'Riverside loop',
    'Evening ride',
    'Morning ride',
    'Commute',
    'Long ride',
    'Hill session',
    'Sunset cruise',
    'Recovery spin',
    'Old town loop',
    'Canal route',
    'Night ride',
  ],
  running: [
    'Tempo run',
    'Easy run',
    'Park intervals',
    'Riverside run',
    'Morning run',
    'Hill repeats',
    'Long run',
  ],
  walking: ['City walk', 'Evening walk', 'Market stroll', 'Park walk', 'Commute walk'],
}

const SPEED_RANGE: Record<ActivityType, [number, number]> = {
  cycling: [14, 26],
  running: [8.5, 13.5],
  walking: [4.2, 5.8],
}

const CALORIES_PER_KM: Record<ActivityType, number> = {
  cycling: 34,
  running: 68,
  walking: 48,
}

function buildSplits(distance: number, duration: number, seed: number): ActivitySplit[] {
  const rand = mulberry32(seed)
  const fullKm = Math.floor(distance)
  if (fullKm < 1) return []
  const base = duration / distance
  const splits: ActivitySplit[] = []
  for (let km = 1; km <= Math.min(fullKm, 24); km++) {
    splits.push({ km, seconds: Math.round(base * (0.88 + rand() * 0.26)) })
  }
  return splits
}

let idCounter = 0
function nextId() {
  idCounter += 1
  return `act-${idCounter.toString().padStart(3, '0')}`
}

interface BuildOptions {
  type?: ActivityType
  title?: string
  distance?: number
  duration?: number
  calories?: number
  date: Date
  seed: number
}

function buildActivity(options: BuildOptions): Activity {
  const rand = mulberry32(options.seed)
  const type = options.type ?? (pick(rand, ['cycling', 'cycling', 'cycling', 'running', 'walking'] as const) as ActivityType)
  const [minSpeed, maxSpeed] = SPEED_RANGE[type]
  const speed = round(minSpeed + rand() * (maxSpeed - minSpeed), 1)
  const distance = options.distance ?? round(2 + rand() * (type === 'cycling' ? 28 : 10), 1)
  const duration = options.duration ?? Math.round((distance / speed) * 3600)
  const averageSpeed = round((distance / duration) * 3600, 1)
  const calories =
    options.calories ?? Math.round(distance * CALORIES_PER_KM[type] * (0.9 + rand() * 0.25))

  return {
    id: nextId(),
    type,
    title: options.title ?? pick(rand, TITLES[type]),
    distance,
    duration,
    calories,
    averageSpeed,
    maxSpeed: round(averageSpeed * (1.28 + rand() * 0.3), 1),
    date: options.date.toISOString(),
    route: generateRoute(options.seed * 7919 + 13),
    splits: buildSplits(distance, duration, options.seed + 41),
    heartRate: Math.round(112 + rand() * 48),
    weather: pick(rand, WEATHER),
  }
}

function at(date: Date, hours: number, minutes: number) {
  const d = startOfDay(date)
  d.setHours(hours, minutes, 0, 0)
  return d
}

function daysAgo(n: number) {
  const d = startOfDay(new Date())
  d.setDate(d.getDate() - n)
  return d
}

/* --------------------------------------------------------------------------
   The last seven days are authored rather than generated: they carry the
   numbers the product is designed around (12.4 km today, 48.2 km this week).
   -------------------------------------------------------------------------- */

interface AuthoredTrip {
  title: string
  type: ActivityType
  distance: number
  duration: number
  calories: number
  hour: number
  minute: number
}

const TODAY_TRIPS: AuthoredTrip[] = [
  {
    title: 'City ride',
    type: 'cycling',
    distance: 8.2,
    duration: 32 * 60,
    calories: 285,
    hour: 8,
    minute: 12,
  },
  {
    title: 'Commute',
    type: 'cycling',
    distance: 2.6,
    duration: 11 * 60,
    calories: 95,
    hour: 12,
    minute: 40,
  },
  {
    title: 'Coffee run',
    type: 'cycling',
    distance: 1.6,
    duration: 5 * 60,
    calories: 48,
    hour: 17,
    minute: 5,
  },
]

const YESTERDAY_TRIPS: AuthoredTrip[] = [
  {
    title: 'Morning ride',
    type: 'cycling',
    distance: 5.4,
    duration: 24 * 60,
    calories: 186,
    hour: 7,
    minute: 30,
  },
]

const MONDAY_TRIPS: AuthoredTrip[] = [
  {
    title: 'Evening ride',
    type: 'cycling',
    distance: 7.1,
    duration: 41 * 60,
    calories: 240,
    hour: 18,
    minute: 45,
  },
]

/** Remaining slots for the week — the big Saturday ride plus two short days. */
const LONG_DAY_TRIPS: AuthoredTrip[] = [
  {
    title: 'Riverside loop',
    type: 'cycling',
    distance: 12.6,
    duration: 44 * 60,
    calories: 428,
    hour: 9,
    minute: 15,
  },
  {
    title: 'Old town loop',
    type: 'cycling',
    distance: 5.8,
    duration: 28 * 60,
    calories: 192,
    hour: 16,
    minute: 20,
  },
]

const SHORT_DAY_A: AuthoredTrip[] = [
  {
    title: 'Park walk',
    type: 'walking',
    distance: 3.1,
    duration: 34 * 60,
    calories: 142,
    hour: 19,
    minute: 10,
  },
]

const SHORT_DAY_B: AuthoredTrip[] = [
  {
    title: 'Market stroll',
    type: 'walking',
    distance: 1.8,
    duration: 21 * 60,
    calories: 84,
    hour: 11,
    minute: 25,
  },
]

const REST_DAY: AuthoredTrip[] = []

function buildWeek(): Activity[] {
  const days = Array.from({ length: 7 }, (_, i) => daysAgo(i))
  const assignments = new Map<string, AuthoredTrip[]>()

  const today = days[0] as Date
  const yesterday = days[1] as Date
  assignments.set(isoDate(today), TODAY_TRIPS)
  assignments.set(isoDate(yesterday), YESTERDAY_TRIPS)

  const remaining = days.slice(2)
  const monday = remaining.find((d) => d.getDay() === 1)
  if (monday) assignments.set(isoDate(monday), MONDAY_TRIPS)

  const stillFree = remaining.filter((d) => !assignments.has(isoDate(d)))
  // The long ride prefers Saturday; otherwise it lands on the earliest free day.
  const saturday = stillFree.find((d) => d.getDay() === 6)
  const pool: AuthoredTrip[][] = [SHORT_DAY_A, SHORT_DAY_B, REST_DAY]
  if (!monday) pool.unshift(MONDAY_TRIPS)

  const longDay = saturday ?? (stillFree[0] as Date | undefined)
  if (longDay) assignments.set(isoDate(longDay), LONG_DAY_TRIPS)

  const rest = stillFree.filter((d) => !assignments.has(isoDate(d)))
  rest.forEach((day, index) => {
    assignments.set(isoDate(day), pool[index] ?? REST_DAY)
  })

  const activities: Activity[] = []
  let seed = 1000
  days.forEach((day) => {
    const trips = assignments.get(isoDate(day)) ?? []
    trips.forEach((trip) => {
      seed += 37
      activities.push(
        buildActivity({
          type: trip.type,
          title: trip.title,
          distance: trip.distance,
          duration: trip.duration,
          calories: trip.calories,
          date: at(day, trip.hour, trip.minute),
          seed,
        }),
      )
    })
  })
  return activities
}

/**
 * The previous seven days are authored too: they total 40.8 km, which is what
 * makes the hero card's "+18% vs last week" a computed number rather than a
 * hard-coded string.
 */
const PREVIOUS_WEEK: { day: number; trip: AuthoredTrip }[] = [
  {
    day: 8,
    trip: {
      title: 'Long ride',
      type: 'cycling',
      distance: 14.2,
      duration: 52 * 60,
      calories: 482,
      hour: 9,
      minute: 5,
    },
  },
  {
    day: 9,
    trip: {
      title: 'Canal route',
      type: 'cycling',
      distance: 8.6,
      duration: 34 * 60,
      calories: 292,
      hour: 18,
      minute: 20,
    },
  },
  {
    day: 10,
    trip: {
      title: 'Commute',
      type: 'cycling',
      distance: 6.4,
      duration: 26 * 60,
      calories: 218,
      hour: 8,
      minute: 5,
    },
  },
  {
    day: 11,
    trip: {
      title: 'Easy run',
      type: 'running',
      distance: 4.9,
      duration: 28 * 60,
      calories: 334,
      hour: 7,
      minute: 40,
    },
  },
  {
    day: 12,
    trip: {
      title: 'Evening walk',
      type: 'walking',
      distance: 3.8,
      duration: 42 * 60,
      calories: 176,
      hour: 20,
      minute: 15,
    },
  },
  {
    day: 13,
    trip: {
      title: 'Recovery spin',
      type: 'cycling',
      distance: 2.9,
      duration: 15 * 60,
      calories: 98,
      hour: 17,
      minute: 30,
    },
  },
]

function buildPreviousWeek(): Activity[] {
  let seed = 3000
  return PREVIOUS_WEEK.map(({ day, trip }) => {
    seed += 61
    return buildActivity({
      type: trip.type,
      title: trip.title,
      distance: trip.distance,
      duration: trip.duration,
      calories: trip.calories,
      date: at(daysAgo(day), trip.hour, trip.minute),
      seed,
    })
  })
}

/** Everything older than two weeks is generated from a fixed seed. */
function buildHistory(count: number): Activity[] {
  const rand = mulberry32(20_260_813)
  const activities: Activity[] = []
  let dayOffset = 14
  let seed = 5000

  while (activities.length < count) {
    dayOffset += 1 + Math.floor(rand() * 2)
    const tripsToday = rand() > 0.78 ? 2 : 1
    for (let i = 0; i < tripsToday && activities.length < count; i++) {
      seed += 53
      const hour = 6 + Math.floor(rand() * 14)
      const minute = Math.floor(rand() * 60)
      activities.push(
        buildActivity({
          date: at(daysAgo(dayOffset), hour, minute),
          seed,
        }),
      )
    }
  }
  return activities
}

export const activities: Activity[] = [
  ...buildWeek(),
  ...buildPreviousWeek(),
  ...buildHistory(35),
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

/** Rolling seven-day window, ordered Monday → Sunday for the weekly chart. */
export function buildWeeklySeries(source: Activity[] = activities): DailyActivity[] {
  const days = Array.from({ length: 7 }, (_, i) => daysAgo(6 - i))
  const buckets = days.map((day) => {
    const key = isoDate(day)
    const dayActivities = source.filter((a) => isoDate(new Date(a.date)) === key)
    return {
      date: key,
      weekday: day.getDay(),
      label: DAY_LABELS[day.getDay()] as string,
      fullLabel: DAY_FULL[day.getDay()] as string,
      distance: round(
        dayActivities.reduce((sum, a) => sum + a.distance, 0),
        1,
      ),
      duration: dayActivities.reduce((sum, a) => sum + a.duration, 0),
      calories: dayActivities.reduce((sum, a) => sum + a.calories, 0),
      trips: dayActivities.length,
    }
  })

  // Monday first, Sunday last — each weekday appears exactly once in the window.
  const order = [1, 2, 3, 4, 5, 6, 0]
  return order
    .map((weekday) => buckets.find((b) => b.weekday === weekday))
    .filter((b): b is (typeof buckets)[number] => Boolean(b))
    .map(({ date, label, fullLabel, distance, duration, calories, trips }) => ({
      date,
      label,
      fullLabel,
      distance,
      duration,
      calories,
      trips,
    }))
}
