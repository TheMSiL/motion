# MOTION

**Move more. Live better.**

A mobile-first web application for tracking personal activity, trips and urban mobility. It is
built as a real product rather than a demo: every button does something, every screen has loading,
empty and error states, and everything you change is persisted.

The primary canvas is **390 × 844**. Phones and tablets get the full screen; from 1024px the same
app is presented inside a device frame beside a product panel — the mobile UX is never restructured
into a desktop dashboard.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle
npm run preview  # serve the production build
npm run lint     # oxlint
```

Node 20+ is required. There is no backend and no database — all data is local.

---

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router · Framer Motion · Recharts ·
Lucide · React Hook Form · Zod

No Next.js, no state library beyond React context and one external store, no network requests at
runtime — including for imagery.

---

## Screens

| Route | Screen |
| --- | --- |
| `/onboarding` | Five-step intro with swipe, skip and a persisted completion flag |
| `/` | Home — greeting, hero card, today's stats, quick actions, weekly chart, recent activity |
| `/activity` | Activity history, grouped by day, filterable by type |
| `/activity/:id` | Activity detail — animated route map, metrics, elevation profile, splits |
| `/activity/live` | Live recording session with a working timer, pause/resume and finish |
| `/activity/summary` | Post-session summary with save and share |
| `/explore` | Discover routes and places: search, categories, recent searches |
| `/explore/:id` | Place detail with cover art, facts, description and route map |
| `/explore/saved` | Saved places |
| `/goals` | Weekly, daily and monthly goals with progress rings |
| `/goals/:id` | Goal detail with a large progress ring, breakdown chart and target editing |
| `/profile` | Profile, stats and account navigation |
| `/profile/personal` | Personal information form (React Hook Form + Zod) |
| `/settings` | Units, theme, notifications, privacy, connected apps |
| `/notifications` | Notification centre with unread state and swipe-to-dismiss |
| `*` | Custom 404 |

---

## Architecture

```
src/
  app/          router, shell layout, error boundary
  components/
    ui/         Button, Card, BottomSheet, Modal, ProgressRing, Switch,
                SegmentedControl, SearchBar, Skeleton, StatCard, states…
    layout/     AppViewport, DeviceFrame, Screen, MobileHeader, PageTransition
    navigation/ BottomNavigation
    charts/     ActivityChart, GoalChart, ElevationChart
    maps/       RouteMap, CityBackdrop, PlaceArtwork
    feedback/   Toaster
  features/     home, activity, explore, goals, profile, notifications,
                onboarding, search, misc — one folder per product area
  services/     activity, place, goal, notification, user
  store/        settings, saved, notifications, toasts, live session
  data/         deterministic mock dataset
  hooks/        useAsync, useLocalStorage, useTheme, useReducedMotion,
                useMediaQuery, useDeviceScale
  lib/          formatting, route generation, storage, share image, haptics
  types/        Activity, Place, Goal, Notification, Route, User, Settings
```

### Services

Every read and write goes through a service, never through the data files directly:

```ts
activityService.getActivities({ type: 'cycling' })
activityService.getActivity(id)
activityService.createActivity(input)
```

`services/client.ts` is the only place that knows *how* data is fetched. It currently resolves
against the local dataset behind a simulated latency — swapping in `fetch` there is the whole
migration to a real API; no feature code changes.

### Data

The dataset is deterministic — a seeded PRNG (`mulberry32`) generates it once at module load, so
numbers never change between renders or reloads:

- **50 activities** — the last two weeks are hand-authored so the headline figures hold
  (12.4 km today, 48.2 km this week, and a **computed** +18% against the previous week's 40.8 km)
- **30 places** across five categories, with editorial copy
- **10 goals** across daily, weekly and monthly periods
- **20 notifications**

Only dates are anchored to "now", so the product always reads as live.

### Maps and imagery

There is no map API and no stock photography — nothing loads over the network.

- `CityBackdrop` procedurally draws a basemap (streets, blocks, a river, parks, a rail line) from a
  seed, so a given route always sits on the same streets.
- `RouteMap` renders the polyline as a smoothed Catmull-Rom path and draws it from start to finish
  on mount; live sessions render a partial path with a pulsing head marker.
- `PlaceArtwork` composes each cover from a tinted ground, topographic bands and a category motif.
  Route and scenic covers draw that place's **actual** polyline, so every card is its own shape.
- The share card is drawn to a `<canvas>` at 1080 × 1350 and exported as a real PNG, locally.

---

## Behaviour worth checking

- **Live session** — start a ride from Home. The timer is wall-clock based (a backgrounded tab
  still reports the right duration) and runs on an accelerated demo clock. Leave the screen and a
  pill keeps the session visible; come back, pause, resume, finish, save.
- **Bottom sheets** — slide from the bottom, drag to dismiss, close on backdrop or Escape, trap
  focus, and always offer a button alternative to the gesture.
- **⌘K / Ctrl+K** — global search across activities, routes and places, fully keyboard navigable.
  On mobile the same search is reachable from the header.
- **Units** — switch to miles in Settings and every distance, speed and pace in the app follows,
  including the exported share card.
- **Theme** — System / Light / Dark, applied before first paint to avoid a flash.
- **Reduced motion** — `prefers-reduced-motion: reduce` disables route drawing, page transitions,
  count-ups and other large motion; the app stays fully usable.

### What is persisted

`onboardingCompleted`, `theme`, `settings`, `savedPlaces`, notification read/dismissed state, goal
target overrides, locally recorded activities and recent searches. Only the mutable slice of each
entity is stored, never whole objects. Profile → *Reset local data* clears all of it.

---

## Accessibility

Semantic landmarks and headings, labelled controls, visible focus states, focus trapping and
restoration in dialogs and sheets, `aria-current` on the active tab, live-region toasts, keyboard
equivalents for every gesture, and a screen-reader summary of the weekly chart.

## Performance

Routes are lazily loaded and the charting library is split out of the first paint. Vendors are
chunked separately, animation is limited to transform and opacity, and images are generated SVG
rather than downloads.
