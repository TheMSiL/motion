import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { ArrowRight, Compass, Sparkles, Target, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { haptic } from '@/lib/haptics'
import { STORAGE_KEYS, writeStorage } from '@/lib/storage'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { AppViewport } from '@/components/layout/AppViewport'
import { Button } from '@/components/ui/Button'
import { OnboardingArt } from './OnboardingArt'

const SLIDES = [
  {
    id: 'welcome',
    eyebrow: 'Welcome to MOTION',
    title: 'Move more.\nLive better.',
    body: 'Your rides, runs and walks in one place — measured, mapped and worth looking at.',
    icon: Sparkles,
  },
  {
    id: 'track',
    eyebrow: 'Track your activity',
    title: 'Every trip\ncounts.',
    body: 'Start a session and MOTION records distance, pace, elevation and calories as you move.',
    icon: TrendingUp,
  },
  {
    id: 'goals',
    eyebrow: 'Set your goals',
    title: 'Aim for\nthe week.',
    body: 'Weekly distance, daily streaks, monthly targets. Progress you can read in one glance.',
    icon: Target,
  },
  {
    id: 'explore',
    eyebrow: 'Explore your city',
    title: "Find the\ngood routes.",
    body: 'Loops, climbs, coffee stops and viewpoints — saved and ready when you are.',
    icon: Compass,
  },
  {
    id: 'final',
    eyebrow: "Let's move.",
    title: 'Ready when\nyou are.',
    body: 'Everything runs locally on this device. No account, no waiting.',
    icon: Sparkles,
  },
] as const

export default function OnboardingPage() {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const slide = SLIDES[index] as (typeof SLIDES)[number]
  const isLast = index === SLIDES.length - 1

  const complete = useCallback(() => {
    haptic('success')
    writeStorage(STORAGE_KEYS.onboarding, true)
    navigate('/', { replace: true })
  }, [navigate])

  const go = useCallback(
    (next: number) => {
      if (next < 0 || next >= SLIDES.length) return
      setDirection(next > index ? 1 : -1)
      setIndex(next)
      haptic('light')
    },
    [index],
  )

  const onDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.x < -60 || info.velocity.x < -450) go(index + 1)
      else if (info.offset.x > 60 || info.velocity.x > 450) go(index - 1)
    },
    [go, index],
  )

  const variants = {
    enter: (dir: number) => ({ x: reduced ? 0 : dir * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: reduced ? 0 : dir * -60, opacity: 0 }),
  }

  return (
    <AppViewport>
      <div className="relative flex size-full flex-col bg-[var(--bg)] pt-[var(--status-h,0px)]">
        <OnboardingArt slideId={slide.id} />

        <header className="relative z-20 flex shrink-0 items-center justify-between px-[var(--gutter)] pt-4">
          {/* Both sit on top of artwork that changes per slide, so they carry
              their own surface to stay legible in either theme. */}
          <span className="rounded-full border border-line bg-surface/85 px-3 py-1.5 text-[12.5px] font-bold tracking-[0.2em] backdrop-blur-md">
            MOTION
          </span>
          {!isLast && (
            <button
              type="button"
              onClick={complete}
              className="rounded-full border border-line bg-surface/85 px-3.5 py-1.5 text-[13px] font-semibold text-ink-2 backdrop-blur-md transition-colors hover:text-ink"
            >
              Skip
            </button>
          )}
        </header>

        <motion.div
          className="relative z-10 flex flex-1 touch-pan-y flex-col justify-end px-[var(--gutter)] pb-2"
          drag={reduced ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={onDragEnd}
        >
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={slide.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduced ? 0.12 : 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 shadow-[var(--shadow-sm)]">
                <slide.icon className="size-3.5 text-ink-2" aria-hidden="true" />
                <span className="text-[12px] font-semibold tracking-[0.02em] text-ink-2">
                  {slide.eyebrow}
                </span>
              </span>

              <h1 className="text-display mt-5 whitespace-pre-line text-[42px]">{slide.title}</h1>
              <p className="mt-4 max-w-[300px] text-[15px] leading-relaxed text-ink-2">
                {slide.body}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="safe-bottom relative z-10 px-[var(--gutter)] pb-5">
          <div className="mb-5 flex items-center gap-2" role="tablist" aria-label="Onboarding steps">
            {SLIDES.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Step ${i + 1}: ${item.eyebrow}`}
                onClick={() => go(i)}
                className="h-6 rounded-full"
                style={{ width: i === index ? 26 : 8 }}
              >
                <span
                  className={cn(
                    'block h-1.5 rounded-full transition-all duration-300',
                    i === index ? 'w-[26px] bg-accent' : 'w-2 bg-line-strong',
                  )}
                />
              </button>
            ))}
          </div>

          {isLast ? (
            <Button size="lg" fullWidth onClick={complete} icon={<ArrowRight className="size-[18px]" />}>
              Get started
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => go(index - 1)}
                disabled={index === 0}
                className="px-5"
              >
                Back
              </Button>
              <Button size="lg" fullWidth onClick={() => go(index + 1)}>
                Continue
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppViewport>
  )
}
