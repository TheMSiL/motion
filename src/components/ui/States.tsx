import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
  secondaryAction?: { label: string; onClick: () => void }
  className?: string
  children?: ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn('flex flex-col items-center px-6 py-12 text-center', className)}
    >
      <span className="relative mb-5 inline-flex size-16 items-center justify-center rounded-3xl bg-surface-2">
        <span
          className="absolute inset-0 rounded-3xl border border-line"
          aria-hidden="true"
        />
        <Icon className="size-7 text-ink-3" aria-hidden="true" />
      </span>
      <h2 className="text-[17px] font-semibold tracking-[-0.02em]">{title}</h2>
      <p className="mt-1.5 max-w-[280px] text-[13.5px] leading-relaxed text-ink-2">{description}</p>
      {children}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-col items-stretch gap-2 self-stretch px-2">
          {action && (
            <Button onClick={action.onClick} fullWidth>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick} fullWidth>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}

export interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this right now. Check your connection and try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title={title}
      description={description}
      className={className}
      {...(onRetry ? { action: { label: 'Try again', onClick: onRetry } } : {})}
    />
  )
}
