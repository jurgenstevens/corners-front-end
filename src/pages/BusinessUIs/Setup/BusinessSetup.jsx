import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as businessService from '../../../services/businessService'
import styles from './BusinessSetup.module.css'

const BUSINESS_TYPES = [
  'Convenience Store','Mini Mart','Hardware Store','Pharmacy','Grocery',
  'Skate Shop','Clothing Boutique','Coffee Shop','Bakery','Auto Parts',
  'Electronics','Pet Store','Book Store','Toy Store','Sporting Goods'
]

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

export default function BusinessSetup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [stepError, setStepError] = useState('')
  const [form, setForm] = useState({
    businessType: '', description: '', visibility: 'public', priceTier: '$',
    address: '', zip: '', city: '', state: '', phone: '',
    hours: { monday:'', tuesday:'', wednesday:'', thursday:'', friday:'', saturday:'', sunday:'' },
  })

  useEffect(() => {
    businessService.getMyBusiness().then(data => {
      if (data && !data.err) {
        setForm(prev => ({
          ...prev,
          businessType: data.businessType || '',
          description: data.description || '',
          visibility: data.visibility || 'public',
          priceTier: data.priceTier || '$',
          address: data.address || '',
          zip: data.location?.zip || '',
          city: data.location?.city || '',
          state: data.location?.state || '',
          phone: data.phone || '',
          hours: data.hours || prev.hours,
        }))
      }
    }).catch(() => {})
  }, [])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleHours(day, val) {
    setForm(prev => ({ ...prev, hours: { ...prev.hours, [day]: val } }))
  }

  function handleStep2Next() {
    setStepError('')
    const addr = form.address.trim()
    const zip  = form.zip.trim()
    const city = form.city.trim()
    if (!addr) return setStepError('Street address is required.')
    if (!/^\d+\s+\S/.test(addr)) return setStepError('Enter a valid street address starting with a house number (e.g. 123 Main St).')
    if (!/^\d{5}$/.test(zip)) return setStepError('Zip code must be exactly 5 digits.')
    if (!city) return setStepError('City is required.')
    if (!/^[A-Za-z\s\-'.]+$/.test(city)) return setStepError('City name may only contain letters, spaces, and hyphens.')
    if (!form.state) return setStepError('State is required.')
    setStep(3)
  }

  async function handleFinish() {
    setSaving(true)
    try {
      const result = await businessService.setupBusiness({
        ...form,
        location: { zip: form.zip, city: form.city, state: form.state },
      })
      if (result?.verificationStatus === 'approved') {
        navigate('/dashboard/business')
      } else {
        navigate('/dashboard/business/pending-approval')
      }
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className={styles.container}>
      <h2>Business Setup</h2>

      <div className={styles.steps}>
        {[1,2,3].map(n => (
          <div key={n} className={`${styles.step} ${step === n ? styles.active : ''} ${step > n ? styles.done : ''}`}>
            {step > n ? '✓' : n}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className={styles.section}>
          <h3>Basic Info</h3>
          <label>Business Type *
            <select name="businessType" value={form.businessType} onChange={handleChange} required>
              <option value="">Select…</option>
              {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label>Description
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
          </label>
          <label>Visibility
            <select name="visibility" value={form.visibility} onChange={handleChange}>
              <option value="public">Public (auto-approve patrons)</option>
              <option value="private">Private (approve manually)</option>
            </select>
          </label>
          <label>Price Tier
            <select name="priceTier" value={form.priceTier} onChange={handleChange}>
              <option value="$">$ — Budget-friendly</option>
              <option value="$$">$$ — Mid-range</option>
              <option value="$$$">$$$ — Premium</option>
            </select>
          </label>
          <button className={styles.next} onClick={() => setStep(2)} disabled={!form.businessType}>
            Next →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className={styles.section}>
          <h3>Location & Contact</h3>
          <label>Street Address *
            <input name="address" value={form.address} onChange={handleChange} placeholder="e.g. 123 Main St" />
          </label>
          <label>Zip Code *
            <input name="zip" value={form.zip} onChange={handleChange} maxLength={5} placeholder="5-digit zip" />
          </label>
          <label>City *
            <input name="city" value={form.city} onChange={handleChange} />
          </label>
          <label>State *
            <select name="state" value={form.state} onChange={handleChange}>
              <option value="">Select state…</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>Phone
            <input name="phone" value={form.phone} onChange={handleChange} />
          </label>
          {stepError && <p className={styles.error}>{stepError}</p>}
          <div className={styles.btns}>
            <button className={styles.back} onClick={() => { setStepError(''); setStep(1) }}>← Back</button>
            <button className={styles.next} onClick={handleStep2Next}>Next →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={styles.section}>
          <h3>Hours</h3>
          {DAYS.map(day => (
            <label key={day} className={styles.dayRow}>
              <span>{day.charAt(0).toUpperCase() + day.slice(1)}</span>
              <input
                placeholder="e.g. 9am – 6pm or Closed"
                value={form.hours[day]}
                onChange={e => handleHours(day, e.target.value)}
              />
            </label>
          ))}
          <div className={styles.btns}>
            <button className={styles.back} onClick={() => setStep(2)}>← Back</button>
            <button className={styles.finish} onClick={handleFinish} disabled={saving}>
              {saving ? 'Saving…' : 'Finish Setup'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
