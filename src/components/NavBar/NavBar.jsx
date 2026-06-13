import { NavLink } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import NotificationBell from '../NotificationBell/NotificationBell'
import styles from './NavBar.module.css'

const NavBar = ({ user, handleLogout }) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <span className={styles.brand}>CORNERS</span>
      </div>

      <div className={styles.right}>
        {!user ? (
          <>
            <NavLink to="/auth/login" className={styles.navButton}>Log In</NavLink>
            <NavLink to="/auth/signup" className={styles.navButton}>Sign Up</NavLink>
          </>
        ) : (
          <>
            <span className={styles.welcome}>Hi, {user.name}</span>
            <NotificationBell user={user} />
            <button className={styles.navButton} onClick={handleLogout}>Log Out</button>
          </>
        )}
        <button
          className={`${styles.toggle} ${theme === 'dark' ? styles.active : ''}`}
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
        >
          <div className={styles.toggleKnob} />
        </button>
      </div>
    </nav>
  )
}

export default NavBar
