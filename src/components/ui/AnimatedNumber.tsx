import { useEffect, useRef } from 'react'
import { animate, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface AnimatedNumberProps {
  value: number
  decimals?: number
  duration?: number
  delay?: number
  className?: string
  prefix?: string
  suffix?: string
}

const formatters = new Map<number, Intl.NumberFormat>()

/** Grouped thousands, fixed decimals — "4,126" and "12.4" in one place. */
function format(value: number, decimals: number) {
  let formatter = formatters.get(decimals)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-GB', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    formatters.set(decimals, formatter)
  }
  return formatter.format(value)
}

/**
 * Counts up to `value` when the element scrolls into view. Values are written
 * straight to the DOM node so the count-up never triggers a React re-render.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 0.9,
  delay = 0,
  className,
  prefix = '',
  suffix = '',
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const reduced = useReducedMotion()
  const previous = useRef(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (reduced || !inView) {
      if (reduced || previous.current === value) {
        node.textContent = `${prefix}${format(value, decimals)}${suffix}`
        previous.current = value
      }
      return
    }

    const from = previous.current
    previous.current = value

    const controls = animate(from, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = `${prefix}${format(latest, decimals)}${suffix}`
      },
    })
    return () => controls.stop()
  }, [value, decimals, duration, delay, inView, reduced, prefix, suffix])

  return (
    <span ref={ref} className={cn('tabular', className)}>
      {prefix}
      {format(reduced ? value : 0, decimals)}
      {suffix}
    </span>
  )
}
