import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { useDeviceScale } from '@/hooks/useDeviceScale'
import { DeviceFrame, DEVICE_HEIGHT, DEVICE_WIDTH } from './DeviceFrame'
import { StatusBar } from './StatusBar'
import { DesktopPanel } from './DesktopPanel'

export interface AppViewportProps {
  children: ReactNode
}

/**
 * Decides how the app is presented.
 *
 * Phones and tablets get the full screen. From 1024px the identical app is
 * placed inside a device frame next to the product panel — the mobile UX is
 * never restructured into a desktop dashboard.
 */
export function AppViewport({ children }: AppViewportProps) {
  const isDesktop = useIsDesktop()
  const scale = useDeviceScale(DEVICE_HEIGHT)

  // On tablets the canvas is centred with a hairline on each side so it still
  // reads as one deliberate surface rather than a stretched page.
  if (!isDesktop) {
    return (
      <div className="app-viewport contain-fixed h-[100dvh] w-full sm:mx-auto sm:max-w-[520px] sm:border-x sm:border-line">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] w-full bg-[var(--bg)]">
      <div
        className={cn(
          'mx-auto flex min-h-[100dvh] max-w-[1400px] items-center justify-center gap-16',
          'px-10 py-12 xl:gap-24',
        )}
      >
        {/* The frame scales down on shorter screens; the app inside stays 390 × 844. */}
        <div
          className="shrink-0"
          style={{ width: DEVICE_WIDTH * scale, height: DEVICE_HEIGHT * scale }}
        >
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <DeviceFrame>
              <div
                className="app-viewport contain-fixed size-full"
                style={{ '--status-h': '46px' } as CSSProperties}
              >
                <StatusBar />
                {children}
              </div>
            </DeviceFrame>
          </div>
        </div>

        <DesktopPanel />
      </div>
    </div>
  )
}
