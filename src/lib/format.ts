import type { Units } from '@/types'
import { round } from './utils'

const KM_TO_MI = 0.621371

export function toDisplayDistance(km: number, units: Units) {
  return units === 'mi' ? km * KM_TO_MI : km
}

export function distanceUnit(units: Units) {
  return units === 'mi' ? 'mi' : 'km'
}

export function speedUnit(units: Units) {
  return units === 'mi' ? 'mph' : 'km/h'
}

export function formatDistance(km: number, units: Units = 'km', decimals = 1) {
  return round(toDisplayDistance(km, units), decimals).toFixed(decimals)
}

export function formatDistanceWithUnit(km: number, units: Units = 'km', decimals = 1) {
  return `${formatDistance(km, units, decimals)} ${distanceUnit(units)}`
}

export function formatSpeed(kmh: number, units: Units = 'km') {
  return `${round(toDisplayDistance(kmh, units), 1).toFixed(1)} ${speedUnit(units)}`
}

/** 2748 → "45 min", 5400 → "1h 30m", 22 → "22 sec" */
export function formatDuration(seconds: number) {
  if (seconds < 60) return `${Math.round(seconds)} sec`
  const totalMinutes = Math.round(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes} min`
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`
}

/** 2748 → "45m", used where space is tight. */
export function formatDurationShort(seconds: number) {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const totalMinutes = Math.round(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours === 0 ? `${minutes}m` : `${hours}h ${minutes}m`
}

/** Splits a duration into the value + unit a metric tile needs. */
export function durationParts(seconds: number): { value: number; unit: string } {
  if (seconds < 60) return { value: Math.round(seconds), unit: 'sec' }
  return { value: Math.round(seconds / 60), unit: 'min' }
}

/** Live-session clock: 872 → "00:14:32" */
export function formatClock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map((n) => n.toString().padStart(2, '0')).join(':')
}

/** Pace in min/km, e.g. "4:32 /km" */
export function formatPace(seconds: number, km: number, units: Units = 'km') {
  const distance = toDisplayDistance(km, units)
  if (distance <= 0) return `--:-- /${distanceUnit(units)}`
  const paceSeconds = seconds / distance
  const m = Math.floor(paceSeconds / 60)
  const s = Math.round(paceSeconds % 60)
  return `${m}:${s.toString().padStart(2, '0')} /${distanceUnit(units)}`
}

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

export function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function isoDate(date: Date) {
  const d = startOfDay(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

export function daysBetween(a: Date, b: Date) {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86_400_000)
}

/** "Today" / "Yesterday" / "Monday" / "12 Mar" */
export function formatRelativeDay(iso: string, now = new Date()) {
  const date = new Date(iso)
  const diff = daysBetween(now, date)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7 && diff > 0) return DAY_NAMES[date.getDay()] as string
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function formatFullDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/** "2h ago" / "3d ago" — used in the notification centre. */
export function formatTimeAgo(iso: string, now = new Date()) {
  const seconds = Math.max(0, (now.getTime() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

/** "3 days left" / "Today" / "Ended" */
export function formatDeadline(iso: string, now = new Date()) {
  const diff = daysBetween(new Date(iso), now)
  if (diff < 0) return 'Ended'
  if (diff === 0) return 'Ends today'
  if (diff === 1) return '1 day left'
  return `${diff} days left`
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`
}
