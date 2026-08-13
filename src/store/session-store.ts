import { useSyncExternalStore } from 'react'
import type { ActivityType, Route } from '@/types'
import { generateRoute } from '@/lib/route-gen'
import { round } from '@/lib/utils'

export type SessionStatus = 'idle' | 'running' | 'paused' | 'finished'

export interface SessionState {
  status: SessionStatus
  type: ActivityType
  /** Seconds elapsed, excluding paused time. */
  elapsed: number
  /** Kilometres covered. */
  distance: number
  calories: number
  /** Instantaneous speed in km/h. */
  speed: number
  route: Route
  /** 0–1: how much of the route polyline has been "ridden". */
  progress: number
  startedAt: number | null
  finishedAt: number | null
}

const TARGET_KM: Record<ActivityType, number> = { cycling: 14, running: 7, walking: 4 }
const BASE_SPEED: Record<ActivityType, number> = { cycling: 24.2, running: 11.4, walking: 5.1 }
const KCAL_PER_KM: Record<ActivityType, number> = { cycling: 34, running: 68, walking: 48 }
const TITLES: Record<ActivityType, string> = {
  cycling: 'City ride',
  running: 'City run',
  walking: 'City walk',
}

/**
 * A demo session runs on an accelerated clock so a recording is worth watching:
 * one wall-clock second advances the session by six.
 */
const TIME_SCALE = 6
const TICK_MS = 200

function initialState(): SessionState {
  return {
    status: 'idle',
    type: 'cycling',
    elapsed: 0,
    distance: 0,
    calories: 0,
    speed: 0,
    route: generateRoute(777),
    progress: 0,
    startedAt: null,
    finishedAt: null,
  }
}

let state: SessionState = initialState()
const listeners = new Set<() => void>()
let ticker: number | null = null
let lastTick = 0

function emit() {
  listeners.forEach((listener) => listener())
}

function set(patch: Partial<SessionState>) {
  state = { ...state, ...patch }
  emit()
}

/** Speed varies smoothly with elapsed time — deterministic, never random. */
function speedAt(seconds: number, type: ActivityType) {
  const base = BASE_SPEED[type]
  const warmUp = Math.min(1, seconds / 20)
  const variation =
    Math.sin(seconds / 23) * 0.14 + Math.sin(seconds / 7.5) * 0.06 + Math.sin(seconds / 3.1) * 0.02
  return Math.max(0, base * warmUp * (1 + variation))
}

function tick() {
  if (state.status !== 'running') return
  const now = performance.now()
  const deltaSeconds = ((now - lastTick) / 1000) * TIME_SCALE
  lastTick = now

  const elapsed = state.elapsed + deltaSeconds
  const speed = speedAt(elapsed, state.type)
  const distance = state.distance + (speed * deltaSeconds) / 3600
  const target = TARGET_KM[state.type]

  set({
    elapsed,
    speed: round(speed, 1),
    distance,
    calories: distance * KCAL_PER_KM[state.type],
    progress: Math.min(1, distance / target),
  })
}

function startTicker() {
  if (ticker !== null) return
  lastTick = performance.now()
  ticker = window.setInterval(tick, TICK_MS)
}

function stopTicker() {
  if (ticker === null) return
  window.clearInterval(ticker)
  ticker = null
}

export const sessionStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  getState() {
    return state
  },

  start(type: ActivityType) {
    state = {
      ...initialState(),
      type,
      status: 'running',
      route: generateRoute(Math.floor(Date.now() / 60_000)),
      startedAt: Date.now(),
    }
    emit()
    startTicker()
  },

  pause() {
    if (state.status !== 'running') return
    stopTicker()
    set({ status: 'paused', speed: 0 })
  },

  resume() {
    if (state.status !== 'paused') return
    set({ status: 'running' })
    startTicker()
  },

  finish() {
    stopTicker()
    set({ status: 'finished', speed: 0, finishedAt: Date.now() })
    return sessionStore.getSummary()
  },

  reset() {
    stopTicker()
    state = initialState()
    emit()
  },

  /** Rounded, presentation-ready numbers for the summary and share screens. */
  getSummary() {
    const distance = round(state.distance, 1)
    const duration = Math.round(state.elapsed)
    const averageSpeed = duration > 0 ? round((distance / duration) * 3600, 1) : 0

    // Only the part of the route actually covered belongs to the summary, so
    // the map on the summary and the saved activity match the distance.
    const total = state.route.points.length
    const covered = Math.max(2, Math.round(total * state.progress))
    const points = state.route.points.slice(0, covered)
    const route: Route = {
      ...state.route,
      points,
      waypoints: state.route.waypoints.filter((_, index) => index < covered / 4),
      endLabel: state.progress >= 0.99 ? state.route.endLabel : 'Where you stopped',
    }

    return {
      type: state.type,
      title: TITLES[state.type],
      distance,
      duration,
      calories: Math.round(state.calories),
      averageSpeed,
      route,
    }
  },
}

export function useSession(): SessionState {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.getState, sessionStore.getState)
}

export function useSessionStatus(): SessionStatus {
  return useSyncExternalStore(
    sessionStore.subscribe,
    () => sessionStore.getState().status,
    () => 'idle' as SessionStatus,
  )
}
