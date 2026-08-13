import { Suspense, useEffect, useRef } from 'react'
import { useLocation, useNavigationType, useOutlet } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppViewport } from '@/components/layout/AppViewport'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { PageTransition, type TransitionKind } from '@/components/layout/PageTransition'
import { Toaster } from '@/components/feedback/Toaster'
import { CommandPalette } from '@/features/search/CommandPalette'
import { LiveSessionBar } from '@/features/activity/LiveSessionBar'
import { ScreenFallback } from '@/components/layout/ScreenFallback'

const TAB_PATHS = ['/', '/activity', '/explore', '/goals', '/profile']

function isTabPath(pathname: string) {
  return TAB_PATHS.includes(pathname)
}

export function AppLayout() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const outlet = useOutlet()
  const previousPath = useRef<string | null>(null)

  let kind: TransitionKind = 'push'
  if (previousPath.current === null) kind = 'none'
  else if (navigationType === 'POP') kind = 'pop'
  else if (isTabPath(location.pathname) && isTabPath(previousPath.current)) kind = 'tab'

  useEffect(() => {
    previousPath.current = location.pathname
  }, [location.pathname])

  const showNav = isTabPath(location.pathname)

  return (
    <AppViewport>
      <div className="relative size-full overflow-hidden">
        <AnimatePresence initial={false} mode="sync">
          <PageTransition key={location.pathname} kind={kind}>
            <Suspense fallback={<ScreenFallback withNav={showNav} />}>{outlet}</Suspense>
          </PageTransition>
        </AnimatePresence>

        <LiveSessionBar />
        {showNav && <BottomNavigation />}
        <Toaster />
        <CommandPalette />
      </div>
    </AppViewport>
  )
}
