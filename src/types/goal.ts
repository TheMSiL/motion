export type GoalPeriod = 'daily' | 'weekly' | 'monthly'
export type GoalMetric = 'distance' | 'duration' | 'calories' | 'trips' | 'streak'
export type GoalStatus = 'active' | 'completed' | 'archived'

export interface GoalHistoryPoint {
  label: string
  value: number
}

export interface Goal {
  id: string
  title: string
  description: string
  period: GoalPeriod
  metric: GoalMetric
  target: number
  current: number
  unit: string
  status: GoalStatus
  /** ISO timestamp the goal window closes. */
  deadline: string
  /** Per-day or per-week progress used by the detail chart. */
  history: GoalHistoryPoint[]
  createdAt: string
}
