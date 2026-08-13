import { AnimatePresence, motion } from 'framer-motion'
import { generateRoute, toSmoothPath } from '@/lib/route-gen'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { CityBackdrop } from '@/components/maps/CityBackdrop'

const ROUTE = generateRoute(4242, { closed: true })
const ROUTE_PATH = toSmoothPath(ROUTE.points)
const BARS = [38, 62, 44, 88, 54, 100, 46]

export interface OnboardingArtProps {
  slideId: string
}

/**
 * The upper half of onboarding. Each step previews a real piece of the app's
 * visual language — the route line, the weekly chart, the progress rings.
 */
export function OnboardingArt({ slideId }: OnboardingArtProps) {
  const reduced = useReducedMotion()
  const transition = { duration: reduced ? 0.12 : 0.5, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <div className="absolute inset-x-0 top-0 h-[48%] min-h-[260px] overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slideId}
          initial={{ opacity: 0, scale: reduced ? 1 : 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: reduced ? 1 : 0.98 }}
          transition={transition}
          className="absolute inset-0"
        >
          {slideId === 'welcome' && <WelcomeArt reduced={reduced} />}
          {slideId === 'track' && <TrackArt reduced={reduced} />}
          {slideId === 'goals' && <GoalsArt reduced={reduced} />}
          {slideId === 'explore' && <ExploreArt reduced={reduced} />}
          {slideId === 'final' && <FinalArt reduced={reduced} />}
        </motion.div>
      </AnimatePresence>

      {/* Top scrim: the art bleeds under the status bar and the MOTION / Skip
          chips, so it has to fade out behind them to stay legible. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[var(--bg)] via-[var(--bg)]/55 to-transparent"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--bg)] to-transparent"
        aria-hidden="true"
      />
    </div>
  )
}

function WelcomeArt({ reduced }: { reduced: boolean }) {
  return (
    <div className="relative size-full bg-surface-2">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="size-full">
        {/* The viewBox is drawn with `slice`, so every unit is ~4× on screen.
            The disc sits low and inboard to clear the status bar and Skip. */}
        <circle cx="66" cy="58" r="19" fill="var(--accent)" opacity="0.9" />
        <circle cx="26" cy="44" r="13" fill="var(--ink)" opacity="0.06" />
        <motion.path
          d={ROUTE_PATH}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.4"
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={reduced ? {} : { pathLength: 1 }}
          transition={{ duration: 1.9, ease: [0.32, 0.72, 0.3, 1] }}
        />
      </svg>
    </div>
  )
}

function TrackArt({ reduced }: { reduced: boolean }) {
  return (
    // pt-28 shrinks the content box, so even the 100% bar starts below the
    // chip row instead of running off the top edge of the phone.
    <div className="relative flex size-full items-end justify-center gap-2.5 bg-surface-2 px-10 pt-28 pb-14">
      {BARS.map((height, index) => (
        <motion.span
          key={index}
          className="w-full max-w-[26px] rounded-t-lg"
          style={{ backgroundColor: height === 100 ? 'var(--accent)' : 'var(--ink)' }}
          initial={reduced ? false : { height: 0, opacity: 0.4 }}
          animate={{ height: `${height}%`, opacity: height === 100 ? 1 : 0.14 }}
          transition={{ duration: 0.6, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  )
}

function GoalsArt({ reduced }: { reduced: boolean }) {
  const rings = [
    { r: 40, value: 0.69, color: 'var(--accent)', width: 9 },
    { r: 28, value: 0.43, color: 'var(--ink)', width: 9 },
    { r: 16, value: 0.86, color: 'var(--ink-3)', width: 9 },
  ]

  return (
    <div className="relative grid size-full place-items-center bg-surface-2">
      <svg viewBox="0 0 100 100" className="size-[220px]" aria-hidden="true">
        {rings.map((ring, index) => {
          const circumference = 2 * Math.PI * ring.r
          return (
            <g key={ring.r} transform="rotate(-90 50 50)">
              <circle
                cx="50"
                cy="50"
                r={ring.r}
                fill="none"
                stroke="var(--line)"
                strokeWidth={ring.width}
              />
              <motion.circle
                cx="50"
                cy="50"
                r={ring.r}
                fill="none"
                stroke={ring.color}
                strokeWidth={ring.width}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={reduced ? false : { strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference * (1 - ring.value) }}
                transition={{ duration: 1.1, delay: 0.12 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                opacity={index === 1 ? 0.16 : 1}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function ExploreArt({ reduced }: { reduced: boolean }) {
  return (
    <div className="relative size-full">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="size-full">
        <CityBackdrop seed={91} />
        <motion.path
          d={ROUTE_PATH}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.45"
          initial={reduced ? false : { pathLength: 0 }}
          animate={reduced ? {} : { pathLength: 1 }}
          transition={{ duration: 1.6, ease: [0.32, 0.72, 0.3, 1] }}
        />
        <motion.path
          d={ROUTE_PATH}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={reduced ? {} : { pathLength: 1 }}
          transition={{ duration: 1.6, ease: [0.32, 0.72, 0.3, 1] }}
        />
        {ROUTE.waypoints.map((waypoint) => (
          <circle
            key={waypoint.label}
            cx={waypoint.x}
            cy={waypoint.y}
            r="1.8"
            fill="var(--surface)"
            stroke="var(--ink)"
            strokeWidth="0.9"
          />
        ))}
      </svg>
    </div>
  )
}

function FinalArt({ reduced }: { reduced: boolean }) {
  return (
    <div className="relative grid size-full place-items-center overflow-hidden bg-surface-inverse">
      <motion.div
        initial={reduced ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <p className="text-[64px] font-semibold leading-none tracking-[-0.05em] text-ink-inverse">
          12.4
        </p>
        <p className="mt-1 text-label text-ink-inverse/60">KM TODAY</p>
      </motion.div>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full opacity-30"
        aria-hidden="true"
      >
        <motion.path
          d={ROUTE_PATH}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.4"
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={reduced ? {} : { pathLength: 1 }}
          transition={{ duration: 2.1, ease: [0.32, 0.72, 0.3, 1] }}
        />
      </svg>
    </div>
  )
}
