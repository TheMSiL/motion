import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, House, Route as RouteIcon, Target, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { haptic } from '@/lib/haptics'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const TABS = [
  { to: '/', label: 'Home', icon: House },
  { to: '/activity', label: 'Activity', icon: RouteIcon },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/profile', label: 'Profile', icon: User },
] as const

export function BottomNavigation() {
  const location = useLocation()
  const reduced = useReducedMotion()

  return (
    <nav
      aria-label="Primary"
      className="absolute inset-x-0 bottom-0 z-40 border-t border-line bg-surface/92 backdrop-blur-xl"
      style={{ height: 'calc(var(--nav-h) + env(safe-area-inset-bottom, 0px))' }}
    >
      <ul className="flex h-[var(--nav-h)] items-stretch">
        {TABS.map((tab) => {
          const active =
            tab.to === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.to)
          const Icon = tab.icon

          return (
            <li key={tab.to} className="flex-1">
              <NavLink
                to={tab.to}
                onClick={() => haptic('light')}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex h-full flex-col items-center justify-center gap-1 rounded-2xl',
                  'transition-colors duration-150',
                  active ? 'text-ink' : 'text-ink-3 hover:text-ink-2',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="tab-indicator"
                    transition={
                      reduced ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 40 }
                    }
                    className="absolute inset-x-3 top-0 h-[3px] rounded-b-full bg-accent"
                    aria-hidden="true"
                  />
                )}
                <motion.span
                  animate={active && !reduced ? { y: -1, scale: 1.06 } : { y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 30 }}
                >
                  <Icon
                    className="size-[21px]"
                    strokeWidth={active ? 2.3 : 1.8}
                    aria-hidden="true"
                  />
                </motion.span>
                <span
                  className={cn(
                    'text-[10.5px] leading-none tracking-[0.01em]',
                    active ? 'font-semibold' : 'font-medium',
                  )}
                >
                  {tab.label}
                </span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
