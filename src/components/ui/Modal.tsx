import { useEffect, useId, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { IconButton } from './Button'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

/** Centred dialog used for confirmations and the share card. */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descriptionId = useId()
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!open) {
      previouslyFocused.current?.focus?.()
      return
    }
    previouslyFocused.current = document.activeElement as HTMLElement | null

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const node = ref.current
      if (!node) return
      const focusable = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      )
      if (focusable.length === 0) return
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
    const timer = window.setTimeout(() => {
      ref.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    }, 60)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(timer)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-5">
          <motion.button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            className="absolute inset-0 cursor-default bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={
              reduced ? { duration: 0.12 } : { type: 'spring', stiffness: 460, damping: 34 }
            }
            className={cn(
              'relative z-10 w-full max-w-[340px] overflow-hidden rounded-[26px]',
              'border border-line bg-surface shadow-[var(--shadow-lift)]',
              className,
            )}
          >
            <header className="flex items-start gap-3 px-5 pt-5">
              <div className="flex-1">
                <h2 id={titleId} className="text-[18px] font-semibold tracking-[-0.02em]">
                  {title}
                </h2>
                {description && (
                  <p id={descriptionId} className="mt-1 text-[13px] leading-relaxed text-ink-2">
                    {description}
                  </p>
                )}
              </div>
              <IconButton
                label="Close dialog"
                variant="ghost"
                size="sm"
                icon={<X className="size-4" />}
                onClick={onClose}
              />
            </header>
            <div className="px-5 py-4">{children}</div>
            {footer && <div className="border-t border-line px-5 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
