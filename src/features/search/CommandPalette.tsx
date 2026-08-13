import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bike,
  Compass,
  CornerDownLeft,
  House,
  MapPin,
  Settings,
  Target,
  User,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceWithUnit, formatRelativeDay } from '@/lib/format'
import { activities as allActivities } from '@/data/activities'
import { places as allPlaces } from '@/data/places'
import { useUnits } from '@/store/settings-store'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { SearchBar } from '@/components/ui/SearchBar'
import { onOpenCommandPalette } from './command-palette-bus'

interface Result {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
  href: string
  group: 'Go to' | 'Routes and places' | 'Activities'
}

const COMMANDS: Result[] = [
  { id: 'cmd-home', title: 'Home', subtitle: 'Today at a glance', icon: House, href: '/', group: 'Go to' },
  {
    id: 'cmd-activity',
    title: 'Activity',
    subtitle: 'Full history',
    icon: Bike,
    href: '/activity',
    group: 'Go to',
  },
  {
    id: 'cmd-explore',
    title: 'Explore',
    subtitle: 'Routes and places',
    icon: Compass,
    href: '/explore',
    group: 'Go to',
  },
  { id: 'cmd-goals', title: 'Goals', subtitle: 'Targets and streaks', icon: Target, href: '/goals', group: 'Go to' },
  { id: 'cmd-profile', title: 'Profile', subtitle: 'Your account', icon: User, href: '/profile', group: 'Go to' },
  {
    id: 'cmd-settings',
    title: 'Settings',
    subtitle: 'Units, theme, privacy',
    icon: Settings,
    href: '/settings',
    group: 'Go to',
  },
]

const MAX_PER_GROUP = 5

/** Global search. K / Ctrl+K on desktop, the search icon on mobile. */
export function CommandPalette() {
  const navigate = useNavigate()
  const units = useUnits()
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setCursor(0)
  }, [])

  useEffect(() => onOpenCommandPalette(() => setOpen(true)), [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80)
    return () => window.clearTimeout(timer)
  }, [open])

  const results = useMemo<Result[]>(() => {
    const term = query.trim().toLowerCase()

    const commands = COMMANDS.filter(
      (command) => !term || command.title.toLowerCase().includes(term),
    ).slice(0, term ? 3 : MAX_PER_GROUP)

    const placeResults: Result[] = allPlaces
      .filter(
        (place) =>
          !term ||
          place.title.toLowerCase().includes(term) ||
          place.location.toLowerCase().includes(term) ||
          place.tags.some((tag) => tag.toLowerCase().includes(term)),
      )
      .slice(0, MAX_PER_GROUP)
      .map((place) => ({
        id: place.id,
        title: place.title,
        subtitle: `${place.location} · ${formatDistanceWithUnit(place.distance, units)}`,
        icon: MapPin,
        href: `/explore/${place.id}`,
        group: 'Routes and places' as const,
      }))

    const activityResults: Result[] = allActivities
      .filter((activity) => !term || activity.title.toLowerCase().includes(term))
      .slice(0, MAX_PER_GROUP)
      .map((activity) => ({
        id: activity.id,
        title: activity.title,
        subtitle: `${formatRelativeDay(activity.date)} · ${formatDistanceWithUnit(activity.distance, units)}`,
        icon: Bike,
        href: `/activity/${activity.id}`,
        group: 'Activities' as const,
      }))

    return [...commands, ...placeResults, ...activityResults]
  }, [query, units])

  useEffect(() => {
    setCursor(0)
  }, [query])

  const select = useCallback(
    (result: Result | undefined) => {
      if (!result) return
      close()
      navigate(result.href)
    },
    [close, navigate],
  )

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setCursor((c) => Math.min(c + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      select(results[cursor])
    }
  }

  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)
    node?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  let lastGroup = ''

  return (
    <AnimatePresence>
      {open && (
        <div
          className="absolute inset-0 z-[70] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Search MOTION"
          onKeyDown={onKeyDown}
        >
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Close search"
            className="absolute inset-0 cursor-default bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.18 }}
            onClick={close}
          />

          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ type: 'spring', stiffness: 460, damping: 36 }}
            className="relative z-10 m-3 mt-[calc(var(--status-h,0px)+12px)] flex max-h-[76%] flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-[var(--shadow-lift)]"
          >
            <div className="border-b border-line p-3">
              <SearchBar
                ref={inputRef}
                value={query}
                onValueChange={setQuery}
                placeholder="Search activities, routes and places"
                label="Search MOTION"
                className="border-0 bg-surface-2"
              />
            </div>

            {results.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-[14px] font-semibold">No results for “{query}”</p>
                <p className="mt-1 text-[13px] text-ink-3">
                  Try a route name, a district or an activity title.
                </p>
              </div>
            ) : (
              <ul ref={listRef} className="scrollbar-none flex-1 overflow-y-auto p-2" role="listbox">
                {results.map((result, index) => {
                  const showGroup = result.group !== lastGroup
                  lastGroup = result.group
                  const Icon = result.icon
                  const active = index === cursor

                  return (
                    <li key={`${result.group}-${result.id}`}>
                      {showGroup && (
                        <p className="text-label px-2 pb-1.5 pt-3 text-ink-3">{result.group}</p>
                      )}
                      <button
                        type="button"
                        data-index={index}
                        role="option"
                        aria-selected={active}
                        onMouseEnter={() => setCursor(index)}
                        onClick={() => select(result)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left transition-colors',
                          active ? 'bg-surface-2' : 'bg-transparent',
                        )}
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2">
                          <Icon className="size-[17px] text-ink-2" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-semibold">
                            {result.title}
                          </span>
                          <span className="block truncate text-[12px] text-ink-3">
                            {result.subtitle}
                          </span>
                        </span>
                        {active && (
                          <CornerDownLeft className="size-4 shrink-0 text-ink-3" aria-hidden="true" />
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
