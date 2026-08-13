import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, Clock3, Compass, SearchX } from 'lucide-react'
import type { PlaceCategory } from '@/types'
import { placeService } from '@/services'
import { placeCategories } from '@/data/places'
import { useAsync } from '@/hooks/useAsync'
import { Screen } from '@/components/layout/Screen'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { IconButton } from '@/components/ui/Button'
import { SearchBar } from '@/components/ui/SearchBar'
import { Chip } from '@/components/ui/Chip'
import { PlaceCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useSaved } from '@/store/saved-store'
import { PlaceCard } from './PlaceCard'

type Category = PlaceCategory | 'all'

const VALID_CATEGORIES = new Set(placeCategories.map((category) => category.id))

export default function ExplorePage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { savedIds } = useSaved()

  const initialCategory = params.get('category')
  const [category, setCategory] = useState<Category>(
    initialCategory && VALID_CATEGORIES.has(initialCategory as Category)
      ? (initialCategory as Category)
      : 'all',
  )
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [recent, setRecent] = useState<string[]>(() => placeService.getRecentSearches())
  const searchRef = useRef<HTMLInputElement>(null)

  // Debounce so the filtered list does not thrash on every keystroke.
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query), 220)
    return () => window.clearTimeout(timer)
  }, [query])

  // Remember searches that produced a real intent, not every partial word.
  useEffect(() => {
    if (debounced.trim().length < 3) return
    const timer = window.setTimeout(() => {
      setRecent(placeService.addRecentSearch(debounced))
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [debounced])

  const { data, loading, error, reload } = useAsync(
    () => placeService.getPlaces({ category, search: debounced }),
    [category, debounced],
  )

  const places = useMemo(() => data ?? [], [data])
  const searching = debounced.trim().length > 0

  const featured = useMemo(
    () => places.filter((place) => place.rating >= 4.6).slice(0, 6),
    [places],
  )

  const selectCategory = useCallback(
    (next: Category) => {
      setCategory(next)
      const nextParams = new URLSearchParams(params)
      if (next === 'all') nextParams.delete('category')
      else nextParams.set('category', next)
      setParams(nextParams, { replace: true })
    },
    [params, setParams],
  )

  return (
    <Screen
      withNav
      header={
        <MobileHeader
          title="Explore"
          subtitle="Discover routes and places"
          actions={
            <IconButton
              label={`Saved places, ${savedIds.length} saved`}
              variant="ghost"
              icon={<Bookmark className="size-[19px]" />}
              badge={savedIds.length > 0}
              onClick={() => navigate('/explore/saved')}
            />
          }
        />
      }
    >
      <div className="space-y-5 pt-4">
        <div className="px-[var(--gutter)]">
          <SearchBar
            ref={searchRef}
            value={query}
            onValueChange={setQuery}
            placeholder="Search places or routes"
            label="Search places or routes"
          />
        </div>

        {/* Horizontal category rail */}
        <div className="scrollbar-none flex gap-2 overflow-x-auto px-[var(--gutter)] pb-1">
          {placeCategories.map((item) => (
            <Chip
              key={item.id}
              active={category === item.id}
              onClick={() => selectCategory(item.id)}
            >
              {item.label}
            </Chip>
          ))}
        </div>

        {!searching && recent.length > 0 && (
          <section aria-labelledby="recent-searches" className="px-[var(--gutter)]">
            <div className="mb-2 flex items-center justify-between">
              <h2 id="recent-searches" className="text-label text-ink-3">
                Recent searches
              </h2>
              <button
                type="button"
                onClick={() => setRecent(placeService.clearRecentSearches())}
                className="text-[12.5px] font-semibold text-ink-3 transition-colors hover:text-ink"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recent.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQuery(term)
                    searchRef.current?.focus()
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
                >
                  <Clock3 className="size-3.5 text-ink-3" aria-hidden="true" />
                  {term}
                </button>
              ))}
            </div>
          </section>
        )}

        {loading ? (
          <div className="space-y-3 px-[var(--gutter)]">
            <PlaceCardSkeleton />
            <PlaceCardSkeleton />
          </div>
        ) : error ? (
          <ErrorState onRetry={reload} />
        ) : places.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={searching ? `No results for “${debounced}”` : 'Nothing here yet'}
            description={
              searching
                ? 'Try a shorter search, a district name, or browse a category instead.'
                : 'There are no places in this category right now.'
            }
            action={{
              label: 'Clear filters',
              onClick: () => {
                setQuery('')
                selectCategory('all')
              },
            }}
          />
        ) : (
          <>
            {!searching && featured.length > 0 && category === 'all' && (
              <section aria-labelledby="featured-heading">
                <h2
                  id="featured-heading"
                  className="text-label mb-3 px-[var(--gutter)] text-ink-3"
                >
                  Popular right now
                </h2>
                {/* scroll-pl keeps snap points aligned with the gutter. */}
                <div className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-pl-[var(--gutter)] px-[var(--gutter)] pb-1">
                  {featured.map((place, index) => (
                    <div key={place.id} className="snap-start">
                      <PlaceCard place={place} variant="rail" index={index} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section aria-labelledby="all-places" className="px-[var(--gutter)]">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 id="all-places" className="text-label text-ink-3">
                  {searching
                    ? `${places.length} result${places.length === 1 ? '' : 's'}`
                    : placeCategories.find((c) => c.id === category)?.label ?? 'All places'}
                </h2>
                <span className="text-[12px] text-ink-3">{places.length} total</span>
              </div>

              <motion.div layout className="space-y-3">
                {places.map((place, index) =>
                  searching || category !== 'all' ? (
                    <PlaceCard key={place.id} place={place} variant="row" index={index} />
                  ) : (
                    <PlaceCard key={place.id} place={place} index={index} />
                  ),
                )}
              </motion.div>
            </section>

            <div className="px-[var(--gutter)] pb-2">
              <button
                type="button"
                onClick={() => navigate('/explore/saved')}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong py-4 text-[13.5px] font-semibold text-ink-2 transition-colors hover:text-ink"
              >
                <Compass className="size-4" aria-hidden="true" />
                {savedIds.length > 0
                  ? `View your ${savedIds.length} saved place${savedIds.length === 1 ? '' : 's'}`
                  : 'Save places to build your shortlist'}
              </button>
            </div>
          </>
        )}
      </div>
    </Screen>
  )
}
