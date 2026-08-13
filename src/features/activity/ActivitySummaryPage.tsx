import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Share2 } from 'lucide-react'
import { activityService } from '@/services'
import { useUnits } from '@/store/settings-store'
import { useToast } from '@/store/toast-store'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { sessionStore, useSession } from '@/store/session-store'
import { distanceUnit, durationParts, formatDuration, speedUnit, toDisplayDistance } from '@/lib/format'
import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { RouteMap } from '@/components/maps/RouteMap'
import { ShareSheet } from './ShareSheet'

export default function ActivitySummaryPage() {
  const session = useSession()
  const navigate = useNavigate()
  const units = useUnits()
  const { toast } = useToast()
  const reduced = useReducedMotion()
  const [shareOpen, setShareOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  // The summary reads a finished session; anything else goes back to Activity.
  useEffect(() => {
    if (session.status !== 'finished') navigate('/activity', { replace: true })
  }, [session.status, navigate])

  // Snapshot the finished session once — resetting it later must not blank the screen.
  const [summary] = useState(() => sessionStore.getSummary())

  async function save() {
    if (saved) return
    setSaving(true)
    try {
      const activity = await activityService.createActivity({
        type: summary.type,
        title: summary.title,
        distance: summary.distance,
        duration: summary.duration,
        calories: summary.calories,
        averageSpeed: summary.averageSpeed,
        route: summary.route,
      })
      setSaved(true)
      toast('Activity saved', {
        description: 'Added to your history',
        action: { label: 'View', onClick: () => navigate(`/activity/${activity.id}`) },
      })
    } catch {
      toast('Could not save the activity', { variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  function done() {
    sessionStore.reset()
    navigate('/activity', { replace: true })
  }

  const metrics = [
    {
      label: 'Distance',
      value: toDisplayDistance(summary.distance, units),
      decimals: 1,
      unit: distanceUnit(units),
    },
    {
      label: 'Duration',
      value: durationParts(summary.duration).value,
      decimals: 0,
      unit: durationParts(summary.duration).unit,
    },
    {
      label: 'Avg speed',
      value: toDisplayDistance(summary.averageSpeed, units),
      decimals: 1,
      unit: speedUnit(units),
    },
    { label: 'Calories', value: summary.calories, decimals: 0, unit: 'kcal' },
  ]

  return (
    <Screen className="bg-[var(--bg)]">
      <div className="flex min-h-full flex-col px-[var(--gutter)] pt-[calc(var(--status-h,0px)+28px)]">
        <motion.div
          initial={reduced ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          className="grid size-14 place-items-center rounded-full bg-accent"
        >
          <Check className="size-7 text-accent-ink" strokeWidth={2.8} aria-hidden="true" />
        </motion.div>

        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="text-display mt-5 text-[38px]"
        >
          Great {summary.type === 'cycling' ? 'ride' : summary.type === 'running' ? 'run' : 'walk'}.
        </motion.h1>
        <p className="mt-2 text-[14px] text-ink-2">
          {formatDuration(summary.duration)} of movement, logged and mapped.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, delay: 0.12 + index * 0.06 }}
              className={
                index === 0 ? 'rounded-[24px] bg-accent p-4 text-accent-ink' : 'surface-card p-4'
              }
            >
              <p className={index === 0 ? 'text-label text-accent-ink/60' : 'text-label text-ink-3'}>
                {metric.label}
              </p>
              <p className="mt-2.5 flex items-baseline gap-1">
                <AnimatedNumber
                  value={metric.value}
                  decimals={metric.decimals}
                  delay={0.2 + index * 0.06}
                  className="text-metric text-[28px] leading-none"
                />
                <span
                  className={
                    index === 0
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

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.34 }}
          className="mt-4"
        >
          <RouteMap
            route={summary.route}
            animate
            className="h-[210px] w-full rounded-[24px] border border-line"
            label="Map of the activity you just finished"
          />
        </motion.div>

        <div className="mt-auto space-y-2.5 py-6">
          <Button size="lg" fullWidth loading={saving} onClick={save} disabled={saved}>
            {saved ? 'Saved to history' : 'Save activity'}
          </Button>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              icon={<Share2 className="size-[18px]" />}
              onClick={() => setShareOpen(true)}
            >
              Share
            </Button>
            <Button variant="ghost" size="lg" fullWidth onClick={done}>
              Done
            </Button>
          </div>
        </div>
      </div>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={summary.title}
        distance={summary.distance}
        duration={summary.duration}
        route={summary.route}
      />
    </Screen>
  )
}
