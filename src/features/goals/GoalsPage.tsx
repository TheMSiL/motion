import { useMemo, useState } from 'react'
import { Target } from 'lucide-react'
import type { GoalPeriod } from '@/types'
import { goalService } from '@/services'
import { goalProgress } from '@/data/goals'
import { useAsync } from '@/hooks/useAsync'
import { Screen } from '@/components/layout/Screen'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { GoalCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { GoalCard } from './GoalCard'

type Filter = GoalPeriod | 'all'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export default function GoalsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const { data, loading, error, reload } = useAsync(() => goalService.getGoals(), [])

  const goals = useMemo(() => data ?? [], [data])
  const visible = useMemo(
    () => (filter === 'all' ? goals : goals.filter((goal) => goal.period === filter)),
    [goals, filter],
  )

  const active = visible.filter((goal) => goal.status === 'active')
  const completed = visible.filter((goal) => goal.status === 'completed')
  const [featured, ...rest] = active

  const overall = useMemo(() => {
    if (active.length === 0) return 0
    return Math.round(
      active.reduce((sum, goal) => sum + goalProgress(goal), 0) / active.length,
    )
  }, [active])

  return (
    <Screen
      withNav
      header={
        <MobileHeader
          title="Goals"
          subtitle={
            loading ? 'Loading…' : `${active.length} active · ${overall}% average progress`
          }
        />
      }
    >
      <div className="space-y-5 px-[var(--gutter)] pt-4">
        <SegmentedControl
          label="Filter goals by period"
          value={filter}
          options={FILTERS}
          onChange={setFilter}
        />

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <GoalCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState onRetry={reload} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No goals here"
            description="Nothing set for this period yet. Switch the filter to see everything you are tracking."
            action={{ label: 'Show all goals', onClick: () => setFilter('all') }}
          />
        ) : (
          <>
            {featured && (
              <section aria-label="Primary goal">
                <GoalCard goal={featured} featured index={0} />
              </section>
            )}

            {rest.length > 0 && (
              <section aria-labelledby="active-goals">
                <h2 id="active-goals" className="text-label mb-3 text-ink-3">
                  In progress
                </h2>
                <div className="space-y-3">
                  {rest.map((goal, index) => (
                    <GoalCard key={goal.id} goal={goal} index={index + 1} />
                  ))}
                </div>
              </section>
            )}

            {completed.length > 0 && (
              <section aria-labelledby="completed-goals">
                <h2 id="completed-goals" className="text-label mb-3 text-ink-3">
                  Completed
                </h2>
                <div className="space-y-3">
                  {completed.map((goal, index) => (
                    <GoalCard key={goal.id} goal={goal} index={index} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </Screen>
  )
}
