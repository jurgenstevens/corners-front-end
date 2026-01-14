import { NavLink } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import styles from './NavBar.module.css'

const NavBar = ({ user, handleLogout }) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className={styles.nav}>
      {/* Left */}
      <div className={styles.left}>
        <a href="/">
          <img
            src="/corners-logo.png"
            alt="Corners Logo"
            className={styles.logo}
          />
        </a>
        <span className={styles.brand}>CORNERS</span>
      </div>

      {/* Right */}
      <div className={styles.right}>
        {!user ? (
          <>
            <NavLink to="/auth/login" className={styles.navButton}>
              Log In
            </NavLink>

            <NavLink to="/auth/signup" className={styles.navButton}>
              Sign Up
            </NavLink>
          </>
        ) : (
          <>
            <span className={styles.welcome}>Hi, {user.name}</span>

            <button className={styles.navButton} onClick={handleLogout}>
              Log Out
            </button>
          </>
        )}

        {/* Theme Toggle */}
        <button
          className={`${styles.toggle} ${
            theme === 'dark' ? styles.active : ''
          }`}
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
