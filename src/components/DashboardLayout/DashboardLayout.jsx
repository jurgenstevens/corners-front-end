import { useOutlet, useNavigate, useLocation } from 'react-router-dom'
import styles from './DashboardLayout.module.css'

export default function DashboardLayout({ Dashboard, user, homePath }) {
  const outlet   = useOutlet()
  const navigate = useNavigate()
  const location = useLocation()

  const isSetupLocked = location.pathname === '/dashboard/business/setup'

  function close() { if (!isSetupLocked) navigate(homePath) }

  return (
    <div className={styles.root}>
      {/* ── Main dashboard (always visible on desktop; hidden on mobile when sidebar is open) ── */}
      <div className={outlet ? `${styles.main} ${styles.dimmed}` : styles.main}>
        <Dashboard user={user} />
      </div>

      {/* ── Sidebar ── */}
      {outlet && (
        <>
          {/* Desktop backdrop — not clickable during required setup */}
          <div className={styles.backdrop} onClick={isSetupLocked ? undefined : close} />

          <div className={styles.sidebar}>
            {/* Sticky header with X at top-left — hidden during required setup */}
            <div className={styles.sidebarHeader}>
              {!isSetupLocked && (
                <button className={styles.closeBtn} onClick={close} aria-label="Close">
                  ✕
                </button>
              )}
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
