import { NavLink } from 'react-router-dom'
import styles from './MobileBottomNav.module.css'

export default function MobileBottomNav({ user }) {
  if (!user) return null

  const isPatron = user.authorizationLevel >= 150 && user.authorizationLevel < 250
  const isBusiness = user.authorizationLevel >= 250 && user.authorizationLevel < 500

  return (
    <nav className={styles.nav}>
      {isBusiness && (
        <>
          <NavLink to="/dashboard/business" end className={({ isActive }) => isActive ? styles.active : ''}>
            <span>🏠</span><span className={styles.label}>Home</span>
          </NavLink>
          <NavLink to="/dashboard/business/products" className={({ isActive }) => isActive ? styles.active : ''}>
            <span>📦</span><span className={styles.label}>Products</span>
          </NavLink>
          <NavLink to="/dashboard/business/patron-requests" className={({ isActive }) => isActive ? styles.active : ''}>
            <span>👥</span><span className={styles.label}>Patrons</span>
          </NavLink>
          <NavLink to="/dashboard/business/analytics" className={({ isActive }) => isActive ? styles.active : ''}>
            <span>📊</span><span className={styles.label}>Analytics</span>
          </NavLink>
          <NavLink to="/dashboard/business/settings" className={({ isActive }) => isActive ? styles.active : ''}>
            <span>⚙️</span><span className={styles.label}>Settings</span>
          </NavLink>
        </>
      )}
      {isPatron && (
        <>
          <NavLink to="/dashboard/patron" end className={({ isActive }) => isActive ? styles.active : ''}>
            <span>🏠</span><span className={styles.label}>Home</span>
          </NavLink>
          <NavLink to="/patron/stores" className={({ isActive }) => isActive ? styles.active : ''}>
            <span>🏪</span><span className={styles.label}>My Stores</span>
          </NavLink>
          <NavLink to="/patron/products" className={({ isActive }) => isActive ? styles.active : ''}>
            <span>🛍️</span><span className={styles.label}>Products</span>
          </NavLink>
          <NavLink to="/profiles" className={({ isActive }) => isActive ? styles.active : ''}>
            <span>👤</span><span className={styles.label}>Profile</span>
          </NavLink>
        </>
      )}
    </nav>
  )
}
