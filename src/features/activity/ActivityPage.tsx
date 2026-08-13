import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Bike, Plus, Route as RouteIcon, Search } from 'lucide-react'
import type { Activity, ActivityType } from '@/types'
import { activityService } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { useUnits } from '@/store/settings-store'
import { formatDistance, formatDurationShort, formatRelativeDay, isoDate } from '@/lib/format'
import { distanceUnit } from '@/lib/format'
import { openCommandPalette } from '@/features/search/command-palette-bus'
import { Screen } from '@/components/layout/Screen'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { IconButton } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { ActivityCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { ActivityCard } from './ActivityCard'
import { StartActivitySheet } from './StartActivitySheet'

type Filter = ActivityType | 'all'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'cycling', label: 'Rides' },
  { value: 'running', label: 'Runs' },
  { value: 'walking', label: 'Walks' },
]

/** Groups activities under Today / Yesterday / weekday / date headings. */
function groupByDay(activities: Activity[]) {
  const groups = new Map<string, { label: string; items: Activity[] }>()
  activities.forEach((activity) => {
    const key = isoDate(new Date(activity.date))
    const existing = groups.get(key)
    if (existing) existing.items.push(activity)
    else groups.set(key, { label: formatRelativeDay(activity.date), items: [activity] })
  })
  return Array.from(groups.entries()).map(([key, value]) => ({ key, ...value }))
}

export default function ActivityPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [startOpen, setStartOpen] = useState(false)
  const units = useUnits()

  const { data, loading, error, reload } = useAsync(
    () => activityService.getActivities({ type: filter }),
    [filter],
  )

  const activities = useMemo(() => data ?? [], [data])
  const groups = useMemo(() => groupByDay(activities), [activities])

  const totals = useMemo(
    () => ({
      distance: activities.reduce((sum, a) => sum + a.distance, 0),
      duration: activities.reduce((sum, a) => sum + a.duration, 0),
      count: activities.length,
    }),
    [activities],
  )

  return (
    <Screen
      withNav
      header={
        <MobileHeader
          title="Activity"
          subtitle={`${totals.count} sessions recorded`}
          actions={
            <>
              <IconButton
                label="Search activities"
                variant="ghost"
                icon={<Search className="size-[19px]" />}
                onClick={openCommandPalette}
              />
              <IconButton
                label="Start a new activity"
                variant="primary"
                icon={<Plus className="size-5" />}
                onClick={() => setStartOpen(true)}
              />
            </>
          }
        />
      }
    >
      <div className="space-y-5 px-[var(--gutter)] pt-4">
        <div className="surface-card grid grid-cols-3 divide-x divide-line p-0">
          {[
            { label: 'Distance', value: `${formatDistance(totals.distance, units, 0)}`, unit: distanceUnit(units) },
            { label: 'Time', value: formatDurationShort(totals.duration), unit: '' },
            { label: 'Sessions', value: `${totals.count}`, unit: '' },
          ].map((stat) => (
            <div key={stat.label} className="px-3 py-3.5 text-center">
              <p className="text-label text-ink-3">{stat.label}</p>
              <p className="mt-1.5 text-[17px] font-semibold tracking-[-0.02em] tabular">
                {stat.value}
                {stat.unit && <span className="ml-0.5 text-[12px] text-ink-3">{stat.unit}</span>}
              </p>
            </div>
          ))}
        </div>

        <SegmentedControl
          label="Filter activities by type"
          value={filter}
          options={FILTERS}
          onChange={setFilter}
        />

        {loading ? (
          <div className="space-y-2.5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ActivityCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState onRetry={reload} />
        ) : activities.length === 0 ? (
          <EmptyState
            icon={filter === 'all' ? RouteIcon : Bike}
            title="No activities yet"
            description={
              filter === 'all'
                ? 'Start your first session and it will show up here with the full route and stats.'
                : `Nothing recorded for this activity type yet. Try another filter or start a session.`
            }
            action={{ label: 'Start an activity', onClick: () => setStartOpen(true) }}
            {...(filter !== 'all'
              ? { secondaryAction: { label: 'Show all activities', onClick: () => setFilter('all') } }
              : {})}
          />
        ) : (
          <div className="space-y-6">
            {groups.map((group, groupIndex) => (
              <section key={group.key} aria-label={group.label}>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-label mb-2.5 text-ink-3"
                >
                  {group.label}
                </motion.h2>
                <ul className="space-y-2.5">
                  {group.items.map((activity, index) => (
                    <li key={activity.id}>
                      <ActivityCard
                        activity={activity}
                        withMap
                        index={groupIndex === 0 ? index : 0}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      <StartActivitySheet open={startOpen} onClose={() => setStartOpen(false)} />
    </Screen>
  )
}
