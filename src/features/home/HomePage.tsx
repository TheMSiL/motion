import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Bell,
  Bookmark,
  ChevronRight,
  Flame,
  Footprints,
  Map,
  Play,
  Route as RouteIcon,
  Search,
  Timer,
  TrendingUp,
} from 'lucide-react'
import type { DailyActivity } from '@/types'
import { activityService } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { useUnits } from '@/store/settings-store'
import { useNotifications } from '@/store/notification-store'
import { useToast } from '@/store/toast-store'
import { userService } from '@/services'
import { distanceUnit, toDisplayDistance } from '@/lib/format'
import { openCommandPalette } from '@/features/search/command-palette-bus'
import { Screen } from '@/components/layout/Screen'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { Avatar } from '@/components/ui/Avatar'
import { IconButton } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { ActivityCard } from '@/features/activity/ActivityCard'
import { StartActivitySheet } from '@/features/activity/StartActivitySheet'
import { HeroCard } from './HeroCard'
import { QuickActions } from './QuickActions'
import {
  ActivityCardSkeleton,
  ChartSkeleton,
  Skeleton,
  StatRowSkeleton,
} from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'

/* The charting library is heavy; keep it out of the first paint. */
const ActivityChart = lazy(() =>
  import('@/components/charts/ActivityChart').then((module) => ({
    default: module.ActivityChart,
  })),
)

const DAILY_GOAL_KM = 15

function greeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function HomePage() {
  const navigate = useNavigate()
  const units = useUnits()
  const { toast } = useToast()
  const { unreadCount } = useNotifications()
  const [startOpen, setStartOpen] = useState(false)

  const user = useMemo(() => userService.getUserSync(), [])
  const firstName = user.name.split(' ')[0] ?? user.name

  const totals = useAsync(() => activityService.getDayTotals(), [])
  const weekly = useAsync(() => activityService.getWeeklySeries(), [])
  const trend = useAsync(() => activityService.getWeeklyTrend(), [])
  const recent = useAsync(() => activityService.getActivities({ limit: 3 }), [])

  const quickActions = [
    {
      id: 'start',
      label: 'Start ride',
      hint: 'Track live',
      icon: Play,
      emphasis: true,
      onClick: () => setStartOpen(true),
    },
    {
      id: 'plan',
      label: 'Plan route',
      hint: 'Popular loops',
      icon: Map,
      onClick: () => navigate('/explore?category=routes'),
    },
    {
      id: 'activity',
      label: 'Activity',
      hint: 'Full history',
      icon: TrendingUp,
      onClick: () => navigate('/activity'),
    },
    {
      id: 'saved',
      label: 'Saved places',
      hint: 'Your shortlist',
      icon: Bookmark,
      onClick: () => navigate('/explore/saved'),
    },
  ]

  const weeklyTotal = useMemo(
    () => (weekly.data ?? []).reduce((sum, day) => sum + day.distance, 0),
    [weekly.data],
  )

  function onSelectDay(day: DailyActivity) {
    if (day.trips === 0) {
      toast('Rest day', { variant: 'info', description: `No activity logged on ${day.fullLabel}` })
    }
  }

  return (
    <Screen
      withNav
      header={
        <MobileHeader
          transparent={false}
          leading={
            <span className="flex-1 text-[14px] font-bold tracking-[0.2em]">MOTION</span>
          }
          actions={
            <>
              <IconButton
                label="Search"
                variant="ghost"
                icon={<Search className="size-[19px]" />}
                onClick={openCommandPalette}
              />
              <IconButton
                label={
                  unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
                }
                variant="ghost"
                icon={<Bell className="size-[19px]" />}
                badge={unreadCount > 0}
                onClick={() => navigate('/notifications')}
              />
              <Link to="/profile" aria-label="Open your profile" className="rounded-full">
                <Avatar initials={user.initials} name={user.name} size={34} ring />
              </Link>
            </>
          }
        />
      }
    >
      <div className="space-y-6 px-[var(--gutter)] pt-4">
        <section aria-labelledby="today-heading" className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 id="today-heading" className="text-display text-[30px]">
                {greeting()}, {firstName}.
              </h2>
              <p className="mt-1.5 text-[13.5px] text-ink-2">
                Here is how today is going so far.
              </p>
            </div>
          </div>

          {totals.error || trend.error ? (
            <ErrorState onRetry={totals.reload} />
          ) : totals.loading || trend.loading ? (
            <Skeleton className="h-[196px] rounded-[28px]" />
          ) : (
            <HeroCard
              distance={totals.data?.distance ?? 0}
              goal={DAILY_GOAL_KM}
              trend={trend.data ?? 0}
            />
          )}

          {totals.loading ? (
            <StatRowSkeleton />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Distance"
                value={toDisplayDistance(totals.data?.distance ?? 0, units)}
                unit={distanceUnit(units)}
                decimals={1}
                icon={RouteIcon}
                delay={0.02}
              />
              <StatCard
                label="Active time"
                value={Math.round((totals.data?.duration ?? 0) / 60)}
                unit="min"
                icon={Timer}
                delay={0.06}
              />
              <StatCard
                label="Calories"
                value={totals.data?.calories ?? 0}
                unit="kcal"
                icon={Flame}
                delay={0.1}
              />
              <StatCard
                label="Trips"
                value={totals.data?.trips ?? 0}
                icon={Footprints}
                delay={0.14}
              />
            </div>
          )}
        </section>

        <section aria-labelledby="quick-heading">
          <h2 id="quick-heading" className="text-label mb-3 text-ink-3">
            Quick actions
          </h2>
          <QuickActions actions={quickActions} />
        </section>

        <section aria-labelledby="week-heading">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 id="week-heading" className="text-label text-ink-3">
                Weekly activity
              </h2>
              <p className="mt-1 text-[15px] font-semibold tracking-[-0.02em] tabular">
                {toDisplayDistance(weeklyTotal, units).toFixed(1)} {distanceUnit(units)}
                <span className="ml-1.5 text-[12.5px] font-medium text-ink-3">last 7 days</span>
              </p>
            </div>
            <Link
              to="/goals"
              className="flex items-center gap-0.5 rounded-lg py-1 text-[13px] font-semibold text-ink-2 transition-colors hover:text-ink"
            >
              Goals
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          {weekly.loading ? (
            <ChartSkeleton />
          ) : weekly.error ? (
            <ErrorState onRetry={weekly.reload} />
          ) : (
            <Card padded={false} className="px-2 pb-3 pt-1">
              <Suspense fallback={<div className="h-[168px]" />}>
                <ActivityChart data={weekly.data ?? []} onSelectDay={onSelectDay} />
              </Suspense>
            </Card>
          )}
        </section>

        <section aria-labelledby="recent-heading">
          <div className="mb-3 flex items-end justify-between">
            <h2 id="recent-heading" className="text-label text-ink-3">
              Recent activity
            </h2>
            <Link
              to="/activity"
              className="flex items-center gap-0.5 rounded-lg py-1 text-[13px] font-semibold text-ink-2 transition-colors hover:text-ink"
            >
              See all
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          {recent.loading ? (
            <div className="space-y-2.5">
              <ActivityCardSkeleton />
              <ActivityCardSkeleton />
              <ActivityCardSkeleton />
            </div>
          ) : recent.error ? (
            <ErrorState onRetry={recent.reload} />
          ) : (
            <motion.ul className="space-y-2.5">
              {(recent.data ?? []).map((activity, index) => (
                <li key={activity.id}>
                  <ActivityCard activity={activity} index={index} />
                </li>
              ))}
            </motion.ul>
          )}
        </section>
      </div>

      <StartActivitySheet open={startOpen} onClose={() => setStartOpen(false)} />
    </Screen>
  )
}
