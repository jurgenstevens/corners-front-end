import { useState, useEffect } from 'react'
import styles from './PatronRequests.module.css'
import * as requestService from '../../../services/requestService'

const STATUS_COLOR = { open: '#f59e0b', fulfilled: '#10b981', cancelled: '#9ca3af' }

const PatronRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    requestService.getMyRequests()
      .then(setRequests)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={styles.page}><p className={styles.loading}>Loading...</p></div>

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2>My Requests</h2>
        {error && <p className={styles.error}>{error}</p>}
        {requests.length === 0
          ? <p className={styles.empty}>You haven't made any requests yet.</p>
          : (
            <div className={styles.list}>
              {requests.map(req => (
                <div key={req._id} className={styles.card}>
                  <div className={styles.dot} style={{ background: STATUS_COLOR[req.status] || '#888' }} />
                  <div className={styles.info}>
                    <h4>{req.productName}</h4>
                    {req.brand && <p className={styles.brand}>{req.brand}</p>}
                    {req.business?.name && <p className={styles.store}>@ {req.business.name}</p>}
                    <span className={styles.date}>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`${styles.badge} ${styles[req.status]}`}>{req.status}</span>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}

export default PatronRequests