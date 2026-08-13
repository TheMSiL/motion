import type { Goal, GoalHistoryPoint } from '@/types'
import { startOfDay } from '@/lib/format'
import { round } from '@/lib/utils'

function inDays(n: number) {
  const d = startOfDay(new Date())
  d.setDate(d.getDate() + n)
  d.setHours(23, 59, 59, 0)
  return d.toISOString()
}

function daysAgoIso(n: number) {
  const d = startOfDay(new Date())
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

/** Days remaining in the current Monday-to-Sunday week, inclusive of today. */
function daysLeftThisWeek() {
  const today = new Date().getDay()
  const mondayIndex = (today + 6) % 7
  return 6 - mondayIndex
}

function endOfMonth() {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  return d.toISOString()
}

function daysLeftThisMonth() {
  const now = new Date()
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return last - now.getDate()
}

const WEEK_HISTORY: GoalHistoryPoint[] = [
  { label: 'Mon', value: 7.1 },
  { label: 'Tue', value: 3.1 },
  { label: 'Wed', value: 1.8 },
  { label: 'Thu', value: 0 },
  { label: 'Fri', value: 18.4 },
  { label: 'Sat', value: 5.4 },
  { label: 'Sun', value: 12.4 },
]

const MONTH_HISTORY: GoalHistoryPoint[] = [
  { label: 'W1', value: 52.4 },
  { label: 'W2', value: 46.8 },
  { label: 'W3', value: 34.6 },
  { label: 'W4', value: 48.2 },
]

const STREAK_HISTORY: GoalHistoryPoint[] = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 1 },
  { label: 'Wed', value: 1 },
  { label: 'Thu', value: 1 },
  { label: 'Fri', value: 1 },
  { label: 'Sat', value: 1 },
  { label: 'Sun', value: 0 },
]

export const goals: Goal[] = [
  {
    id: 'goal-weekly-distance',
    title: 'Weekly distance',
    description: 'Cover 70 km across all activities between Monday and Sunday.',
    period: 'weekly',
    metric: 'distance',
    target: 70,
    current: 48.2,
    unit: 'km',
    status: 'active',
    deadline: inDays(daysLeftThisWeek()),
    history: WEEK_HISTORY,
    createdAt: daysAgoIso(84),
  },
  {
    id: 'goal-daily-streak',
    title: 'Daily streak',
    description: 'Log at least one activity every day. Rest days reset the count.',
    period: 'daily',
    metric: 'streak',
    target: 14,
    current: 6,
    unit: 'days',
    status: 'active',
    deadline: inDays(8),
    history: STREAK_HISTORY,
    createdAt: daysAgoIso(42),
  },
  {
    id: 'goal-monthly-distance',
    title: 'Monthly distance',
    description: 'Ride 250 km this month. Only cycling counts towards this goal.',
    period: 'monthly',
    metric: 'distance',
    target: 250,
    current: 182,
    unit: 'km',
    status: 'active',
    deadline: endOfMonth(),
    history: MONTH_HISTORY,
    createdAt: daysAgoIso(28),
  },
  {
    id: 'goal-weekly-time',
    title: 'Active time',
    description: 'Spend five hours moving this week.',
    period: 'weekly',
    metric: 'duration',
    target: 300,
    current: 214,
    unit: 'min',
    status: 'active',
    deadline: inDays(daysLeftThisWeek()),
    history: [
      { label: 'Mon', value: 41 },
      { label: 'Tue', value: 34 },
      { label: 'Wed', value: 21 },
      { label: 'Thu', value: 0 },
      { label: 'Fri', value: 72 },
      { label: 'Sat', value: 24 },
      { label: 'Sun', value: 48 },
    ],
    createdAt: daysAgoIso(56),
  },
  {
    id: 'goal-monthly-calories',
    title: 'Calorie burn',
    description: 'Burn 9 000 kcal across all activities this month.',
    period: 'monthly',
    metric: 'calories',
    target: 9000,
    current: 6480,
    unit: 'kcal',
    status: 'active',
    deadline: endOfMonth(),
    history: [
      { label: 'W1', value: 1980 },
      { label: 'W2', value: 1640 },
      { label: 'W3', value: 1210 },
      { label: 'W4', value: 1650 },
    ],
    createdAt: daysAgoIso(28),
  },
  {
    id: 'goal-weekly-trips',
    title: 'Weekly trips',
    description: 'Replace ten car journeys with a ride or a walk.',
    period: 'weekly',
    metric: 'trips',
    target: 10,
    current: 9,
    unit: 'trips',
    status: 'active',
    deadline: inDays(daysLeftThisWeek()),
    history: [
      { label: 'Mon', value: 1 },
      { label: 'Tue', value: 1 },
      { label: 'Wed', value: 1 },
      { label: 'Thu', value: 0 },
      { label: 'Fri', value: 2 },
      { label: 'Sat', value: 1 },
      { label: 'Sun', value: 3 },
    ],
    createdAt: daysAgoIso(21),
  },
  {
    id: 'goal-commute',
    title: 'Car-free commute',
    description: 'Ride to work every weekday this month.',
    period: 'monthly',
    metric: 'trips',
    target: 20,
    current: 20,
    unit: 'trips',
    status: 'completed',
    deadline: daysAgoIso(2),
    history: [
      { label: 'W1', value: 5 },
      { label: 'W2', value: 5 },
      { label: 'W3', value: 5 },
      { label: 'W4', value: 5 },
    ],
    createdAt: daysAgoIso(30),
  },
  {
    id: 'goal-elevation',
    title: 'Climb 2 000 m',
    description: 'Accumulate two thousand metres of elevation this month.',
    period: 'monthly',
    metric: 'distance',
    target: 2000,
    current: 1340,
    unit: 'm',
    status: 'active',
    deadline: endOfMonth(),
    history: [
      { label: 'W1', value: 420 },
      { label: 'W2', value: 380 },
      { label: 'W3', value: 250 },
      { label: 'W4', value: 290 },
    ],
    createdAt: daysAgoIso(28),
  },
  {
    id: 'goal-morning',
    title: 'Morning starts',
    description: 'Begin eight activities before 8am this month.',
    period: 'monthly',
    metric: 'trips',
    target: 8,
    current: 5,
    unit: 'rides',
    status: 'active',
    deadline: endOfMonth(),
    history: [
      { label: 'W1', value: 2 },
      { label: 'W2', value: 1 },
      { label: 'W3', value: 1 },
      { label: 'W4', value: 1 },
    ],
    createdAt: daysAgoIso(28),
  },
  {
    id: 'goal-long-ride',
    title: 'One long ride',
    description: 'Complete a single ride of 40 km or more.',
    period: 'monthly',
    metric: 'distance',
    target: 40,
    current: 31.8,
    unit: 'km',
    status: 'active',
    deadline: endOfMonth(),
    history: [
      { label: 'W1', value: 24.2 },
      { label: 'W2', value: 28.6 },
      { label: 'W3', value: 19.4 },
      { label: 'W4', value: 31.8 },
    ],
    createdAt: daysAgoIso(28),
  },
]

export function goalProgress(goal: Pick<Goal, 'current' | 'target'>) {
  if (goal.target <= 0) return 0
  return Math.min(100, round((goal.current / goal.target) * 100, 0))
}

export function goalRemaining(goal: Pick<Goal, 'current' | 'target'>) {
  return round(Math.max(0, goal.target - goal.current), 1)
}

export { daysLeftThisMonth, daysLeftThisWeek }
