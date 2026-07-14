import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import * as authService from '../../../services/authService'
import * as businessService from '../../../services/businessService'
import styles from './BusinessSettings.module.css'

function validatePassword(pw) {
  if (pw.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(pw)) return 'Must include at least one uppercase letter.'
  if (!/[0-9]/.test(pw)) return 'Must include at least one number.'
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Must include at least one special character.'
  return null
}

export default function BusinessSettings() {
  const navigate = useNavigate()
  const [slug, setSlug] = useState(null)
  const qrRef = useRef(null)

  useEffect(() => {
    businessService.getMyBusiness().then(data => {
      if (data?.slug) setSlug(data.slug)
    })
  }, [])

  function handleDownload() {
    const canvas = qrRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `corners-qr-${slug}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const [pwForm, setPwForm] = useState({ password: '', newPassword: '', newPasswordConf: '' })
  const [showPw, setShowPw] = useState({ current: false, next: false, conf: false })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMessage, setPwMessage] = useState('')
  const [pwError, setPwError] = useState('')

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

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Settings</h2>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Business Profile</p>
        <p className={styles.sectionSub}>Update your business name, type, and location.</p>
        <button className={styles.linkBtn} onClick={() => navigate('/dashboard/business/setup')}>
          Edit Business Profile →
        </button>
      </div>

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

      <hr className={styles.divider} />
      <p className={styles.sectionLabel}>Your QR Code</p>

      {slug ? (
        <div className={styles.qrSection}>
          <p className={styles.sectionSub}>Customers scan this to follow your store instantly.</p>
          <div className={styles.qrWrap}>
            <QRCodeCanvas
              ref={qrRef}
              value={`${window.location.origin}/join/${slug}`}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <button className={styles.linkBtn} onClick={handleDownload}>
            Download QR Code
          </button>
        </div>
      ) : (
        <p className={styles.sectionSub}>
          Your QR code will appear here once your store is approved.
        </p>
      )}
    </div>
  )
}
