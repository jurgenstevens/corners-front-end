import { useState, useEffect } from 'react'
import * as productService from '../../../services/productService'
import styles from './PatronRequests.module.css'

const STATUS_COLORS = {
  pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444',
  ready_to_stock: '#3b82f6', stocked: '#a855f7'
}

export default function PatronRequests({ user }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const profileId = user?.profileId
    productService.getPatronProducts()
      .then(data => {
        if (Array.isArray(data)) {
          const mine = data.filter(p => p.requestedBy === profileId || p.requestedBy?._id === profileId)
          setRequests(mine)
        }
      })
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div className={styles.container}>
      <h2>My Requests</h2>
      {loading && <p>Loading…</p>}
      {!loading && requests.length === 0 && <p className={styles.empty}>You haven't requested any products yet.</p>}
      <div className={styles.list}>
        {requests.map(p => (
          <div key={p._id} className={styles.card}>
            {p.image && <img src={p.image} alt={p.name} className={styles.thumb} />}
            <div className={styles.dot} style={{ background: STATUS_COLORS[p.status] || '#888' }} />
            <div className={styles.info}>
              <h4>{p.name}</h4>
              {p.brand && <span className={styles.brand}>{p.brand}</span>}
            </div>
            <div className={styles.right}>
              <span className={styles.status}>{p.status.replace(/_/g,' ')}</span>
              <div className={styles.tally}>
                <span>{p.currentTally}/{p.tallyGoal}</span>
                <div className={styles.bar}><div className={styles.fill} style={{ width:`${Math.min(100,(p.currentTally/p.tallyGoal)*100)}%` }} /></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
