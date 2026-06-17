import { useState, useEffect } from 'react'
import * as distributorService from '../../services/distributorService'
import styles from './DistributorSettings.module.css'

const CATEGORIES = ['Beverages', 'Snacks', 'Dairy', 'Bakery', 'Meat', 'Produce', 'Frozen', 'Dry Goods', 'Tobacco', 'Alcohol', 'Other']

export default function DistributorSettings() {
  const [companyName, setCompanyName] = useState('')
  const [regionsInput, setRegionsInput] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    distributorService.getMyDistributor().then(data => {
      if (!data.err) {
        setCompanyName(data.companyName || '')
        setRegionsInput((data.serviceRegions || []).join(', '))
        setSelectedCategories(data.categories || [])
      }
    }).finally(() => setLoading(false))
  }, [])

  function toggleCategory(cat) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaveMsg('')
    setSaveError('')
    setSaving(true)
    const serviceRegions = regionsInput.split(',').map(s => s.trim()).filter(Boolean)
    try {
      const result = await distributorService.updateDistributor({
        companyName: companyName.trim(),
        serviceRegions,
        categories: selectedCategories,
      })
      if (result.err) { setSaveError(result.err); return }
      setSaveMsg('Settings saved.')
    } catch {
      setSaveError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className={styles.loading}>Loading…</div>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Settings</h2>
      </div>

      <form className={styles.form} onSubmit={handleSave}>
        <div className={styles.section}>
          <label className={styles.label}>
            Company Name
            <input
              className={styles.input}
              type="text"
              placeholder="Your company name"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
            />
          </label>

          <label className={styles.label}>
            Service Zip Codes
            <span className={styles.labelHint}>Comma-separated — businesses in these zips will see your catalog.</span>
            <input
              className={styles.input}
              type="text"
              placeholder="60609, 60616, 60632…"
              value={regionsInput}
              onChange={e => setRegionsInput(e.target.value)}
            />
          </label>
        </div>

        <div className={styles.section}>
          <p className={styles.categoryLabel}>Categories You Carry</p>
          <div className={styles.checkboxGrid}>
            {CATEGORIES.map(cat => (
              <label key={cat} className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {saveMsg && <p className={styles.saveSuccess}>{saveMsg}</p>}
        {saveError && <p className={styles.saveError}>{saveError}</p>}

        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
