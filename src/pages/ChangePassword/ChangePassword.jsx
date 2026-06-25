// npm modules
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// services
import * as authService from '../../services/authService'

// css
import styles from './ChangePassword.module.css'

function validatePasswordComplexity(pw) {
  if (pw.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(pw)) return 'Password must include at least one uppercase letter.'
  if (!/[0-9]/.test(pw)) return 'Password must include at least one number.'
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Password must include at least one special character (e.g. !@#$%).'
  return null
}

const ChangePassword = ({ handleAuthEvt }) => {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    password: '',
    newPassword: '',
    newPasswordConf: '',
  })
  const [showPw, setShowPw] = useState({ current: false, next: false, conf: false })

  const handleChange = evt => {
    setMessage('')
    setFormData({ ...formData, [evt.target.name]: evt.target.value })
  }

  const handleSubmit = async evt => {
    evt.preventDefault()
    if (newPassword !== newPasswordConf) {
      return setMessage('New passwords do not match.')
    }
    const pwErr = validatePasswordComplexity(newPassword)
    if (pwErr) return setMessage(pwErr)
    try {
      await authService.changePassword(formData)
      handleAuthEvt()
      navigate('/')
    } catch (err) {
      setMessage(err.message)
    }
  }

  const { password, newPassword, newPasswordConf } = formData

  const isFormInvalid = () => {
    return !(password && newPassword && newPassword === newPasswordConf)
  }

  return (
    <main className={styles.container}>
      <h1>Change Password</h1>
      {message && <p className={styles.message}>{message}</p>}
      <form autoComplete="off" onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          Current Password
          <div className={styles.passwordWrap}>
            <input
              type={showPw.current ? 'text' : 'password'}
              value={password}
              name="password"
              onChange={handleChange}
              className={styles.input}
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}>
              {showPw.current ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>
        <label className={styles.label}>
          New Password
          <div className={styles.passwordWrap}>
            <input
              type={showPw.next ? 'text' : 'password'}
              value={newPassword}
              name="newPassword"
              onChange={handleChange}
              className={styles.input}
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(p => ({ ...p, next: !p.next }))}>
              {showPw.next ? 'Hide' : 'Show'}
            </button>
          </div>
          <ul className={styles.requirementsList}>
            <li className={newPassword.length >= 8 ? styles.requirementMet : styles.requirement}>Min 8 characters</li>
            <li className={/[A-Z]/.test(newPassword) ? styles.requirementMet : styles.requirement}>1 uppercase letter</li>
            <li className={/[0-9]/.test(newPassword) ? styles.requirementMet : styles.requirement}>1 number</li>
            <li className={/[^A-Za-z0-9]/.test(newPassword) ? styles.requirementMet : styles.requirement}>1 special character</li>
          </ul>
        </label>
        <label className={styles.label}>
          Confirm New Password
          <div className={styles.passwordWrap}>
            <input
              type={showPw.conf ? 'text' : 'password'}
              value={newPasswordConf}
              name="newPasswordConf"
              onChange={handleChange}
              className={styles.input}
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(p => ({ ...p, conf: !p.conf }))}>
              {showPw.conf ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>
        <div className={styles.actions}>
          <Link to="/" className={styles.cancelLink}>Cancel</Link>
          <button className={styles.button} disabled={isFormInvalid()}>
            Change Password
          </button>
        </div>
      </form>
    </main>
  )
}

export default ChangePassword
