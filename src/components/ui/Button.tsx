import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { haptic } from '@/lib/haptics'

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverse' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink hover:bg-accent-strong',
  secondary: 'bg-surface text-ink border border-line hover:bg-surface-2',
  ghost: 'bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink',
  inverse: 'bg-surface-inverse text-ink-inverse hover:opacity-90',
  danger: 'bg-transparent text-negative border border-line hover:bg-surface-2',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5 rounded-xl',
  md: 'h-11 px-4 text-[14px] gap-2 rounded-2xl',
  lg: 'h-14 px-6 text-[15px] gap-2.5 rounded-[20px]',
}

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof HTMLMotionProps<'button'>> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  loading?: boolean
  icon?: ReactNode
  children?: ReactNode
  className?: string
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth,
    loading,
    icon,
    className,
    children,
    onClick,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      whileTap={disabled || loading ? undefined : { scale: 0.965 }}
      transition={{ type: 'spring', stiffness: 620, damping: 32 }}
      onClick={(event) => {
        if (disabled || loading) return
        haptic('light')
        onClick?.(event)
      }}
      className={cn(
        'inline-flex select-none items-center justify-center font-semibold tracking-[-0.01em]',
        'transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        icon
      )}
      {children}
    </motion.button>
  )
})

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'icon' | 'size'> {
  label: string
  icon: ReactNode
  size?: 'sm' | 'md'
  badge?: boolean
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, variant = 'secondary', size = 'md', badge, className, onClick, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={label}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 620, damping: 32 }}
      onClick={(event) => {
        haptic('light')
        onClick?.(event)
      }}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full transition-colors duration-150',
        size === 'md' ? 'size-10' : 'size-9',
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {badge && (
        <span
          className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent ring-2 ring-surface"
          aria-hidden="true"
        />
      )}
    </motion.button>
  )
})
