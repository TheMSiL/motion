import { useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { motion } from 'framer-motion'
import type { DailyActivity } from '@/types'
import { cn } from '@/lib/utils'
import { formatDistanceWithUnit, formatDurationShort, isoDate } from '@/lib/format'
import { haptic } from '@/lib/haptics'
import { useUnits } from '@/store/settings-store'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface ActivityChartProps {
  data: DailyActivity[]
  className?: string
  onSelectDay?: (day: DailyActivity) => void
}

interface TooltipRenderProps {
  active?: boolean
  payload?: readonly { payload?: unknown }[]
}

function ChartTooltip({ active, payload }: TooltipRenderProps) {
  const units = useUnits()
  if (!active || !payload?.length) return null
  const day = payload[0]?.payload as DailyActivity | undefined
  if (!day) return null

  return (
    <div className="pointer-events-none rounded-2xl border border-line bg-surface-inverse px-3.5 py-2.5 shadow-[var(--shadow-lift)]">
      <p className="text-[12px] font-semibold text-ink-inverse">{day.fullLabel}</p>
      <p className="mt-1 text-[17px] font-semibold leading-none tracking-[-0.02em] text-accent tabular">
        {formatDistanceWithUnit(day.distance, units)}
      </p>
      <p className="mt-1.5 text-[12px] text-ink-inverse/60 tabular">
        {day.trips === 0 ? 'Rest day' : `${formatDurationShort(day.duration)} · ${day.trips} trips`}
      </p>
    </div>
  )
}

/**
 * Weekly distance. Sized and spaced for thumbs: tall tap targets, one tap to
 * select a day, tap again to clear.
 */
export function ActivityChart({ data, className, onSelectDay }: ActivityChartProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const reduced = useReducedMotion()
  const today = isoDate(new Date())
  const max = Math.max(...data.map((d) => d.distance), 1)

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={168}>
        <BarChart
          data={data}
          margin={{ top: 24, right: 0, bottom: 0, left: 0 }}
          barCategoryGap="24%"
          onClick={(state) => {
            const raw = state?.activeTooltipIndex
            if (raw === undefined || raw === null) return
            const index = Number(raw)
            if (Number.isNaN(index)) return
            haptic('light')
            setSelected((prev) => (prev === index ? null : index))
            const day = data[index]
            if (day) onSelectDay?.(day)
          }}
        >
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={({ x, y, payload, index }) => {
              const position = Number(index)
              const day = data[position]
              const isToday = day?.date === today
              return (
                <text
                  x={x}
                  y={Number(y) + 14}
                  textAnchor="middle"
                  className={cn(
                    'text-[11px]',
                    isToday || selected === position
                      ? 'fill-ink font-semibold'
                      : 'fill-ink-3 font-medium',
                  )}
                >
                  {payload.value}
                </text>
              )
            }}
            interval={0}
          />
          <Tooltip
            content={(props) => <ChartTooltip {...props} />}
            cursor={false}
            trigger="click"
            wrapperStyle={{ outline: 'none', zIndex: 20 }}
            allowEscapeViewBox={{ x: true, y: true }}
          />
          <Bar
            dataKey="distance"
            radius={[8, 8, 8, 8]}
            minPointSize={4}
            isAnimationActive={!reduced}
            animationDuration={700}
            animationEasing="ease-out"
          >
            {data.map((day, index) => {
              const isToday = day.date === today
              const isSelected = selected === index
              const isPeak = day.distance === max
              return (
                <Cell
                  key={day.date}
                  cursor="pointer"
                  fill={
                    isSelected || isToday || isPeak
                      ? 'var(--accent)'
                      : 'var(--surface-3)'
                  }
                />
              )
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Keyboard-accessible equivalent of the tap targets above. */}
      <ul className="sr-only">
        {data.map((day) => (
          <li key={`sr-${day.date}`}>
            {day.fullLabel}: {day.distance} kilometres over {day.trips} trips
          </li>
        ))}
      </ul>

      {selected !== null && data[selected] && (
        <motion.p
          initial={reduced ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-center text-[11.5px] text-ink-3"
        >
          Tap again to clear
        </motion.p>
      )}
    </div>
  )
}
