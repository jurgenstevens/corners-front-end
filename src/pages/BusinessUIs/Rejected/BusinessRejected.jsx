import { useNavigate } from 'react-router-dom'
import * as authService from '../../../services/authService'
import styles from './BusinessRejected.module.css'

export default function BusinessRejected() {
  const navigate = useNavigate()

  function handleLogout() {
    authService.logout()
    window.location.href = '/'
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <span className={styles.icon}>🚫</span>
        </div>

        <h1 className={styles.title}>Store application denied</h1>
        <p className={styles.body}>
          After reviewing your submission, we were unable to approve your store on Corners.
          Our platform is reserved exclusively for independent, locally-owned businesses.
        </p>
        <p className={styles.body}>
          If you believe this was a mistake, please contact us through the messaging system
          before your account is permanently removed.
        </p>

        <div className={styles.notice}>
          Your account and all associated data will be automatically deleted within 3 days.
        </div>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  )
}
