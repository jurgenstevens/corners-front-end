import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as businessService from '../../services/businessService'
import styles from './BusinessDashboard.module.css'

export default function BusinessDashboard({ user }) {
  const navigate = useNavigate()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    businessService.getMyBusiness()
      .then(data => {
        if (data?.err) {
          navigate('/dashboard/business/setup')
          return
        }
        if (!data?.businessType || !data?.location?.zip) {
          navigate('/dashboard/business/setup')
          return
        }
        setBusiness(data)
      })
      .catch(() => navigate('/dashboard/business/setup'))
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) return <div className={styles.loading}>Loading…</div>

  return (
    <div className={styles.container}>
      <h1>{business?.displayName || user?.name}</h1>
      {business?.businessType && <p className={styles.type}>{business.businessType}</p>}

      <div className={styles.grid}>
        <div className={styles.card} onClick={() => navigate('/dashboard/business/products')}>
          <span>📦</span><h3>Products</h3><p>Manage your product catalog</p>
        </div>
        <div className={styles.card} onClick={() => navigate('/dashboard/business/patron-requests')}>
          <span>👥</span><h3>Patron Requests</h3><p>Approve or deny patrons</p>
        </div>
        <div className={styles.card} onClick={() => navigate('/dashboard/business/analytics')}>
          <span>📊</span><h3>Analytics</h3><p>View your business stats</p>
        </div>
        <div className={styles.card} onClick={() => navigate('/dashboard/business/setup')}>
          <span>⚙️</span><h3>Settings</h3><p>Update business info</p>
        </div>
      </div>
    </div>
  )
}
