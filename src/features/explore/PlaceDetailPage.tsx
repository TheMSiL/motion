import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Gauge, MapPin, Play, Star, TrendingUp, Users } from 'lucide-react'
import { placeService } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { useUnits } from '@/store/settings-store'
import { distanceUnit, toDisplayDistance } from '@/lib/format'
import { Screen } from '@/components/layout/Screen'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { PlaceArtwork } from '@/components/maps/PlaceArtwork'
import { RouteMap } from '@/components/maps/RouteMap'
import { StartActivitySheet } from '@/features/activity/StartActivitySheet'
import { SaveButton } from './SaveButton'

const DIFFICULTY_LABEL = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Challenging',
} as const

export default function PlaceDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const units = useUnits()
  const [startOpen, setStartOpen] = useState(false)

  const { data: place, loading, error, reload } = useAsync(() => placeService.getPlace(id), [id])

  if (loading) {
    return (
      <Screen header={<MobileHeader back transparent />} fullBleed>
        <Skeleton className="h-[42vh] w-full rounded-none" />
        <div className="space-y-4 px-[var(--gutter)] pt-5">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      </Screen>
    )
  }

  if (error || !place) {
    return (
      <Screen header={<MobileHeader back title="Place" />}>
        <ErrorState
          title="Place not found"
          description="This place is no longer listed, or the link is out of date."
          onRetry={reload}
        />
        <div className="px-8">
          <Button variant="secondary" fullWidth onClick={() => navigate('/explore')}>
            Back to Explore
          </Button>
        </div>
      </Screen>
    )
  }

  const facts = [
    {
      icon: TrendingUp,
      label: 'Distance',
      value: `${toDisplayDistance(place.distance, units).toFixed(1)} ${distanceUnit(units)}`,
    },
    { icon: Clock, label: 'Duration', value: `${place.estimatedDuration} min` },
    { icon: Gauge, label: 'Difficulty', value: DIFFICULTY_LABEL[place.difficulty] },
    { icon: Users, label: 'Logged rides', value: place.popularity.toLocaleString('en-GB') },
  ]

  return (
    <Screen
      fullBleed
      header={
        <MobileHeader
          back
          transparent
          actions={<SaveButton placeId={place.id} placeTitle={place.title} />}
        />
      }
      footer={
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate(`/explore?category=${place.category}`)}
            className="px-5"
          >
            Similar
          </Button>
          <Button
            size="lg"
            fullWidth
            icon={<Play className="size-[18px]" />}
            onClick={() => setStartOpen(true)}
          >
            Start route
          </Button>
        </div>
      }
    >
      <div className="relative">
        <PlaceArtwork
          seed={place.artSeed}
          category={place.category}
          route={place.route}
          className="h-[42vh] min-h-[280px] w-full"
        />
        <div className="absolute inset-x-0 bottom-0 p-[var(--gutter)] pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-accent-ink">
              {place.category === 'routes' ? 'Popular route' : place.category}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 backdrop-blur-md">
              <Star className="size-3 fill-white text-white" aria-hidden="true" />
              <span className="text-[12px] font-semibold text-white tabular">
                {place.rating.toFixed(1)}
              </span>
              <span className="text-[11.5px] text-white/65">({place.reviews})</span>
            </span>
          </div>
          <h1 className="text-display mt-3 text-[32px] text-white">{place.title}</h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-white/75">
            <MapPin className="size-3.5" aria-hidden="true" />
            {place.location} · {place.neighbourhood}
          </p>
        </div>
      </div>

      <div className="space-y-5 px-[var(--gutter)] pt-5">
        <div className="grid grid-cols-2 gap-3">
          {facts.map((fact, index) => (
            <motion.div
              key={fact.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: index * 0.05 }}
              className="surface-card flex items-center gap-3 p-3.5"
            >
              <fact.icon className="size-4 shrink-0 text-ink-3" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-[11.5px] text-ink-3">{fact.label}</p>
                <p className="truncate text-[14px] font-semibold tabular">{fact.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <section aria-labelledby="about-heading">
          <h2 id="about-heading" className="text-label mb-2 text-ink-3">
            About
          </h2>
          <p className="text-[14.5px] leading-relaxed text-ink-2">{place.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {place.tags.map((tag) => (
              <Chip key={tag}>{tag}</Chip>
            ))}
          </div>
        </section>

        <section aria-labelledby="route-heading">
          <h2 id="route-heading" className="text-label mb-2 text-ink-3">
            The route
          </h2>
          <Card padded={false}>
            <RouteMap
              route={place.route}
              animate
              showWaypoints
              className="h-[220px] w-full"
              label={`Route map for ${place.title}`}
            />
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-label text-ink-3">Start</p>
                <p className="truncate text-[13.5px] font-semibold">{place.route.startLabel}</p>
              </div>
              <div className="h-8 w-px bg-line" aria-hidden="true" />
              <div className="min-w-0 text-right">
                <p className="text-label text-ink-3">Climb</p>
                <p className="text-[13.5px] font-semibold tabular">
                  {place.route.elevationGain} m
                </p>
              </div>
            </div>
          </Card>
        </section>

        <div className="pb-24" />
      </div>

      <StartActivitySheet open={startOpen} onClose={() => setStartOpen(false)} />
    </Screen>
  )
}
