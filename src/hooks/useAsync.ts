import { useCallback, useEffect, useRef, useState } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  reload: () => void
}

/**
 * Runs a service call and tracks loading/error state. Late responses from a
 * superseded call are discarded so a fast back-navigation can't flash old data.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [nonce, setNonce] = useState(0)
  const runId = useRef(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps)

  useEffect(() => {
    const id = ++runId.current
    let active = true
    setLoading(true)
    setError(null)

    run()
      .then((result) => {
        if (!active || id !== runId.current) return
        setData(result)
      })
      .catch((err: unknown) => {
        if (!active || id !== runId.current) return
        setError(err instanceof Error ? err : new Error('Something went wrong'))
      })
      .finally(() => {
        if (!active || id !== runId.current) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [run, nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  return { data, loading, error, reload }
}
