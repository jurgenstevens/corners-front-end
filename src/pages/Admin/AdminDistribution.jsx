import { useState, useEffect } from 'react'
import * as adminService from '../../services/adminService'
import styles from './AdminDistribution.module.css'

export default function AdminDistribution() {
  const [tab, setTab] = useState('all')
  const [distributors, setDistributors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    adminService.getAllDistributors()
      .then(data => { setDistributors(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className={styles.notice}>
        <span className={styles.noticeIcon}>🚛</span>
        <div>
          <p className={styles.noticeTitle}>Distributor Admin — Coming Soon</p>
          <p className={styles.noticeText}>
            Full distributor management (catalog approval, order oversight, region config) is a v2 feature.
            Registered distributors are listed below.
          </p>
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'all' ? styles.tabActive : ''}`} onClick={() => setTab('all')}>
          All Distributors
        </button>
      </div>

      {loading && <p className={styles.loading}>Loading…</p>}

      {!loading && distributors.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyIcon}>📦</p>
          <p>No distributors registered yet.</p>
        </div>
      )}

      {!loading && distributors.map(d => (
        <div key={d._id} className={styles.row}>
          {d.photo && <img src={d.photo} className={styles.avatar} alt="" />}
          <div>
            <p className={styles.name}>{d.name}</p>
            <p className={styles.email}>{d.email}</p>
            <p className={styles.joinDate}>Joined {new Date(d.createdAt).toLocaleDateString()}</p>
          </div>
          <span className={styles.badge}>Distributor</span>
        </div>
      ))}
    </div>
  )
}
