import type { Route } from './route'

export type PlaceCategory = 'coffee' | 'parks' | 'restaurants' | 'scenic' | 'routes'

export interface Place {
  id: string
  title: string
  category: PlaceCategory
  /** Kilometres — route length for routes, distance from the user for places. */
  distance: number
  rating: number
  reviews: number
  description: string
  location: string
  neighbourhood: string
  /** Minutes. */
  estimatedDuration: number
  /** Difficulty of the ride/walk, shown as a chip. */
  difficulty: 'easy' | 'moderate' | 'hard'
  tags: string[]
  /** Seed for the generated cover artwork — keeps every card deterministic. */
  artSeed: number
  route: Route
  /** Rides logged by the community. */
  popularity: number
}
