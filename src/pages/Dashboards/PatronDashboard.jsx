import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as connectionService from '../../services/connectionService'
import styles from './PatronDashboard.module.css'

const QUICK_LINKS = [
  { to: '/patron/stores',   emoji: '🏪', label: 'My Stores',  sub: 'Your connected businesses' },
  { to: '/patron/products', emoji: '🛍️', label: 'Products',   sub: 'Browse & vote on items'    },
  { to: '/patron/requests', emoji: '📋', label: 'My Requests', sub: 'Track what you've asked for' },
]

export default function PatronDashboard({ user }) {
  const [nearby, setNearby]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [requested, setRequested] = useState({})

  useEffect(() => {
    connectionService.getNearbyBusinesses()
      .then(d => { if (Array.isArray(d)) setNearby(d) })
      .finally(() => setLoading(false))
  }, [])

  async function handleRegister(id) {
    await connectionService.requestConnection(id)
    setRequested(p => ({ ...p, [id]: true }))
    setNearby(p => p.filter(b => b._id !== id))
  }

  async function handleDismiss(id) {
    await connectionService.dismissBusiness(id)
    setNearby(p => p.filter(b => b._id !== id))
  }

  return (
    <div className={styles.page}>

      {/* ── Greeting ── */}
      <header className={styles.greeting}>
        <h1>Hey, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's what's happening around you.</p>
      </header>

      {/* ── Quick-link cards ── */}
      <section className={styles.cardGrid}>
        {QUICK_LINKS.map(({ to, emoji, label, sub }) => (
          <Link key={to} to={to} className={styles.card}>
            <span className={styles.cardEmoji}>{emoji}</span>
            <div>
              <h3 className={styles.cardLabel}>{label}</h3>
              <p className={styles.cardSub}>{sub}</p>
            </div>
            <span className={styles.cardArrow}>›</span>
          </Link>
        ))}
      </section>

      {/* ── Businesses near you ── */}
      <section className={styles.nearby}>
        <div className={styles.sectionHeader}>
          <h2>Businesses Near You</h2>
          {nearby.length > 0 && (
            <span className={styles.badge}>{nearby.length} new</span>
          )}
        </div>

        {loading && (
          <div className={styles.skeletonWrap}>
            {[1,2,3].map(n => <div key={n} className={styles.skeleton} />)}
          </div>
        )}

        {!loading && nearby.length === 0 && (
          <div className={styles.emptyState}>
            <span>📍</span>
            <p>No new businesses in your area right now. Check back soon.</p>
          </div>
        )}

        <div className={styles.bizList}>
          {nearby.map(b => (
            <div key={b._id} className={styles.bizCard}>
              <div className={styles.bizLeft}>
                <div className={styles.bizAvatar}>
                  {b.photos?.[0]
                    ? <img src={b.photos[0]} alt={b.displayName} />
                    : <span>{(b.displayName || b.profile?.name || '?')[0].toUpperCase()}</span>
                  }
                </div>
                <div className={styles.bizInfo}>
                  <h4>{b.displayName || b.profile?.name}</h4>
                  {b.businessType && <span className={styles.typeBadge}>{b.businessType}</span>}
                  {b.address && <p className={styles.bizAddress}>📍 {b.address}</p>}
                </div>
              </div>

              <div className={styles.bizActions}>
                {requested[b._id] ? (
                  <span className={styles.requestedLabel}>✓ Requested</span>
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
