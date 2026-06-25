import { useState } from 'react'
import { submitBugReport } from '../../services/bugReportService'
import styles from './BugReportModal.module.css'

const CATEGORIES = [
  { value: 'ui_bug', label: 'UI Bug' },
  { value: 'incorrect_data', label: 'Incorrect Data' },
  { value: 'account_issue', label: 'Account Issue' },
  { value: 'abuse_report', label: 'Abuse Report' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'other', label: 'Other' },
]

const SEVERITIES = ['low', 'medium', 'high', 'critical']

const BLANK = { category: 'other', title: '', description: '', severity: 'medium', steps: '', relatedUser: '' }

export default function BugReportModal({ isOpen, onClose, user }) {
  const [form, setForm] = useState(BLANK)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  function set(key, val) {
    setError('')
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.')
      return
    }
    setLoading(true)
    try {
      let description = form.description.trim()
      if (form.category === 'abuse_report' && form.relatedUser.trim()) {
        description = `Reported user/store: ${form.relatedUser.trim()}\n\n${description}`
      }
      const payload = {
        category: form.category,
        title: form.title.trim(),
        description,
        severity: form.severity,
        stepsToReproduce: form.category === 'ui_bug' ? form.steps.trim() || undefined : undefined,
      }
      await submitBugReport(payload)
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setForm(BLANK)
    setSubmitted(false)
    setError('')
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">✕</button>

        {submitted ? (
          <div className={styles.success}>
            <p className={styles.successIcon}>✅</p>
            <p className={styles.successTitle}>Thanks!</p>
            <p className={styles.successMsg}>We'll look into it.</p>
            <button className={styles.doneBtn} onClick={handleClose}>Done</button>
          </div>
        ) : (
          <>
            <h2 className={styles.title}>Report an Issue</h2>
            <p className={styles.subtitle}>Help us improve Corners.</p>

            {error && <p className={styles.error}>{error}</p>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.label}>Category</label>
              <select className={styles.select} value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>

              {form.category === 'abuse_report' && (
                <>
                  <label className={styles.label}>Who are you reporting? (name or email)</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Name or email"
                    value={form.relatedUser}
                    onChange={e => set('relatedUser', e.target.value)}
                    maxLength={200}
                  />
                </>
              )}

              <label className={styles.label}>Title <span className={styles.required}>*</span></label>
              <input
                className={styles.input}
                type="text"
                placeholder="Brief summary"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                maxLength={100}
                required
              />

              <label className={styles.label}>Description <span className={styles.required}>*</span></label>
              <textarea
                className={styles.textarea}
                placeholder="What happened?"
                rows={4}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                required
              />

              {form.category === 'ui_bug' && (
                <>
                  <label className={styles.label}>Steps to Reproduce <span className={styles.optional}>(optional)</span></label>
                  <textarea
                    className={styles.textarea}
                    placeholder="1. Go to…&#10;2. Click…&#10;3. See error"
                    rows={3}
                    value={form.steps}
                    onChange={e => set('steps', e.target.value)}
                  />
                </>
              )}

              <label className={styles.label}>Severity</label>
              <div className={styles.pills}>
                {SEVERITIES.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`${styles.pill} ${form.severity === s ? styles[`pill_${s}`] : ''}`}
                    onClick={() => set('severity', s)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>

              <button className={styles.submitBtn} disabled={loading}>
                {loading ? 'Sending…' : 'Submit Report'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
