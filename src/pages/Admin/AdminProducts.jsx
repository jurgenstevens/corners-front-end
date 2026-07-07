import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as adminService from '../../services/adminService'
import styles from './AdminProducts.module.css'

export default function AdminProducts() {
  const [tab, setTab] = useState('all')
  const [allProducts, setAllProducts] = useState([])
  const [tallyHits, setTallyHits] = useState([])
  const [expiring, setExpiring] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    if (tab === 'all') {
      adminService.getAllProducts().then(data => { setAllProducts(Array.isArray(data) ? data : []); setLoading(false) })
    } else if (tab === 'tally') {
      adminService.getTallyHits().then(data => { setTallyHits(Array.isArray(data) ? data : []); setLoading(false) })
    } else {
      adminService.getExpiringRejected().then(data => { setExpiring(Array.isArray(data) ? data : []); setLoading(false) })
    }
  }, [tab])

  return (
    <div>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'all' ? styles.tabActive : ''}`} onClick={() => setTab('all')}>All Products</button>
        <button className={`${styles.tab} ${tab === 'tally' ? styles.tabActive : ''}`} onClick={() => setTab('tally')}>Tally Hits</button>
        <button className={`${styles.tab} ${tab === 'expiring' ? styles.tabActive : ''}`} onClick={() => setTab('expiring')}>Expiring Rejected</button>
      </div>

      {loading && <p className={styles.loading}>Loading…</p>}

      {!loading && tab === 'all' && (
        allProducts.length === 0
          ? <p className={styles.empty}>No products found.</p>
          : allProducts.map(p => (
            <div key={p._id} className={styles.card}>
              <div className={styles.cardRow}>
                <div>
                  <p className={styles.productName}>{p.name}</p>
                  {p.brand && <p className={styles.meta}>{p.brand}</p>}
                  {p.storeName && <p className={styles.meta}>{p.storeName}</p>}
                </div>
                <div className={styles.cardRowRight}>
                  <span className={`${styles.statusBadge} ${p.status === 'stocked' ? styles.success : p.status === 'rejected' ? styles.danger : styles.warn}`}>
                    {p.status}
                  </span>
                  <Link to={`/dashboard/admin/products/${p._id}`} className={styles.btnGhost}>View →</Link>
                </div>
              </div>
              <p className={styles.dateMeta}>Added {new Date(p.createdAt).toLocaleDateString()}</p>
            </div>
          ))
      )}

      {!loading && tab === 'tally' && (
        tallyHits.length === 0
          ? <p className={styles.empty}>No products have hit tally yet.</p>
          : tallyHits.map(p => (
            <div key={p._id} className={styles.card}>
              <div className={styles.cardRow}>
                <div>
                  <p className={styles.productName}>{p.name}</p>
                  {p.brand && <p className={styles.meta}>{p.brand}</p>}
                  <p className={styles.meta}>{typeof p.business === 'object' ? (p.business.displayName ?? p.business.name) : '—'}</p>
                </div>
                <div className={styles.cardRowRight}>
                  <span className={`${styles.statusBadge} ${p.status === 'stocked' ? styles.success : styles.warn}`}>
                    {p.status}
                  </span>
                  <Link to={`/dashboard/admin/products/${p._id}`} className={styles.btnGhost}>View →</Link>
                </div>
              </div>
              <div className={styles.tallyRow}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${Math.min(100, (p.currentTally / p.tallyGoal) * 100)}%` }}
                  />
                </div>
                <span className={styles.tallyLabel}>{p.currentTally} / {p.tallyGoal} votes</span>
              </div>
              <p className={styles.dateMeta}>Updated {new Date(p.updatedAt).toLocaleDateString()}</p>
            </div>
          ))
      )}

      {!loading && tab === 'expiring' && (
        expiring.length === 0
          ? <p className={styles.empty}>No rejected products pending deletion.</p>
          : expiring.map(p => (
            <div key={p._id} className={styles.card}>
              <div className={styles.cardRow}>
                <div>
                  <p className={styles.productName}>{p.name}</p>
                  <p className={styles.meta}>{typeof p.business === 'object' ? (p.business.displayName ?? p.business.name) : '—'}</p>
                </div>
                <div className={styles.cardRowRight}>
                  <span className={`${styles.countdown} ${p.daysUntilDeletion <= 5 ? styles.countdownRed : ''}`}>
                    Deletes in {Math.ceil(p.daysUntilDeletion)} days
                  </span>
                  <Link to={`/dashboard/admin/products/${p._id}`} className={styles.btnGhost}>View →</Link>
                </div>
              </div>
            </div>
          ))
      )}
    </div>
  )
}
