export type NotificationKind = 'goal' | 'summary' | 'streak' | 'route' | 'social' | 'system'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  /** ISO timestamp. */
  date: string
  read: boolean
  /** In-app destination opened when the notification is tapped. */
  href?: string
}
