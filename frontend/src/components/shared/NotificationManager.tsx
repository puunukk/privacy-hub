import { Component } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from '@reduxjs/toolkit'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { hideNotification } from '@/store/appConfig/appConfigSlice'
import type { RootState } from '@/store'
import type { Notification } from '@/store/appConfig/types'

interface NotificationManagerProps {
  notifications: Notification[]
  dispatch: Dispatch
}

interface NotificationManagerState {
  dismissTimers: Map<string, NodeJS.Timeout>
}

class NotificationManager extends Component<NotificationManagerProps, NotificationManagerState> {
  constructor(props: NotificationManagerProps) {
    super(props)
    this.state = {
      dismissTimers: new Map()
    }
  }

  componentDidMount() {
    this.setupAutoDismiss()
  }

  componentDidUpdate(prevProps: NotificationManagerProps) {
    if (prevProps.notifications !== this.props.notifications) {
      this.setupAutoDismiss()
    }
  }

  componentWillUnmount() {
    // Clear all timers
    this.state.dismissTimers.forEach(timer => clearTimeout(timer))
  }

  private setupAutoDismiss = () => {
    const { notifications } = this.props
    const { dismissTimers } = this.state
    
    // Clear existing timers for notifications that no longer exist
    const currentIds = new Set(notifications.map(n => n.id))
    dismissTimers.forEach((timer, id) => {
      if (!currentIds.has(id)) {
        clearTimeout(timer)
        dismissTimers.delete(id)
      }
    })

    // Set up new timers for new notifications
    notifications.forEach(notification => {
      if (!dismissTimers.has(notification.id)) {
        const timer = setTimeout(() => {
          this.handleDismiss(notification.id)
          dismissTimers.delete(notification.id)
        }, 5000) // Auto-dismiss after 5 seconds
        
        dismissTimers.set(notification.id, timer)
      }
    })

    this.setState({ dismissTimers })
  }

  private getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  private getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
    }
  }

  private handleDismiss = (id: string) => {
    const { dismissTimers } = this.state
    
    // Clear the timer if it exists
    const timer = dismissTimers.get(id)
    if (timer) {
      clearTimeout(timer)
      dismissTimers.delete(id)
      this.setState({ dismissTimers })
    }
    
    this.props.dispatch(hideNotification({ id }))
  }

  render() {
    const { notifications } = this.props

    // Filter active notifications (not older than 5 minutes)
    const activeNotifications = notifications.filter(notification => {
      const now = Date.now()
      const maxAge = 5 * 60 * 1000 // 5 minutes
      return now - notification.timestamp < maxAge
    })

    if (activeNotifications.length === 0) {
      return null
    }

    return (
      <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-sm">
        {activeNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`border rounded-lg shadow-lg p-4 transition-all duration-300 transform animate-in slide-in-from-right ${this.getNotificationStyles(
              notification.type
            )}`}
          >
            <div className="flex items-start space-x-3">
              {this.getNotificationIcon(notification.type)}

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">
                  {notification.title}
                </div>
                <div className="text-sm mt-1 opacity-90">
                  {notification.message}
                </div>
              </div>

              <button
                type="button"
                onClick={() => this.handleDismiss(notification.id)}
                className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }
}

// Redux connection
const mapStateToProps = (state: RootState) => ({
  notifications: state.appConfig.notifications
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch
})

export default connect(mapStateToProps, mapDispatchToProps)(NotificationManager)