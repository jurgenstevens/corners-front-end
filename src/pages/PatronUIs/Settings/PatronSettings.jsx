import { useState, useEffect } from 'react'
import * as patronService from '../../../services/patronService'
import styles from './PatronSettings.module.css'

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
    </div>
  )
}