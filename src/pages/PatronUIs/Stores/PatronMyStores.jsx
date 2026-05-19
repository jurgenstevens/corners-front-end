import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as connectionService from '../../../services/connectionService'
import BackButton from '../../../components/BackButton/BackButton'
import styles from './PatronMyStores.module.css'

export default function PatronMyStores() {
  const [nearby, setNearby]         = useState([])
  const [connected, setConnected]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [requested, setRequested]   = useState({})
  const [zipSearch, setZipSearch]   = useState('')
  const [filter, setFilter]         = useState('all')
  const [sortBy, setSortBy]         = useState('name')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      connectionService.getNearbyBusinesses(),
      connectionService.getMyStores(),
    ]).then(([nb, cn]) => {
      if (Array.isArray(nb)) setNearby(nb)
      if (Array.isArray(cn)) setConnected(cn)
    }).finally(() => setLoading(false))
  }, [])

  async function handlePatronize(id) {
    await connectionService.requestConnection(id)
    setRequested(p => ({ ...p, [id]: true }))
  }

  const connectedIds = new Set(connected.map(s => s._id))

  const all = [
    ...connected.map(b => ({ ...b, _connected: true })),
    ...nearby.filter(b => !connectedIds.has(b._id)).map(b => ({ ...b, _connected: false })),
  ]

  const filtered = all
    .filter(b => {
      if (filter === 'connected') return b._connected
      if (filter === 'new') return !b._connected
      return true
    })
    .filter(b => {
      if (!zipSearch.trim()) return true
      const zip = b.location?.zip || b.address || ''
      return zip.includes(zipSearch.trim())
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
      const nameA = (a.displayName || a.profile?.name || '').toLowerCase()
      const nameB = (b.displayName || b.profile?.name || '').toLowerCase()
      return nameA.localeCompare(nameB)
    })

  return (
    <div className={styles.page}>
      <BackButton />

      {/* Search */}
      <div className={styles.searchBar}>
        <span className={styles.searchIcon}>⌕</span>
        <input
          className={styles.searchInput}
          placeholder="Search by zip code…"
          value={zipSearch}
          onChange={e => setZipSearch(e.target.value)}
        />
        {zipSearch && (
          <button className={styles.clearBtn} onClick={() => setZipSearch('')}>✕</button>
        )}
      </div>

      {/* Controls row */}
      <div className={styles.controls}>
        <div className={styles.controlBtns}>
          <select className={styles.controlBtn} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">Filter</option>
            <option value="connected">Connected</option>
            <option value="new">Discover</option>
          </select>
          <select className={styles.controlBtn} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="name">Sort: Name</option>
            <option value="rating">Sort: Rating</option>
          </select>
        </div>
        {!loading && (
          <span className={styles.resultCount}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Map placeholder */}
      <div className={styles.mapBox}>
        <div className={styles.mapGrid} />
        {filtered.slice(0, 5).map((b, i) => (
          <div key={b._id} className={`${styles.mapPin} ${styles[`p${i}`]}`}>
            {b.displayName || b.profile?.name || '?'}
          </div>
        ))}
        {filtered.length === 0 && !loading && (
          <span className={styles.mapEmpty}>No results in this area</span>
        )}
      </div>

      {/* Skeletons */}
      {loading && (
        <div className={styles.skeletons}>
          {[1, 2, 3].map(n => <div key={n} className={styles.skeleton} />)}
        </div>
      )}

      {/* Business list */}
      <div className={styles.list}>
        {filtered.map(b => {
          const name = b.displayName || b.profile?.name || 'Unknown'
          const photo = b.photos?.[0]

          return (
            <div key={b._id} className={styles.card}>
              {/* Card header */}
              <div className={styles.cardTop}>
                <div className={styles.cardInfo}>
                  <h3 className={styles.bizName}>{name}</h3>
                  <div className={styles.meta}>
                    {b.rating > 0 && (
                      <span className={styles.rating}>
                        ☆ {b.rating.toFixed(1)} ({b.reviewCount || 0} reviews)
                      </span>
                    )}
                    {b.address && (
                      <span className={styles.dist}>📍 {b.address}</span>
                    )}
                  </div>
                  {b.priceTier && <span className={styles.price}>{b.priceTier}</span>}
                </div>

                <div className={styles.cardAction}>
                  {b._connected ? (
                    <button
                      className={styles.viewBtn}
                      onClick={() => navigate(`/patron/stores/${b._id}`)}
                    >
                      View Store
                    </button>
                  ) : requested[b._id] ? (
                    <span className={styles.pendingLabel}>Pending…</span>
                  ) : (
                    <button
                      className={styles.patronizeBtn}
                      onClick={() => handlePatronize(b._id)}
                    >
                      Patronize
                    </button>
                  )}
                </div>
              </div>

              {/* Photo */}
              {photo ? (
                <img src={photo} alt={name} className={styles.cardPhoto} />
              ) : (
                <div className={styles.cardPhotoPlaceholder}>
                  <span>{name[0].toUpperCase()}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!loading && filtered.length === 0 && (
        <div className={styles.empty}>
          <p>No businesses found. Try adjusting your search or filter.</p>
        </div>
      )}
    </div>
  )
}
