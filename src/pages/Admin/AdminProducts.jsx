import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as adminService from '../../services/adminService'
import styles from './AdminProducts.module.css'

const PRODUCT_STATUSES = ['pending', 'approved', 'rejected', 'ready_to_stock', 'stocked', 'needs_info', 'on_sale']

const EMPTY_FORM = {
  name: '', brand: '', description: '', price: '', image: '',
  business: '', tallyGoal: '10', status: 'pending',
  salePrice: '', discountPercent: '', isActive: true, boosted: false,
}

export default function AdminProducts() {
  const [tab, setTab] = useState('all')
  const [allProducts, setAllProducts] = useState([])
  const [tallyHits, setTallyHits] = useState([])
  const [expiring, setExpiring] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [modalForm, setModalForm] = useState(EMPTY_FORM)
  const [businesses, setBusinesses] = useState([])
  const [modalSaving, setModalSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    setLoading(true)
    if (tab === 'all') {
      adminService.getAllProducts().then(data => { setAllProducts(Array.isArray(data) ? data : []); setLoading(false) })
    } else if (tab === 'tally') {
      adminService.getTallyHits().then(data => { setTallyHits(Array.isArray(data) ? data : []); setLoading(false) })
    } else {
      adminService.getExpiringRejected().then(data => { setExpiring(Array.isArray(data) ? data : []); setLoading(false) })
    }
  }, [tab])

  function openModal() {
    setModalForm(EMPTY_FORM)
    setModalError('')
    if (businesses.length === 0) {
      adminService.getAllBusinesses().then(data => setBusinesses(Array.isArray(data) ? data : []))
    }
    setShowModal(true)
  }

  function closeModal() { setShowModal(false); setModalError('') }

  function setField(key, val) { setModalForm(f => ({ ...f, [key]: val })) }

  async function handleCreate() {
    if (!modalForm.name.trim()) { setModalError('Name is required.'); return }
    if (!modalForm.business)    { setModalError('Business is required.'); return }
    setModalSaving(true)
    const data = await adminService.createProduct(modalForm)
    setModalSaving(false)
    if (data.err) { setModalError(data.err); return }
    setAllProducts(prev => [{ ...data, storeName: businesses.find(b => b.profile._id === data.business)?.displayName ?? null }, ...prev])
    closeModal()
  }

  return (
    <div>
      <div className={styles.listHeader}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'all' ? styles.tabActive : ''}`} onClick={() => setTab('all')}>All Products</button>
          <button className={`${styles.tab} ${tab === 'tally' ? styles.tabActive : ''}`} onClick={() => setTab('tally')}>Tally Hits</button>
          <button className={`${styles.tab} ${tab === 'expiring' ? styles.tabActive : ''}`} onClick={() => setTab('expiring')}>Expiring Rejected</button>
        </div>
        <button className={styles.btnAdd} onClick={openModal}>+ Add Product</button>
      </div>

      {loading && <p className={styles.loading}>Loading…</p>}

      {!loading && tab === 'all' && (
        allProducts.length === 0
          ? <p className={styles.empty}>No products found.</p>
          : allProducts.map(p => (
            <div key={p._id} className={styles.card}>
              <div className={styles.cardRow}>
                <div>
                  <p className={styles.productName}>{p.name}</p>
                  {p.brand && <p className={styles.meta}>{p.brand}</p>}
                  {p.storeName && <p className={styles.meta}>{p.storeName}</p>}
                </div>
                <div className={styles.cardRowRight}>
                  <span className={`${styles.statusBadge} ${p.status === 'stocked' ? styles.success : p.status === 'rejected' ? styles.danger : styles.warn}`}>
                    {p.status}
                  </span>
                  <Link to={`/dashboard/admin/products/${p._id}`} className={styles.btnGhost}>View →</Link>
                </div>
              </div>
              <p className={styles.dateMeta}>Added {new Date(p.createdAt).toLocaleDateString()}</p>
            </div>
          ))
      )}

      {!loading && tab === 'tally' && (
        tallyHits.length === 0
          ? <p className={styles.empty}>No products have hit tally yet.</p>
          : tallyHits.map(p => (
            <div key={p._id} className={styles.card}>
              <div className={styles.cardRow}>
                <div>
                  <p className={styles.productName}>{p.name}</p>
                  {p.brand && <p className={styles.meta}>{p.brand}</p>}
                  <p className={styles.meta}>{typeof p.business === 'object' ? (p.business.displayName ?? p.business.name) : '—'}</p>
                </div>
                <div className={styles.cardRowRight}>
                  <span className={`${styles.statusBadge} ${p.status === 'stocked' ? styles.success : styles.warn}`}>
                    {p.status}
                  </span>
                  <Link to={`/dashboard/admin/products/${p._id}`} className={styles.btnGhost}>View →</Link>
                </div>
              </div>
              <div className={styles.tallyRow}>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${Math.min(100, (p.currentTally / p.tallyGoal) * 100)}%` }} />
                </div>
                <span className={styles.tallyLabel}>{p.currentTally} / {p.tallyGoal} votes</span>
              </div>
              <p className={styles.dateMeta}>Updated {new Date(p.updatedAt).toLocaleDateString()}</p>
            </div>
          ))
      )}

      {!loading && tab === 'expiring' && (
        expiring.length === 0
          ? <p className={styles.empty}>No rejected products pending deletion.</p>
          : expiring.map(p => (
            <div key={p._id} className={styles.card}>
              <div className={styles.cardRow}>
                <div>
                  <p className={styles.productName}>{p.name}</p>
                  <p className={styles.meta}>{typeof p.business === 'object' ? (p.business.displayName ?? p.business.name) : '—'}</p>
                </div>
                <div className={styles.cardRowRight}>
                  <span className={`${styles.countdown} ${p.daysUntilDeletion <= 5 ? styles.countdownRed : ''}`}>
                    Deletes in {Math.ceil(p.daysUntilDeletion)} days
                  </span>
                  <Link to={`/dashboard/admin/products/${p._id}`} className={styles.btnGhost}>View →</Link>
                </div>
              </div>
            </div>
          ))
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Add Product</h3>

            <div className={styles.modalBody}>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Name <span className={styles.req}>*</span></label>
                <input className={styles.formInput} value={modalForm.name} onChange={e => setField('name', e.target.value)} placeholder="Product name" />
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>Business <span className={styles.req}>*</span></label>
                <select className={styles.formSelect} value={modalForm.business} onChange={e => setField('business', e.target.value)}>
                  <option value="">— Select business —</option>
                  {businesses.map(b => (
                    <option key={b._id} value={b.profile._id}>{b.displayName || b.profile?.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>Brand</label>
                <input className={styles.formInput} value={modalForm.brand} onChange={e => setField('brand', e.target.value)} placeholder="Brand name" />
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>Description</label>
                <textarea className={styles.formTextarea} rows={3} value={modalForm.description} onChange={e => setField('description', e.target.value)} placeholder="Description…" />
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>Status</label>
                <select className={styles.formSelect} value={modalForm.status} onChange={e => setField('status', e.target.value)}>
                  {PRODUCT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Price ($)</label>
                  <input className={styles.formInput} type="number" min="0" step="0.01" value={modalForm.price} onChange={e => setField('price', e.target.value)} placeholder="0.00" />
                </div>
                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Sale Price ($)</label>
                  <input className={styles.formInput} type="number" min="0" step="0.01" value={modalForm.salePrice} onChange={e => setField('salePrice', e.target.value)} placeholder="0.00" />
                </div>
                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Discount (%)</label>
                  <input className={styles.formInput} type="number" min="0" max="100" value={modalForm.discountPercent} onChange={e => setField('discountPercent', e.target.value)} placeholder="0" />
                </div>
                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Tally Goal</label>
                  <input className={styles.formInput} type="number" min="1" value={modalForm.tallyGoal} onChange={e => setField('tallyGoal', e.target.value)} placeholder="10" />
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>Image URL</label>
                <input className={styles.formInput} value={modalForm.image} onChange={e => setField('image', e.target.value)} placeholder="https://…" />
              </div>

              <div className={styles.formCheckRow}>
                <label className={styles.checkLabel}>
                  <input type="checkbox" checked={modalForm.isActive} onChange={e => setField('isActive', e.target.checked)} />
                  Active
                </label>
                <label className={styles.checkLabel}>
                  <input type="checkbox" checked={modalForm.boosted} onChange={e => setField('boosted', e.target.checked)} />
                  Boosted
                </label>
              </div>

              {modalError && <p className={styles.modalError}>{modalError}</p>}
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnAccent} disabled={modalSaving} onClick={handleCreate}>
                {modalSaving ? 'Saving…' : 'Submit'}
              </button>
              <button className={styles.btnGhost} onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
