import { useId } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { haptic } from '@/lib/haptics'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  /** Renders label + description alongside the control. */
  inline?: boolean
  disabled?: boolean
}

export function Switch({ checked, onChange, label, description, inline = true, disabled }: SwitchProps) {
  const id = useId()
  const descriptionId = `${id}-description`

  const control = (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={inline ? undefined : label}
      aria-describedby={description ? descriptionId : undefined}
      disabled={disabled}
      onClick={() => {
        haptic('light')
        onChange(!checked)
      }}
      className={cn(
        'relative inline-flex h-[30px] w-[50px] shrink-0 items-center rounded-full p-[3px]',
        'transition-colors duration-200 disabled:opacity-40',
        checked ? 'bg-accent' : 'bg-line-strong',
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 640, damping: 34 }}
        className={cn(
          'size-6 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.28)]',
          checked ? 'ml-auto' : 'ml-0',
        )}
      />
    </button>
  )

  if (!inline) return control

  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="block text-[14px] font-medium">
          {label}
        </label>
        {description && (
          <p id={descriptionId} className="mt-0.5 text-[12.5px] leading-snug text-ink-3">
            {description}
          </p>
        )}
      </div>
      {control}
    </div>
  )
}
