import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  variant: ToastVariant
  description?: string
  action?: { label: string; onClick: () => void }
}

interface ToastOptions {
  variant?: ToastVariant
  description?: string
  action?: { label: string; onClick: () => void }
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (message: string, options?: ToastOptions) => void
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const MAX_VISIBLE = 3
const DEFAULT_DURATION = 3200

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)
  const timers = useRef(new Map<number, number>())

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const toast = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const id = nextId.current++
      const next: Toast = {
        id,
        message,
        variant: options.variant ?? 'success',
        ...(options.description ? { description: options.description } : {}),
        ...(options.action ? { action: options.action } : {}),
      }
      setToasts((prev) => [...prev, next].slice(-MAX_VISIBLE))
      const timer = window.setTimeout(() => dismiss(id), options.duration ?? DEFAULT_DURATION)
      timers.current.set(id, timer)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}
