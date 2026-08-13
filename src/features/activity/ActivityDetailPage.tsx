import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Flag,
  Heart,
  MapPin,
  Mountain,
  Share2,
  Timer,
  TrendingUp,
  Trash2,
  Wind,
} from 'lucide-react'
import { activityService } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { useUnits } from '@/store/settings-store'
import { useToast } from '@/store/toast-store'
import {
  distanceUnit,
  formatDistance,
  formatDuration,
  formatFullDate,
  formatSpeed,
  formatTime,
  speedUnit,
  toDisplayDistance,
} from '@/lib/format'
import { Screen } from '@/components/layout/Screen'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { IconButton, Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { RouteMap } from '@/components/maps/RouteMap'
import { ElevationChart } from '@/components/charts/GoalChart'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { ShareSheet } from './ShareSheet'
import { ACTIVITY_LABELS } from './ActivityCard'

export default function ActivityDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const units = useUnits()
  const { toast } = useToast()
  const [shareOpen, setShareOpen] = useState(false)

  const { data: activity, loading, error, reload } = useAsync(
    () => activityService.getActivity(id),
    [id],
  )

  if (loading) {
    return (
      <Screen header={<MobileHeader back transparent />}>
        <div className="space-y-4">
          <Skeleton className="h-[46vh] w-full rounded-none" />
          <div className="space-y-4 px-[var(--gutter)]">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 rounded-3xl" />
            <Skeleton className="h-40 rounded-3xl" />
          </div>
        </div>
      </Screen>
    )
  }

  if (error || !activity) {
    return (
      <Screen header={<MobileHeader back title="Activity" />}>
        <ErrorState
          title="Activity not found"
          description="This session may have been deleted or the link is out of date."
          onRetry={reload}
        />
        <div className="px-8">
          <Button variant="secondary" fullWidth onClick={() => navigate('/activity')}>
            Back to all activities
          </Button>
        </div>
      </Screen>
    )
  }

  const details = [
    {
      icon: Mountain,
      label: 'Elevation gain',
      value: `${activity.route.elevationGain} m`,
    },
    {
      icon: Wind,
      label: 'Max speed',
      value: formatSpeed(activity.maxSpeed, units),
    },
    { icon: Heart, label: 'Avg heart rate', value: `${activity.heartRate} bpm` },
    { icon: Timer, label: 'Started', value: formatTime(activity.date) },
  ]

  return (
    <Screen
      fullBleed
      header={
        <MobileHeader
          back
          transparent
          actions={
            <IconButton
              label="Share this activity"
              variant="inverse"
              icon={<Share2 className="size-[18px]" />}
              onClick={() => setShareOpen(true)}
            />
          }
        />
      }
    >
      {/* Hero map — the route draws itself from start to finish on open. */}
      <div className="relative">
        <RouteMap
          route={activity.route}
          animate
          showWaypoints
          className="h-[46vh] min-h-[300px] w-full"
          label={`Map of ${activity.title}`}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--bg)] to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--bg)] to-transparent"
          aria-hidden="true"
        />
      </div>

      <div className="relative -mt-10 space-y-5 px-[var(--gutter)]">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-label text-ink-3">
            {ACTIVITY_LABELS[activity.type]} · {activity.weather}
          </span>
          <h1 className="text-display mt-2 text-[30px]">{activity.title}</h1>
          <p className="mt-1.5 text-[13.5px] text-ink-2">{formatFullDate(activity.date)}</p>
        </motion.header>

        {/* Headline metrics */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: 'Distance',
              value: toDisplayDistance(activity.distance, units),
              decimals: 1,
              unit: distanceUnit(units),
              emphasis: true,
            },
            {
              label: 'Duration',
              value: Math.round(activity.duration / 60),
              decimals: 0,
              unit: 'min',
            },
            {
              label: 'Avg speed',
              value: toDisplayDistance(activity.averageSpeed, units),
              decimals: 1,
              unit: speedUnit(units),
            },
            { label: 'Calories', value: activity.calories, decimals: 0, unit: 'kcal' },
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, delay: 0.06 + index * 0.05 }}
              className={
                metric.emphasis
                  ? 'rounded-[24px] bg-accent p-4 text-accent-ink'
                  : 'surface-card p-4'
              }
            >
              <p
                className={
                  metric.emphasis ? 'text-label text-accent-ink/60' : 'text-label text-ink-3'
                }
              >
                {metric.label}
              </p>
              <p className="mt-2.5 flex items-baseline gap-1">
                <AnimatedNumber
                  value={metric.value}
                  decimals={metric.decimals}
                  delay={0.1 + index * 0.05}
                  className="text-metric text-[28px] leading-none"
                />
                <span
                  className={
                    metric.emphasis
                      ? 'text-[13px] font-medium text-accent-ink/60'
                      : 'text-[13px] font-medium text-ink-3'
                  }
                >
                  {metric.unit}
                </span>
              </p>
            </motion.div>
          ))}
        </div>

        {/* Start and end */}
        <Card padded={false} className="divide-y divide-line">
          <div className="flex items-center gap-3 p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent">
              <MapPin className="size-4 text-accent-ink" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-label text-ink-3">Start</p>
              <p className="truncate text-[14px] font-semibold">{activity.route.startLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-inverse">
              <Flag className="size-4 text-ink-inverse" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-label text-ink-3">Finish</p>
              <p className="truncate text-[14px] font-semibold">{activity.route.endLabel}</p>
            </div>
          </div>
        </Card>

        {/* Secondary details */}
        <div className="grid grid-cols-2 gap-3">
          {details.map((detail) => (
            <div key={detail.label} className="surface-card flex items-center gap-3 p-3.5">
              <detail.icon className="size-4 shrink-0 text-ink-3" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-[11.5px] text-ink-3">{detail.label}</p>
                <p className="truncate text-[14px] font-semibold tabular">{detail.value}</p>
              </div>
            </div>
          ))}
        </div>

        <section aria-labelledby="elevation-heading">
          <h2 id="elevation-heading" className="text-label mb-2 text-ink-3">
            Elevation profile
          </h2>
          <Card padded={false} className="px-2 py-3">
            <ElevationChart profile={activity.route.elevationProfile} />
            <div className="flex items-center justify-between px-3 pt-1 text-[11.5px] text-ink-3">
              <span>{activity.route.startLabel}</span>
              <span className="font-semibold text-ink-2">
                +{activity.route.elevationGain} m climb
              </span>
              <span>{activity.route.endLabel}</span>
            </div>
          </Card>
        </section>

        {activity.splits.length > 0 && (
          <section aria-labelledby="splits-heading">
            <h2 id="splits-heading" className="text-label mb-2 text-ink-3">
              Splits
            </h2>
            <Card padded={false} className="divide-y divide-line">
              {activity.splits.map((split) => {
                const fastest = Math.min(...activity.splits.map((s) => s.seconds))
                const slowest = Math.max(...activity.splits.map((s) => s.seconds))
                const range = slowest - fastest || 1
                const width = 30 + ((slowest - split.seconds) / range) * 70
                return (
                  <div key={split.km} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="w-9 shrink-0 text-[12.5px] font-semibold text-ink-2 tabular">
                      {split.km} {distanceUnit(units)}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <motion.span
                        className="block h-full rounded-full bg-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ duration: 0.6, delay: split.km * 0.03 }}
                      />
                    </span>
                    <span className="w-14 shrink-0 text-right text-[12.5px] font-semibold tabular">
                      {formatDuration(split.seconds)}
                    </span>
                  </div>
                )
              })}
            </Card>
          </section>
        )}

        <div className="flex gap-3 pb-2">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            icon={<Share2 className="size-[18px]" />}
            onClick={() => setShareOpen(true)}
          >
            Share
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={<ArrowUpRight className="size-[18px]" />}
            onClick={() => navigate('/explore?category=routes')}
          >
            Similar routes
          </Button>
        </div>

        {activity.isLocal && (
          <Button
            variant="danger"
            size="lg"
            fullWidth
            icon={<Trash2 className="size-[17px]" />}
            onClick={async () => {
              await activityService.deleteActivity(activity.id)
              toast('Activity deleted', { variant: 'info' })
              navigate('/activity')
            }}
          >
            Delete activity
          </Button>
        )}

        <p className="flex items-center justify-center gap-1.5 pb-4 text-[12px] text-ink-3">
          <TrendingUp className="size-3.5" aria-hidden="true" />
          {formatDistance(activity.distance, units)} {distanceUnit(units)} ·{' '}
          {formatDuration(activity.duration)} · {activity.calories} kcal
        </p>
      </div>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={activity.title}
        distance={activity.distance}
        duration={activity.duration}
        route={activity.route}
      />
    </Screen>
  )
}
