import { motion } from 'framer-motion'
import { Bookmark, Map, Play, TrendingUp, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { haptic } from '@/lib/haptics'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface QuickAction {
  id: string
  label: string
  hint: string
  icon: LucideIcon
  emphasis?: boolean
  onClick: () => void
}

export interface QuickActionsProps {
  actions: QuickAction[]
  className?: string
}

export const QUICK_ACTION_ICONS = { Play, Map, TrendingUp, Bookmark }

export function QuickActions({ actions, className }: QuickActionsProps) {
  const reduced = useReducedMotion()

  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {actions.map((action, index) => {
        const Icon = action.icon
        return (
          <motion.button
            key={action.id}
            type="button"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.05 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            whileTap={reduced ? undefined : { scale: 0.955 }}
            onClick={() => {
              haptic('medium')
              action.onClick()
            }}
            className={cn(
              'group flex flex-col items-start gap-3 rounded-3xl border p-3.5 text-left',
              'transition-colors duration-150',
              action.emphasis
                ? 'border-transparent bg-accent text-accent-ink'
                : 'border-line bg-surface text-ink hover:border-line-strong',
            )}
          >
            <span
              className={cn(
                'grid size-9 place-items-center rounded-xl transition-transform duration-200',
                'group-active:scale-90',
                action.emphasis ? 'bg-accent-ink/10' : 'bg-surface-2',
              )}
            >
              <Icon className="size-[18px]" strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-semibold tracking-[-0.01em]">
                {action.label}
              </span>
              <span
                className={cn(
                  'mt-0.5 block truncate text-[11.5px]',
                  action.emphasis ? 'text-accent-ink/60' : 'text-ink-3',
                )}
              >
                {action.hint}
              </span>
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
