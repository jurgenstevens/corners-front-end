import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as distributorService from '../../../services/distributorService'
import styles from './BusinessDistributors.module.css'

export default function BusinessDistributors() {
  const [distributors, setDistributors] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    distributorService.getNearbyDistributors()
      .then(data => { if (Array.isArray(data)) setDistributors(data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={styles.loading}>Loading…</div>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Distributors</h2>
        <p className={styles.subtitle}>Order directly from distributors that service your area.</p>
      </div>

      {distributors.length === 0 ? (
        <div className={styles.empty}>
          <p>No distributors in your area yet.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {distributors.map(d => {
            const name = d.companyName || d.profile?.name || 'Distributor'
            return (
              <div key={d._id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>{name[0].toUpperCase()}</div>
                  <div className={styles.cardInfo}>
                    <h3 className={styles.name}>{name}</h3>
                    {d.categories?.length > 0 && (
                      <p className={styles.categories}>{d.categories.join(', ')}</p>
                    )}
                    {d.serviceRegions?.length > 0 && (
                      <p className={styles.regions}>
                        📍 {d.serviceRegions.slice(0, 3).join(', ')}
                        {d.serviceRegions.length > 3 ? ` +${d.serviceRegions.length - 3} more` : ''}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  className={styles.viewBtn}
                  onClick={() => navigate(`/dashboard/business/distributors/${d._id}`)}
                >
                  View Catalog →
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
