import { useState, useEffect } from 'react'
import * as adminService from '../../services/adminService'
import styles from './AdminAnalytics.module.css'

function Section({ title, children }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </div>
  )
}

export default function AdminAnalytics() {
  const [zip, setZip] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [growth, setGrowth] = useState([])
  const [connRates, setConnRates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminService.getZipActivity(),
      adminService.getTopProducts(),
      adminService.getGrowthStats(),
      adminService.getConnectionRates(),
    ]).then(([z, p, g, c]) => {
      setZip(Array.isArray(z) ? z : [])
      setTopProducts(Array.isArray(p) ? p : [])
      setGrowth(Array.isArray(g) ? g : [])
      setConnRates(Array.isArray(c) ? c : [])
      setLoading(false)
    })
  }, [])

  if (loading) return <p className={styles.loading}>Loading analytics…</p>

  return (
    <div className={styles.grid}>
      <Section title="Most Active Zip Codes">
        {zip.length === 0 && <p className={styles.empty}>No data yet.</p>}
        {zip.map((z, i) => (
          <div key={z.zip} className={styles.rankRow}>
            <span className={styles.rank}>#{i + 1}</span>
            <span className={styles.rankLabel}>{z.zip}</span>
            <span className={styles.rankValue}>{z.storeCount} store{z.storeCount !== 1 ? 's' : ''}</span>
          </div>
        ))}
      </Section>

      <Section title="Top Voted Products (30 days)">
        {topProducts.length === 0 && <p className={styles.empty}>No data yet.</p>}
        {topProducts.map((p, i) => (
          <div key={p._id} className={styles.rankRow}>
            <span className={styles.rank}>#{i + 1}</span>
            <div className={styles.rankMain}>
              <span className={styles.rankLabel}>{p.name}</span>
              <span className={styles.rankSub}>{typeof p.business === 'object' ? p.business.name : '—'}</span>
            </div>
            <span className={styles.rankValue}>{p.currentTally} votes</span>
          </div>
        ))}
      </Section>

      <Section title="Signup Growth (Last 8 Weeks)">
        {growth.length === 0 && <p className={styles.empty}>No data yet.</p>}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Week</th><th>Patrons</th><th>Businesses</th><th>Distributors</th><th>Total</th>
            </tr>
          </thead>
          <tbody>
            {growth.map(w => (
              <tr key={w.weekStart}>
                <td>{w.weekStart}</td>
                <td>{w.patrons}</td>
                <td>{w.businesses}</td>
                <td>{w.distributors}</td>
                <td className={styles.bold}>{w.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Connection Rate by Business">
        {connRates.length === 0 && <p className={styles.empty}>No data yet.</p>}
        {connRates.map(c => (
          <div key={c.businessId} className={styles.connRow}>
            <span className={styles.connName}>{c.name}</span>
            <div className={styles.connStats}>
              <span className={styles.connStat}><span className={styles.greenDot} />{c.connected} connected</span>
              <span className={styles.connStat}><span className={styles.redDot} />{c.dismissed} dismissed</span>
              <span className={styles.connRate}>{c.approvalRate}%</span>
            </div>
          </div>
        ))}
      </Section>
    </div>
  )
}
