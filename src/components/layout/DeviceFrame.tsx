import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Outer hardware dimensions — the app canvas inside is 390 × 844. */
export const DEVICE_WIDTH = 412
export const DEVICE_HEIGHT = 866

export interface DeviceFrameProps {
  children: ReactNode
  className?: string
}

/**
 * Premium hardware frame used to present the app on tablet and desktop.
 * The app itself is unchanged inside — it is the same 390 × 844 canvas.
 */
export function DeviceFrame({ children, className }: DeviceFrameProps) {
  return (
    <div
      className={cn(
        'relative shrink-0 rounded-[54px] p-[11px]',
        'bg-gradient-to-b from-[#3a3d40] via-[#131416] to-[#2a2d30]',
        'shadow-[var(--shadow-device)]',
        className,
      )}
      style={{ width: DEVICE_WIDTH, height: DEVICE_HEIGHT }}
    >
      {/* Polished inner bezel */}
      <div className="absolute inset-[7px] rounded-[48px] ring-1 ring-white/10" aria-hidden="true" />

      {/* Side hardware */}
      <span
        className="absolute -left-[3px] top-[132px] h-8 w-[3px] rounded-l-sm bg-[#232629]"
        aria-hidden="true"
      />
      <span
        className="absolute -left-[3px] top-[184px] h-14 w-[3px] rounded-l-sm bg-[#232629]"
        aria-hidden="true"
      />
      <span
        className="absolute -left-[3px] top-[252px] h-14 w-[3px] rounded-l-sm bg-[#232629]"
        aria-hidden="true"
      />
      <span
        className="absolute -right-[3px] top-[212px] h-20 w-[3px] rounded-r-sm bg-[#232629]"
        aria-hidden="true"
      />

      <div className="relative size-full overflow-hidden rounded-[44px] bg-[var(--bg)]">
        {/* Dynamic island */}
        <div
          className="pointer-events-none absolute left-1/2 top-2 z-[70] h-[26px] w-[94px] -translate-x-1/2 rounded-full bg-black"
          aria-hidden="true"
        >
          <span className="absolute right-3 top-1/2 size-2 -translate-y-1/2 rounded-full bg-[#15181c]" />
        </div>

        {children}

        {/* Home indicator */}
        <div
          className="pointer-events-none absolute bottom-1.5 left-1/2 z-[70] h-[5px] w-[124px] -translate-x-1/2 rounded-full bg-ink/25"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
