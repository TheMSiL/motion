import type { Place, PlaceCategory } from '@/types'
import { places as seedPlaces } from '@/data/places'
import { readStorage, writeStorage, STORAGE_KEYS } from '@/lib/storage'
import { request, notFound } from './client'

export interface PlaceQuery {
  category?: PlaceCategory | 'all'
  search?: string
}

const MAX_RECENT_SEARCHES = 6

function matches(place: Place, term: string) {
  const haystack = [
    place.title,
    place.location,
    place.neighbourhood,
    place.description,
    ...place.tags,
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(term)
}

export const placeService = {
  async getPlaces(query: PlaceQuery = {}): Promise<Place[]> {
    return request(() => {
      let items = [...seedPlaces]
      if (query.category && query.category !== 'all') {
        items = items.filter((p) => p.category === query.category)
      }
      if (query.search?.trim()) {
        items = items.filter((p) => matches(p, query.search!.trim().toLowerCase()))
      }
      return items
    })
  },

  async getPlace(id: string): Promise<Place> {
    return request(() => {
      const place = seedPlaces.find((p) => p.id === id)
      if (!place) notFound('Place', id)
      return place
    })
  },

  /** Synchronous lookup for places already in memory (search, saved list). */
  findPlace(id: string): Place | undefined {
    return seedPlaces.find((p) => p.id === id)
  },

  getSavedIds(): string[] {
    return readStorage<string[]>(STORAGE_KEYS.savedPlaces, [])
  },

  setSavedIds(ids: string[]) {
    writeStorage(STORAGE_KEYS.savedPlaces, ids)
  },

  getRecentSearches(): string[] {
    return readStorage<string[]>(STORAGE_KEYS.recentSearches, [])
  },

  addRecentSearch(term: string): string[] {
    const clean = term.trim()
    if (clean.length < 2) return placeService.getRecentSearches()
    const next = [clean, ...placeService.getRecentSearches().filter((t) => t !== clean)].slice(
      0,
      MAX_RECENT_SEARCHES,
    )
    writeStorage(STORAGE_KEYS.recentSearches, next)
    return next
  },

  clearRecentSearches(): string[] {
    writeStorage(STORAGE_KEYS.recentSearches, [])
    return []
  },
}
