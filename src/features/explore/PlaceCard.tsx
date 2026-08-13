import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Star } from 'lucide-react'
import type { Place } from '@/types'
import { cn } from '@/lib/utils'
import { haptic } from '@/lib/haptics'
import { formatDistanceWithUnit } from '@/lib/format'
import { useUnits } from '@/store/settings-store'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { PlaceArtwork } from '@/components/maps/PlaceArtwork'
import { SaveButton } from './SaveButton'

export interface PlaceCardProps {
  place: Place
  /** `wide` fills the column, `rail` is the fixed-width horizontal variant. */
  variant?: 'wide' | 'rail' | 'row'
  index?: number
  className?: string
}

export function PlaceCard({ place, variant = 'wide', index = 0, className }: PlaceCardProps) {
  const navigate = useNavigate()
  const units = useUnits()
  const reduced = useReducedMotion()

  const open = () => {
    haptic('light')
    navigate(`/explore/${place.id}`)
  }

  if (variant === 'row') {
    return (
      <motion.button
        type="button"
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: Math.min(index * 0.04, 0.24) }}
        whileTap={reduced ? undefined : { scale: 0.98 }}
        onClick={open}
        className={cn(
          'surface-card flex w-full items-center gap-3.5 p-3 text-left transition-colors hover:border-line-strong',
          className,
        )}
      >
        <PlaceArtwork
          seed={place.artSeed}
          category={place.category}
          route={place.route}
          scrim={false}
          className="size-[62px] shrink-0 rounded-2xl"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold tracking-[-0.01em]">
            {place.title}
          </span>
          <span className="mt-0.5 block truncate text-[12.5px] text-ink-3">
            {place.location} · {formatDistanceWithUnit(place.distance, units)}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-surface-2 px-2 py-1">
          <Star className="size-3 fill-accent text-accent" aria-hidden="true" />
          <span className="text-[12px] font-semibold tabular">{place.rating.toFixed(1)}</span>
        </span>
      </motion.button>
    )
  }

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'surface-card relative p-0',
        variant === 'rail' ? 'w-[248px] shrink-0' : 'w-full',
        className,
      )}
    >
      <motion.button
        type="button"
        whileTap={reduced ? undefined : { scale: 0.985 }}
        onClick={open}
        className="block w-full text-left"
        aria-label={`Open ${place.title}`}
      >
        <PlaceArtwork
          seed={place.artSeed}
          category={place.category}
          route={place.route}
          className={cn('w-full', variant === 'rail' ? 'h-[132px]' : 'h-[150px]')}
        />

        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 flex-1 truncate text-[15.5px] font-semibold tracking-[-0.015em]">
              {place.title}
            </h3>
            <span className="flex shrink-0 items-center gap-1">
              <Star className="size-3.5 fill-accent text-accent" aria-hidden="true" />
              <span className="text-[13px] font-semibold tabular">{place.rating.toFixed(1)}</span>
            </span>
          </div>

          <div className="mt-1.5 flex items-center gap-2 text-[12.5px] text-ink-3">
            <span className="tabular">{formatDistanceWithUnit(place.distance, units)}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" aria-hidden="true" />
              {place.estimatedDuration} min
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{place.neighbourhood}</span>
          </div>
        </div>
      </motion.button>

      <SaveButton
        placeId={place.id}
        placeTitle={place.title}
        className="absolute right-2.5 top-2.5"
      />
    </motion.article>
  )
}
