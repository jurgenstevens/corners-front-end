import { NavLink } from 'react-router-dom'
import styles from './NavBar.module.css'

const NavBar = ({ user, handleLogout }) => {
  return (
    <nav className={styles.nav}>
      {/* Left */}
      <div className={styles.left}>
        <img
          src="../../../public/corners-logo.png"
          alt="Corners Logo"
          className={styles.logo}
        />
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

        {/* Theme Toggle (visual only for now) */}
        <div className={styles.toggleWrapper}>
          <div className={styles.toggle}>
            <div className={styles.toggleKnob} />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
