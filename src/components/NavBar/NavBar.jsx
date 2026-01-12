// npm modules
import { NavLink } from 'react-router-dom'

// css
import styles from './NavBar.module.css'

// assets (placeholder for now — swap later)
import logo from '../../../public/corners-logo-transparent.png'

const NavBar = ({ user, handleLogout }) => {
  return (
    <header className={styles.navbar}>
      {/* Left */}
      <div className={styles.left}>
        <img
          src={logo}
          alt="Corners Logo"
          className={styles.logo}
        />
        <span className={styles.brand}>CORNERS</span>
      </div>

      {/* Right */}
      <div className={styles.right}>
        {user ? (
          <>
            <span className={styles.welcome}>Hi, {user.name}</span>

            <NavLink
              to="/profiles"
              className={styles.link}
            >
              Profiles
            </NavLink>

            <button
              className={styles.secondaryButton}
              onClick={handleLogout}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/auth/login">
              <button className={styles.button}>
                Log In
              </button>
            </NavLink>

            <NavLink to="/auth/signup">
              <button className={styles.button}>
                Sign Up
              </button>
            </NavLink>
          </>
        )}

        {/* Theme Toggle Placeholder */}
        <div className={styles.themeToggle}>
          🌙
        </div>
      </div>
    </header>
  )
}

export default NavBar
