import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as connectionService from '../../services/connectionService'
import styles from './PatronDashboard.module.css'

export default function PatronDashboard({ user }) {
  const [nearby, setNearby] = useState([])
  const [loading, setLoading] = useState(true)
  const [requested, setRequested] = useState({})

  useEffect(() => {
    connectionService.getNearbyBusinesses()
      .then(data => { if (Array.isArray(data)) setNearby(data) })
      .finally(() => setLoading(false))
  }, [])

  async function handleRegister(businessId) {
    await connectionService.requestConnection(businessId)
    setRequested(prev => ({ ...prev, [businessId]: true }))
    setNearby(prev => prev.filter(b => b._id !== businessId))
  }

  async function handleDismiss(businessId) {
    await connectionService.dismissBusiness(businessId)
    setNearby(prev => prev.filter(b => b._id !== businessId))
  }

  return (
    <div className={styles.container}>
      <h1>Welcome, {user?.name}</h1>

      <div className={styles.cards}>
        <Link to="/patron/stores" className={styles.card}>
          <span>🏪</span>
          <h3>My Stores</h3>
          <p>View your connected businesses</p>
        </Link>
        <Link to="/patron/products" className={styles.card}>
          <span>🛍️</span>
          <h3>Products</h3>
          <p>Browse and vote on products</p>
        </Link>
        <Link to="/patron/requests" className={styles.card}>
          <span>📋</span>
          <h3>Promotions & Sales</h3>
          <p>See deals from your stores</p>
        </Link>
      </div>

      <section className={styles.nearby}>
        <h2>Businesses Near You</h2>
        {loading && <p>Loading…</p>}
        {!loading && nearby.length === 0 && (
          <p className={styles.empty}>No new businesses in your area right now.</p>
        )}
        <div className={styles.businessList}>
          {nearby.map(b => (
            <div key={b._id} className={styles.businessCard}>
              <div className={styles.bizInfo}>
                <h4>{b.displayName || b.profile?.name}</h4>
                {b.businessType && <span className={styles.type}>{b.businessType}</span>}
                {b.address && <p className={styles.address}>📍 {b.address}</p>}
                {b.location?.zip && <p className={styles.zip}>📮 {b.location.zip}</p>}
              </div>
              <div className={styles.actions}>
                {requested[b._id] ? (
                  <span className={styles.requested}>✓ Requested</span>
                ) : (
                  <button className={styles.registerBtn} onClick={() => handleRegister(b._id)}>
                    Register
                  </button>
                )}
                <button className={styles.dismissBtn} onClick={() => handleDismiss(b._id)}>
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
