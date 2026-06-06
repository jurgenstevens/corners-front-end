import { useState, useEffect } from 'react'
import * as connectionService from '../../../services/connectionService'
import styles from './BusinessPatronRequests.module.css'

export default function BusinessPatronRequests() {
  const [connections, setConnections] = useState([])
  const [denyInput, setDenyInput] = useState({})

  async function load() {
    const data = await connectionService.getPendingConnections()
    if (Array.isArray(data)) setConnections(data)
  }

  useEffect(() => { load() }, [])

  async function handleStatus(id, status) {
    await connectionService.updateConnectionStatus(id, status, denyInput[id] || '')
    load()
  }

  const pending = connections.filter(c => c.status === 'pending')
  const resolved = connections.filter(c => c.status !== 'pending')

  return (
    <div className={styles.container}>
      <h2>Patron Requests</h2>

      {pending.length === 0 && <p className={styles.empty}>No pending requests.</p>}

      <div className={styles.list}>
        {pending.map(c => (
          <div key={c._id} className={styles.card}>
            <div className={styles.patronInfo}>
              {c.patron?.photo && <img src={c.patron.photo} alt="" className={styles.avatar} />}
              <div>
                <h4>{c.patron?.name || 'Unknown'}</h4>
                <p>{c.patron?.email}</p>
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.approveBtn} onClick={() => handleStatus(c._id, 'approved')}>Accept</button>
              {denyInput[c._id] !== undefined ? (
                <div className={styles.denyInput}>
                  <input
                    placeholder="Reason (optional)"
                    value={denyInput[c._id]}
                    onChange={e => setDenyInput(prev => ({ ...prev, [c._id]: e.target.value }))}
                  />
                  <button className={styles.denyBtn} onClick={() => handleStatus(c._id, 'denied')}>Confirm Deny</button>
                  <button className={styles.cancelBtn} onClick={() => setDenyInput(prev => { const n = {...prev}; delete n[c._id]; return n })}>Cancel</button>
                </div>
              ) : (
                <button className={styles.denyBtn} onClick={() => setDenyInput(prev => ({ ...prev, [c._id]: '' }))}>Deny</button>
              )}
              <button className={styles.blockBtn} onClick={() => handleStatus(c._id, 'blocked')}>Block</button>
            </div>
          </div>
        ))}
      </div>

      {resolved.length > 0 && (
        <>
          <h3 className={styles.resolvedTitle}>Resolved</h3>
          <div className={styles.list}>
            {resolved.map(c => (
              <div key={c._id} className={`${styles.card} ${styles.resolved}`}>
                <div className={styles.patronInfo}>
                  <div>
                    <h4>{c.patron?.name || 'Unknown'}</h4>
                    <p>{c.patron?.email}</p>
                  </div>
                </div>
                <span className={styles[c.status]}>{c.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
