import type { AppNotification } from '@/types'
import { notifications as seedNotifications } from '@/data/notifications'
import { readStorage, writeStorage, STORAGE_KEYS } from '@/lib/storage'
import { request } from './client'

/** Persisted state is just the read flags plus dismissed ids. */
interface NotificationState {
  read: string[]
  dismissed: string[]
}

const EMPTY: NotificationState = { read: [], dismissed: [] }

function readState(): NotificationState {
  const stored = readStorage<Partial<NotificationState>>(STORAGE_KEYS.notifications, EMPTY)
  return { read: stored.read ?? [], dismissed: stored.dismissed ?? [] }
}

function writeState(state: NotificationState) {
  writeStorage(STORAGE_KEYS.notifications, state)
}

function project(state: NotificationState): AppNotification[] {
  return seedNotifications
    .filter((n) => !state.dismissed.includes(n.id))
    .map((n) => (state.read.includes(n.id) ? { ...n, read: true } : n))
}

export const notificationService = {
  async getNotifications(): Promise<AppNotification[]> {
    return request(() => project(readState()))
  },

  /** Synchronous read used by the header badge on first paint. */
  listSync(): AppNotification[] {
    return project(readState())
  },

  async markRead(id: string): Promise<AppNotification[]> {
    return request(() => {
      const state = readState()
      if (!state.read.includes(id)) state.read.push(id)
      writeState(state)
      return project(state)
    }, 0)
  },

  async markAllRead(): Promise<AppNotification[]> {
    return request(() => {
      const state = readState()
      state.read = seedNotifications.map((n) => n.id)
      writeState(state)
      return project(state)
    }, 0)
  },

  async dismiss(id: string): Promise<AppNotification[]> {
    return request(() => {
      const state = readState()
      if (!state.dismissed.includes(id)) state.dismissed.push(id)
      writeState(state)
      return project(state)
    }, 0)
  },

  async clearAll(): Promise<AppNotification[]> {
    return request(() => {
      const state: NotificationState = {
        read: seedNotifications.map((n) => n.id),
        dismissed: seedNotifications.map((n) => n.id),
      }
      writeState(state)
      return project(state)
    }, 0)
  },

  reset() {
    writeState(EMPTY)
  },
}
