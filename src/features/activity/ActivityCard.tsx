import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bike, ChevronRight, Footprints, Zap } from 'lucide-react'
import type { Activity, ActivityType } from '@/types'
import { cn } from '@/lib/utils'
import { formatDistanceWithUnit, formatDurationShort, formatRelativeDay, formatTime } from '@/lib/format'
import { useUnits } from '@/store/settings-store'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { RouteMap } from '@/components/maps/RouteMap'
import { haptic } from '@/lib/haptics'

export const ACTIVITY_ICONS: Record<ActivityType, typeof Bike> = {
  cycling: Bike,
  running: Zap,
  walking: Footprints,
}

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  cycling: 'Ride',
  running: 'Run',
  walking: 'Walk',
}

export interface ActivityCardProps {
  activity: Activity
  /** Adds a route thumbnail — used on the Activity tab. */
  withMap?: boolean
  index?: number
  className?: string
}

export function ActivityCard({ activity, withMap = false, index = 0, className }: ActivityCardProps) {
  const navigate = useNavigate()
  const units = useUnits()
  const reduced = useReducedMotion()
  const Icon = ACTIVITY_ICONS[activity.type]

  return (
    <motion.button
      type="button"
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, delay: Math.min(index * 0.045, 0.3), ease: [0.22, 1, 0.36, 1] }}
      whileTap={reduced ? undefined : { scale: 0.978 }}
      onClick={() => {
        haptic('light')
        navigate(`/activity/${activity.id}`)
      }}
      className={cn(
        'surface-card flex w-full items-center gap-3.5 p-3 text-left',
        'transition-colors duration-150 hover:border-line-strong',
        className,
      )}
    >
      {withMap ? (
        <RouteMap
          route={activity.route}
          className="size-[62px] shrink-0 rounded-2xl"
          showMarkers={false}
          compact
          label={`Route thumbnail for ${activity.title}`}
        />
      ) : (
        <span className="grid size-[46px] shrink-0 place-items-center rounded-2xl bg-surface-2">
          <Icon className="size-[21px] text-ink" strokeWidth={1.9} aria-hidden="true" />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[15px] font-semibold tracking-[-0.01em]">
            {activity.title}
          </span>
          {activity.isLocal && (
            <span className="shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-[9.5px] font-bold tracking-[0.04em] text-accent-ink">
              NEW
            </span>
          )}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-ink-3">
          <span>{formatRelativeDay(activity.date)}</span>
          <span aria-hidden="true">·</span>
          <span>{formatTime(activity.date)}</span>
          <span aria-hidden="true">·</span>
          <span>{ACTIVITY_LABELS[activity.type]}</span>
        </span>
      </span>

      <span className="shrink-0 text-right">
        <span className="block text-[15px] font-semibold tracking-[-0.02em] tabular">
          {formatDistanceWithUnit(activity.distance, units)}
        </span>
        <span className="mt-0.5 block text-[12.5px] text-ink-3 tabular">
          {formatDurationShort(activity.duration)}
        </span>
      </span>

      <ChevronRight className="size-4 shrink-0 text-ink-3" aria-hidden="true" />
    </motion.button>
  )
}
