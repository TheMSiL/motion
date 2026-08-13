import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, House } from 'lucide-react'
import { generateRoute, toSmoothPath } from '@/lib/route-gen'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Screen } from '@/components/layout/Screen'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { Button } from '@/components/ui/Button'

const LOST_ROUTE = generateRoute(404, { closed: false })
const LOST_PATH = toSmoothPath(LOST_ROUTE.points)

export default function NotFoundPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const reduced = useReducedMotion()

  return (
    <Screen header={<MobileHeader back title="Not found" />}>
      <div className="flex min-h-full flex-col items-center justify-center px-8 text-center">
        <div className="relative h-40 w-full max-w-[280px]">
          <svg viewBox="0 0 100 100" className="size-full" aria-hidden="true">
            <path
              d={LOST_PATH}
              fill="none"
              stroke="var(--line-strong)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="4 5"
            />
            <motion.circle
              r="3.4"
              fill="var(--accent)"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              cx={LOST_ROUTE.points[Math.floor(LOST_ROUTE.points.length / 2)]?.x ?? 50}
              cy={LOST_ROUTE.points[Math.floor(LOST_ROUTE.points.length / 2)]?.y ?? 50}
            />
          </svg>
        </div>

        <p className="text-display text-[64px] text-ink-3">404</p>
        <h1 className="mt-3 text-[22px] font-semibold tracking-[-0.025em]">
          This route does not exist
        </h1>
        <p className="mt-2 max-w-[300px] text-[14px] leading-relaxed text-ink-2">
          We could not find{' '}
          <span className="font-medium text-ink">{location.pathname}</span>. It may have moved, or
          the link is out of date.
        </p>

        <div className="mt-7 flex w-full max-w-[300px] flex-col gap-2.5">
          <Button
            size="lg"
            fullWidth
            icon={<House className="size-[18px]" />}
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            icon={<Compass className="size-[18px]" />}
            onClick={() => navigate('/explore')}
          >
            Explore routes
          </Button>
        </div>
      </div>
    </Screen>
  )
}
