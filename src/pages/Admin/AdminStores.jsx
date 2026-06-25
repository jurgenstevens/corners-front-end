import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import * as adminService from '../../services/adminService'
import styles from './AdminStores.module.css'

const STATUS_LABEL = {
  unverified: 'Pending', pending_verification: 'Pending Review',
  verified: 'Verified', rejected: 'Rejected',
}
const STATUS_CLASS = {
  unverified: 'warn', pending_verification: 'warn', verified: 'success', rejected: 'danger',
}

function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000)
}

function BusinessCard({ b, onApprove, onReject, tab }) {
  const [showReject, setShowReject] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')
  const owner = b.profile
  const days = daysSince(b.createdAt)

  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.cardInfo}>
          <div className={styles.cardTitleRow}>
            <Link to={`/dashboard/admin/stores/${b._id}`} className={styles.bizName}>
              {b.displayName || owner?.name || 'Unnamed'}
            </Link>
            <span className={`${styles.statusBadge} ${styles[STATUS_CLASS[b.verificationStatus]]}`}>
              {STATUS_LABEL[b.verificationStatus] ?? b.verificationStatus}
            </span>
          </div>
          <p className={styles.meta}>{owner?.name} · {owner?.email}</p>
          <p className={styles.meta}>{b.businessType} · {b.location?.city}, {b.location?.state}</p>
          {tab === 'pending' && (
            <p className={`${styles.waitLabel} ${days > 3 ? styles.waitLabelRed : ''}`}>
              Waiting {days} day{days !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {(tab === 'pending' || tab === 'all') && (
          <div className={styles.cardActions}>
            <button className={styles.btnGreen} onClick={() => onApprove(b._id)}>Approve</button>
            <button className={styles.btnRed} onClick={() => setShowReject(p => !p)}>Reject</button>
            <Link to={`/dashboard/admin/stores/${b._id}`} className={styles.btnGhost}>View →</Link>
          </div>
        )}
        {tab === 'verified' && (
          <div className={styles.cardActions}>
            <Link to={`/dashboard/admin/stores/${b._id}`} className={styles.btnGhost}>View →</Link>
          </div>
        )}
      </div>
      {showReject && (
        <div className={styles.rejectForm}>
          <textarea
            className={styles.textarea}
            placeholder="Reason for rejection (optional)"
            value={rejectNotes}
            onChange={e => setRejectNotes(e.target.value)}
            rows={3}
          />
          <div className={styles.rejectActions}>
            <button className={styles.btnRed} onClick={() => { onReject(b._id, rejectNotes); setShowReject(false) }}>
              Confirm Reject
            </button>
            <button className={styles.btnGhost} onClick={() => setShowReject(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminStores() {
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('status') === 'verified' ? 'verified' : 'pending'
  const [tab, setTab] = useState(initialTab)
  const [businesses, setBusinesses] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = tab === 'verified'
      ? { verificationStatus: 'verified' }
      : tab === 'pending'
      ? { verificationStatus: 'unverified' }
      : {}
    adminService.getAllBusinesses(params).then(data => {
      setBusinesses(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [tab])

  async function handleApprove(id) {
    await adminService.verifyBusiness(id, '')
    setBusinesses(b => b.filter(x => x._id !== id))
  }

  async function handleReject(id, notes) {
    await adminService.rejectBusiness(id, notes)
    setBusinesses(b => b.filter(x => x._id !== id))
  }

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
        {['pending', 'all', 'verified'].map(t => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
            {t === 'pending' ? 'Pending Approval' : t === 'all' ? 'All Stores' : 'Verified'}
          </button>
        ))}
      </div>

      {loading && <p className={styles.loading}>Loading…</p>}
      {!loading && filtered.length === 0 && <p className={styles.empty}>No stores found.</p>}
      {!loading && filtered.map(b => (
        <BusinessCard key={b._id} b={b} tab={tab} onApprove={handleApprove} onReject={handleReject} />
      ))}
    </div>
  )
}
