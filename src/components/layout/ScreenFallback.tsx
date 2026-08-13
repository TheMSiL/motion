import { Screen } from './Screen'
import { Skeleton, ActivityCardSkeleton, StatRowSkeleton } from '@/components/ui/Skeleton'

/** Shown while a lazily-loaded route chunk arrives. */
export function ScreenFallback({ withNav = false }: { withNav?: boolean }) {
  return (
    <Screen withNav={withNav} className="bg-[var(--bg)]">
      <div className="space-y-4 px-[var(--gutter)] pt-[calc(var(--header-h)+var(--status-h,0px))]">
        <div className="space-y-2 pt-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-44 rounded-3xl" />
        <StatRowSkeleton />
        <ActivityCardSkeleton />
        <ActivityCardSkeleton />
      </div>
    </Screen>
  )
}
