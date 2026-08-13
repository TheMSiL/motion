import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown, Flag, Flame, Gauge, Pause, Play, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { haptic } from '@/lib/haptics'
import {
  distanceUnit,
  formatClock,
  formatPace,
  speedUnit,
  toDisplayDistance,
} from '@/lib/format'
import { useUnits } from '@/store/settings-store'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { sessionStore, useSession } from '@/store/session-store'
import { Screen } from '@/components/layout/Screen'
import { Button, IconButton } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { RouteMap } from '@/components/maps/RouteMap'
import { ACTIVITY_LABELS } from './ActivityCard'

export default function LiveActivityPage() {
  const session = useSession()
  const navigate = useNavigate()
  const units = useUnits()
  const reduced = useReducedMotion()
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Landing here without a session (deep link, reload) goes back to Activity.
  useEffect(() => {
    if (session.status === 'idle') navigate('/activity', { replace: true })
  }, [session.status, navigate])

  const running = session.status === 'running'

  function finish() {
    haptic('success')
    sessionStore.finish()
    setConfirmOpen(false)
    navigate('/activity/summary', { replace: true })
  }

  const metrics = [
    {
      icon: Gauge,
      label: 'Speed',
      value: toDisplayDistance(session.speed, units).toFixed(1),
      unit: speedUnit(units),
    },
    {
      icon: Flame,
      label: 'Calories',
      value: Math.round(session.calories).toString(),
      unit: 'kcal',
    },
    {
      icon: Timer,
      label: 'Pace',
      value: formatPace(session.elapsed, session.distance, units).split(' ')[0] ?? '--:--',
      unit: `/${distanceUnit(units)}`,
    },
  ]

  return (
    // The recording screen is always dark, in both themes: it is a heads-up
    // display meant to be readable at a glance, outdoors, mid-ride.
    <Screen fullBleed className="bg-[#0c0d0f]" contentClassName="bg-[#0c0d0f]">
      <div className="relative flex h-full flex-col bg-[#0c0d0f] text-white">
        <header
          className="flex shrink-0 items-center justify-between px-[var(--gutter)] pb-2"
          style={{ paddingTop: 'calc(var(--status-h, 0px) + 12px)' }}
        >
          <IconButton
            label="Minimise the session"
            variant="ghost"
            icon={<ChevronDown className="size-5 text-white" />}
            onClick={() => navigate('/activity')}
            className="hover:bg-white/10"
          />
          <span className="flex items-center gap-2">
            <span className="relative flex size-2 shrink-0">
              {running && !reduced && (
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
              )}
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
              {running ? 'Live activity' : 'Paused'}
            </span>
          </span>
          <span className="w-10" aria-hidden="true" />
        </header>

        <div className="flex min-h-0 flex-1 flex-col justify-center px-[var(--gutter)] pb-2">
          <div className="text-center">
            <p className="text-label text-white/45">
              {ACTIVITY_LABELS[session.type]} in progress
            </p>
            <p
              className={cn(
                'mt-3 text-[60px] font-semibold leading-none tracking-[-0.045em] tabular',
                !running && 'opacity-55',
              )}
              aria-live="off"
            >
              {formatClock(session.elapsed)}
            </p>
            <p className="mt-5 flex items-baseline justify-center gap-2">
              <span className="text-[46px] font-semibold leading-none tracking-[-0.04em] text-accent tabular">
                {toDisplayDistance(session.distance, units).toFixed(2)}
              </span>
              <span className="text-[17px] font-semibold text-white/55">
                {distanceUnit(units)}
              </span>
            </p>
          </div>

          <RouteMap
            route={session.route}
            progress={session.progress}
            tone="accent"
            className="map-night mt-7 min-h-[180px] w-full flex-1 rounded-[24px] border border-white/10"
            label="Live route being recorded"
          />

          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-center"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <metric.icon className="size-3.5 text-white/40" aria-hidden="true" />
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white/45">
                    {metric.label}
                  </span>
                </span>
                <p className="mt-2 text-[21px] font-semibold leading-none tracking-[-0.02em] tabular">
                  {metric.value}
                </p>
                <p className="mt-1.5 text-[10.5px] font-medium text-white/40">{metric.unit}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex shrink-0 items-center gap-3 px-[var(--gutter)] pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+24px)]"
        >
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              haptic('medium')
              if (running) sessionStore.pause()
              else sessionStore.resume()
            }}
            className="flex h-16 flex-1 items-center justify-center gap-2.5 rounded-[22px] border border-white/15 bg-white/10 text-[15px] font-semibold text-white"
          >
            {running ? (
              <>
                <Pause className="size-[18px]" aria-hidden="true" />
                Pause
              </>
            ) : (
              <>
                <Play className="size-[18px]" aria-hidden="true" />
                Resume
              </>
            )}
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              haptic('warning')
              setConfirmOpen(true)
            }}
            className="flex h-16 flex-1 items-center justify-center gap-2.5 rounded-[22px] bg-accent text-[15px] font-semibold text-accent-ink"
          >
            <Flag className="size-[18px]" aria-hidden="true" />
            Finish
          </motion.button>
        </div>

        <BottomSheet
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Finish this activity?"
          description="Your session will be saved with everything recorded so far."
          footer={
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => setConfirmOpen(false)}
              >
                Keep going
              </Button>
              <Button size="lg" fullWidth onClick={finish}>
                Finish
              </Button>
            </div>
          }
        >
          <dl className="grid grid-cols-3 gap-3 text-center">
            {[
              { term: 'Time', value: formatClock(session.elapsed) },
              {
                term: 'Distance',
                value: `${toDisplayDistance(session.distance, units).toFixed(1)} ${distanceUnit(units)}`,
              },
              { term: 'Calories', value: `${Math.round(session.calories)}` },
            ].map((item) => (
              <div key={item.term} className="rounded-2xl bg-surface-2 px-2 py-3">
                <dt className="text-label text-ink-3">{item.term}</dt>
                <dd className="mt-1.5 text-[15px] font-semibold tabular">{item.value}</dd>
              </div>
            ))}
          </dl>
        </BottomSheet>
      </div>
    </Screen>
  )
}
