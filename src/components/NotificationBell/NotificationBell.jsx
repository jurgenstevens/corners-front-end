import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import * as notificationService from '../../services/notificationService'
import styles from './NotificationBell.module.css'

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  async function load() {
    try {
      const data = await notificationService.getNotifications()
      if (Array.isArray(data)) setNotifications(data)
    } catch {
      console.log("notifications not loading")
    }
  }

  useEffect(() => {
    if (!user) return
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleNotificationClick(n) {
    await notificationService.markRead(n._id)
    setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, read: true } : x))
    setOpen(false)
    const routes = {
      connection_request:  '/dashboard/business/patron-requests',
      connection_approved: '/dashboard/patron/stores',
      connection_denied:   '/dashboard/patron/stores',
      connection_blocked:  '/dashboard/patron/stores',
      product_request:     '/dashboard/business/products',
      product_approved:    '/dashboard/patron/products',
      product_rejected:    '/dashboard/patron/products',
      product_ready:       '/dashboard/patron/products',
    }
    if (routes[n.type]) navigate(routes[n.type])
  }

  const unread = notifications.filter(n => !n.read).length

  return (
    <div className={styles.wrapper} ref={ref}>
      <button className={styles.bell} onClick={() => setOpen(o => !o)} aria-label="Notifications">
        🔔
        {unread > 0 && <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <span>Notifications</span>
            {unread > 0 && (
              <button onClick={async () => {
                await notificationService.markAllRead()
                setNotifications(prev => prev.map(n => ({ ...n, read: true })))
              }}>Mark all read</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className={styles.empty}>No notifications</p>
          ) : (
            notifications.slice(0, 20).map(n => (
              <div
                key={n._id}
                className={`${styles.item} ${n.read ? styles.read : styles.unread}`}
                onClick={() => handleNotificationClick(n)}
              >
                {n.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}