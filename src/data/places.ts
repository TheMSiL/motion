import type { Place, PlaceCategory } from '@/types'
import { generateRoute } from '@/lib/route-gen'
import { mulberry32, round } from '@/lib/utils'

interface PlaceSeed {
  title: string
  category: PlaceCategory
  location: string
  neighbourhood: string
  description: string
  tags: string[]
}

/** Hand-written editorial content; numbers are derived deterministically below. */
const SEEDS: PlaceSeed[] = [
  {
    title: 'Riverside Loop',
    category: 'routes',
    location: 'River Quarter',
    neighbourhood: 'Quay North',
    description:
      'A flat, uninterrupted loop along both banks of the river. Wide separated lanes, four bridges and almost no traffic lights — the fastest way to put clean kilometres in your legs before work.',
    tags: ['Flat', 'Separated lane', 'Sunrise'],
  },
  {
    title: 'Old Town Route',
    category: 'routes',
    location: 'Old Town',
    neighbourhood: 'Cathedral Hill',
    description:
      'Cobbled lanes, arcades and courtyards stitched into one continuous ride. Slow, scenic and best early on a Sunday when the streets still belong to residents.',
    tags: ['Cobbles', 'Historic', 'Low traffic'],
  },
  {
    title: 'North Canal Path',
    category: 'routes',
    location: 'North Canal',
    neighbourhood: 'Foundry',
    description:
      'A towpath that runs dead straight past old warehouses and lock gates. Gravel underfoot, zero junctions, and a coffee window at the halfway lock.',
    tags: ['Gravel', 'Straight', 'Quiet'],
  },
  {
    title: 'Observatory Climb',
    category: 'routes',
    location: 'Observatory Hill',
    neighbourhood: 'Upper Terrace',
    description:
      'The steepest sustained climb inside the ring road. Six switchbacks, an average gradient of 7% and a view over the whole basin from the top.',
    tags: ['Climb', 'Views', 'Hard'],
  },
  {
    title: 'Harbour Sprint',
    category: 'routes',
    location: 'Harbour Front',
    neighbourhood: 'Docklands',
    description:
      'Two kilometres of closed dock road with a perfect surface. Locals use it for intervals; the wind off the water decides whether it feels easy or brutal.',
    tags: ['Fast', 'Intervals', 'Windy'],
  },
  {
    title: 'Botanic Garden Circuit',
    category: 'routes',
    location: 'Botanic Garden',
    neighbourhood: 'Linden',
    description:
      'A gentle circuit through the glasshouse district under a full canopy of lime trees. Shaded the whole way, which makes it the summer default.',
    tags: ['Shaded', 'Easy', 'Family'],
  },
  {
    title: 'Sunset Pier Run',
    category: 'scenic',
    location: 'Sunset Pier',
    neighbourhood: 'West Bay',
    description:
      'The old timber pier reopened to pedestrians and bikes last spring. Come at golden hour — the light off the bay is the whole point.',
    tags: ['Golden hour', 'Waterfront'],
  },
  {
    title: 'Granite Quay Viewpoint',
    category: 'scenic',
    location: 'Granite Quay',
    neighbourhood: 'Docklands',
    description:
      'A platform cantilevered over the water where the container cranes still work through the night. Industrial, cinematic, and empty after 9pm.',
    tags: ['Industrial', 'Night', 'Photo spot'],
  },
  {
    title: 'Linden Park',
    category: 'parks',
    location: 'Linden Avenue',
    neighbourhood: 'Linden',
    description:
      'Eleven hectares of open lawn with a 2.4 km perimeter path marked every 400 metres. The unofficial track for everyone in the district.',
    tags: ['Loop', 'Marked', 'Open late'],
  },
  {
    title: 'Foundry Coffee',
    category: 'coffee',
    location: 'Foundry Lane 12',
    neighbourhood: 'Foundry',
    description:
      'A former iron works turned roastery. Bike racks inside, filter on tap, and staff who will refill a bottle without being asked.',
    tags: ['Roastery', 'Bike racks', 'Filter'],
  },
  {
    title: 'Quay Espresso Bar',
    category: 'coffee',
    location: 'Harbour Front 3',
    neighbourhood: 'Quay North',
    description:
      'A six-seat espresso bar built into the ferry terminal wall. Opens at 05:30 for the first crossing, which makes it the natural first stop of any dawn ride.',
    tags: ['Early', 'Espresso', 'Tiny'],
  },
  {
    title: 'Mill Street Roasters',
    category: 'coffee',
    location: 'Mill Street 41',
    neighbourhood: 'Old Town',
    description:
      'Single-origin only, changed weekly, listed on a chalkboard nobody can read from the door. Worth the detour through the cobbles.',
    tags: ['Single origin', 'Pastries'],
  },
  {
    title: 'Canal House Café',
    category: 'coffee',
    location: 'North Canal 7',
    neighbourhood: 'Foundry',
    description:
      'Sits directly on the towpath at the halfway lock. The terrace catches the morning sun and the cinnamon buns come out at eight.',
    tags: ['Terrace', 'On route'],
  },
  {
    title: 'Cathedral Square Kiosk',
    category: 'coffee',
    location: 'Cathedral Square',
    neighbourhood: 'Cathedral Hill',
    description:
      'A green kiosk that has been pouring coffee on this square since 1974. Cash still preferred, cups still ceramic.',
    tags: ['Classic', 'Outdoor'],
  },
  {
    title: 'Willow Common',
    category: 'parks',
    location: 'Willow Crossing',
    neighbourhood: 'West Bay',
    description:
      'Meadow grass, a swimming pond and a gravel loop that stays rideable after rain. Busy at weekends, empty on a weekday morning.',
    tags: ['Pond', 'Gravel loop'],
  },
  {
    title: 'Observatory Gardens',
    category: 'parks',
    location: 'Observatory Hill',
    neighbourhood: 'Upper Terrace',
    description:
      'Terraced gardens climbing the hill in five steps. The top terrace is the best place in the city to stretch after a climb.',
    tags: ['Terraced', 'Views'],
  },
  {
    title: 'Foundry Green',
    category: 'parks',
    location: 'Foundry Lane',
    neighbourhood: 'Foundry',
    description:
      'A reclaimed rail yard turned pocket park. Concrete, wildflowers and a pump track at the far end.',
    tags: ['Pump track', 'Pocket park'],
  },
  {
    title: 'Botanic Garden',
    category: 'parks',
    location: 'Botanic Gate',
    neighbourhood: 'Linden',
    description:
      'Glasshouses, a fern gully and benches under lime trees. Bikes allowed on the outer path only, which keeps it calm.',
    tags: ['Glasshouse', 'Calm'],
  },
  {
    title: 'The Lock Kitchen',
    category: 'restaurants',
    location: 'North Canal 22',
    neighbourhood: 'Foundry',
    description:
      'Open fire cooking in a converted lock keeper’s house. The set lunch is three courses and lands in under forty minutes.',
    tags: ['Fire', 'Set lunch'],
  },
  {
    title: 'Quay Fish House',
    category: 'restaurants',
    location: 'Granite Quay 4',
    neighbourhood: 'Docklands',
    description:
      'Whatever came in that morning, grilled whole. Paper tablecloths, a chalk menu and a queue after seven.',
    tags: ['Seafood', 'No booking'],
  },
  {
    title: 'Linden Bistro',
    category: 'restaurants',
    location: 'Linden Avenue 88',
    neighbourhood: 'Linden',
    description:
      'A neighbourhood bistro with a courtyard that fills the moment the sun clears the roofline. Long lunches strongly encouraged.',
    tags: ['Courtyard', 'Long lunch'],
  },
  {
    title: 'Old Town Tavern',
    category: 'restaurants',
    location: 'Cathedral Square 2',
    neighbourhood: 'Old Town',
    description:
      'Vaulted cellar, heavy plates, and the only kitchen in the quarter still open past midnight.',
    tags: ['Late', 'Hearty'],
  },
  {
    title: 'Market Hall Canteen',
    category: 'restaurants',
    location: 'Central Market',
    neighbourhood: 'Old Town',
    description:
      'Twelve counters under one glass roof. Fast, cheap and the easiest place to refuel mid-ride without changing out of kit.',
    tags: ['Fast', 'Casual'],
  },
  {
    title: 'Cathedral Rooftop',
    category: 'scenic',
    location: 'Cathedral Hill',
    neighbourhood: 'Cathedral Hill',
    description:
      'Two hundred and eleven steps to a walkway that circles the spire. The whole route network makes sense once you see it from up here.',
    tags: ['Rooftop', 'Panorama'],
  },
  {
    title: 'North Bridge Overlook',
    category: 'scenic',
    location: 'Riverside Bridge',
    neighbourhood: 'Quay North',
    description:
      'The pedestrian deck of the north bridge, level with the cable anchors. Trains pass underneath every few minutes.',
    tags: ['Bridge', 'Sunset'],
  },
  {
    title: 'Tram Depot Yard',
    category: 'scenic',
    location: 'Tram Depot',
    neighbourhood: 'Foundry',
    description:
      'A working depot that opens its yard on weekends. Rows of restored cars, brick arches and very good light after four.',
    tags: ['Heritage', 'Weekends'],
  },
  {
    title: 'West Bay Lighthouse',
    category: 'scenic',
    location: 'West Bay',
    neighbourhood: 'West Bay',
    description:
      'Nine kilometres out along the sea wall with nothing to break the wind. Turn around at the lighthouse and let it push you home.',
    tags: ['Sea wall', 'Exposed'],
  },
  {
    title: 'Upper Terrace Traverse',
    category: 'routes',
    location: 'Upper Terrace',
    neighbourhood: 'Upper Terrace',
    description:
      'A contour road that holds the same altitude for six kilometres across the hillside. Rolling, quiet, and the best evening ride in the city.',
    tags: ['Rolling', 'Evening', 'Quiet'],
  },
  {
    title: 'Union Station Link',
    category: 'routes',
    location: 'Union Station',
    neighbourhood: 'Old Town',
    description:
      'The commuter spine: protected the entire way from the station to the eastern districts, with signal priority at every junction.',
    tags: ['Protected', 'Commute', 'Fast'],
  },
  {
    title: 'Mill Street Circuit',
    category: 'routes',
    location: 'Mill Street',
    neighbourhood: 'Old Town',
    description:
      'A short, technical circuit through the mill district. Tight corners, changing surfaces and a headwind on the return leg.',
    tags: ['Technical', 'Short'],
  },
]

