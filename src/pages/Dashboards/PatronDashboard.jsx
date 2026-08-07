import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import * as connectionService from '../../services/connectionService'
import * as patronService from '../../services/patronService'
import * as productService from '../../services/productService'
import BugReportModal from '../../components/BugReportModal/BugReportModal'
import MessageInbox from '../../components/MessageInbox/MessageInbox'
import styles from './PatronDashboard.module.css'

const FILTERS = [
  { value: 'all',       label: 'All'       },
  { value: 'connected', label: 'Connected' },
]
const SORTS = [
  { value: 'name',   label: 'Name'   },
  { value: 'rating', label: 'Rating' },
  { value: 'nearby', label: 'Nearby' },
]

export default function PatronDashboard({ user }) {
  const [tab, setTab] = useState('stores')

  // Patron's saved zip (loaded from profile)
  const [patronZip, setPatronZip] = useState(null)

  // Stores tab state
  const [nearby, setNearby]       = useState([])
  const [connected, setConnected] = useState([])
  const [loading, setLoading]     = useState(true)
  const [requested, setRequested] = useState({})
  const [zipSearch, setZipSearch] = useState('')
  const [filter, setFilter]       = useState('all')
  const [sortBy, setSortBy]       = useState('name')

  // Products tab state
  const [productQuery, setProductQuery]           = useState('')
  const [productResults, setProductResults]       = useState([])
  const [productLoading, setProductLoading]       = useState(false)
  const [hasProductSearched, setHasProductSearched] = useState(false)
  const [productVotes, setProductVotes]           = useState({})

  const [showBugReport, setShowBugReport] = useState(false)
  const navigate    = useNavigate()
  const debounceRef = useRef(null)

  function fetchNearby(zip) {
    setLoading(true)
    connectionService.getNearbyBusinesses(zip || undefined)
      .then(nb => { if (Array.isArray(nb)) setNearby(nb) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // Load patron's saved zip, then seed the store search with it
    patronService.getMyProfile().then(data => {
      const zip = data?.location?.zip || ''
      setPatronZip(zip)
      if (zip) {
        setZipSearch(zip)
        fetchNearby(zip)
      }
    }).catch(() => setPatronZip(''))

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

  async function handleProductSearch() {
    if (!productQuery.trim()) return
    setProductLoading(true)
    setHasProductSearched(true)
    setProductResults([])
    try {
      const nearbyStores = await connectionService.getNearbyBusinesses(patronZip || undefined)
      if (!Array.isArray(nearbyStores) || nearbyStores.length === 0) return
      const q = productQuery.toLowerCase()
      const perStore = await Promise.all(
        nearbyStores.map(store =>
          productService.getProductsByBusiness(store._id)
            .then(prods => {
              if (!Array.isArray(prods)) return []
              return prods
                .filter(p =>
                  (p.name  || '').toLowerCase().includes(q) ||
                  (p.brand || '').toLowerCase().includes(q)
                )
                .map(p => ({
                  ...p,
                  _storeName: store.displayName || store.profile?.name || 'Unknown',
                  _storeId:   store._id,
                }))
            })
            .catch(() => [])
        )
      )
      const results = perStore.flat()
      if (user?.profileId) {
        const votes = {}
        results.forEach(p => {
          if (p.votedBy?.some(v => v.toString() === user.profileId.toString())) votes[p._id] = true
        })
        setProductVotes(votes)
      }
      setProductResults(results)
    } finally {
      setProductLoading(false)
    }
  }

  async function handleProductVote(id) {
    const updated = await productService.voteForProduct(id)
    if (!updated.err) {
      setProductVotes(prev => ({ ...prev, [id]: true }))
      setProductResults(prev =>
        prev.map(p => p._id === id ? { ...p, ...updated, _storeName: p._storeName, _storeId: p._storeId } : p)
      )
    }
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

  const connectedIds = new Set(connected.map(s => s._id))

  const allStores = [
    ...connected.map(b => ({ ...b, _connected: true })),
    ...nearby.filter(b => !connectedIds.has(b._id)).map(b => ({ ...b, _connected: false })),
  ]

  const filteredStores = allStores
    .filter(b => {
      if (filter === 'connected') return b._connected
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
      if (sortBy === 'nearby') return (a.distance ?? Infinity) - (b.distance ?? Infinity)
      const nameA = (a.displayName || a.profile?.name || '').toLowerCase()
      const nameB = (b.displayName || b.profile?.name || '').toLowerCase()
      return nameA.localeCompare(nameB)
    })

  const noZip = patronZip !== null && !patronZip && !zipSearch

  return (
    <div className={styles.page}>

      {/* ── Segmented control ── */}
      <div className={styles.segControl}>
        <button
          className={`${styles.segBtn} ${tab === 'stores' ? styles.segBtnActive : ''}`}
          onClick={() => setTab('stores')}
        >
          Stores
        </button>
        <button
          className={`${styles.segBtn} ${tab === 'products' ? styles.segBtnActive : ''}`}
          onClick={() => setTab('products')}
        >
          Products
        </button>
      </div>

      {/* ── STORES TAB ── */}
      {tab === 'stores' && (
        <>
          {noZip && (
            <p className={styles.zipPrompt}>
              <Link to="/dashboard/patron/settings" className={styles.zipPromptLink}>
                Set your zip to see stores near you →
              </Link>
            </p>
          )}

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
              {filteredStores.length} result{filteredStores.length !== 1 ? 's' : ''}
            </p>
          )}

          {loading && (
            <div className={styles.skeletons}>
              {[1, 2, 3].map(n => <div key={n} className={styles.skeleton} />)}
            </div>
          )}

          <div className={styles.list}>
            {filteredStores.map(b => {
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

          {!loading && filteredStores.length === 0 && (
            <div className={styles.empty}>
              <p>No businesses found. Try adjusting your search or filter.</p>
            </div>
          )}
        </>
      )}

      {/* ── PRODUCTS TAB ── */}
      {tab === 'products' && (
        <>
          {noZip && (
            <p className={styles.zipPrompt}>
              <Link to="/dashboard/patron/settings" className={styles.zipPromptLink}>
                Set your zip to see products near you →
              </Link>
            </p>
          )}

          <div className={styles.itemSearchBar}>
            <input
              className={styles.itemSearchInput}
              placeholder="Search products near you…"
              value={productQuery}
              onChange={e => {
                setProductQuery(e.target.value)
                if (!e.target.value) { setProductResults([]); setHasProductSearched(false) }
              }}
              onKeyDown={e => { if (e.key === 'Enter') handleProductSearch() }}
            />
            <button
              className={styles.itemSearchBtn}
              onClick={handleProductSearch}
              disabled={productLoading}
            >
              {productLoading ? 'Searching…' : 'Search'}
            </button>
          </div>

          {productLoading && (
            <div className={styles.skeletons}>
              {[1, 2, 3].map(n => <div key={n} className={styles.skeleton} />)}
            </div>
          )}

          {!productLoading && hasProductSearched && productResults.length === 0 && (
            <p className={styles.empty}>No matching products found near you.</p>
          )}

          {!productLoading && productResults.length > 0 && (
            <div className={styles.itemResultList}>
              {productResults.map((p, i) => {
                const isStocked = p.status === 'stocked' || p.status === 'on_sale'
                const isRequest = p.status === 'approved' || p.status === 'ready_to_stock'
                const alreadyVoted = !!productVotes[p._id]
                const canVote = isRequest && !alreadyVoted &&
                  p.requestedBy?.toString() !== user?.profileId?.toString()

                return (
                  <div key={`${p._id}-${i}`} className={styles.itemResultRow}>
                    <div className={styles.itemResultInfo}>
                      <span className={styles.itemResultName}>{p.name}</span>
                      {p.brand && <span className={styles.itemResultBrand}>{p.brand}</span>}
                      <span className={styles.itemResultStore}>
                        {isStocked ? `Stocked @ ${p._storeName}` : p._storeName}
                      </span>
                    </div>
                    <div className={styles.itemResultAction}>
                      {isStocked && (
                        <>
                          <span className={`${styles.itemStatusBadge} ${p.status === 'on_sale' ? styles.badgeSale : styles.badgeStocked}`}>
                            {p.status === 'on_sale' ? 'On Sale' : 'In Store'}
                          </span>
                          <button
                            className={styles.viewStoreBtn}
                            onClick={() => navigate(`/dashboard/patron/stores/${p._storeId}`)}
                          >
                            View
                          </button>
                        </>
                      )}
                      {isRequest && (
                        <div className={styles.requestTally}>
                          <span className={styles.tallyLabel}>{p.currentTally ?? 0}/{p.tallyGoal ?? 0}</span>
                          {canVote && (
                            <button className={styles.voteBtn} onClick={() => handleProductVote(p._id)}>+1</button>
                          )}
                          {alreadyVoted && <span className={styles.voted}>✓</span>}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

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
