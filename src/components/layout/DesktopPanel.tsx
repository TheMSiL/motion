import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, House, Moon, Route as RouteIcon, Sun, Target, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'
import { Chip } from '@/components/ui/Chip'

const SCREENS = [
  { to: '/', label: 'Home', icon: House },
  { to: '/activity', label: 'Activity', icon: RouteIcon },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/profile', label: 'Profile', icon: User },
] as const

const CAPABILITIES = [
  'Gesture-driven bottom sheets',
  'Animated route rendering',
  'Live session tracking',
  'Offline-first local state',
  'Full dark mode',
  'Reduced-motion support',
]

const STACK = ['React', 'TypeScript', 'Vite', 'Tailwind', 'Framer Motion', 'Recharts']

/**
 * The desktop companion panel. It frames the product and lets a reviewer jump
 * between screens — the app inside the device frame keeps running normally.
 */
export function DesktopPanel() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, resolvedTheme, toggleTheme } = useTheme()

  const activePath = location.pathname

  return (
    <aside className="hidden max-w-[440px] flex-1 lg:block">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-surface-inverse text-[15px] font-bold tracking-[-0.04em] text-ink-inverse">
            M
          </span>
          <div>
            <p className="text-[15px] font-bold tracking-[0.16em]">MOTION</p>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-ink-3">
              MOVE MORE. LIVE BETTER.
            </p>
          </div>
        </div>

        <h1 className="text-display mt-10 text-[52px]">
          A mobility app
          <br />
          built for the
          <br />
          <span className="relative inline-block">
            <span className="relative z-10">street.</span>
            {/* Marker swash under the word — kept below the baseline so it
                reads as an underline rather than a strikethrough. */}
            <span
              className="absolute -inset-x-1 -bottom-2.5 z-0 h-2 rounded-xs bg-accent"
              aria-hidden="true"
            />
          </span>
        </h1>

        <p className="mt-6 max-w-[380px] text-[15px] leading-relaxed text-ink-2">
          MOTION tracks rides, walks and runs, turns them into weekly goals, and helps people find
          the good routes in their own city. Everything you see runs on the same mobile canvas —
          390 × 844 — with no desktop rewrite.
        </p>

        <div className="mt-9">
          <p className="text-label text-ink-3">Jump to a screen</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SCREENS.map((screen) => {
              const active =
                screen.to === '/' ? activePath === '/' : activePath.startsWith(screen.to)
              const Icon = screen.icon
              return (
                <Chip
                  key={screen.to}
                  active={active}
                  onClick={() => navigate(screen.to)}
                  icon={<Icon className="size-3.5" aria-hidden="true" />}
                >
                  {screen.label}
                </Chip>
              )
            })}
          </div>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-x-6 gap-y-2.5">
          {CAPABILITIES.map((capability) => (
            <div key={capability} className="flex items-start gap-2">
              <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              <span className="text-[13.5px] leading-snug text-ink-2">{capability}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
          <div className="flex flex-wrap gap-1.5">
            {STACK.map((item) => (
              <span
                key={item}
                className="rounded-full border border-line px-2.5 py-1 text-[11.5px] font-medium text-ink-3"
              >
                {item}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}
            className={cn(
              'grid size-10 shrink-0 place-items-center rounded-full border border-line',
              'bg-surface text-ink-2 transition-colors hover:text-ink',
            )}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="size-[18px]" aria-hidden="true" />
            ) : (
              <Moon className="size-[18px]" aria-hidden="true" />
            )}
          </button>
        </div>

        <p className="mt-4 text-[12px] text-ink-3">
          Theme preference: <span className="font-semibold text-ink-2">{theme}</span> ·
        </p>
      </motion.div>
    </aside>
  )
}
