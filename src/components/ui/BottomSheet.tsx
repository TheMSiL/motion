import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  /** Hides the drag handle for sheets that must be dismissed deliberately. */
  dismissible?: boolean
  className?: string
  footer?: ReactNode
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

/**
 * Accessible modal bottom sheet: focus trap, Escape to close, backdrop click,
 * and a drag-to-dismiss gesture that always has a button equivalent.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  description,
  children,
  dismissible = true,
  className,
  footer,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descriptionId = useId()
  const reduced = useReducedMotion()

  // Escape closes; Tab is trapped inside the sheet.
  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement as HTMLElement | null

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const sheet = sheetRef.current
      if (!sheet) return
      const focusable = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      )
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusable[0] as HTMLElement
      const last = focusable[focusable.length - 1] as HTMLElement
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  // Move focus into the sheet on open, and back to the trigger on close.
  useEffect(() => {
    if (!open) {
      previouslyFocused.current?.focus?.()
      return
    }
    const timer = window.setTimeout(() => {
      const sheet = sheetRef.current
      if (!sheet) return
      const target = sheet.querySelector<HTMLElement>(FOCUSABLE)
      ;(target ?? sheet).focus()
    }, 60)
    return () => window.clearTimeout(timer)
  }, [open])

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (!dismissible) return
      if (info.offset.y > 110 || info.velocity.y > 620) onClose()
    },
    [dismissible, onClose],
  )

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <motion.button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            className="absolute inset-0 cursor-default bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.22 }}
            onClick={onClose}
          />

          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            drag={dismissible ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
            initial={{ y: reduced ? 0 : '100%', opacity: reduced ? 0 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduced ? 0 : '100%', opacity: reduced ? 0 : 1 }}
            transition={
              reduced
                ? { duration: 0.12 }
                : { type: 'spring', stiffness: 420, damping: 40, mass: 0.9 }
            }
            className={cn(
              'relative z-10 max-h-[86%] overflow-hidden bg-surface',
              'rounded-t-[28px] border-t border-line shadow-[var(--shadow-sheet)]',
              'focus-visible:outline-none',
              className,
            )}
          >
            {dismissible && (
              <div className="flex cursor-grab justify-center pt-3 pb-1 active:cursor-grabbing">
                <span className="h-1 w-9 rounded-full bg-line-strong" aria-hidden="true" />
              </div>
            )}

            {(title || description) && (
              <header className={cn('px-5', dismissible ? 'pt-2' : 'pt-6')}>
                {title && (
                  <h2 id={titleId} className="text-[19px] font-semibold tracking-[-0.02em]">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id={descriptionId} className="mt-1 text-[13px] leading-relaxed text-ink-2">
                    {description}
                  </p>
                )}
              </header>
            )}

            <div className="scrollbar-none max-h-[62vh] overflow-y-auto overscroll-contain px-5 py-4">
              {children}
            </div>

            {footer && (
              <div className="border-t border-line px-5 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
                {footer}
              </div>
            )}
            {!footer && <div className="pb-[calc(env(safe-area-inset-bottom,0px)+8px)]" />}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
