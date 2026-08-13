import { useId } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { haptic } from '@/lib/haptics'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
}

export interface SegmentedControlProps<T extends string> {
  value: T
  options: SegmentedOption<T>[]
  onChange: (value: T) => void
  label: string
  className?: string
  size?: 'sm' | 'md'
}

/** Sliding-pill segmented control used for filters, units and theme. */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
  className,
  size = 'md',
}: SegmentedControlProps<T>) {
  const layoutId = useId()
  const reduced = useReducedMotion()

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        'relative flex w-full items-center rounded-full bg-surface-2 p-1',
        size === 'sm' ? 'h-9' : 'h-11',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => {
              if (active) return
              haptic('light')
              onChange(option.value)
            }}
            className={cn(
              'relative z-10 flex-1 rounded-full font-semibold transition-colors duration-200',
              size === 'sm' ? 'h-7 text-[12.5px]' : 'h-9 text-[13.5px]',
              active ? 'text-ink' : 'text-ink-3 hover:text-ink-2',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={
                  reduced ? { duration: 0 } : { type: 'spring', stiffness: 480, damping: 38 }
                }
                className="absolute inset-0 -z-10 rounded-full bg-surface shadow-[var(--shadow-sm)]"
              />
            )}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
