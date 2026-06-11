import { useState, useEffect } from 'react'
import * as connectionService from '../../../services/connectionService'
import * as businessService from '../../../services/businessService'
import styles from './BusinessPatronRequests.module.css'

const FILTERS = ['All', 'Requests', 'Approved', 'Rejected']

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60); if (m < 60) return `${m}m`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`
  const d = Math.floor(h / 24); if (d < 7) return `${d}d`
  return `${Math.floor(d / 7)}w`
}

function statusText(status) {
  if (status === 'pending')  return 'is requesting to be a patron.'
  if (status === 'approved') return 'Approved as a patron.'
  if (status === 'denied')   return 'Rejected as a patron.'
  if (status === 'blocked')  return 'Blocked.'
  return ''
}

function showStatusText(filter, status) {
  if (status === 'pending') return true
  if (status === 'approved') return filter === 'Approved'
  return filter === 'Rejected'
}

export default function BusinessPatronRequests() {
  const [connections, setConnections] = useState([])
  const [filter, setFilter]           = useState('All')
  const [isPublic, setIsPublic]       = useState(true)

  async function load() {
    console.log('BusinessPatronRequests — loading connections and business data')
    const [connData, bizData] = await Promise.all([
      connectionService.getPendingConnections(),
      businessService.getMyBusiness(),
    ])
    console.log('BusinessPatronRequests — connections:', connData)
    console.log('BusinessPatronRequests — business:', bizData)
    if (Array.isArray(connData)) setConnections(connData)
    if (bizData && !bizData.err) setIsPublic(bizData.visibility === 'public')
  }

  useEffect(() => { load() }, [])

  async function handleStatus(id, status) {
    console.log('BusinessPatronRequests — updating connection', id, 'to', status)
    await connectionService.updateConnectionStatus(id, status, '')
    load()
  }

  async function handleRemove(id) {
    if (!window.confirm('Remove this patron from your store?')) return
    await connectionService.updateConnectionStatus(id, 'denied', '')
    load()
  }

  async function handleDelete(id) {
    if (!window.confirm('Permanently delete this patron from your list? This cannot be undone.')) return
    await connectionService.deleteConnection(id)
    load()
  }

  async function toggleVisibility() {
    const next = isPublic ? 'private' : 'public'
    setIsPublic(!isPublic)
    await businessService.updateVisibility(next)
  }

  const filtered = connections.filter(c => {
    if (filter === 'Requests') return c.status === 'pending'
    if (filter === 'Approved') return c.status === 'approved'
    if (filter === 'Rejected') return c.status === 'denied' || c.status === 'blocked'
    return c.status !== 'denied' && c.status !== 'blocked'
  })

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Patrons</h2>

      <div className={styles.tabs}>
        {FILTERS.map(f => (
          <button
            key={f}
            className={`${styles.tab} ${filter === f ? styles.activeTab : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className={styles.visibilityRow}>
        <span className={styles.visibilityLabel}>Make profile public?</span>
        <div className={styles.toggleGroup}>
          <span className={isPublic ? styles.toggleLabelActive : styles.toggleLabelMuted}>Yes</span>
          <button
            className={`${styles.toggle} ${isPublic ? styles.toggleOn : styles.toggleOff}`}
            onClick={toggleVisibility}
            aria-label="Toggle visibility"
          >
            <span className={styles.toggleKnob} />
          </button>
          <span className={!isPublic ? styles.toggleLabelActive : styles.toggleLabelMuted}>No</span>
        </div>
      </div>

      <div className={styles.feed}>
        {filtered.length === 0 && (
          <p className={styles.empty}>Nothing here yet.</p>
        )}
        {filtered.map(c => (
          <div key={c._id} className={styles.item}>
            <div className={styles.avatarWrap}>
              {c.patron?.photo
                ? <img src={c.patron.photo} alt="" className={styles.avatar} />
                : <div className={styles.avatarFallback}>{(c.patron?.name || '?')[0].toUpperCase()}</div>
              }
              {c.status === 'pending' && <span className={styles.dot} />}
            </div>

            <div className={styles.body}>
              <p className={styles.text}>
                <strong>{c.patron?.name || 'Unknown'}</strong>{' '}
                <span className={c.status === 'pending' ? '' : styles.resolvedText}>
                  {showStatusText(filter, c.status) ? statusText(c.status) : ''}
                </span>
              </p>
              <span className={styles.time}>{timeAgo(c.createdAt)}</span>
            </div>

            <div className={styles.right}>
              {c.status === 'pending' ? (
                <div className={styles.actions}>
                  <button className={styles.acceptBtn} onClick={() => handleStatus(c._id, 'approved')}>✓</button>
                  <button className={styles.rejectBtn} onClick={() => handleStatus(c._id, 'denied')}>✕</button>
                </div>
              ) : c.status === 'approved' ? (
                <button className={styles.removeBtn} onClick={() => handleRemove(c._id)}>Remove</button>
              ) : filter === 'Rejected' ? (
                <div className={styles.actions}>
                  <button className={styles.acceptBtn} onClick={() => handleStatus(c._id, 'approved')}>✓</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(c._id)}>Delete</button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}