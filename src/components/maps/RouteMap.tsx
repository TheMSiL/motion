import { useId, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Route } from '@/types'
import { cn } from '@/lib/utils'
import { toSmoothPath } from '@/lib/route-gen'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { CityBackdrop } from './CityBackdrop'

export interface RouteMapProps {
  route: Route
  className?: string
  /** Draws the route from start to finish on mount. */
  animate?: boolean
  showMarkers?: boolean
  showWaypoints?: boolean
  /** 0–1. When set, only this fraction of the route is drawn (live sessions). */
  progress?: number
  /** Route stroke colour token. */
  tone?: 'ink' | 'accent'
  /** Scales stroke weights for small previews. */
  compact?: boolean
  label?: string
}

const DRAW_DURATION = 1.6

export function RouteMap({
  route,
  className,
  animate = false,
  showMarkers = true,
  showWaypoints = false,
  progress,
  tone = 'ink',
  compact = false,
  label,
}: RouteMapProps) {
  const reduced = useReducedMotion()
  const glowId = useId()
  const seed = useMemo(
    () => route.points.reduce((sum, p, i) => sum + p.x * (i + 1) + p.y, route.points.length),
    [route.points],
  )

  const visiblePoints = useMemo(() => {
    if (progress === undefined) return route.points
    const count = Math.max(2, Math.round(route.points.length * Math.min(1, Math.max(0, progress))))
    return route.points.slice(0, count)
  }, [route.points, progress])

  const fullPath = useMemo(() => toSmoothPath(route.points), [route.points])
  const drawnPath = useMemo(
    () => (progress === undefined ? fullPath : toSmoothPath(visiblePoints)),
    [fullPath, visiblePoints, progress],
  )

  const start = route.points[0]
  const end = route.points[route.points.length - 1]
  const head = visiblePoints[visiblePoints.length - 1]

  const stroke = tone === 'accent' ? 'var(--accent)' : 'var(--ink)'
  const routeWidth = compact ? 2.4 : 2.1
  const glowWidth = compact ? 6 : 5.4
  const shouldDraw = animate && !reduced && progress === undefined

  return (
    <div
      className={cn('relative overflow-hidden bg-[var(--map-bg)]', className)}
      role="img"
      aria-label={label ?? `Route from ${route.startLabel} to ${route.endLabel}`}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <defs>
          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <CityBackdrop seed={Math.round(seed)} muted />

        {/* Ghost of the full route, so a partially-drawn line still reads as a loop. */}
        {progress !== undefined && (
          <path
            d={fullPath}
            fill="none"
            stroke="var(--ink-3)"
            strokeWidth={routeWidth * 0.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.28}
            strokeDasharray="1.5 2.5"
          />
        )}

        {/* Accent halo under the line. */}
        <motion.path
          d={drawnPath}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={glowWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.5}
          filter={`url(#${glowId})`}
          initial={shouldDraw ? { pathLength: 0 } : false}
          animate={shouldDraw ? { pathLength: 1 } : {}}
          transition={{ duration: DRAW_DURATION, ease: [0.32, 0.72, 0.3, 1] }}
        />

        <motion.path
          d={drawnPath}
          fill="none"
          stroke={stroke}
          strokeWidth={routeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={shouldDraw ? { pathLength: 0 } : false}
          animate={shouldDraw ? { pathLength: 1 } : {}}
          transition={{ duration: DRAW_DURATION, ease: [0.32, 0.72, 0.3, 1] }}
        />

        {showWaypoints &&
          route.waypoints.map((waypoint) => (
            <motion.circle
              key={waypoint.label}
              cx={waypoint.x}
              cy={waypoint.y}
              r={compact ? 1.4 : 1.2}
              fill="var(--surface)"
              stroke="var(--ink)"
              strokeWidth="0.8"
              initial={shouldDraw ? { opacity: 0, scale: 0 } : false}
              animate={shouldDraw ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: DRAW_DURATION * 0.5, duration: 0.3 }}
              style={{ transformOrigin: `${waypoint.x}px ${waypoint.y}px` }}
            />
          ))}

        {showMarkers && start && (
          <motion.g
            initial={shouldDraw ? { opacity: 0, scale: 0.4 } : false}
            animate={shouldDraw ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: `${start.x}px ${start.y}px` }}
          >
            <circle cx={start.x} cy={start.y} r={compact ? 3 : 2.6} fill="var(--accent)" />
            <circle cx={start.x} cy={start.y} r={compact ? 1.2 : 1} fill="var(--accent-ink)" />
          </motion.g>
        )}

        {showMarkers && end && progress === undefined && (
          <motion.g
            initial={shouldDraw ? { opacity: 0, y: -4 } : false}
            animate={shouldDraw ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: shouldDraw ? DRAW_DURATION * 0.86 : 0, duration: 0.34 }}
          >
            <circle
              cx={end.x}
              cy={end.y}
              r={compact ? 3 : 2.6}
              fill="var(--ink)"
              stroke="var(--surface)"
              strokeWidth="0.9"
            />
          </motion.g>
        )}

        {/* Live head marker with a soft pulse. */}
        {progress !== undefined && head && (
          <g>
            <motion.circle
              cx={head.x}
              cy={head.y}
              r={3}
              fill="var(--accent)"
              opacity={0.35}
              animate={reduced ? {} : { r: [3, 6, 3], opacity: [0.35, 0, 0.35] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
            <circle
              cx={head.x}
              cy={head.y}
              r={2.2}
              fill="var(--accent)"
              stroke="var(--accent-ink)"
              strokeWidth="0.7"
            />
          </g>
        )}
      </svg>
    </div>
  )
}
