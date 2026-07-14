import styles from './IdleWarningModal.module.css'

export default function IdleWarningModal({ showWarning, secondsLeft, resetTimer, onLogout }) {
  if (!showWarning) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>Still there?</h3>
        <p className={styles.body}>You've been inactive for a while.</p>
        <p className={styles.countdown}>
          You will be logged out in <strong>{secondsLeft}</strong> second{secondsLeft !== 1 ? 's' : ''}.
        </p>
        <div className={styles.actions}>
          <button className={styles.stayBtn} onClick={resetTimer}>Stay logged in</button>
          <button className={styles.logoutBtn} onClick={onLogout}>Log out now</button>
        </div>
      </div>
    </div>
  )
}
