import { memo, useMemo } from 'react'
import { mulberry32, round } from '@/lib/utils'

interface Segment {
  x1: number
  y1: number
  x2: number
  y2: number
  width: number
}

interface Backdrop {
  water: string
  parks: { x: number; y: number; w: number; h: number; r: number }[]
  blocks: { x: number; y: number; w: number; h: number }[]
  major: Segment[]
  minor: Segment[]
  rail: string
}

/**
 * Procedural basemap. Everything derives from a single seed, so a given route
 * always sits on exactly the same streets — no flicker between renders.
 */
function buildBackdrop(seed: number): Backdrop {
  const rand = mulberry32(seed)
  const skew = (rand() - 0.5) * 0.28

  const major: Segment[] = []
  const minor: Segment[] = []

  // Verticals
  let x = -8 + rand() * 8
  while (x < 118) {
    const isMajor = rand() > 0.62
    const drift = skew * 100
    const segment: Segment = {
      x1: round(x, 1),
      y1: -10,
      x2: round(x + drift, 1),
      y2: 110,
      width: isMajor ? 2.6 : 1.2,
    }
    ;(isMajor ? major : minor).push(segment)
    x += 8 + rand() * 12
  }

  // Horizontals
  let y = -8 + rand() * 8
  while (y < 118) {
    const isMajor = rand() > 0.68
    const drift = (rand() - 0.5) * 6
    const segment: Segment = {
      x1: -10,
      y1: round(y, 1),
      x2: 110,
      y2: round(y + drift, 1),
      width: isMajor ? 2.4 : 1.1,
    }
    ;(isMajor ? major : minor).push(segment)
    y += 9 + rand() * 13
  }

  // A diagonal avenue cutting the grid.
  major.push({
    x1: -10,
    y1: round(10 + rand() * 30, 1),
    x2: 110,
    y2: round(60 + rand() * 30, 1),
    width: 3,
  })

  // River: a wide meandering band across the map.
  const riverY = 20 + rand() * 55
  const amp = 8 + rand() * 12
  const water = `M-10 ${round(riverY, 1)} C 20 ${round(riverY - amp, 1)}, 38 ${round(
    riverY + amp,
    1,
  )}, 58 ${round(riverY, 1)} S 92 ${round(riverY - amp * 0.8, 1)}, 112 ${round(
    riverY + amp * 0.4,
    1,
  )}`

  const parks = Array.from({ length: 3 }, () => ({
    x: round(rand() * 78, 1),
    y: round(rand() * 78, 1),
    w: round(10 + rand() * 20, 1),
    h: round(9 + rand() * 16, 1),
    r: round(2 + rand() * 4, 1),
  }))

  const blocks = Array.from({ length: 14 }, () => ({
    x: round(rand() * 92, 1),
    y: round(rand() * 92, 1),
    w: round(4 + rand() * 10, 1),
    h: round(4 + rand() * 9, 1),
  }))

  const railY = 8 + rand() * 80
  const rail = `M-10 ${round(railY, 1)} L 112 ${round(railY + (rand() - 0.5) * 26, 1)}`

  return { water, parks, blocks, major, minor, rail }
}

export interface CityBackdropProps {
  seed: number
  /** Dims the basemap so an overlaid route reads clearly. */
  muted?: boolean
}

export const CityBackdrop = memo(function CityBackdrop({ seed, muted }: CityBackdropProps) {
  const map = useMemo(() => buildBackdrop(seed), [seed])

  return (
    <g opacity={muted ? 0.75 : 1} aria-hidden="true">
      <rect x="-10" y="-10" width="120" height="120" fill="var(--map-bg)" />

      {map.blocks.map((block, index) => (
        <rect
          key={`b${index}`}
          x={block.x}
          y={block.y}
          width={block.w}
          height={block.h}
          rx="1"
          fill="var(--map-block)"
        />
      ))}

      {map.parks.map((park, index) => (
        <rect
          key={`p${index}`}
          x={park.x}
          y={park.y}
          width={park.w}
          height={park.h}
          rx={park.r}
          fill="var(--map-park)"
        />
      ))}

      <path
        d={map.water}
        fill="none"
        stroke="var(--map-water)"
        strokeWidth="7.5"
        strokeLinecap="round"
      />

      {map.minor.map((segment, index) => (
        <line
          key={`m${index}`}
          x1={segment.x1}
          y1={segment.y1}
          x2={segment.x2}
          y2={segment.y2}
          stroke="var(--map-road-minor)"
          strokeWidth={segment.width}
        />
      ))}

      {map.major.map((segment, index) => (
        <line
          key={`M${index}`}
          x1={segment.x1}
          y1={segment.y1}
          x2={segment.x2}
          y2={segment.y2}
          stroke="var(--map-road)"
          strokeWidth={segment.width}
          strokeLinecap="round"
        />
      ))}

      <path
        d={map.rail}
        fill="none"
        stroke="var(--map-rail)"
        strokeWidth="0.8"
        strokeDasharray="2.4 2"
      />
    </g>
  )
})
