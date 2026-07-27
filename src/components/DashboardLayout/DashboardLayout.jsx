import { NavLink, useOutlet, useNavigate, useLocation } from 'react-router-dom'
import styles from './DashboardLayout.module.css'

export default function DashboardLayout({ Dashboard, user, homePath, navItems }) {
  const outlet   = useOutlet()
  const navigate = useNavigate()
  const location = useLocation()

  const isSetupLocked = location.pathname === '/dashboard/business/setup'

  function close() { if (!isSetupLocked) navigate(homePath) }

  return (
    <div className={`${styles.root} ${navItems ? styles.hasNav : ''}`}>

      {/* ── Left nav sidebar (desktop only, patron/distributor) ── */}
      {navItems && (
        <nav className={styles.leftNav}>
          {navItems.map(({ to, label, icon: NavIcon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navActive : ''}`}
            >
              {NavIcon && <NavIcon className={styles.navIcon} aria-hidden="true" />}
              {label}
            </NavLink>
          ))}
        </nav>
      )}

      {/* ── Main dashboard ── */}
      <div className={outlet ? `${styles.main} ${styles.dimmed}` : styles.main}>
        <Dashboard user={user} />
      </div>

      {/* ── Right sidebar (sub-routes) ── */}
      {outlet && (
        <>
          <div className={styles.backdrop} onClick={isSetupLocked ? undefined : close} />
          <div className={styles.sidebar}>
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
