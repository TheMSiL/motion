import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IconButton } from '@/components/ui/Button'

export interface MobileHeaderProps {
  title?: string
  subtitle?: string
  /** Shows a back control. Pass a path to force the destination. */
  back?: boolean | string
  actions?: ReactNode
  /** Leading slot used by Home for the greeting block. */
  leading?: ReactNode
  transparent?: boolean
  className?: string
}

export function MobileHeader({
  title,
  subtitle,
  back,
  actions,
  leading,
  transparent,
  className,
}: MobileHeaderProps) {
  const navigate = useNavigate()

  return (
    <header
      className={cn(
        'absolute inset-x-0 top-0 z-30 flex items-center gap-3 px-[var(--gutter)]',
        transparent
          ? 'bg-transparent'
          : 'border-b border-line bg-[var(--bg)]/88 backdrop-blur-xl',
        className,
      )}
      // The bar starts at the very top and reserves the status strip with
      // padding, so scrolled content never surfaces above it.
      style={{
        height: 'calc(var(--header-h) + var(--status-h, 0px))',
        paddingTop: 'var(--status-h, 0px)',
      }}
    >
      {back && (
        <IconButton
          label="Go back"
          variant={transparent ? 'inverse' : 'secondary'}
          icon={<ChevronLeft className="size-5" />}
          onClick={() => {
            if (typeof back === 'string') navigate(back)
            else navigate(-1)
          }}
        />
      )}

      {leading}

      {title && (
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-semibold tracking-[-0.02em]">{title}</h1>
          {subtitle && <p className="truncate text-[12px] text-ink-3">{subtitle}</p>}
        </div>
      )}

      {!title && !leading && <div className="flex-1" />}

      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}
