import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { haptic } from '@/lib/haptics'
import { useSaved } from '@/store/saved-store'
import { useToast } from '@/store/toast-store'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface SaveButtonProps {
  placeId: string
  placeTitle: string
  className?: string
  /** Larger variant used on the place detail screen. */
  size?: 'sm' | 'lg'
}

/** Toggles a saved place, with the little burst that makes saving feel good. */
export function SaveButton({ placeId, placeTitle, className, size = 'sm' }: SaveButtonProps) {
  const { isSaved, toggleSaved } = useSaved()
  const { toast } = useToast()
  const reduced = useReducedMotion()
  const saved = isSaved(placeId)

  function onClick() {
    const nowSaved = toggleSaved(placeId)
    haptic(nowSaved ? 'success' : 'light')
    toast(nowSaved ? 'Place added to favorites' : 'Removed from saved', {
      variant: nowSaved ? 'success' : 'info',
      description: placeTitle,
    })
  }

  return (
    <motion.button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${placeTitle} from saved` : `Save ${placeTitle}`}
      whileTap={reduced ? undefined : { scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 620, damping: 24 }}
      onClick={onClick}
      className={cn(
        'relative grid shrink-0 place-items-center rounded-full backdrop-blur-md transition-colors duration-200',
        size === 'lg' ? 'size-12' : 'size-9',
        saved ? 'bg-accent text-accent-ink' : 'bg-black/35 text-white hover:bg-black/50',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={saved ? 'on' : 'off'}
          initial={reduced ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="grid place-items-center"
        >
          <Bookmark
            className={cn(size === 'lg' ? 'size-5' : 'size-[17px]', saved && 'fill-current')}
            strokeWidth={2}
            aria-hidden="true"
          />
        </motion.span>
      </AnimatePresence>

      {/* Burst ring on save */}
      <AnimatePresence>
        {saved && !reduced && (
          <motion.span
            key="burst"
            initial={{ scale: 0.6, opacity: 0.6 }}
            animate={{ scale: 1.9, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-accent"
          />
        )}
      </AnimatePresence>
    </motion.button>
  )
}
