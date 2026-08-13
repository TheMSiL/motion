import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Bell,
  Bookmark,
  ChevronRight,
  Flame,
  Link2,
  LogOut,
  Route as RouteIcon,
  Settings,
  Shield,
  SlidersHorizontal,
  Trophy,
  UserRound,
} from 'lucide-react'
import { userService } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { useUnits } from '@/store/settings-store'
import { useSaved } from '@/store/saved-store'
import { useNotifications } from '@/store/notification-store'
import { useToast } from '@/store/toast-store'
import { clearAppStorage } from '@/lib/storage'
import { distanceUnit, toDisplayDistance } from '@/lib/format'
import { Screen } from '@/components/layout/Screen'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Button, IconButton } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { ProfileSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'

export default function ProfilePage() {
  const navigate = useNavigate()
  const units = useUnits()
  const { savedIds } = useSaved()
  const { unreadCount } = useNotifications()
  const { toast } = useToast()
  const [resetOpen, setResetOpen] = useState(false)

  const { data: user, loading, error, reload } = useAsync(() => userService.getUser(), [])

  const links = [
    {
      icon: UserRound,
      label: 'Personal information',
      hint: 'Name, email, city',
      to: '/profile/personal',
    },
    {
      icon: SlidersHorizontal,
      label: 'Preferences',
      hint: 'Units and theme',
      to: '/settings#preferences',
    },
    {
      icon: Bell,
      label: 'Notifications',
      hint: unreadCount > 0 ? `${unreadCount} unread` : 'All caught up',
      to: '/notifications',
    },
    { icon: Shield, label: 'Privacy', hint: 'Who sees your activity', to: '/settings#privacy' },
    { icon: Link2, label: 'Connected apps', hint: '2 connected', to: '/settings#apps' },
  ]

  return (
    <Screen
      withNav
      header={
        <MobileHeader
          title="Profile"
          actions={
            <IconButton
              label="Open settings"
              variant="ghost"
              icon={<Settings className="size-[19px]" />}
              onClick={() => navigate('/settings')}
            />
          }
        />
      }
    >
      <div className="space-y-5 px-[var(--gutter)] pt-4">
        {loading ? (
          <ProfileSkeleton />
        ) : error || !user ? (
          <ErrorState onRetry={reload} />
        ) : (
          <>
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-4"
            >
              <Avatar initials={user.initials} name={user.name} size={72} ring />
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-[22px] font-semibold tracking-[-0.025em]">
                  {user.name}
                </h1>
                <p className="mt-0.5 truncate text-[13px] text-ink-3">
                  {user.handle} · {user.city}
                </p>
                <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1">
                  <Flame className="size-3.5 text-ink" aria-hidden="true" />
                  <span className="text-[12px] font-semibold">
                    {user.stats.weekStreak} week streak
                  </span>
                </p>
              </div>
            </motion.section>

            <p className="text-[13.5px] leading-relaxed text-ink-2">{user.bio}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[24px] bg-accent p-4 text-accent-ink">
                <p className="text-label text-accent-ink/60">This month</p>
                <p className="mt-2.5 flex items-baseline gap-1">
                  <AnimatedNumber
                    value={toDisplayDistance(user.stats.monthDistance, units)}
                    decimals={0}
                    className="text-metric text-[28px] leading-none"
                  />
                  <span className="text-[13px] font-medium text-accent-ink/60">
                    {distanceUnit(units)}
                  </span>
                </p>
              </div>
              <div className="surface-card p-4">
                <p className="text-label text-ink-3">All time</p>
                <p className="mt-2.5 flex items-baseline gap-1">
                  <AnimatedNumber
                    value={toDisplayDistance(user.stats.totalDistance, units)}
                    decimals={0}
                    className="text-metric text-[28px] leading-none"
                  />
                  <span className="text-[13px] font-medium text-ink-3">{distanceUnit(units)}</span>
                </p>
              </div>
            </div>

            <Card padded={false} className="grid grid-cols-3 divide-x divide-line">
              {[
                { icon: RouteIcon, label: 'Activities', value: user.stats.totalActivities },
                { icon: Trophy, label: 'Longest', value: `${user.stats.longestRide} km` },
                { icon: Bookmark, label: 'Saved', value: savedIds.length },
              ].map((stat) => (
                <div key={stat.label} className="px-2 py-3.5 text-center">
                  <stat.icon className="mx-auto size-4 text-ink-3" aria-hidden="true" />
                  <p className="mt-2 text-[16px] font-semibold tracking-[-0.02em] tabular">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-3">{stat.label}</p>
                </div>
              ))}
            </Card>

            <nav aria-label="Account">
              <ul className="surface-card divide-y divide-line p-0">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      type="button"
                      onClick={() => navigate(link.to)}
                      className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-surface-2"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2">
                        <link.icon className="size-[17px] text-ink-2" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14.5px] font-medium">
                          {link.label}
                        </span>
                        <span className="block truncate text-[12px] text-ink-3">{link.hint}</span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-ink-3" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <button
              type="button"
              onClick={() => setResetOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line py-3.5 text-[13.5px] font-semibold text-ink-2 transition-colors hover:text-ink"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Reset local data
            </button>

            <p className="pb-2 text-center text-[11.5px] text-ink-3">
              MOTION · member since {user.memberSince}
            </p>
          </>
        )}
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset local data?"
        description="Saved places, goal changes, settings, recorded activities and the onboarding flag are all stored on this device. This cannot be undone."
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="inverse"
              fullWidth
              onClick={() => {
                clearAppStorage()
                setResetOpen(false)
                toast('Local data cleared', {
                  variant: 'info',
                  description: 'Reloading a fresh session',
                })
                window.setTimeout(() => window.location.assign('/'), 700)
              }}
            >
              Reset
            </Button>
          </div>
        }
      >
        <ul className="space-y-1.5 text-[13px] text-ink-2">
          {[
            'Saved places and recent searches',
            'Recorded activities and goal targets',
            'Theme, units and privacy settings',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span
                className="mt-[7px] size-1.5 shrink-0 rounded-full bg-ink-3"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      </Modal>
    </Screen>
  )
}
