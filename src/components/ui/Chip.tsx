import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { haptic } from '@/lib/haptics'

export interface ChipProps {
  children: ReactNode
  active?: boolean
  onClick?: () => void
  icon?: ReactNode
  className?: string
}

/** Horizontal-scroll filter chip. Non-interactive when no handler is given. */
export function Chip({ children, active, onClick, icon, className }: ChipProps) {
  if (!onClick) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-[12.5px] font-medium text-ink-2',
          className,
        )}
      >
        {icon}
        {children}
      </span>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => {
        haptic('light')
        onClick()
      }}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold',
        'transition-colors duration-150',
        active
          ? 'border-transparent bg-surface-inverse text-ink-inverse'
          : 'border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  )
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: 'neutral' | 'accent' | 'positive' | 'inverse'
  className?: string
}) {
  const tones = {
    neutral: 'bg-surface-2 text-ink-2',
    accent: 'bg-accent text-accent-ink',
    positive: 'bg-accent-soft text-ink',
    inverse: 'bg-surface-inverse text-ink-inverse',
  } as const

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-[0.01em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
