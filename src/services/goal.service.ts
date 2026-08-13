import type { Goal } from '@/types'
import { goals as seedGoals } from '@/data/goals'
import { readStorage, writeStorage, STORAGE_KEYS } from '@/lib/storage'
import { request, notFound } from './client'

/** Only the mutable slice of a goal is persisted, not the whole record. */
type GoalOverride = Pick<Goal, 'current' | 'target' | 'status'>

function readOverrides(): Record<string, GoalOverride> {
  return readStorage<Record<string, GoalOverride>>(STORAGE_KEYS.goals, {})
}

function merge(goal: Goal, overrides: Record<string, GoalOverride>): Goal {
  const override = overrides[goal.id]
  return override ? { ...goal, ...override } : goal
}

export const goalService = {
  async getGoals(): Promise<Goal[]> {
    return request(() => {
      const overrides = readOverrides()
      return seedGoals.map((goal) => merge(goal, overrides))
    })
  },

  async getGoal(id: string): Promise<Goal> {
    return request(() => {
      const goal = seedGoals.find((g) => g.id === id)
      if (!goal) notFound('Goal', id)
      return merge(goal, readOverrides())
    })
  },

  async updateGoal(id: string, patch: Partial<GoalOverride>): Promise<Goal> {
    return request(() => {
      const goal = seedGoals.find((g) => g.id === id)
      if (!goal) notFound('Goal', id)
      const overrides = readOverrides()
      const current = overrides[id] ?? {
        current: goal.current,
        target: goal.target,
        status: goal.status,
      }
      const next: GoalOverride = { ...current, ...patch }
      writeStorage(STORAGE_KEYS.goals, { ...overrides, [id]: next })
      return { ...goal, ...next }
    })
  },

  resetGoals() {
    writeStorage(STORAGE_KEYS.goals, {})
  },
}
