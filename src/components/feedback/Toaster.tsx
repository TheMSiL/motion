import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { useToast, type ToastVariant } from '@/store/toast-store'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const ICON_COLOR: Record<ToastVariant, string> = {
  success: 'text-accent',
  error: 'text-negative',
  info: 'text-ink-2',
}

/** Toast stack, anchored above the bottom navigation inside the app viewport. */
export function Toaster() {
  const { toasts, dismiss } = useToast()
  const reduced = useReducedMotion()

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-[calc(var(--nav-h)+16px)] z-[60] flex flex-col items-center gap-2 px-4"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.variant]
          return (
            <motion.output
              key={toast.id}
              layout={!reduced}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
              transition={
                reduced ? { duration: 0.12 } : { type: 'spring', stiffness: 520, damping: 34 }
              }
              className="pointer-events-auto flex w-full max-w-[330px] items-center gap-3 rounded-2xl border border-line bg-surface-inverse px-4 py-3 shadow-[var(--shadow-lift)]"
            >
              <Icon className={`size-[18px] shrink-0 ${ICON_COLOR[toast.variant]}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-ink-inverse">
                  {toast.message}
                </p>
                {toast.description && (
                  <p className="truncate text-[12px] text-ink-inverse/65">{toast.description}</p>
                )}
              </div>
              {toast.action ? (
                <button
                  type="button"
                  className="shrink-0 rounded-lg px-2 py-1 text-[12px] font-semibold text-accent"
                  onClick={() => {
                    toast.action?.onClick()
                    dismiss(toast.id)
                  }}
                >
                  {toast.action.label}
                </button>
              ) : null}
            </motion.output>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
