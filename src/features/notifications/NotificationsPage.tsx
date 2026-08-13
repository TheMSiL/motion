import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  BellOff,
  CalendarCheck,
  Flame,
  MapPin,
  Settings2,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { AppNotification, NotificationKind } from '@/types'
import { cn } from '@/lib/utils'
import { haptic } from '@/lib/haptics'
import { formatTimeAgo } from '@/lib/format'
import { useNotifications } from '@/store/notification-store'
import { useToast } from '@/store/toast-store'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Screen } from '@/components/layout/Screen'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/States'

const ICONS: Record<NotificationKind, LucideIcon> = {
  goal: Target,
  summary: CalendarCheck,
  streak: Flame,
  route: MapPin,
  social: Users,
  system: Settings2,
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { notifications, unreadCount, markRead, markAllRead, dismiss, clearAll } =
    useNotifications()
  const { toast } = useToast()
  const reduced = useReducedMotion()

  // Opening the centre marks everything as seen — but only after a short beat,
  // so the unread highlights are still visible when the screen appears.
  useEffect(() => {
    if (unreadCount === 0) return
    const timer = window.setTimeout(() => markAllRead(), 1400)
    return () => window.clearTimeout(timer)
  }, [unreadCount, markAllRead])

  function open(notification: AppNotification) {
    markRead(notification.id)
    if (notification.href) navigate(notification.href)
  }

  return (
    <Screen
      header={
        <MobileHeader
          back
          title="Notifications"
          subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          actions={
            notifications.length > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearAll()
                  toast('Notifications cleared', { variant: 'info' })
                }}
              >
                Clear
              </Button>
            ) : null
          }
        />
      }
    >
      <div className="px-[var(--gutter)] pt-4">
        {notifications.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title="Nothing new"
            description="Goal updates, weekly summaries and nearby routes will show up here."
            action={{ label: 'Back to Home', onClick: () => navigate('/') }}
            secondaryAction={{
              label: 'Notification settings',
              onClick: () => navigate('/settings#notifications'),
            }}
          />
        ) : (
          <ul className="space-y-2.5">
            <AnimatePresence initial={false}>
              {notifications.map((notification, index) => {
                const Icon = ICONS[notification.kind] ?? Bell
                return (
                  <motion.li
                    key={notification.id}
                    layout={!reduced}
                    initial={reduced ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, x: -60, height: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min(index * 0.035, 0.25),
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    drag={reduced ? false : 'x'}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={{ left: 0.6, right: 0 }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -110) {
                        haptic('medium')
                        dismiss(notification.id)
                      }
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => open(notification)}
                      className={cn(
                        'flex w-full items-start gap-3.5 rounded-3xl border p-3.5 text-left transition-colors',
                        notification.read
                          ? 'border-line bg-surface hover:border-line-strong'
                          : 'border-transparent bg-accent-soft',
                      )}
                    >
                      <span
                        className={cn(
                          'grid size-10 shrink-0 place-items-center rounded-2xl',
                          notification.read ? 'bg-surface-2' : 'bg-accent',
                        )}
                      >
                        <Icon
                          className={cn(
                            'size-[18px]',
                            notification.read ? 'text-ink-2' : 'text-accent-ink',
                          )}
                          aria-hidden="true"
                        />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold tracking-[-0.01em]">
                            {notification.title}
                          </span>
                          {!notification.read && (
                            <span
                              className="size-2 shrink-0 rounded-full bg-accent"
                              aria-label="Unread"
                            />
                          )}
                        </span>
                        <span className="mt-1 block text-[13px] leading-relaxed text-ink-2">
                          {notification.body}
                        </span>
                        <span className="mt-1.5 block text-[11.5px] text-ink-3">
                          {formatTimeAgo(notification.date)}
                        </span>
                      </span>
                    </button>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        )}

        {notifications.length > 0 && (
          <p className="py-5 text-center text-[11.5px] text-ink-3">
            Swipe a card left to dismiss it
          </p>
        )}
      </div>
    </Screen>
  )
}