const DIFFICULTIES = ['easy', 'moderate', 'hard'] as const

/** The hero cards on Explore carry fixed headline numbers. */
const OVERRIDES: Record<string, { distance?: number; rating?: number }> = {
  'Riverside Loop': { distance: 8.4, rating: 4.8 },
  'Old Town Route': { distance: 5.7, rating: 4.9 },
  'Observatory Climb': { distance: 6.2, rating: 4.7 },
  'North Canal Path': { distance: 11.3, rating: 4.6 },
}

export const places: Place[] = SEEDS.map((seed, index) => {
  const rand = mulberry32(9_000 + index * 131)
  const isRoute = seed.category === 'routes' || seed.category === 'scenic'
  const override = OVERRIDES[seed.title]
  const distance = override?.distance ?? round(isRoute ? 3.2 + rand() * 14 : 0.4 + rand() * 5.5, 1)
  const rating = override?.rating ?? round(4.1 + rand() * 0.9, 1)

  return {
    id: `place-${(index + 1).toString().padStart(2, '0')}`,
    title: seed.title,
    category: seed.category,
    distance,
    rating,
    reviews: 40 + Math.floor(rand() * 900),
    description: seed.description,
    location: seed.location,
    neighbourhood: seed.neighbourhood,
    estimatedDuration: Math.round(isRoute ? (distance / 16) * 60 + 6 : 8 + rand() * 22),
    difficulty: DIFFICULTIES[Math.floor(rand() * 3)] ?? 'easy',
    tags: seed.tags,
    artSeed: 9_000 + index * 131,
    route: generateRoute(4_100 + index * 271, { closed: isRoute ? rand() > 0.4 : true }),
    popularity: 120 + Math.floor(rand() * 4_800),
  }
})

/** Curated pins for the "Riverside Loop 8.4 km · 4.8" style cards on Explore. */
export const featuredPlaceIds = ['place-01', 'place-02', 'place-04', 'place-07'] as const

export const placeCategories: { id: PlaceCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'parks', label: 'Parks' },
  { id: 'restaurants', label: 'Restaurants' },
  { id: 'scenic', label: 'Scenic' },
  { id: 'routes', label: 'Popular routes' },
]
