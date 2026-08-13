import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bike, Check, Footprints, Zap } from 'lucide-react'
import type { ActivityType } from '@/types'
import { cn } from '@/lib/utils'
import { haptic } from '@/lib/haptics'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { sessionStore } from '@/store/session-store'

const OPTIONS: { value: ActivityType; label: string; hint: string; icon: typeof Bike }[] = [
  { value: 'cycling', label: 'Cycling', hint: 'Road, gravel or commute', icon: Bike },
  { value: 'walking', label: 'Walking', hint: 'City walks and strolls', icon: Footprints },
  { value: 'running', label: 'Running', hint: 'Tempo, easy or intervals', icon: Zap },
]

export interface StartActivitySheetProps {
  open: boolean
  onClose: () => void
}

/** "Choose activity" sheet — the entry point into a live session. */
export function StartActivitySheet({ open, onClose }: StartActivitySheetProps) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<ActivityType>('cycling')

  function start() {
    haptic('success')
    sessionStore.start(selected)
    onClose()
    navigate('/activity/live')
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Choose activity"
      description="Your session starts as soon as you pick a mode."
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" size="lg" onClick={onClose} className="px-6">
            Cancel
          </Button>
          <Button size="lg" fullWidth onClick={start}>
            Start {OPTIONS.find((o) => o.value === selected)?.label.toLowerCase()}
          </Button>
        </div>
      }
    >
      <div className="space-y-2.5" role="radiogroup" aria-label="Activity type">
        {OPTIONS.map((option) => {
          const active = option.value === selected
          const Icon = option.icon
          return (
            <motion.button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                haptic('light')
                setSelected(option.value)
              }}
              className={cn(
                'flex w-full items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-colors duration-150',
                active
                  ? 'border-transparent bg-surface-inverse text-ink-inverse'
                  : 'border-line bg-surface hover:border-line-strong',
              )}
            >
              <span
                className={cn(
                  'grid size-11 shrink-0 place-items-center rounded-xl',
                  active ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink',
                )}
              >
                <Icon className="size-5" strokeWidth={1.9} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold tracking-[-0.01em]">
                  {option.label}
                </span>
                <span
                  className={cn(
                    'mt-0.5 block text-[12.5px]',
                    active ? 'text-ink-inverse/55' : 'text-ink-3',
                  )}
                >
                  {option.hint}
                </span>
              </span>
              {active && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 620, damping: 24 }}
                  className="grid size-6 shrink-0 place-items-center rounded-full bg-accent"
                >
                  <Check className="size-3.5 text-accent-ink" strokeWidth={3} aria-hidden="true" />
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </div>
    </BottomSheet>
  )
}
