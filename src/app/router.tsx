import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { RootBoundary } from './RootBoundary'

/* Every screen is code-split; the shell ships on its own. */
const HomePage = lazy(() => import('@/features/home/HomePage'))
const ActivityPage = lazy(() => import('@/features/activity/ActivityPage'))
const ActivityDetailPage = lazy(() => import('@/features/activity/ActivityDetailPage'))
const LiveActivityPage = lazy(() => import('@/features/activity/LiveActivityPage'))
const ActivitySummaryPage = lazy(() => import('@/features/activity/ActivitySummaryPage'))
const ExplorePage = lazy(() => import('@/features/explore/ExplorePage'))
const PlaceDetailPage = lazy(() => import('@/features/explore/PlaceDetailPage'))
const SavedPage = lazy(() => import('@/features/explore/SavedPage'))
const GoalsPage = lazy(() => import('@/features/goals/GoalsPage'))
const GoalDetailPage = lazy(() => import('@/features/goals/GoalDetailPage'))
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'))
const SettingsPage = lazy(() => import('@/features/profile/SettingsPage'))
const PersonalInfoPage = lazy(() => import('@/features/profile/PersonalInfoPage'))
const NotificationsPage = lazy(() => import('@/features/notifications/NotificationsPage'))
const NotFoundPage = lazy(() => import('@/features/misc/NotFoundPage'))

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RootBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'activity', element: <ActivityPage /> },
      { path: 'activity/live', element: <LiveActivityPage /> },
      { path: 'activity/summary', element: <ActivitySummaryPage /> },
      { path: 'activity/:id', element: <ActivityDetailPage /> },
      { path: 'explore', element: <ExplorePage /> },
      { path: 'explore/saved', element: <SavedPage /> },
      { path: 'explore/:id', element: <PlaceDetailPage /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: 'goals/:id', element: <GoalDetailPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'profile/personal', element: <PersonalInfoPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
