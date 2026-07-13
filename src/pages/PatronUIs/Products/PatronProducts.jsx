import { useState, useEffect, useRef } from 'react'
import * as productService from '../../../services/productService'
import * as connectionService from '../../../services/connectionService'
import ImageUpload from '../../../components/ImageUpload/ImageUpload'
import styles from './PatronProducts.module.css'

const EMPTY_FORM = { businessId: '', name: '', brand: '', description: '', image: '' }
const EMPTY_UPDATE_FORM = { name: '', brand: '', description: '', image: '' }

function timeAgo(date) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const d = Math.floor(diff / 86400000)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor(diff / 60000)
  if (d > 0) return `${d}d`
  if (h > 0) return `${h}h`
  if (m > 0) return `${m}m`
  return 'now'
}

export default function PatronProducts({ user }) {
  const [products, setProducts]         = useState([])
  const [stores, setStores]             = useState([])
  const [activeTab, setActiveTab]       = useState('all')
  const [myVotes, setMyVotes]           = useState({})
  const [loading, setLoading]           = useState(true)
  const [showModal, setShowModal]       = useState(false)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [submitting, setSubmitting]     = useState(false)
  const [reqError, setReqError]         = useState('')
  const [updateProduct, setUpdateProduct] = useState(null)
  const [updateForm, setUpdateForm]     = useState(EMPTY_UPDATE_FORM)
  const [updateError, setUpdateError]   = useState('')
  const [updating, setUpdating]         = useState(false)
  const [seenIds, setSeenIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('corners_seen_products') || '[]')) }
    catch { return new Set() }
  })
  const [canScrollLeft, setCanScrollLeft]   = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const tabsScrollRef = useRef(null)

  async function load() {
    const [prods, strs] = await Promise.all([
      productService.getPatronProducts(),
      connectionService.getMyStores(),
    ])
    if (Array.isArray(prods)) {
      setProducts(prods)
      if (user?.profileId) {
        const votes = {}
        prods.forEach(p => {
          if (p.votedBy?.some(v => v.toString() === user.profileId.toString())) votes[p._id] = true
        })
        setMyVotes(votes)
      }
    }
    if (Array.isArray(strs)) setStores(strs)
  }

  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [stores])

  function checkScroll() {
    const el = tabsScrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  function scrollTabs(dir) {
    tabsScrollRef.current?.scrollBy({ left: dir * 150, behavior: 'smooth' })
    setTimeout(checkScroll, 200)
  }

  async function handleVote(id) {
    const updated = await productService.voteForProduct(id)
    if (!updated.err) {
      setMyVotes(prev => ({ ...prev, [id]: true }))
      setProducts(prev => prev.map(p => p._id === id ? updated : p))
    }
  }

  function openModal() {
    setForm({ ...EMPTY_FORM, businessId: stores[0]?._id || '' })
    setReqError('')
    setShowModal(true)
  }
  function closeModal() { setShowModal(false); setReqError('') }
  function handleChange(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.businessId) return setReqError('Please select a store.')
    if (!form.name.trim()) return setReqError('Product name is required.')
    setSubmitting(true)
    setReqError('')
    const { businessId, ...rest } = form
    const result = await productService.requestProduct(businessId, rest)
    setSubmitting(false)
    if (result.err) { setReqError(result.err) } else { setShowModal(false); load() }
  }

  function markSeen(id) {
    setSeenIds(prev => {
      const next = new Set(prev)
      next.add(id)
      localStorage.setItem('corners_seen_products', JSON.stringify([...next]))
      return next
    })
  }

  function openUpdateModal(p) {
    setUpdateProduct(p)
    setUpdateForm({ name: p.name, brand: p.brand || '', description: p.description || '', image: p.image || '' })
    setUpdateError('')
  }
  function closeUpdateModal() { setUpdateProduct(null); setUpdateError('') }
  function handleUpdateChange(e) { setUpdateForm(prev => ({ ...prev, [e.target.name]: e.target.value })) }

  async function handleUpdateSubmit(e) {
    e.preventDefault()
    if (!updateForm.name.trim()) return setUpdateError('Product name is required.')
    setUpdating(true)
    setUpdateError('')
    const result = await productService.patronUpdateProduct(updateProduct._id, updateForm)
    setUpdating(false)
    if (result.err) { setUpdateError(result.err) } else { closeUpdateModal(); load() }
  }

  // Map Profile._id → store display name (products.business is populated Profile)
  const storeNameMap = {}
  stores.forEach(s => {
    const pid = (s.profile?._id || s.profile)?.toString()
    if (pid) storeNameMap[pid] = s.displayName || s.profile?.name || ''
  })
  function getStoreName(p) {
    const bizId = (p.business?._id || p.business)?.toString()
    return storeNameMap[bizId] || p.business?.name || ''
  }

  function getSubtitle(p) {
    const store = getStoreName(p)
    const at = store ? ` @ ${store}` : ''
    if (p.status === 'needs_info')      return `Update Requested${at}`
    if (p.status === 'pending')         return `Pending Request${at}`
    if (p.status === 'approved')        return `Request Approved${at}`
    if (p.status === 'rejected')        return `Request Rejected${at}`
    if (p.status === 'ready_to_stock')  return `${p.currentTally} Total Votes${at}`
    if (p.status === 'stocked')         return `Now In Stock${at}`
    return `${p.currentTally} Total Votes${at}`
  }

  const storeTabs = stores.map(s => ({
    id: (s.profile?._id || s.profile)?.toString(),
    label: s.displayName || s.profile?.name || 'Store',
  }))

  const needsUpdateCount = products.filter(p => p.status === 'needs_info').length

  const filtered = products.filter(p => {
    if (activeTab === 'votes')          return (p.status === 'approved' || p.status === 'ready_to_stock') && !myVotes[p._id]
    if (activeTab === 'requires_update') return p.status === 'needs_info'
    if (activeTab === 'all')            return true
    const bizId = (p.business?._id || p.business)?.toString()
    return bizId === activeTab
  })

  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <h2>Products</h2>
        {stores.length > 0 && (
          <button className={styles.requestBtn} onClick={openModal}>+ Request</button>
        )}
      </div>

      {/* Store tabs — horizontal scroll with carousel arrows */}
      <div className={styles.tabsWrap}>
        {canScrollLeft && (
          <button className={styles.tabArrow} onClick={() => scrollTabs(-1)}>‹</button>
        )}
        <div className={styles.tabsScroll} ref={tabsScrollRef} onScroll={checkScroll}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('all')}
            >All Stores</button>
            {storeTabs.map(t => (
              <button
                key={t.id}
                className={`${styles.tab} ${activeTab === t.id ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(t.id)}
              >{t.label}</button>
            ))}
            <button
              className={`${styles.tab} ${activeTab === 'votes' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('votes')}
            >Votes</button>
            <button
              className={`${styles.tab} ${styles.updateTab} ${activeTab === 'requires_update' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('requires_update')}
            >
              Requires Update{needsUpdateCount > 0 && <span className={styles.updateBadge}>{needsUpdateCount}</span>}
            </button>
          </div>
        </div>
        {canScrollRight && (
          <button className={styles.tabArrow} onClick={() => scrollTabs(1)}>›</button>
        )}
      </div>

      {/* Skeletons */}
      {loading && (
        <div className={styles.skeletons}>
          {[1,2,3,4].map(n => <div key={n} className={styles.skItem} />)}
        </div>
      )}

      {/* Activity feed */}
      <div className={styles.feed}>
        {!loading && filtered.length === 0 && (
          <p className={styles.empty}>Nothing here yet.</p>
        )}
        {filtered.map(p => {
          const votable = (p.status === 'approved' || p.status === 'ready_to_stock')
            && !myVotes[p._id]
            && p.requestedBy?.toString() !== user?.profileId?.toString()

          const unseen = !seenIds.has(p._id)

          return (
            <div key={p._id} className={styles.feedItem} onClick={() => markSeen(p._id)}>
              {unseen && <span className={`${styles.dot} ${styles[p.status] || ''}`} />}

              <div className={styles.avatar}>
                {p.image
                  ? <img src={p.image} alt={p.name} />
                  : <span>{p.name?.[0]?.toUpperCase() || '?'}</span>
                }
              </div>

              <div className={styles.content}>
                <div className={styles.titleRow}>
                  <span className={styles.productName}>{p.name}</span>
                  <span className={styles.ago}>{timeAgo(p.createdAt)}</span>
                </div>
                <p className={styles.subtitle}>{getSubtitle(p)}</p>
                {p.brand && <p className={styles.brand}>{p.brand}</p>}
                {p.tallyGoal > 0 && (p.status === 'approved' || p.status === 'ready_to_stock') && (
                  <div className={styles.tally}>
                    <div className={styles.tallyBar}>
                      <div
                        className={styles.tallyFill}
                        style={{ width: `${Math.min(100, (p.currentTally / p.tallyGoal) * 100)}%` }}
                      />
                    </div>
                    <span className={styles.tallyNums}>{p.currentTally} / {p.tallyGoal}</span>
                  </div>
                )}
              </div>

              <div className={styles.action}>
                {p.status === 'needs_info' && (
                  <button className={styles.updateBtn} onClick={() => openUpdateModal(p)}>Update</button>
                )}
                {votable && (
                  <button className={styles.voteBtn} onClick={() => handleVote(p._id)}>+1</button>
                )}
                {myVotes[p._id] && unseen && p.status !== 'needs_info' && <span className={styles.voted}>✓</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Request modal ── */}
      {showModal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Request a Product</h3>
              <button className={styles.closeBtn} onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <label>Store *
                <select name="businessId" value={form.businessId} onChange={handleChange} required>
                  <option value="">Select a store…</option>
                  {stores.map(s => (
                    <option key={s._id} value={s._id}>{s.displayName || s.profile?.name}</option>
                  ))}
                </select>
              </label>
              <label>Product Name *
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Takis Fuego" required />
              </label>
              <label>Brand
                <input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Barcel" />
              </label>
              <label>Description
                <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Short description (optional)" />
              </label>
              <ImageUpload value={form.image} onChange={(url) => setForm(f => ({ ...f, image: url }))} label="Product photo (optional)" />
              {reqError && <p className={styles.error}>{reqError}</p>}
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Update modal ── */}
      {updateProduct && (
        <div className={styles.overlay} onClick={closeUpdateModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Update Request</h3>
              <button className={styles.closeBtn} onClick={closeUpdateModal}>✕</button>
            </div>
            <p className={styles.updateNote}>The store has requested more information. Please update your product request below.</p>
            <form onSubmit={handleUpdateSubmit} className={styles.modalForm}>
              <label>Product Name *
                <input name="name" value={updateForm.name} onChange={handleUpdateChange} required />
              </label>
              <label>Brand
                <input name="brand" value={updateForm.brand} onChange={handleUpdateChange} placeholder="e.g. Barcel" />
              </label>
              <label>Description
                <textarea name="description" value={updateForm.description} onChange={handleUpdateChange} rows={3} placeholder="Add more details about this product…" />
              </label>
              <ImageUpload value={updateForm.image} onChange={(url) => setUpdateForm(f => ({ ...f, image: url }))} label="Product photo (optional)" />
              {updateError && <p className={styles.error}>{updateError}</p>}
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeUpdateModal}>Cancel</button>
                <button type="submit" className={styles.submitBtn} disabled={updating}>
                  {updating ? 'Submitting…' : 'Resubmit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
