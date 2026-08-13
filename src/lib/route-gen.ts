import type { Route, RoutePoint, RouteWaypoint } from '@/types'
import { mulberry32, pick, round } from './utils'

const WAYPOINT_NAMES = [
  'Riverside Bridge',
  'Old Town Gate',
  'Central Market',
  'Harbour Steps',
  'Linden Park',
  'North Canal',
  'Observatory Hill',
  'Foundry Lane',
  'Cathedral Square',
  'Botanic Gate',
  'Tram Depot',
  'Sunset Pier',
  'Willow Crossing',
  'Granite Quay',
] as const

const PLACE_NAMES = [
  'Kalvarija St.',
  'Riverside Park',
  'Old Town Square',
  'Harbour Front',
  'Linden Avenue',
  'North Gate',
  'Foundry District',
  'Observatory Hill',
  'Cathedral Square',
  'Botanic Garden',
  'Sunset Pier',
  'Granite Quay',
  'Mill Street',
  'Union Station',
] as const

/**
 * Builds a deterministic, organic-looking polyline inside a 0–100 box.
 * Loops close back on themselves; point-to-point routes sweep across the map.
 */
export function generateRoute(seed: number, options?: { closed?: boolean }): Route {
  const rand = mulberry32(seed)
  const closed = options?.closed ?? rand() > 0.45

  const anchors = 14 + Math.floor(rand() * 6)
  const centerX = 50 + (rand() - 0.5) * 10
  const centerY = 50 + (rand() - 0.5) * 10

  // Three harmonics give the loop a natural, non-circular silhouette.
  const h1 = 0.16 + rand() * 0.16
  const h2 = 0.1 + rand() * 0.14
  const h3 = 0.05 + rand() * 0.1
  const p1 = rand() * Math.PI * 2
  const p2 = rand() * Math.PI * 2
  const p3 = rand() * Math.PI * 2
  const radiusX = 26 + rand() * 9
  const radiusY = 22 + rand() * 9

  const points: RoutePoint[] = []

  if (closed) {
    for (let i = 0; i < anchors; i++) {
      const t = (i / anchors) * Math.PI * 2
      const wobble =
        1 + h1 * Math.sin(t * 2 + p1) + h2 * Math.sin(t * 3 + p2) + h3 * Math.sin(t * 5 + p3)
      points.push({
        x: round(centerX + Math.cos(t) * radiusX * wobble + (rand() - 0.5) * 3, 2),
        y: round(centerY + Math.sin(t) * radiusY * wobble + (rand() - 0.5) * 3, 2),
      })
    }
    points.push({ ...(points[0] as RoutePoint) })
  } else {
    const startX = 12 + rand() * 12
    const startY = 22 + rand() * 56
    const endX = 76 + rand() * 12
    const endY = 22 + rand() * 56
    const amplitude = 12 + rand() * 14
    for (let i = 0; i <= anchors; i++) {
      const t = i / anchors
      const drift =
        Math.sin(t * Math.PI * 2 + p1) * amplitude +
        Math.sin(t * Math.PI * 3.7 + p2) * amplitude * 0.4
      points.push({
        x: round(startX + (endX - startX) * t + Math.sin(t * Math.PI) * (rand() - 0.5) * 8, 2),
        y: round(startY + (endY - startY) * t + drift * Math.sin(t * Math.PI), 2),
      })
    }
  }

  // Keep everything comfortably inside the frame so markers never clip.
  const normalised = fitToBox(points, 10, 90, 12, 88)

  const waypointCount = 2 + Math.floor(rand() * 2)
  const waypoints: RouteWaypoint[] = []
  const usedNames = new Set<string>()
  for (let i = 0; i < waypointCount; i++) {
    const index = Math.floor(((i + 1) / (waypointCount + 1)) * (normalised.length - 1))
    let name = pick(rand, WAYPOINT_NAMES)
    let guard = 0
    while (usedNames.has(name) && guard++ < 10) name = pick(rand, WAYPOINT_NAMES)
    usedNames.add(name)
    const point = normalised[index] as RoutePoint
    waypoints.push({ x: point.x, y: point.y, label: name })
  }

  const startLabel: string = pick(rand, PLACE_NAMES)
  let endLabel: string = closed ? startLabel : pick(rand, PLACE_NAMES)
  if (!closed && endLabel === startLabel) {
    const index = PLACE_NAMES.indexOf(endLabel as (typeof PLACE_NAMES)[number])
    endLabel = PLACE_NAMES[(index + 3) % PLACE_NAMES.length] as string
  }

  const elevationGain = 40 + Math.floor(rand() * 420)
  const profileLength = 16
  const base = 20 + rand() * 60
  const elevationProfile = Array.from({ length: profileLength }, (_, i) => {
    const t = i / (profileLength - 1)
    return round(
      base +
        Math.sin(t * Math.PI * 2 + p1) * (elevationGain / 14) +
        Math.sin(t * Math.PI * 5 + p3) * (elevationGain / 30) +
        t * (elevationGain / 20),
      1,
    )
  })

  return {
    id: `route-${seed}`,
    points: normalised,
    waypoints,
    startLabel,
    endLabel,
    elevationGain,
    elevationProfile,
  }
}

function fitToBox(
  points: RoutePoint[],
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
): RoutePoint[] {
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const loX = Math.min(...xs)
  const hiX = Math.max(...xs)
  const loY = Math.min(...ys)
  const hiY = Math.max(...ys)
  const spanX = hiX - loX || 1
  const spanY = hiY - loY || 1
  return points.map((p) => ({
    x: round(minX + ((p.x - loX) / spanX) * (maxX - minX), 2),
    y: round(minY + ((p.y - loY) / spanY) * (maxY - minY), 2),
  }))
}

/**
 * Converts a polyline into a smooth SVG path using Catmull-Rom → cubic Bézier.
 * Routes read as drawn lines rather than jagged segment chains.
 */
export function toSmoothPath(points: RoutePoint[], tension = 0.5): string {
  if (points.length === 0) return ''
  if (points.length < 3) {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')
  }

  let path = `M${points[0]!.x} ${points[0]!.y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]!
    const p1 = points[i]!
    const p2 = points[i + 1]!
    const p3 = points[Math.min(points.length - 1, i + 2)]!

    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension * 2
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension * 2
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension * 2
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension * 2

    path += ` C${round(c1x, 2)} ${round(c1y, 2)}, ${round(c2x, 2)} ${round(c2y, 2)}, ${p2.x} ${p2.y}`
  }
  return path
}

/** Approximate polyline length in viewBox units — used to size dash animations. */
export function pathLength(points: RoutePoint[]) {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!
    const b = points[i]!
    total += Math.hypot(b.x - a.x, b.y - a.y)
  }
  return total
}
