import type { ReactNode } from 'react'
import { motion, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export type TransitionKind = 'push' | 'pop' | 'tab' | 'none'

const SPRING = { duration: 0.32, ease: [0.32, 0.72, 0.3, 1] } as const

const VARIANTS: Record<Exclude<TransitionKind, 'none'>, Variants> = {
  push: {
    initial: { x: '26%', opacity: 0.4 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-14%', opacity: 0 },
  },
  pop: {
    initial: { x: '-14%', opacity: 0.4 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '26%', opacity: 0 },
  },
  tab: {
    initial: { opacity: 0, y: 8, scale: 0.995 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -4, scale: 0.995 },
  },
}

export interface PageTransitionProps {
  kind: TransitionKind
  children: ReactNode
  className?: string
}

/**
 * Wraps a routed screen. Pages are absolutely positioned so the outgoing and
 * incoming screens overlap the way they do in a native stack.
 */
export function PageTransition({ kind, children, className }: PageTransitionProps) {
  const reduced = useReducedMotion()
  const variants = kind === 'none' ? undefined : VARIANTS[kind]

  if (reduced || !variants) {
    return <div className={cn('absolute inset-0', className)}>{children}</div>
  }

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={SPRING}
      className={cn('absolute inset-0', className)}
    >
      {children}
    </motion.div>
  )
}
