import { useEffect, useId, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface ProgressRingProps {
  /** 0–100. */
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  trackClassName?: string
  /** Delay before the fill animation starts, in seconds. */
  delay?: number
  children?: ReactNode
  /** Ring colour; defaults to the accent token. */
  color?: string
  label?: string
}

export function ProgressRing({
  value,
  size = 132,
  strokeWidth = 10,
  className,
  trackClassName,
  delay = 0.15,
  children,
  color = 'var(--accent)',
  label,
}: ProgressRingProps) {
  const reduced = useReducedMotion()
  const gradientId = useId()
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))

  const progress = useMotionValue(reduced ? clamped : 0)
  const spring = useSpring(progress, { stiffness: 90, damping: 20, mass: 0.9 })
  const offset = useTransform(spring, (v) => circumference - (v / 100) * circumference)

  useEffect(() => {
    if (reduced) {
      progress.set(clamped)
      return
    }
    const timer = window.setTimeout(() => progress.set(clamped), delay * 1000)
    return () => window.clearTimeout(timer)
  }, [clamped, delay, progress, reduced])

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${Math.round(clamped)}% complete`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.72" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={cn('stroke-line', trackClassName)}
          strokeLinecap="round"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {children && <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>}
    </div>
  )
}

export interface ProgressBarProps {
  value: number
  className?: string
  delay?: number
  height?: number
}

export function ProgressBar({ value, className, delay = 0.1, height = 6 }: ProgressBarProps) {
  const reduced = useReducedMotion()
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div
      className={cn('w-full overflow-hidden rounded-full bg-line', className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full bg-accent"
        initial={{ width: reduced ? `${clamped}%` : 0 }}
        animate={{ width: `${clamped}%` }}
        transition={reduced ? { duration: 0 } : { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
