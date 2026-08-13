import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarDays, Check, Minus, Plus, Target, Trophy } from 'lucide-react'
import { goalService } from '@/services'
import { goalProgress, goalRemaining } from '@/data/goals'
import { useAsync } from '@/hooks/useAsync'
import { useToast } from '@/store/toast-store'
import { formatDeadline } from '@/lib/format'
import { Screen } from '@/components/layout/Screen'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { GoalChart } from '@/components/charts/GoalChart'

export default function GoalDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [editOpen, setEditOpen] = useState(false)
  const [draftTarget, setDraftTarget] = useState(0)

  const { data: goal, loading, error, reload } = useAsync(() => goalService.getGoal(id), [id])

  if (loading) {
    return (
      <Screen header={<MobileHeader back title="Goal" />}>
        <div className="space-y-4 px-[var(--gutter)] pt-4">
          <Skeleton className="mx-auto size-44 rounded-full" />
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      </Screen>
    )
  }

  if (error || !goal) {
    return (
      <Screen header={<MobileHeader back title="Goal" />}>
        <ErrorState
          title="Goal not found"
          description="This goal may have been removed. Head back to see everything you are tracking."
          onRetry={reload}
        />
        <div className="px-8">
          <Button variant="secondary" fullWidth onClick={() => navigate('/goals')}>
            Back to Goals
          </Button>
        </div>
      </Screen>
    )
  }

  const percent = goalProgress(goal)
  const remaining = goalRemaining(goal)
  const complete = goal.status === 'completed' || percent >= 100

  const stats = [
    { label: 'Current', value: `${goal.current.toLocaleString('en-GB')} ${goal.unit}` },
    { label: 'Target', value: `${goal.target.toLocaleString('en-GB')} ${goal.unit}` },
    { label: 'Remaining', value: complete ? '—' : `${remaining} ${goal.unit}` },
    { label: 'Deadline', value: formatDeadline(goal.deadline) },
  ]

  async function saveTarget() {
    if (!goal) return
    await goalService.updateGoal(goal.id, { target: draftTarget })
    setEditOpen(false)
    toast('Goal updated', { description: `Target set to ${draftTarget} ${goal.unit}` })
    reload()
  }

  return (
    <Screen
      header={<MobileHeader back title={goal.title} subtitle={`${goal.period} goal`} />}
      footer={
        <Button
          size="lg"
          fullWidth
          onClick={() => {
            setDraftTarget(goal.target)
            setEditOpen(true)
          }}
        >
          Adjust target
        </Button>
      }
    >
      <div className="space-y-5 px-[var(--gutter)] pt-6">
        <div className="flex flex-col items-center">
          <ProgressRing value={percent} size={192} strokeWidth={14} delay={0.2}>
            <span className="text-display text-[46px]">
              <AnimatedNumber value={percent} duration={1.1} delay={0.25} suffix="%" />
            </span>
            <span className="mt-1.5 text-[12px] font-medium text-ink-3">
              {complete ? 'Complete' : formatDeadline(goal.deadline)}
            </span>
          </ProgressRing>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-5 text-center text-[22px] font-semibold tracking-[-0.025em] tabular"
          >
            {goal.current.toLocaleString('en-GB')}
            <span className="text-ink-3"> / {goal.target.toLocaleString('en-GB')} {goal.unit}</span>
          </motion.p>
          <p className="mt-2 max-w-[300px] text-center text-[13.5px] leading-relaxed text-ink-2">
            {goal.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.1 + index * 0.05 }}
              className="surface-card p-4"
            >
              <p className="text-label text-ink-3">{stat.label}</p>
              <p className="mt-2 text-[17px] font-semibold tracking-[-0.02em] tabular">
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        <section aria-labelledby="progress-heading">
          <h2 id="progress-heading" className="text-label mb-2 text-ink-3">
            Progress breakdown
          </h2>
          <Card padded={false} className="px-2 py-4">
            <GoalChart data={goal.history} unit={goal.unit} />
          </Card>
        </section>

        <Card className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft">
            {complete ? (
              <Trophy className="size-4 text-ink" aria-hidden="true" />
            ) : (
              <Target className="size-4 text-ink" aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold">
              {complete ? 'Goal reached' : `${remaining} ${goal.unit} left`}
            </p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">
              {complete
                ? 'Nice work. Set a new target to keep the pressure on.'
                : `Keep the current pace and you will land this with ${formatDeadline(
                    goal.deadline,
                  ).toLowerCase()}.`}
            </p>
          </div>
        </Card>

        <div className="flex items-center gap-2 pb-24 text-[12px] text-ink-3">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          Started {new Date(goal.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
          })}
        </div>
      </div>

      <BottomSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Adjust target"
        description={`Set a new target for “${goal.title}”.`}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" size="lg" fullWidth onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button size="lg" fullWidth icon={<Check className="size-[18px]" />} onClick={saveTarget}>
              Save
            </Button>
          </div>
        }
      >
        <div className="flex items-center justify-between gap-4 rounded-3xl bg-surface-2 p-4">
          <Button
            variant="secondary"
            size="md"
            aria-label="Decrease target"
            onClick={() => setDraftTarget((value) => Math.max(1, value - stepFor(goal.target)))}
            className="size-12 rounded-full p-0"
            icon={<Minus className="size-5" />}
          />
          <p className="text-center">
            <span className="block text-[34px] font-semibold leading-none tracking-[-0.03em] tabular">
              {draftTarget.toLocaleString('en-GB')}
            </span>
            <span className="mt-1 block text-[12.5px] text-ink-3">{goal.unit}</span>
          </p>
          <Button
            variant="secondary"
            size="md"
            aria-label="Increase target"
            onClick={() => setDraftTarget((value) => value + stepFor(goal.target))}
            className="size-12 rounded-full p-0"
            icon={<Plus className="size-5" />}
          />
        </div>
      </BottomSheet>
    </Screen>
  )
}

/** Sensible increments so adjusting 9 000 kcal is not a hundred taps. */
function stepFor(target: number) {
  if (target >= 1000) return 100
  if (target >= 100) return 10
  if (target >= 20) return 5
  return 1
}
