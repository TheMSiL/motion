import { memo, useId, useMemo } from 'react'
import type { PlaceCategory, Route } from '@/types'
import { cn, mulberry32, round } from '@/lib/utils'
import { toSmoothPath } from '@/lib/route-gen'

/**
 * Editorial cover art for places and routes.
 *
 * Rather than shipping stock photography, each card gets a deterministic
 * layered composition: a tinted ground, topographic contour bands and a motif
 * that identifies the category. Zero network requests, one consistent look.
 */

interface Palette {
  base: string
  bands: [string, string, string]
  motif: string
  sky: string
}

const PALETTES: Record<PlaceCategory, Palette> = {
  coffee: {
    base: '#3C2E24',
    bands: ['#4A382C', '#5C4635', '#7A5C44'],
    motif: '#D9C3A5',
    sky: '#2E231C',
  },
  parks: {
    base: '#23372A',
    bands: ['#2C4433', '#375440', '#48684F'],
    motif: '#C9DCB4',
    sky: '#1B2A20',
  },
  restaurants: {
    base: '#3A2723',
    bands: ['#4A322C', '#5E4037', '#7A5245'],
    motif: '#E3BFA8',
    sky: '#2C1D1A',
  },
  scenic: {
    base: '#22323C',
    bands: ['#2A3E4A', '#35505E', '#456777'],
    motif: '#BFD8E3',
    sky: '#1A272F',
  },
  routes: {
    base: '#26292C',
    bands: ['#2F3438', '#3B4145', '#4C5358'],
    motif: '#D4FB3C',
    sky: '#1D2022',
  },
}

/** A wavy contour band spanning the full width at a given height. */
function band(y: number, amplitude: number, phase: number) {
  const p = (x: number) => round(y + Math.sin(x / 22 + phase) * amplitude, 1)
  return `M0 ${p(0)} C 30 ${p(30)}, 70 ${p(70)}, 120 ${p(120)} L120 100 L0 100 Z`
}

export interface PlaceArtworkProps {
  seed: number
  category: PlaceCategory
  className?: string
  /** Adds a bottom-up scrim so overlaid text stays readable. */
  scrim?: boolean
  /**
   * When given, route and scenic covers draw this actual polyline instead of a
   * generic squiggle — so every route card is recognisably its own shape.
   */
  route?: Route
}

export const PlaceArtwork = memo(function PlaceArtwork({
  seed,
  category,
  className,
  scrim = true,
  route,
}: PlaceArtworkProps) {
  const gradientId = useId()
  const palette = PALETTES[category]
  const routePath = useMemo(() => (route ? toSmoothPath(route.points) : null), [route])

  const composition = useMemo(() => {
    const rand = mulberry32(seed)
    return {
      bands: [
        band(42 + rand() * 10, 4 + rand() * 4, rand() * 6),
        band(58 + rand() * 8, 3 + rand() * 4, rand() * 6),
        band(74 + rand() * 6, 2 + rand() * 3, rand() * 6),
      ],
      sunX: round(18 + rand() * 64, 1),
      sunY: round(16 + rand() * 12, 1),
      sunR: round(6 + rand() * 5, 1),
      motifSeed: rand(),
      trees: Array.from({ length: 6 }, () => ({
        x: round(6 + rand() * 88, 1),
        y: round(52 + rand() * 30, 1),
        r: round(2.5 + rand() * 4, 1),
      })),
    }
  }, [seed])

  return (
    <div className={cn('relative overflow-hidden', className)} aria-hidden="true">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.sky} />
            <stop offset="100%" stopColor={palette.base} />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="100" height="100" fill={`url(#${gradientId})`} />

        {/* Sun / focal disc */}
        <circle
          cx={composition.sunX}
          cy={composition.sunY}
          r={composition.sunR}
          fill={palette.motif}
          opacity={category === 'routes' ? 0.28 : 0.42}
        />

        {composition.bands.map((d, index) => (
          <path key={index} d={d} fill={palette.bands[index] ?? palette.base} />
        ))}

        {category === 'parks' &&
          composition.trees.map((tree, index) => (
            <circle
              key={index}
              cx={tree.x}
              cy={tree.y}
              r={tree.r}
              fill={palette.motif}
              opacity={0.22 + (index % 3) * 0.08}
            />
          ))}

        {category === 'coffee' && (
          <g stroke={palette.motif} fill="none" strokeLinecap="round" opacity={0.5}>
            <path d="M34 76 q6 -10 0 -20 q-6 -10 0 -18" strokeWidth="1.6" />
            <path d="M50 80 q6 -11 0 -22 q-6 -11 0 -20" strokeWidth="1.6" opacity={0.75} />
            <path d="M66 76 q6 -10 0 -20 q-6 -10 0 -18" strokeWidth="1.6" opacity={0.55} />
          </g>
        )}

        {category === 'restaurants' && (
          <g fill={palette.motif} opacity={0.34}>
            <rect x="22" y="62" width="56" height="2.4" rx="1.2" />
            <circle cx="50" cy="76" r="9" opacity={0.5} />
            <circle cx="50" cy="76" r="4.4" opacity={0.7} />
          </g>
        )}

        {category === 'scenic' && (
          <g fill={palette.motif} opacity={0.3}>
            <path d="M8 74 L28 46 L48 74 Z" />
            <path d="M40 78 L62 42 L86 78 Z" opacity={0.75} />
          </g>
        )}

        {(category === 'routes' || category === 'scenic') && (
          <path
            d={routePath ?? 'M6 88 C 28 70, 20 54, 44 46 S 76 40, 94 18'}
            fill="none"
            stroke={palette.motif}
            strokeWidth={category === 'routes' ? 2.2 : 1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={category === 'routes' ? '5 4' : undefined}
            opacity={category === 'routes' ? 0.9 : 0.55}
          />
        )}
      </svg>

      {scrim && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
      )}
    </div>
  )
})
