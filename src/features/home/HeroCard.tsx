import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { distanceUnit, formatDistance, toDisplayDistance } from '@/lib/format'
import { useUnits } from '@/store/settings-store'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { ProgressRing } from '@/components/ui/ProgressRing'

export interface HeroCardProps {
  distance: number
  goal: number
  trend: number
  className?: string
}

/** The single most important card in the product: today at a glance. */
export function HeroCard({ distance, goal, trend, className }: HeroCardProps) {
  const units = useUnits()
  const reduced = useReducedMotion()
  const percent = goal > 0 ? Math.min(100, (distance / goal) * 100) : 0
  const Trend = trend < 0 ? TrendingDown : TrendingUp

  return (
    <motion.section
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="hero-title"
      className={cn(
        'relative overflow-hidden rounded-[28px] bg-surface-inverse p-5 text-ink-inverse',
        className,
      )}
    >
      {/* Soft accent wash, kept subtle so the accent stays meaningful. */}
      <span
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-accent/12 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 id="hero-title" className="text-label text-ink-inverse/55">
            Today&apos;s activity
          </h2>

          <p className="mt-3 flex items-baseline gap-1.5">
            <AnimatedNumber
              value={toDisplayDistance(distance, units)}
              decimals={1}
              duration={1.1}
              className="text-display text-[52px]"
            />
            <span className="text-[19px] font-semibold uppercase tracking-[-0.01em] text-ink-inverse/55">
              {distanceUnit(units)}
            </span>
          </p>

          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
            <Trend className="size-3.5 text-accent" aria-hidden="true" />
            <span className="text-[12.5px] font-semibold text-ink-inverse">
              {trend >= 0 ? '+' : ''}
              {trend}%
            </span>
            <span className="text-[12.5px] text-ink-inverse/55">vs last week</span>
          </p>
        </div>

        <ProgressRing
          value={percent}
          size={104}
          strokeWidth={9}
          trackClassName="stroke-white/12"
          delay={0.35}
          label={`Daily goal ${formatDistance(distance, units)} of ${formatDistance(goal, units)} ${distanceUnit(units)}`}
          className="shrink-0"
        >
          <span className="text-[19px] font-semibold leading-none tracking-[-0.03em] tabular">
            {Math.round(percent)}%
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-inverse/50">
            of goal
          </span>
        </ProgressRing>
      </div>

      <div className="relative mt-5 flex items-center justify-between border-t border-white/10 pt-3.5">
        <span className="text-[12.5px] text-ink-inverse/55">Daily goal</span>
        <span className="text-[13px] font-semibold tabular">
          {formatDistance(distance, units)} / {formatDistance(goal, units)}{' '}
          {distanceUnit(units)}
        </span>
      </div>
    </motion.section>
  )
}
