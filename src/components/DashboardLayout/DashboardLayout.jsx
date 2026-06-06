import { useOutlet, useNavigate } from 'react-router-dom'
import styles from './DashboardLayout.module.css'

export default function DashboardLayout({ Dashboard, user, homePath }) {
  const outlet   = useOutlet()
  const navigate = useNavigate()

  function close() { navigate(homePath) }

  return (
    <div className={styles.root}>
      {/* ── Main dashboard (always visible on desktop; hidden on mobile when sidebar is open) ── */}
      <div className={outlet ? `${styles.main} ${styles.dimmed}` : styles.main}>
        <Dashboard user={user} />
      </div>

      {/* ── Sidebar ── */}
      {outlet && (
        <>
          {/* Desktop backdrop */}
          <div className={styles.backdrop} onClick={close} />

          <div className={styles.sidebar}>
            {/* Sticky header with X at top-left */}
            <div className={styles.sidebarHeader}>
              <button className={styles.closeBtn} onClick={close} aria-label="Close">
                ✕
              </button>
            </div>

            <div className={styles.sidebarInner}>
              {outlet}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
