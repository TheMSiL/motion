import { useEffect, useState } from 'react'

function currentTime() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Cosmetic status bar shown only when the app is presented inside the desktop
 * device frame — on a real phone the OS draws its own.
 */
export function StatusBar() {
  const [time, setTime] = useState(currentTime)

  useEffect(() => {
    const timer = window.setInterval(() => setTime(currentTime()), 20_000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-[65] flex h-[var(--status-h)] items-center justify-between px-7 text-ink"
      aria-hidden="true"
    >
      <span className="text-[13px] font-semibold tracking-[-0.01em] tabular">{time}</span>
      <span className="flex items-center gap-1.5">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
          <rect x="0" y="7.5" width="2.6" height="3.5" rx="0.8" opacity="0.9" />
          <rect x="4.2" y="5.2" width="2.6" height="5.8" rx="0.8" opacity="0.9" />
          <rect x="8.4" y="2.8" width="2.6" height="8.2" rx="0.8" opacity="0.9" />
          <rect x="12.6" y="0" width="2.6" height="11" rx="0.8" opacity="0.35" />
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke="currentColor">
          <path
            d="M1 4.2a9 9 0 0 1 13 0"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path d="M3.6 6.9a5.4 5.4 0 0 1 7.8 0" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
          <circle cx="7.5" cy="9.6" r="1.1" fill="currentColor" stroke="none" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect
            x="0.6"
            y="0.6"
            width="21"
            height="10.8"
            rx="3"
            stroke="currentColor"
            strokeOpacity="0.4"
            strokeWidth="1"
          />
          <rect x="2.2" y="2.2" width="14.5" height="7.6" rx="1.8" fill="currentColor" />
          <path
            d="M23 4.2v3.6a2 2 0 0 0 0-3.6Z"
            fill="currentColor"
            fillOpacity="0.4"
          />
        </svg>
      </span>
    </div>
  )
}
