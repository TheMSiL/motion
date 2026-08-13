import { forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ScreenProps {
  /** Rendered above the scroll area, pinned to the top of the viewport. */
  header?: ReactNode
  children: ReactNode
  /** Leaves room for the bottom navigation. */
  withNav?: boolean
  /** Content starts under the header — used by full-bleed hero screens. */
  fullBleed?: boolean
  className?: string
  contentClassName?: string
  /** Pinned action area above the navigation, e.g. a primary CTA. */
  footer?: ReactNode
}

/**
 * The scroll container every screen sits in. Scrolling is owned here rather
 * than by the window, which is what keeps the header, navigation and sheets
 * anchored to the phone frame on desktop.
 */
export const Screen = forwardRef<HTMLDivElement, ScreenProps>(function Screen(
  { header, children, withNav = false, fullBleed = false, className, contentClassName, footer },
  ref,
) {
  return (
    <div className={cn('relative h-full', className)}>
      {header}
      <div
        ref={ref}
        className={cn(
          'scrollbar-none h-full overflow-y-auto overscroll-contain',
          contentClassName,
        )}
        style={{
          paddingTop:
            header && !fullBleed ? 'calc(var(--header-h) + var(--status-h, 0px))' : 0,
          paddingBottom: withNav
            ? 'calc(var(--nav-h) + env(safe-area-inset-bottom, 0px) + 20px)'
            : 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
        }}
      >
        {children}
      </div>
      {footer && (
        <div
          className="absolute inset-x-0 z-30 border-t border-line bg-[var(--bg)]/92 px-[var(--gutter)] py-3 backdrop-blur-xl"
          style={{
            bottom: withNav ? 'calc(var(--nav-h) + env(safe-area-inset-bottom, 0px))' : 0,
            paddingBottom: withNav ? undefined : 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  )
})
