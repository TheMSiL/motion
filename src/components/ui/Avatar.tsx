import { cn } from '@/lib/utils'

export interface AvatarProps {
  initials: string
  name?: string
  size?: number
  className?: string
  /** Draws the accent ring used to signal an active streak. */
  ring?: boolean
}

export function Avatar({ initials, name, size = 44, className, ring }: AvatarProps) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full',
        'bg-surface-inverse text-ink-inverse font-semibold tracking-[-0.02em]',
        ring && 'ring-2 ring-accent ring-offset-2 ring-offset-[var(--bg)]',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      role="img"
      aria-label={name ? `${name}'s avatar` : 'Avatar'}
    >
      {initials}
    </span>
  )
}
