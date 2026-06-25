import { useState, useEffect } from 'react'
import * as patronService from '../../../services/patronService'
import * as authService from '../../../services/authService'
import styles from './PatronSettings.module.css'

function validatePassword(pw) {
  if (pw.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(pw)) return 'Must include at least one uppercase letter.'
  if (!/[0-9]/.test(pw)) return 'Must include at least one number.'
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Must include at least one special character.'
  return null
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
]

export default function PatronSettings() {
  const [formData, setFormData] = useState({ name: '', photo: '', zip: '', city: '', state: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [pwForm, setPwForm] = useState({ password: '', newPassword: '', newPasswordConf: '' })
  const [showPw, setShowPw] = useState({ current: false, next: false, conf: false })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMessage, setPwMessage] = useState('')
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    async function load() {
      const data = await patronService.getMyProfile()
      if (data && !data.err) {
        setFormData({
          name:  data.profile?.name  || '',
          photo: data.profile?.photo || '',
          zip:   data.location?.zip  || '',
          city:  data.location?.city || '',
          state: data.location?.state || '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handlePwSubmit(e) {
    e.preventDefault()
    setPwMessage('')
    setPwError('')
    if (pwForm.newPassword !== pwForm.newPasswordConf) return setPwError('New passwords do not match.')
    const pwErr = validatePassword(pwForm.newPassword)
    if (pwErr) return setPwError(pwErr)
    setPwSaving(true)
    try {
      await authService.changePassword(pwForm)
      setPwForm({ password: '', newPassword: '', newPasswordConf: '' })
      setPwMessage('Password updated successfully!')
    } catch (err) {
      setPwError(err.message || 'Failed to update password.')
    } finally {
      setPwSaving(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setError('')
    if (!formData.zip) return setError('Zip code is required.')
    if (!formData.state) return setError('State is required.')
    setSaving(true)
    try {
      const result = await patronService.updateProfile(formData)
      if (result.err) return setError(result.err)
      setMessage('Settings saved!')
    } catch (err) {
      setError(err.message || 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className={styles.loading}>Loading…</div>

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Profile Settings</h2>

      {message && <p className={styles.success}>{message}</p>}
      {error   && <p className={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.fieldLabel}>Display Name
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </label>

        <label className={styles.fieldLabel}>Photo URL <span className={styles.optional}>(optional)</span>
          <input
            name="photo"
            value={formData.photo}
            onChange={handleChange}
            className={styles.input}
            placeholder="https://…"
          />
        </label>

        <hr className={styles.divider} />
        <p className={styles.sectionLabel}>Location</p>

        <label className={styles.fieldLabel}>Zip Code *
          <input
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            maxLength={10}
            required
            className={styles.input}
          />
        </label>

        <label className={styles.fieldLabel}>City
          <input
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={styles.input}
          />
        </label>

        <label className={styles.fieldLabel}>State *
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            className={styles.input}
          >
            <option value="">Select state…</option>
            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>

      <hr className={styles.divider} />
      <p className={styles.sectionLabel}>Change Password</p>

      {pwMessage && <p className={styles.success}>{pwMessage}</p>}
      {pwError   && <p className={styles.error}>{pwError}</p>}

      <form onSubmit={handlePwSubmit} className={styles.form}>
        <label className={styles.fieldLabel}>Current Password
          <div className={styles.passwordWrap}>
            <input
              type={showPw.current ? 'text' : 'password'}
              name="password"
              value={pwForm.password}
              onChange={e => setPwForm(p => ({ ...p, password: e.target.value }))}
              className={styles.input}
              autoComplete="current-password"
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}>
              {showPw.current ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <label className={styles.fieldLabel}>New Password
          <div className={styles.passwordWrap}>
            <input
              type={showPw.next ? 'text' : 'password'}
              name="newPassword"
              value={pwForm.newPassword}
              onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
              className={styles.input}
              autoComplete="new-password"
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(p => ({ ...p, next: !p.next }))}>
              {showPw.next ? 'Hide' : 'Show'}
            </button>
          </div>
          <ul className={styles.requirementsList}>
            <li className={pwForm.newPassword.length >= 8 ? styles.requirementMet : styles.requirement}>Min 8 characters</li>
            <li className={/[A-Z]/.test(pwForm.newPassword) ? styles.requirementMet : styles.requirement}>1 uppercase letter</li>
            <li className={/[0-9]/.test(pwForm.newPassword) ? styles.requirementMet : styles.requirement}>1 number</li>
            <li className={/[^A-Za-z0-9]/.test(pwForm.newPassword) ? styles.requirementMet : styles.requirement}>1 special character</li>
          </ul>
        </label>

        <label className={styles.fieldLabel}>Confirm New Password
          <div className={styles.passwordWrap}>
            <input
              type={showPw.conf ? 'text' : 'password'}
              name="newPasswordConf"
              value={pwForm.newPasswordConf}
              onChange={e => setPwForm(p => ({ ...p, newPasswordConf: e.target.value }))}
              className={styles.input}
              autoComplete="new-password"
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(p => ({ ...p, conf: !p.conf }))}>
              {showPw.conf ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <button
          type="submit"
          className={styles.saveBtn}
          disabled={pwSaving || !pwForm.password || !pwForm.newPassword || !pwForm.newPasswordConf}
        >
          {pwSaving ? 'Updating…' : 'Change Password'}
        </button>
      </form>
    </div>
  )
}