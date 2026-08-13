import { useRouteError } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/** Catches render and loader failures anywhere in the route tree. */
export function RootBoundary() {
  const error = useRouteError()
  const message =
    error instanceof Error ? error.message : 'An unexpected error stopped the app from rendering.'

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-5 bg-[var(--bg)] px-8 text-center">
      <span className="grid size-16 place-items-center rounded-3xl bg-surface-2">
        <AlertTriangle className="size-7 text-ink-3" aria-hidden="true" />
      </span>
      <div>
        <h1 className="text-[20px] font-semibold tracking-[-0.02em]">Something went wrong</h1>
        <p className="mt-2 max-w-[320px] text-[14px] leading-relaxed text-ink-2">{message}</p>
      </div>
      <Button onClick={() => window.location.assign('/')}>Back to Home</Button>
    </div>
  )
}
