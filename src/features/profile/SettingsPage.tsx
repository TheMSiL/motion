import { useEffect, useRef } from 'react'
import { Check, Link2, Monitor, Moon, Sun } from 'lucide-react'
import type { ActivityVisibility, ThemePreference, Units } from '@/types'
import { cn } from '@/lib/utils'
import { connectedApps } from '@/data/user'
import { useSettings } from '@/store/settings-store'
import { useToast } from '@/store/toast-store'
import { Screen } from '@/components/layout/Screen'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { Card } from '@/components/ui/Card'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'

const THEMES: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
]

const VISIBILITY: { value: ActivityVisibility; label: string; hint: string }[] = [
  { value: 'public', label: 'Everyone', hint: 'Anyone can see your activities' },
  { value: 'followers', label: 'Followers', hint: 'Only people you approve' },
  { value: 'private', label: 'Only me', hint: 'Nothing is shared' },
]

export default function SettingsPage() {
  const { settings, setTheme, setUnits, setNotification, setPrivacy, resetSettings } = useSettings()
  const { toast } = useToast()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Deep links from Profile (#preferences, #privacy, #apps) scroll to a section.
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (!hash) return
    const timer = window.setTimeout(() => {
      const target = document.getElementById(hash)
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 220)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <Screen ref={scrollRef} header={<MobileHeader back title="Settings" />}>
      <div className="space-y-6 px-[var(--gutter)] pt-4">
        <section id="preferences" aria-labelledby="units-heading" className="scroll-mt-4">
          <h2 id="units-heading" className="text-label mb-2.5 text-ink-3">
            Units
          </h2>
          <Card>
            <SegmentedControl<Units>
              label="Distance units"
              value={settings.units}
              options={[
                { value: 'km', label: 'Kilometres' },
                { value: 'mi', label: 'Miles' },
              ]}
              onChange={(value) => {
                setUnits(value)
                toast('Settings saved', {
                  description: value === 'km' ? 'Using kilometres' : 'Using miles',
                })
              }}
            />
            <p className="mt-3 text-[12.5px] leading-relaxed text-ink-3">
              Applies everywhere: activities, goals, routes and the share card.
            </p>
          </Card>
        </section>

        <section aria-labelledby="theme-heading">
          <h2 id="theme-heading" className="text-label mb-2.5 text-ink-3">
            Theme
          </h2>
          <Card padded={false} className="p-2">
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Theme">
              {THEMES.map((theme) => {
                const active = settings.theme === theme.value
                return (
                  <button
                    key={theme.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setTheme(theme.value)
                      toast('Settings saved', { description: `Theme set to ${theme.label}` })
                    }}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-2xl border px-2 py-3.5 transition-colors duration-150',
                      active
                        ? 'border-transparent bg-surface-inverse text-ink-inverse'
                        : 'border-line bg-surface text-ink-2 hover:border-line-strong',
                    )}
                  >
                    <theme.icon className="size-[18px]" aria-hidden="true" />
                    <span className="text-[12.5px] font-semibold">{theme.label}</span>
                  </button>
                )
              })}
            </div>
          </Card>
        </section>

        <section aria-labelledby="notifications-heading">
          <h2 id="notifications-heading" className="text-label mb-2.5 text-ink-3">
            Notifications
          </h2>
          <Card padded={false} className="divide-y divide-line px-4">
            <Switch
              label="Activity reminders"
              description="A nudge when you usually head out"
              checked={settings.notifications.activityReminders}
              onChange={(value) => {
                setNotification('activityReminders', value)
                toast('Settings saved', { description: 'Activity reminders updated' })
              }}
            />
            <Switch
              label="Goal reminders"
              description="Progress alerts as a deadline approaches"
              checked={settings.notifications.goalReminders}
              onChange={(value) => {
                setNotification('goalReminders', value)
                toast('Settings saved', { description: 'Goal reminders updated' })
              }}
            />
            <Switch
              label="Weekly summary"
              description="Your week in numbers, every Monday"
              checked={settings.notifications.weeklySummary}
              onChange={(value) => {
                setNotification('weeklySummary', value)
                toast('Settings saved', { description: 'Weekly summary updated' })
              }}
            />
            <Switch
              label="New routes nearby"
              description="When something good opens near you"
              checked={settings.notifications.newRoutes}
              onChange={(value) => {
                setNotification('newRoutes', value)
                toast('Settings saved', { description: 'Route alerts updated' })
              }}
            />
          </Card>
        </section>

        <section id="privacy" aria-labelledby="privacy-heading" className="scroll-mt-4">
          <h2 id="privacy-heading" className="text-label mb-2.5 text-ink-3">
            Privacy
          </h2>
          <Card padded={false} className="p-2">
            <div
              className="space-y-1"
              role="radiogroup"
              aria-label="Who can see your activity"
            >
              {VISIBILITY.map((option) => {
                const active = settings.privacy.activityVisibility === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setPrivacy('activityVisibility', option.value)
                      toast('Settings saved', { description: `Visible to ${option.label}` })
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors',
                      active ? 'bg-surface-2' : 'hover:bg-surface-2/60',
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium">{option.label}</span>
                      <span className="block text-[12px] text-ink-3">{option.hint}</span>
                    </span>
                    <span
                      className={cn(
                        'grid size-5 shrink-0 place-items-center rounded-full border',
                        active ? 'border-transparent bg-accent' : 'border-line-strong',
                      )}
                    >
                      {active && (
                        <Check className="size-3 text-accent-ink" strokeWidth={3} aria-hidden="true" />
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card padded={false} className="mt-3 divide-y divide-line px-4">
            <Switch
              label="Hide start and end points"
              description="Blurs the first and last 200 m of every route"
              checked={settings.privacy.hideStartEnd}
              onChange={(value) => {
                setPrivacy('hideStartEnd', value)
                toast('Settings saved', { description: 'Privacy zone updated' })
              }}
            />
            <Switch
              label="Share aggregate stats"
              description="Lets friends see your weekly totals"
              checked={settings.privacy.shareStats}
              onChange={(value) => {
                setPrivacy('shareStats', value)
                toast('Settings saved', { description: 'Stat sharing updated' })
              }}
            />
          </Card>
        </section>

        <section id="apps" aria-labelledby="apps-heading" className="scroll-mt-4">
          <h2 id="apps-heading" className="text-label mb-2.5 text-ink-3">
            Connected apps
          </h2>
          <Card padded={false} className="divide-y divide-line">
            {connectedApps.map((app) => (
              <div key={app.id} className="flex items-center gap-3.5 px-4 py-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2">
                  <Link2 className="size-4 text-ink-2" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">{app.name}</p>
                  <p className="truncate text-[12px] text-ink-3">{app.description}</p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold',
                    app.connected ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink-3',
                  )}
                >
                  {app.connected ? 'Connected' : 'Connect'}
                </span>
              </div>
            ))}
          </Card>
        </section>

        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => {
            resetSettings()
            toast('Settings reset', { variant: 'info', description: 'Back to defaults' })
          }}
        >
          Reset to defaults
        </Button>

        <p className="pb-2 text-center text-[11.5px] text-ink-3">
          MOTION 1.0 · Everything is stored on this device
        </p>
      </div>
    </Screen>
  )
}
