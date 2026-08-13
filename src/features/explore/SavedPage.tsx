import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BookmarkX, Compass } from 'lucide-react'
import { useSaved } from '@/store/saved-store'
import { useToast } from '@/store/toast-store'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Screen } from '@/components/layout/Screen'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/States'
import { PlaceCard } from './PlaceCard'

export default function SavedPage() {
  const navigate = useNavigate()
  const { savedPlaces, clearSaved } = useSaved()
  const { toast } = useToast()
  const reduced = useReducedMotion()

  return (
    <Screen
      header={
        <MobileHeader
          back="/explore"
          title="Saved places"
          subtitle={`${savedPlaces.length} saved`}
          actions={
            savedPlaces.length > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearSaved()
                  toast('Saved places cleared', { variant: 'info' })
                }}
              >
                Clear all
              </Button>
            ) : null
          }
        />
      }
    >
      <div className="px-[var(--gutter)] pt-4">
        {savedPlaces.length === 0 ? (
          <EmptyState
            icon={BookmarkX}
            title="No saved places"
            description="Tap the bookmark on any route or place and it will be waiting for you here."
            action={{ label: 'Explore the city', onClick: () => navigate('/explore') }}
          />
        ) : (
          <motion.div layout className="space-y-3">
            <AnimatePresence initial={false}>
              {savedPlaces.map((place, index) => (
                <motion.div
                  key={place.id}
                  layout={!reduced}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, x: -40 }}
                  transition={{ duration: 0.24 }}
                >
                  <PlaceCard place={place} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => navigate('/explore')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong py-4 text-[13.5px] font-semibold text-ink-2 transition-colors hover:text-ink"
            >
              <Compass className="size-4" aria-hidden="true" />
              Find more places
            </button>
          </motion.div>
        )}
      </div>
    </Screen>
  )
}
