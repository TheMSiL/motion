import type { AppNotification } from '@/types'

function hoursAgo(n: number) {
  const d = new Date()
  d.setMinutes(d.getMinutes() - Math.round(n * 60))
  return d.toISOString()
}

interface Seed extends Omit<AppNotification, 'id' | 'date'> {
  hours: number
}

const SEEDS: Seed[] = [
  {
    kind: 'goal',
    title: 'Goal completed',
    body: 'Car-free commute — 20 of 20 trips. That is a full month without the car.',
    read: false,
    href: '/goals/goal-commute',
    hours: 1.5,
  },
  {
    kind: 'streak',
    title: "You're on a 6-day streak",
    body: 'One more day and you match your longest streak this season.',
    read: false,
    href: '/goals/goal-daily-streak',
    hours: 4,
  },
  {
    kind: 'summary',
    title: 'Weekly summary ready',
    body: '48.2 km across 9 trips, up 18% on last week. Saturday was your biggest day.',
    read: false,
    href: '/goals/goal-weekly-distance',
    hours: 9,
  },
  {
    kind: 'route',
    title: 'New route nearby',
    body: 'Upper Terrace Traverse — 6 km of rolling contour road, two streets from your usual loop.',
    read: false,
    href: '/explore/place-28',
    hours: 20,
  },
  {
    kind: 'goal',
    title: 'Weekly goal at 69%',
    body: '21.8 km to go with 3 days left. A single evening ride keeps you on pace.',
    read: true,
    href: '/goals/goal-weekly-distance',
    hours: 26,
  },
  {
    kind: 'social',
    title: 'Anna rode your route',
    body: 'Riverside Loop, 8.4 km. She was 42 seconds quicker than your best.',
    read: true,
    href: '/explore/place-01',
    hours: 30,
  },
  {
    kind: 'route',
    title: 'Harbour Sprint reopened',
    body: 'The dock road resurfacing finished early. The full 2 km is rideable again.',
    read: true,
    href: '/explore/place-05',
    hours: 38,
  },
  {
    kind: 'system',
    title: 'Activity reminder',
    body: 'You usually ride around 08:00. Clear skies and 16° this morning.',
    read: true,
    hours: 44,
  },
  {
    kind: 'goal',
    title: 'Monthly distance halfway',
    body: '182 of 250 km. You are 4 days ahead of the pace you need.',
    read: true,
    href: '/goals/goal-monthly-distance',
    hours: 52,
  },
  {
    kind: 'social',
    title: 'Marek followed you',
    body: 'You now have 3 mutual routes in the Foundry district.',
    read: true,
    hours: 61,
  },
  {
    kind: 'summary',
    title: 'Personal best',
    body: 'Fastest 10 km this year — 16.2 km/h average on the Riverside Loop.',
    read: true,
    hours: 74,
  },
  {
    kind: 'route',
    title: 'Closure on North Canal',
    body: 'The towpath is closed between locks 3 and 5 until Friday. A detour is suggested.',
    read: true,
    href: '/explore/place-03',
    hours: 88,
  },
  {
    kind: 'streak',
    title: 'Streak saved',
    body: 'Your 1.6 km coffee run counted. The streak stays alive at 6 days.',
    read: true,
    hours: 96,
  },
  {
    kind: 'system',
    title: 'Units updated',
    body: 'Distances now display in kilometres across the app.',
    read: true,
    href: '/settings',
    hours: 110,
  },
  {
    kind: 'goal',
    title: 'New goal suggested',
    body: 'Based on the last four weeks, 80 km per week looks achievable. Try it?',
    read: true,
    href: '/goals',
    hours: 128,
  },
  {
    kind: 'summary',
    title: 'Month in review',
    body: '328 km, 21 hours moving and 11 400 kcal. Your strongest month so far.',
    read: true,
    hours: 150,
  },
  {
    kind: 'route',
    title: 'Saved place updated',
    body: 'Foundry Coffee now opens at 06:30 on weekdays.',
    read: true,
    href: '/explore/place-10',
    hours: 168,
  },
  {
    kind: 'social',
    title: 'Your route was saved 12 times',
    body: 'Old Town Route is trending in the Cathedral Hill district this week.',
    read: true,
    href: '/explore/place-02',
    hours: 190,
  },
  {
    kind: 'system',
    title: 'Backup complete',
    body: 'All 50 activities are synced to your account.',
    read: true,
    hours: 214,
  },
  {
    kind: 'streak',
    title: '12 week streak',
    body: 'Twelve weeks in a row with at least one activity. Keep it going.',
    read: true,
    href: '/profile',
    hours: 240,
  },
]

export const notifications: AppNotification[] = SEEDS.map((seed, index) => ({
  id: `ntf-${(index + 1).toString().padStart(2, '0')}`,
  kind: seed.kind,
  title: seed.title,
  body: seed.body,
  read: seed.read,
  ...(seed.href ? { href: seed.href } : {}),
  date: hoursAgo(seed.hours),
}))
