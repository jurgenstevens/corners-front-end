// SECURITY: This route should be served only over HTTPS in production.
// Consider adding rate limiting on POST /api/auth/login in the backend
// (express-rate-limit package, 5 attempts per 15 minutes per IP).
// The admin login URL should not be publicized or linked from the main app.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './AdminLogin.module.css'

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/api/auth`

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async evt => {
    evt.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()

      if (json.err) {
        setError(json.err)
        return
      }

      if (json.token) {
        const payload = JSON.parse(atob(json.token.split('.')[1]))

        if (payload.authorizationLevel !== 100) {
          setError('Access denied. Admin credentials required.')
          return
        }

        localStorage.setItem('token', json.token)
        window.location.href = '/dashboard/admin'
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.logo}>C</div>
        <h1 className={styles.heading}>Admin Access</h1>

        {error && <p className={styles.error}>{error}</p>}

        <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
          <input
            className={styles.input}
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => { setError(''); setEmail(e.target.value) }}
            required
          />

          <div className={styles.passwordWrap}>
            <input
              className={styles.input}
              placeholder="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => { setError(''); setPassword(e.target.value) }}
              required
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPw(p => !p)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>

          <button
            className={styles.submitBtn}
            disabled={!email || !password || loading}
          >
            {loading ? 'Verifying…' : 'Sign In'}
          </button>
        </form>

        <Link to="/auth/login" className={styles.backLink}>← Back to app</Link>
      </div>
    </div>
  )
}
