import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import * as adminService from '../../services/adminService'
import styles from './AdminStores.module.css'

const STATUS_LABEL = { pending: 'Pending Approval', approved: 'Approved' }
const STATUS_CLASS = { pending: 'warn', approved: 'success' }

function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000)
}

function BusinessCard({ b, tab }) {
  const owner = b.profile
  const days = daysSince(b.createdAt)

  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.cardInfo}>
          <div className={styles.cardTitleRow}>
            <span className={styles.bizName}>{b.displayName || owner?.name || 'Unnamed'}</span>
            <span className={`${styles.statusBadge} ${styles[STATUS_CLASS[b.verificationStatus]]}`}>
              {STATUS_LABEL[b.verificationStatus] ?? b.verificationStatus}
            </span>
            {b.isAuthentic && <span className={styles.authenticBadge}>Verified Authentic</span>}
          </div>
          <p className={styles.meta}>{owner?.name} · {owner?.email}</p>
          <p className={styles.meta}>{b.businessType} · {b.location?.city}, {b.location?.state}</p>
          {tab === 'pending' && (
            <p className={`${styles.waitLabel} ${days > 3 ? styles.waitLabelRed : ''}`}>
              Waiting {days} day{days !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className={styles.cardActions}>
          <Link to={`/dashboard/admin/stores/${b._id}`} className={styles.btnGhost}>View →</Link>
        </div>
      </div>
    </div>
  )
}

export default function AdminStores() {
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('status') === 'pending' ? 'pending' : searchParams.get('status') === 'approved' ? 'approved' : 'all'
  const [tab, setTab] = useState(initialTab)
  const [businesses, setBusinesses] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = tab === 'approved'
      ? { verificationStatus: 'approved' }
      : tab === 'pending'
      ? { verificationStatus: 'pending' }
      : {}
    adminService.getAllBusinesses(params).then(data => {
      setBusinesses(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [tab])

  const filtered = businesses.filter(b => {
    const q = search.toLowerCase()
    return !q || (b.displayName ?? '').toLowerCase().includes(q) || (b.profile?.name ?? '').toLowerCase().includes(q)
  })

  return (
    <div>
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Search stores…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.tabs}>
        {['all', 'pending', 'approved'].map(t => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
            {t === 'all' ? 'All Stores' : t === 'pending' ? 'Pending Approval' : 'Approved'}
          </button>
        ))}
      </div>

      {loading && <p className={styles.loading}>Loading…</p>}
      {!loading && filtered.length === 0 && <p className={styles.empty}>No stores found.</p>}
      {!loading && filtered.map(b => (
        <BusinessCard key={b._id} b={b} tab={tab} />
      ))}
    </div>
  )
}
