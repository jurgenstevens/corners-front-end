import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import * as connectionService from '../../services/connectionService'
import * as productService from '../../services/productService'
import BugReportModal from '../../components/BugReportModal/BugReportModal'
import MessageInbox from '../../components/MessageInbox/MessageInbox'
import styles from './PatronDashboard.module.css'

const FILTERS = [
  { value: 'all',       label: 'All'       },
  { value: 'connected', label: 'Connected' },
  { value: 'new',       label: 'Discover'  },
]
const SORTS = [
  { value: 'name',   label: 'Name'   },
  { value: 'rating', label: 'Rating' },
  { value: 'nearby', label: 'Nearby' },
]

export default function PatronDashboard({ user }) {
  const [nearby, setNearby]               = useState([])
  const [connected, setConnected]         = useState([])
  const [loading, setLoading]             = useState(true)
  const [requested, setRequested]         = useState({})
  const [zipSearch, setZipSearch]         = useState('')
  const [filter, setFilter]               = useState('all')
  const [sortBy, setSortBy]               = useState('name')
  const [showBugReport, setShowBugReport] = useState(false)
  const navigate    = useNavigate()
  const debounceRef = useRef(null)
  const [itemQuery, setItemQuery]         = useState('')
  const [itemResults, setItemResults]     = useState([])
  const [itemSearching, setItemSearching] = useState(false)
  const [itemSearched, setItemSearched]   = useState(false)

  function fetchNearby(zip) {
    setLoading(true)
    connectionService.getNearbyBusinesses(zip || undefined)
      .then(nb => { if (Array.isArray(nb)) setNearby(nb) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    Promise.all([
      connectionService.getNearbyBusinesses(),
      connectionService.getMyStores(),
    ]).then(([nb, cn]) => {
      if (Array.isArray(nb)) setNearby(nb)
      if (Array.isArray(cn)) setConnected(cn)
    }).finally(() => setLoading(false))
  }, [])

  function handleZipChange(e) {
    const val = e.target.value
    setZipSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchNearby(val), 500)
  }

  async function handleFollow(id) {
    const conn = await connectionService.requestConnection(id)
    if (conn?.status === 'approved') {
      setRequested(p => ({ ...p, [id]: 'accepted' }))
      setTimeout(() => {
        const biz = nearby.find(b => b._id === id)
        if (biz) setConnected(prev => [...prev, biz])
        setRequested(p => { const n = { ...p }; delete n[id]; return n })
      }, 1500)
    } else {
      navigate(`/dashboard/patron/stores/pending/${id}`)
    }
  }

  async function handleItemSearch() {
    if (!itemQuery.trim()) return
    setItemSearching(true)
    setItemSearched(true)
    setItemResults([])
    try {
      const perStore = await Promise.all(
        connected.map(biz =>
          productService.getProductsByBusiness(biz._id)
            .then(products => {
              if (!Array.isArray(products)) return []
              const q = itemQuery.toLowerCase()
              return products
                .filter(p => p.status === 'stocked' || p.status === 'on_sale')
                .filter(p =>
                  (p.name || '').toLowerCase().includes(q) ||
                  (p.brand || '').toLowerCase().includes(q)
                )
                .map(p => ({ ...p, _storeName: biz.displayName || biz.profile?.name || 'Unknown' }))
            })
            .catch(() => [])
        )
      )
      setItemResults(perStore.flat())
    } finally {
      setItemSearching(false)
    }
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
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
      if (sortBy === 'nearby') return (a.distance ?? Infinity) - (b.distance ?? Infinity)
      const nameA = (a.displayName || a.profile?.name || '').toLowerCase()
      const nameB = (b.displayName || b.profile?.name || '').toLowerCase()
      return nameA.localeCompare(nameB)
    })

  return (
    <div className={styles.page}>

      <h4 className={styles.heading}>Search for stores nearby</h4>

      {/* Search */}
      <div className={styles.searchBar}>
        <span className={styles.searchIcon}>⌕</span>
        <input
          className={styles.searchInput}
          placeholder="Search by zip code…"
          value={zipSearch}
          onChange={handleZipChange}
        />
        {zipSearch && (
          <button className={styles.clearBtn} onClick={() => { setZipSearch(''); fetchNearby('') }}>✕</button>
        )}
      </div>

      {/* Filter + sort pills */}
      <div className={styles.pillRow}>
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            className={`${styles.pill} ${filter === value ? styles.pillActive : ''}`}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
        <span className={styles.pillDivider} />
        {SORTS.map(({ value, label }) => (
          <button
            key={value}
            className={`${styles.pill} ${sortBy === value ? styles.pillActive : ''}`}
            onClick={() => setSortBy(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {!loading && (
        <p className={styles.resultCount}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Skeletons */}
      {loading && (
        <div className={styles.skeletons}>
          {[1, 2, 3].map(n => <div key={n} className={styles.skeleton} />)}
        </div>
      )}

      {/* Store list */}
      <div className={styles.list}>
        {filtered.map(b => {
          const name  = b.displayName || b.profile?.name || 'Unknown'
          const photo = b.photos?.[0]

          return (
            <div key={b._id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.cardInfo}>
                  <h3 className={styles.bizName}>{name}</h3>
                  <div className={styles.meta}>
                    {b.rating > 0 && (
                      <span className={styles.rating}>☆ {b.rating.toFixed(1)} ({b.reviewCount || 0} reviews)</span>
                    )}
                    {b.address && <span className={styles.dist}>📍 {b.address}</span>}
                  </div>
                  {b.priceTier && <span className={styles.price}>{b.priceTier}</span>}
                </div>

                <div className={styles.cardAction}>
                  {b._connected ? (
                    <button className={styles.viewBtn} onClick={() => navigate(`/dashboard/patron/stores/${b._id}`)}>
                      View Store
                    </button>
                  ) : requested[b._id] === 'accepted' ? (
                    <span className={styles.acceptedLabel}>Accepted</span>
                  ) : requested[b._id] === 'pending' ? (
                    <span className={styles.pendingLabel}>Pending…</span>
                  ) : (
                    <button className={styles.followBtn} onClick={() => handleFollow(b._id)}>
                      Follow Store
                    </button>
                  )}
                </div>
              </div>

              {photo && <img src={photo} alt={name} className={styles.cardPhoto} />}
            </div>
          )
        })}
      </div>

      {!loading && filtered.length === 0 && (
        <div className={styles.empty}>
          <p>No businesses found. Try adjusting your search or filter.</p>
        </div>
      )}

      {/* Item Search */}
      <div className={styles.itemSearchSection}>
        <h4 className={styles.sectionHeading}>Item Search</h4>
        <p className={styles.sectionSub}>Search products available across your connected stores.</p>
        <div className={styles.itemSearchBar}>
          <input
            className={styles.itemSearchInput}
            placeholder="Search for an item…"
            value={itemQuery}
            onChange={e => setItemQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleItemSearch() }}
          />
          <button
            className={styles.itemSearchBtn}
            onClick={handleItemSearch}
            disabled={itemSearching}
          >
            {itemSearching ? '…' : 'Search'}
          </button>
        </div>
        {itemSearching && (
          <div className={styles.skeletons}>
            {[1, 2, 3].map(n => <div key={n} className={styles.skeleton} />)}
          </div>
        )}
        {!itemSearching && itemSearched && itemResults.length === 0 && (
          <p className={styles.empty}>No matching products found in your connected stores.</p>
        )}
        {!itemSearching && itemResults.length > 0 && (
          <div className={styles.itemResultList}>
            {itemResults.map((p, i) => (
              <div key={`${p._id}-${i}`} className={styles.itemResultRow}>
                <div className={styles.itemResultInfo}>
                  <span className={styles.itemResultName}>{p.name}</span>
                  {p.brand && <span className={styles.itemResultBrand}>{p.brand}</span>}
                  <span className={styles.itemResultStore}>{p._storeName}</span>
                </div>
                <span className={`${styles.itemStatusBadge} ${p.status === 'on_sale' ? styles.badgeSale : styles.badgeStocked}`}>
                  {p.status === 'on_sale' ? 'On Sale' : 'In Store'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <button className={styles.bugLink} onClick={() => setShowBugReport(true)}>
          Found a bug? Report it →
        </button>
      </footer>

      <BugReportModal isOpen={showBugReport} onClose={() => setShowBugReport(false)} user={user} />
      <MessageInbox user={user} />
    </div>
  )
}
