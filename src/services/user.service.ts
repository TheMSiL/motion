import type { ConnectedApp, Settings, User } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'
import { user as seedUser, connectedApps as seedApps } from '@/data/user'
import { readStorage, writeStorage, STORAGE_KEYS } from '@/lib/storage'
import { request } from './client'

interface ProfileOverride {
  name?: string
  email?: string
  city?: string
  bio?: string
}

const PROFILE_KEY = STORAGE_KEYS.settings

function readProfileOverride(): ProfileOverride {
  const stored = readStorage<Settings & { profile?: ProfileOverride }>(PROFILE_KEY, {
    ...DEFAULT_SETTINGS,
  })
  return stored.profile ?? {}
}

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p.charAt(0).toUpperCase()).join('') || 'M'
}

export const userService = {
  async getUser(): Promise<User> {
    return request(() => {
      const override = readProfileOverride()
      const name = override.name ?? seedUser.name
      return {
        ...seedUser,
        ...override,
        name,
        initials: initialsFrom(name),
      }
    })
  },

  /** Synchronous read for the greeting — avoids a flash on the Home screen. */
  getUserSync(): User {
    const override = readProfileOverride()
    const name = override.name ?? seedUser.name
    return { ...seedUser, ...override, name, initials: initialsFrom(name) }
  },

  async updateProfile(patch: ProfileOverride): Promise<User> {
    return request(() => {
      const stored = readStorage<Settings & { profile?: ProfileOverride }>(PROFILE_KEY, {
        ...DEFAULT_SETTINGS,
      })
      const profile = { ...stored.profile, ...patch }
      writeStorage(PROFILE_KEY, { ...stored, profile })
      const name = profile.name ?? seedUser.name
      return { ...seedUser, ...profile, name, initials: initialsFrom(name) }
    }, 320)
  },

  async getConnectedApps(): Promise<ConnectedApp[]> {
    return request(() => seedApps)
  },
}
