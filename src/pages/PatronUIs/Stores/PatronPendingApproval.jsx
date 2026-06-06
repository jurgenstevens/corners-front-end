import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as connectionService from '../../../services/connectionService'
import styles from './PatronPendingApproval.module.css'

export default function PatronPendingApproval() {
  const { businessId } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
  const [conn, setConn] = useState(null)

  useEffect(() => {
    connectionService.getConnectionStatus(businessId).then(data => {
      setConn(data)
      setStatus(data?.status || 'none')
    })
  }, [businessId])

  useEffect(() => {
    if (status === 'pending') {
      const t = setTimeout(() => navigate('/dashboard/patron'), 4000)
      return () => clearTimeout(t)
    }
    if (status === 'approved') {
      navigate(`/patron/stores/${businessId}`)
    }
  }, [status, businessId, navigate])

  return (
    <div className={styles.container}>
      {status === 'pending' && (
        <>
          <span className={styles.icon}>⏳</span>
          <h2>Request Pending</h2>
          <p>Your connection request is awaiting approval. You'll be redirected shortly.</p>
        </>
      )}
      {status === 'denied' && (
        <>
          <span className={styles.icon}>❌</span>
          <h2>Request Denied</h2>
          {conn?.denialReason && <p className={styles.reason}>Reason: {conn.denialReason}</p>}
          <button onClick={() => navigate('/dashboard/patron')}>Back to Dashboard</button>
        </>
      )}
      {status === 'blocked' && (
        <>
          <span className={styles.icon}>🚫</span>
          <h2>Connection Not Available</h2>
          <p>This business is not available for connection.</p>
          <button onClick={() => navigate('/dashboard/patron')}>Back to Dashboard</button>
        </>
      )}
    </div>
  )
}
