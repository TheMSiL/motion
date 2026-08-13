import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { AppNotification } from '@/types'
import { notificationService } from '@/services'

interface NotificationContextValue {
  notifications: AppNotification[]
  unreadCount: number
  markRead: (id: string) => void
  markAllRead: () => void
  dismiss: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    notificationService.listSync(),
  )

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    void notificationService.markRead(id)
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    void notificationService.markAllRead()
  }, [])

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    void notificationService.dismiss(id)
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    void notificationService.clearAll()
  }, [])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const value = useMemo(
    () => ({ notifications, unreadCount, markRead, markAllRead, dismiss, clearAll }),
    [notifications, unreadCount, markRead, markAllRead, dismiss, clearAll],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotifications must be used inside <NotificationProvider>')
  return context
}
