import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRouter } from './app/router'
import { SettingsProvider } from './store/settings-store'
import { ToastProvider } from './store/toast-store'
import { SavedProvider } from './store/saved-store'
import { NotificationProvider } from './store/notification-store'

const container = document.getElementById('root')
if (!container) throw new Error('Root container #root was not found')

createRoot(container).render(
  <StrictMode>
    <SettingsProvider>
      <ToastProvider>
        <SavedProvider>
          <NotificationProvider>
            <AppRouter />
          </NotificationProvider>
        </SavedProvider>
      </ToastProvider>
    </SettingsProvider>
  </StrictMode>,
)
