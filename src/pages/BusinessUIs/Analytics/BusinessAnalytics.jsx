import { useState, useEffect } from 'react'
import * as productService from '../../../services/productService'
import styles from './BusinessAnalytics.module.css'

export default function BusinessAnalytics() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    productService.getBusinessProducts()
      .then(data => {
        if (Array.isArray(data)) setProducts(data)
        else setError('Failed to load analytics.')
      })
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={styles.loading}><span className={styles.spinner} /></div>

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}><h2>Analytics</h2></div>
        <p className={styles.error}>{error}</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}><h2>Analytics</h2></div>
        <p className={styles.empty}>No data yet — once patrons start requesting products, your analytics will appear here.</p>
      </div>
    )
  }

  const total    = products.length
  const pending  = products.filter(p => p.status === 'pending').length
  const approved = products.filter(p => p.status === 'approved').length
  const inStore  = products.filter(p => p.status === 'stocked' || p.status === 'on_sale').length

  const top5     = [...products].sort((a, b) => (b.currentTally || 0) - (a.currentTally || 0)).slice(0, 5)
  const maxTally = top5[0]?.currentTally || 1

  const fulfilled      = products.filter(p => ['approved', 'stocked', 'on_sale'].includes(p.status)).length
  const fulfillmentRate = total > 0 ? Math.round((fulfilled / total) * 100) : 0

  const STATS = [
    { label: 'Total Products',   value: total    },
    { label: 'Pending Requests', value: pending  },
    { label: 'Approved',         value: approved },
    { label: 'In Store',         value: inStore  },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}><h2>Analytics</h2></div>

      <div className={styles.statsRow}>
        {STATS.map(s => (
          <div key={s.label} className={styles.statCard}>
            <span className={styles.statNum}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Top 5 Most-Voted Products</h3>
        <div className={styles.barList}>
          {top5.length === 0 ? (
            <p className={styles.empty}>No votes yet.</p>
          ) : top5.map(p => (
            <div key={p._id} className={styles.barRow}>
              <div className={styles.barMeta}>
                <span className={styles.barName}>{p.name}</span>
                {p.business?.name && <span className={styles.barStore}>{p.business.name}</span>}
                <span className={styles.barTally}>{p.currentTally || 0}</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${maxTally > 0 ? ((p.currentTally || 0) / maxTally) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Fulfillment Rate</h3>
        <div className={styles.fulfillRow}>
          <div className={styles.fulfillTrack}>
            <div className={styles.fulfillFill} style={{ width: `${fulfillmentRate}%` }} />
          </div>
          <span className={styles.fulfillPct}>{fulfillmentRate}%</span>
        </div>
        <p className={styles.fulfillNote}>{fulfilled} of {total} products approved, stocked, or on sale</p>
      </div>
    </div>
  )
}
