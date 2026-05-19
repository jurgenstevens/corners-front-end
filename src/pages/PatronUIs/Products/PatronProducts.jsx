import { useState, useEffect } from 'react'
import * as productService from '../../../services/productService'
import * as connectionService from '../../../services/connectionService'
import BackButton from '../../../components/BackButton/BackButton'
import styles from './PatronProducts.module.css'

const TABS = ['All', 'My Requests', 'Approved']
const EMPTY_FORM = { businessId: '', name: '', brand: '', description: '', image: '', price: '', tallyGoal: 10 }

export default function PatronProducts({ user }) {
  const [products, setProducts]     = useState([])
  const [tab, setTab]               = useState('All')
  const [myVotes, setMyVotes]       = useState({})
  const [loading, setLoading]       = useState(true)
  const [stores, setStores]         = useState([])
  const [showModal, setShowModal]   = useState(false)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [reqError, setReqError]     = useState('')

  async function load() {
    const data = await productService.getPatronProducts()
    if (Array.isArray(data)) setProducts(data)
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
    connectionService.getMyStores().then(data => {
      if (Array.isArray(data)) setStores(data)
    })
  }, [])

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

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.businessId) return setReqError('Please select a store.')
    if (!form.name.trim()) return setReqError('Product name is required.')
    setSubmitting(true)
    setReqError('')
    const { businessId, ...rest } = form
    const result = await productService.requestProduct(businessId, {
      ...rest,
      price: rest.price ? Number(rest.price) : undefined,
      tallyGoal: Number(rest.tallyGoal) || 10,
    })
    setSubmitting(false)
    if (result.err) {
      setReqError(result.err)
    } else {
      setShowModal(false)
      load()
    }
  }

  const profileId = user?.profileId
  const filtered = products.filter(p => {
    if (tab === 'My Requests') return p.requestedBy === profileId || p.requestedBy?._id === profileId
    if (tab === 'Approved') return p.status === 'approved' || p.status === 'ready_to_stock'
    return true
  })

  return (
    <div className={styles.container}>
      <BackButton />

      <div className={styles.header}>
        <h2>Products</h2>
        {stores.length > 0 && (
          <button className={styles.requestBtn} onClick={openModal}>+ Request Product</button>
        )}
      </div>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.active : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {loading && <p>Loading…</p>}
      <div className={styles.list}>
        {!loading && filtered.length === 0 && <p className={styles.empty}>No products here.</p>}
        {filtered.map(p => (
          <div key={p._id} className={styles.card}>
            {p.image && <img src={p.image} alt={p.name} className={styles.thumb} />}
            <div className={styles.info}>
              <h4>{p.name}</h4>
              {p.brand && <span className={styles.brand}>{p.brand}</span>}
              {p.description && <p className={styles.desc}>{p.description}</p>}
            </div>
            <div className={styles.right}>
              <span className={`${styles.badge} ${styles[p.status]}`}>{p.status.replace(/_/g,' ')}</span>
              <div className={styles.tally}>
                <span>{p.currentTally}/{p.tallyGoal}</span>
                <div className={styles.bar}><div className={styles.fill} style={{ width:`${Math.min(100,(p.currentTally/p.tallyGoal)*100)}%` }} /></div>
              </div>
              {!myVotes[p._id] && (p.status === 'approved' || p.status === 'ready_to_stock') && (
                <button className={styles.voteBtn} onClick={() => handleVote(p._id)}>+1 Vote</button>
              )}
              {myVotes[p._id] && <span className={styles.voted}>✓ Voted</span>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Request product modal ── */}
      {showModal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Request a Product</h3>
              <button className={styles.closeBtn} onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <label>
                Store *
                <select name="businessId" value={form.businessId} onChange={handleChange} required>
                  <option value="">Select a store…</option>
                  {stores.map(s => (
                    <option key={s._id} value={s._id}>{s.displayName || s.profile?.name}</option>
                  ))}
                </select>
              </label>

              <label>
                Product Name *
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Takis Fuego" required />
              </label>

              <label>
                Brand
                <input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Barcel" />
              </label>

              <label>
                Description
                <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Short description (optional)" />
              </label>

              <label>
                Image URL
                <input name="image" value={form.image} onChange={handleChange} placeholder="https://i.imgur.com/…" />
                <span className={styles.hint}>Paste an Imgur or direct image link. The store owner can update this later.</span>
              </label>

              <div className={styles.row}>
                <label>
                  Price ($)
                  <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00" />
                </label>
                <label>
                  Tally Goal
                  <input name="tallyGoal" type="number" min="1" value={form.tallyGoal} onChange={handleChange} />
                </label>
              </div>

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
    </div>
  )
}
