import { NavLink } from 'react-router-dom'
import styles from './MobileBottomNav.module.css'

const AUTH_LEVELS = { PATRON: 150, BUSINESS: 250 }

const NavItem = ({ to, label, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
    end
  >
    <span className={styles.icon}>{icon}</span>
    <span className={styles.label}>{label}</span>
  </NavLink>
)

const MobileBottomNav = ({ user }) => {
  if (!user) return null

  if (user.authorizationLevel === AUTH_LEVELS.BUSINESS) {
    return (
      <nav className={styles.nav}>
        <NavItem to="/dashboard/business" icon="🏠" label="Home" />
        <NavItem to="/dashboard/business/products" icon="🛍️" label="Products" />
        <NavItem to="/dashboard/business/patronRequests" icon="📋" label="Requests" />
        <NavItem to="/dashboard/business/analytics" icon="📊" label="Analytics" />
        <NavItem to="/dashboard/business/settings" icon="⚙️" label="Settings" />
      </nav>
    )
  }

  if (user.authorizationLevel === AUTH_LEVELS.PATRON) {
    return (
      <nav className={styles.nav}>
        <NavItem to="/dashboard/patron" icon="🏠" label="Home" />
        <NavItem to="/patron/products" icon="🔍" label="Browse" />
        <NavItem to="/patron/requests" icon="📋" label="Requests" />
        <NavItem to="/profiles" icon="👤" label="Profile" />
      </nav>
    )
  }

  return null
}

export default MobileBottomNav