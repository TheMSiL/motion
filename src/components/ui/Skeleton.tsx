import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-surface-2', className)}
      aria-hidden="true"
    />
  )
}

export function ActivityCardSkeleton() {
  return (
    <div className="surface-card flex items-center gap-3.5 p-4">
      <Skeleton className="size-12 shrink-0 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
      <Skeleton className="h-8 w-14 rounded-lg" />
    </div>
  )
}

export function ChartSkeleton() {
  const bars = [42, 68, 30, 84, 55, 96, 38]
  return (
    <div className="surface-card p-4">
      <Skeleton className="mb-1 h-3 w-24" />
      <Skeleton className="mb-5 h-3 w-16" />
      <div className="flex h-32 items-end gap-2">
        {bars.map((height, index) => (
          <div key={index} className="flex-1" style={{ height: `${height}%` }}>
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PlaceCardSkeleton() {
  return (
    <div className="surface-card overflow-hidden p-0">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-3.5 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
    </div>
  )
}

export function GoalCardSkeleton() {
  return (
    <div className="surface-card flex items-center gap-4 p-4">
      <Skeleton className="size-16 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <div className="surface-card flex items-center gap-4 p-5">
        <Skeleton className="size-16 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-3xl" />
        <Skeleton className="h-24 rounded-3xl" />
      </div>
      <div className="surface-card divide-y divide-line p-0">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <Skeleton className="size-9 rounded-xl" />
            <Skeleton className="h-3.5 flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatRowSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-[86px] rounded-3xl" />
      ))}
    </div>
  )
}
