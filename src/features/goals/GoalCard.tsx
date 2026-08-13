import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, ChevronRight, Flame } from 'lucide-react'
import type { Goal } from '@/types'
import { cn } from '@/lib/utils'
import { haptic } from '@/lib/haptics'
import { formatDeadline } from '@/lib/format'
import { goalProgress, goalRemaining } from '@/data/goals'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ProgressRing } from '@/components/ui/ProgressRing'

export interface GoalCardProps {
  goal: Goal
  index?: number
  /** The lead card gets the larger, emphasised treatment. */
  featured?: boolean
}

export function GoalCard({ goal, index = 0, featured }: GoalCardProps) {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const percent = goalProgress(goal)
  const complete = goal.status === 'completed' || percent >= 100
  const isStreak = goal.metric === 'streak'

  return (
    <motion.button
      type="button"
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay: Math.min(index * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      onClick={() => {
        haptic('light')
        navigate(`/goals/${goal.id}`)
      }}
      className={cn(
        'w-full rounded-[26px] border p-4 text-left transition-colors duration-150',
        featured
          ? 'border-transparent bg-surface-inverse text-ink-inverse'
          : 'border-line bg-surface hover:border-line-strong',
      )}
    >
      <div className="flex items-center gap-4">
        <ProgressRing
          value={percent}
          size={featured ? 84 : 68}
          strokeWidth={featured ? 8 : 7}
          delay={0.15 + index * 0.06}
          trackClassName={featured ? 'stroke-white/12' : undefined}
          label={`${goal.title}: ${percent}% complete`}
          className="shrink-0"
        >
          {isStreak ? (
            <Flame
              className={cn(featured ? 'size-6' : 'size-5', 'text-accent')}
              aria-hidden="true"
            />
          ) : complete ? (
            <Check className="size-5 text-accent" strokeWidth={3} aria-hidden="true" />
          ) : (
            <span
              className={cn(
                'font-semibold leading-none tracking-[-0.03em] tabular',
                featured ? 'text-[19px]' : 'text-[15px]',
              )}
            >
              {percent}%
            </span>
          )}
        </ProgressRing>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                'truncate font-semibold tracking-[-0.015em]',
                featured ? 'text-[16px]' : 'text-[15px]',
              )}
            >
              {goal.title}
            </h3>
            {complete && (
              <span className="shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-[9.5px] font-bold tracking-[0.04em] text-accent-ink">
                DONE
              </span>
            )}
          </div>

          <p
            className={cn(
              'mt-1 text-[19px] font-semibold tracking-[-0.02em] tabular',
              featured ? 'text-ink-inverse' : 'text-ink',
            )}
          >
            {goal.current.toLocaleString('en-GB')}
            <span className={cn('text-[13px] font-medium', featured ? 'text-ink-inverse/50' : 'text-ink-3')}>
              {' '}
              / {goal.target.toLocaleString('en-GB')} {goal.unit}
            </span>
          </p>

          <p
            className={cn(
              'mt-1 truncate text-[12.5px]',
              featured ? 'text-ink-inverse/55' : 'text-ink-3',
            )}
          >
            {complete
              ? 'Goal complete'
              : `${goalRemaining(goal)} ${goal.unit} to go · ${formatDeadline(goal.deadline)}`}
          </p>
        </div>

        <ChevronRight
          className={cn('size-4 shrink-0', featured ? 'text-ink-inverse/40' : 'text-ink-3')}
          aria-hidden="true"
        />
      </div>
    </motion.button>
  )
}
