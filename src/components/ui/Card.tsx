import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { haptic } from '@/lib/haptics'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean
  children: ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, padded = true, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('surface-card overflow-hidden', padded && 'p-4', className)}
      {...rest}
    >
      {children}
    </div>
  )
})

export interface PressableCardProps {
  onClick?: () => void
  className?: string
  children: ReactNode
  /** Rendered as a plain div when there is no action attached. */
  as?: 'button' | 'div'
  label?: string
  disabled?: boolean
}

/** Card with the app's standard press feedback: scale down, spring back. */
export function PressableCard({
  onClick,
  className,
  children,
  label,
  disabled,
}: PressableCardProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      aria-label={label}
      whileTap={disabled ? undefined : { scale: 0.975 }}
      transition={{ type: 'spring', stiffness: 560, damping: 30 }}
      onClick={() => {
        if (disabled) return
        haptic('light')
        onClick?.()
      }}
      className={cn(
        'surface-card block w-full overflow-hidden p-4 text-left',
        'transition-colors duration-150 hover:border-line-strong disabled:opacity-50',
        className,
      )}
    >
      {children}
    </motion.button>
  )
}
