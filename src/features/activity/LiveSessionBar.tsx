import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { formatClock, formatDistanceWithUnit } from '@/lib/format'
import { useUnits } from '@/store/settings-store'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useSession } from '@/store/session-store'
import { haptic } from '@/lib/haptics'

/**
 * Persistent "session in progress" pill. It keeps a running activity visible
 * while the user browses the rest of the app.
 */
export function LiveSessionBar() {
  const session = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const units = useUnits()
  const reduced = useReducedMotion()

  const onLiveScreen = location.pathname === '/activity/live'
  const visible = (session.status === 'running' || session.status === 'paused') && !onLiveScreen

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -16 }}
          transition={{ type: 'spring', stiffness: 480, damping: 34 }}
          onClick={() => {
            haptic('light')
            navigate('/activity/live')
          }}
          className="absolute inset-x-3 z-[45] flex items-center gap-3 rounded-2xl bg-surface-inverse px-4 py-2.5 text-ink-inverse shadow-[var(--shadow-lift)]"
          style={{ top: 'calc(var(--status-h, 0px) + var(--header-h) + 8px)' }}
        >
          <span className="relative flex size-2.5 shrink-0">
            {session.status === 'running' && !reduced && (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
            )}
            <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
          </span>

          <span className="min-w-0 flex-1 text-left">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-inverse/55">
              {session.status === 'paused' ? 'Paused' : 'Recording'}
            </span>
            <span className="block truncate text-[13.5px] font-semibold tabular">
              {formatClock(session.elapsed)} · {formatDistanceWithUnit(session.distance, units)}
            </span>
          </span>

          <ChevronRight className="size-4 shrink-0 text-ink-inverse/60" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
