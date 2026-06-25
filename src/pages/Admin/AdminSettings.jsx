import { useState } from 'react'
import * as authService from '../../services/authService'
import styles from './AdminSettings.module.css'

function validatePassword(pw) {
  if (pw.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(pw)) return 'Must include at least one uppercase letter.'
  if (!/[0-9]/.test(pw)) return 'Must include at least one number.'
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Must include at least one special character.'
  return null
}

const BLANK = { password: '', newPassword: '', newPasswordConf: '' }

export default function AdminSettings({ user }) {
  const [form, setForm] = useState(BLANK)
  const [showPw, setShowPw] = useState({ current: false, next: false, conf: false })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function set(key, val) {
    setError('')
    setSuccess(false)
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.newPassword !== form.newPasswordConf) {
      return setError('New passwords do not match.')
    }
    const pwErr = validatePassword(form.newPassword)
    if (pwErr) return setError(pwErr)

    setLoading(true)
    try {
      await authService.changePassword({ password: form.password, newPassword: form.newPassword, newPasswordConf: form.newPasswordConf })
      setForm(BLANK)
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const { password, newPassword, newPasswordConf } = form
  const isInvalid = !password || !newPassword || !newPasswordConf

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Change Password</h2>
        <p className={styles.cardSub}>Update your admin account password.</p>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>Password changed successfully.</p>}

        <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
          <label className={styles.label}>Current Password</label>
          <div className={styles.passwordWrap}>
            <input
              className={styles.input}
              type={showPw.current ? 'text' : 'password'}
              value={password}
              onChange={e => set('password', e.target.value)}
              required
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}>
              {showPw.current ? 'Hide' : 'Show'}
            </button>
          </div>

          <label className={styles.label}>New Password</label>
          <div className={styles.passwordWrap}>
            <input
              className={styles.input}
              type={showPw.next ? 'text' : 'password'}
              value={newPassword}
              onChange={e => set('newPassword', e.target.value)}
              required
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(p => ({ ...p, next: !p.next }))}>
              {showPw.next ? 'Hide' : 'Show'}
            </button>
          </div>
          <ul className={styles.requirements}>
            <li className={newPassword.length >= 8 ? styles.met : styles.req}>Min 8 characters</li>
            <li className={/[A-Z]/.test(newPassword) ? styles.met : styles.req}>1 uppercase letter</li>
            <li className={/[0-9]/.test(newPassword) ? styles.met : styles.req}>1 number</li>
            <li className={/[^A-Za-z0-9]/.test(newPassword) ? styles.met : styles.req}>1 special character</li>
          </ul>

          <label className={styles.label}>Confirm New Password</label>
          <div className={styles.passwordWrap}>
            <input
              className={styles.input}
              type={showPw.conf ? 'text' : 'password'}
              value={newPasswordConf}
              onChange={e => set('newPasswordConf', e.target.value)}
              required
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(p => ({ ...p, conf: !p.conf }))}>
              {showPw.conf ? 'Hide' : 'Show'}
            </button>
          </div>

          <button className={styles.submitBtn} disabled={isInvalid || loading}>
            {loading ? 'Saving…' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
