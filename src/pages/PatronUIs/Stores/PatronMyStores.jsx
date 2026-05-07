import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as connectionService from '../../../services/connectionService'
import styles from './PatronMyStores.module.css'

export default function PatronMyStores() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    connectionService.getMyStores()
      .then(data => { if (Array.isArray(data)) setStores(data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={styles.loading}>Loading…</div>

  if (stores.length === 0) return (
    <div className={styles.empty}>
      <span>🏪</span>
      <h3>No connected stores yet</h3>
      <p>Find businesses near you and send a connection request.</p>
      <button onClick={() => navigate('/dashboard/patron')}>Find Nearby Stores</button>
    </div>
  )

  return (
    <div className={styles.container}>
      <h2>My Stores</h2>
      <div className={styles.list}>
        {stores.map(b => (
          <div key={b._id} className={styles.card} onClick={() => navigate(`/patron/stores/${b._id}`)}>
            {b.photos?.[0] && <img src={b.photos[0]} alt={b.displayName} className={styles.thumb} />}
            <div className={styles.info}>
              <h4>{b.displayName || b.profile?.name}</h4>
              {b.businessType && <span className={styles.type}>{b.businessType}</span>}
              {b.address && <p className={styles.address}>📍 {b.address}</p>}
              {b.rating > 0 && <p className={styles.rating}>{'★'.repeat(Math.round(b.rating))} {b.rating.toFixed(1)}</p>}
            </div>
            <span className={styles.arrow}>›</span>
          </div>
        ))}
      </div>
    </div>
  )
}
