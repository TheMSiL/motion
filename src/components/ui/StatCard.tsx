import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedNumber } from './AnimatedNumber'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface StatCardProps {
  label: string
  value: number
  unit?: string
  decimals?: number
  icon?: LucideIcon
  /** Highlights the single most important metric on the screen. */
  emphasis?: boolean
  delay?: number
  footer?: ReactNode
  className?: string
}

export function StatCard({
  label,
  value,
  unit,
  decimals = 0,
  icon: Icon,
  emphasis,
  delay = 0,
  footer,
  className,
}: StatCardProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'surface-card flex flex-col justify-between p-4',
        emphasis && 'border-transparent bg-accent text-accent-ink shadow-none',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn('text-label', emphasis ? 'text-accent-ink/65' : 'text-ink-3')}>
          {label}
        </span>
        {Icon && (
          <Icon
            className={cn('size-4', emphasis ? 'text-accent-ink/70' : 'text-ink-3')}
            aria-hidden="true"
          />
        )}
      </div>
      <p className="mt-3 flex items-baseline gap-1">
        <AnimatedNumber
          value={value}
          decimals={decimals}
          delay={delay}
          className="text-metric text-[26px] leading-none"
        />
        {unit && (
          <span
            className={cn(
              'text-[13px] font-medium',
              emphasis ? 'text-accent-ink/70' : 'text-ink-3',
            )}
          >
            {unit}
          </span>
        )}
      </p>
      {footer && <div className="mt-2">{footer}</div>}
    </motion.div>
  )
}
