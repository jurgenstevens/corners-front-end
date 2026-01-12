import styles from './Landing.module.css'

const Landing = ({ user, onPatronSignUp, onBusinessSignUp, onLogin }) => {
  return (
    <main className={styles.container}>
      <h1 className={styles.header}>CORNERS</h1>

      {user && <h2 className={styles.subHeader}>Hello, {user.name}!</h2>}

      <div className={styles.buttonsContainer}>
        <button
          className={styles.button}
          onClick={onPatronSignUp}
        >
          Patron Sign Up
        </button>

        <button
          className={styles.button}
          onClick={onBusinessSignUp}
        >
          Business Sign Up
        </button>

        <div className={styles.orContainer}>
          <div className={styles.line} />
          <span className={styles.orText}>or</span>
          <div className={styles.line} />
        </div>

        <button
          className={styles.button}
          onClick={onLogin}
        >
          Log In
        </button>
      </div>
    </main>
  )
}

export default Landing
