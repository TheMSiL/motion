import { forwardRef, type InputHTMLAttributes } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchBarProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string
  onValueChange: (value: string) => void
  onClear?: () => void
  label?: string
  className?: string
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  { value, onValueChange, onClear, label = 'Search', className, placeholder, ...rest },
  ref,
) {
  return (
    <div
      className={cn(
        'flex h-12 items-center gap-2.5 rounded-2xl border border-line bg-surface px-3.5',
        'transition-colors duration-150 focus-within:border-line-strong',
        className,
      )}
    >
      <Search className="size-[18px] shrink-0 text-ink-3" aria-hidden="true" />
      <input
        ref={ref}
        type="search"
        role="searchbox"
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onValueChange(event.target.value)}
        className={cn(
          'h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none',
          'placeholder:text-ink-3 [&::-webkit-search-cancel-button]:hidden',
        )}
        {...rest}
      />
      {value.length > 0 && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            onValueChange('')
            onClear?.()
          }}
          className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-2 text-ink-2 transition-colors hover:bg-surface-3"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
})
