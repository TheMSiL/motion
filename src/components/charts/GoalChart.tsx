import { Area, AreaChart, Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { GoalHistoryPoint } from '@/types'
import { cn, round } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface TooltipRenderProps {
  active?: boolean
  payload?: readonly { value?: unknown }[]
  label?: unknown
  unit?: string
}

function SimpleTooltip({ active, payload, label, unit }: TooltipRenderProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line bg-surface-inverse px-3 py-2 shadow-lift">
      <p className="text-[11px] font-medium text-ink-inverse/60">{String(label ?? '')}</p>
      <p className="text-[14px] font-semibold text-ink-inverse tabular">
        {round(Number(payload[0]?.value ?? 0), 1)}
        {unit ? ` ${unit}` : ''}
      </p>
    </div>
  )
}

export interface GoalChartProps {
  data: GoalHistoryPoint[]
  unit?: string
  className?: string
  height?: number
}

/** Per-period progress for a single goal. */
export function GoalChart({ data, unit, className, height = 150 }: GoalChartProps) {
  const reduced = useReducedMotion()
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }} barCategoryGap="28%">
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'var(--ink-3)' }}
            interval={0}
          />
          <Tooltip
            content={(props) => <SimpleTooltip {...props} unit={unit} />}
            cursor={{ fill: 'var(--surface-2)', radius: 8 }}
            wrapperStyle={{ outline: 'none' }}
          />
          <Bar
            dataKey="value"
            radius={[7, 7, 7, 7]}
            isAnimationActive={!reduced}
            animationDuration={650}
          >
            {data.map((point) => (
              <Cell
                key={point.label}
                fill={point.value === max ? 'var(--accent)' : 'var(--surface-3)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export interface ElevationChartProps {
  profile: number[]
  className?: string
  height?: number
}

/** Elevation profile shown on the activity detail screen. */
export function ElevationChart({ profile, className, height = 110 }: ElevationChartProps) {
  const reduced = useReducedMotion()
  const data = profile.map((value, index) => ({ label: `${index} km`, value }))
  const min = Math.min(...profile)
  const max = Math.max(...profile)

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="elevation-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[Math.max(0, min - 12), max + 12]} />
          <XAxis dataKey="label" hide />
          <Tooltip
            content={(props) => <SimpleTooltip {...props} unit="m" />}
            cursor={{ stroke: 'var(--line-strong)', strokeWidth: 1 }}
            wrapperStyle={{ outline: 'none' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--ink)"
            strokeWidth={2}
            fill="url(#elevation-fill)"
            isAnimationActive={!reduced}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
