import { useState, useEffect, useRef } from 'react'
import * as productService from '../../../services/productService'
import styles from './BusinessProducts.module.css'

const TABS = ['All', 'Requests', 'Approved', 'In Store', 'Promotions/Sales', 'Requires Update']
const STATUS_MAP = {
  'All':              ['pending', 'ready_to_stock', 'approved', 'stocked', 'needs_info', 'on_sale'],
  'Requests':         ['pending', 'ready_to_stock'],
  'Approved':         ['approved'],
  'In Store':         ['stocked'],
  'Promotions/Sales': ['on_sale'],
  'Requires Update':  ['needs_info'],
}

export default function BusinessProducts() {
  const [products, setProducts] = useState([])
  const [tab, setTab] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name:'', brand:'', description:'', price:'', image:'', tallyGoal: 10 })
  const [expandedVoters, setExpandedVoters] = useState({})
  const [promoProduct, setPromoProduct] = useState(null)
  const [promoMode, setPromoMode] = useState('percent') // 'percent' | 'price'
  const [promoPercent, setPromoPercent] = useState('')
  const [promoPrice, setPromoPrice] = useState('')
  const [promoError, setPromoError] = useState('')
  const [canScrollLeft, setCanScrollLeft]   = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const tabsScrollRef = useRef(null)

  async function load() {
    const data = await productService.getBusinessProducts()
    if (Array.isArray(data)) setProducts(data)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

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

  function toggleVoters(id) {
    setExpandedVoters(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function openPromoModal(p) {
    setPromoProduct(p)
    setPromoMode('percent')
    setPromoPercent('')
    setPromoPrice('')
    setPromoError('')
  }
  function closePromoModal() { setPromoProduct(null) }

  // Derived preview values for the promotion modal
  const originalPrice = promoProduct?.price ?? null
  const previewSalePrice = (() => {
    if (promoMode === 'percent' && promoPercent !== '' && originalPrice != null) {
      return parseFloat((originalPrice * (1 - Number(promoPercent) / 100)).toFixed(2))
    }
    if (promoMode === 'price' && promoPrice !== '' && originalPrice != null) {
      return parseFloat(Number(promoPrice).toFixed(2))
    }
    return null
  })()
  const previewDiscount = (() => {
    if (promoMode === 'percent' && promoPercent !== '') return Number(promoPercent)
    if (promoMode === 'price' && promoPrice !== '' && originalPrice != null) {
      return parseFloat((((originalPrice - Number(promoPrice)) / originalPrice) * 100).toFixed(1))
    }
    return null
  })()

  async function handlePromoSubmit(e) {
    e.preventDefault()
    setPromoError('')
    const payload = {}
    if (promoMode === 'percent') {
      const pct = Number(promoPercent)
      if (!promoPercent || pct <= 0 || pct >= 100) return setPromoError('Enter a discount between 1% and 99%.')
      if (originalPrice == null) return setPromoError('This product has no price set. Please edit the product price first.')
      payload.discountPercent = pct
    } else {
      const sp = Number(promoPrice)
      if (!promoPrice || sp <= 0) return setPromoError('Enter a valid sale price.')
      if (originalPrice != null && sp >= originalPrice) return setPromoError('Sale price must be less than the original price.')
      payload.salePrice = sp
    }
    const result = await productService.promoteProduct(promoProduct._id, payload)
    if (result.err) return setPromoError(result.err)
    closePromoModal()
    load()
  }

  const filtered = products.filter(p => STATUS_MAP[tab].includes(p.status))

  async function handleApprove(id) {
    await productService.updateProductStatus(id, 'approved')
    load()
  }
  async function handleReject(id) {
    await productService.updateProductStatus(id, 'rejected')
    load()
  }
  async function handleStock(id) {
    await productService.updateProductStatus(id, 'stocked')
    load()
  }
  async function handleDelete(id) {
    await productService.deleteProduct(id)
    load()
  }
  async function handleRequestInfo(id) {
    await productService.requestMoreInfo(id)
    load()
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editId) {
      await productService.updateProduct(editId, form)
    } else {
      await productService.createProduct({ ...form, tallyGoal: Number(form.tallyGoal) })
    }
    setForm({ name:'', brand:'', description:'', price:'', image:'', tallyGoal: 10 })
    setEditId(null)
    setShowForm(false)
    load()
  }

  function startEdit(p) {
    setForm({ name: p.name, brand: p.brand||'', description: p.description||'', price: p.price||'', image: p.image||'', tallyGoal: p.tallyGoal||10 })
    setEditId(p._id)
    setShowForm(true)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Products</h2>
        <button className={styles.addBtn} onClick={() => { setShowForm(s => !s); setEditId(null) }}>
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <input name="name" placeholder="Product name *" value={form.name} onChange={handleChange} required />
          <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} />
          <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} />
          <div className={styles.imageRow}>
            <input name="image" placeholder="Image URL" value={form.image} onChange={handleChange} />
            {form.image && <img src={form.image} alt="preview" className={styles.imagePreview} onError={e => e.target.style.display='none'} />}
          </div>
          <div className={styles.tallyRow}>
            <label>Tally Goal</label>
            <input name="tallyGoal" type="number" min={1} value={form.tallyGoal} onChange={handleChange} />
          </div>
          <button type="submit">{editId ? 'Update' : 'Add Product'}</button>
        </form>
      )}

      <div className={styles.tabsWrap}>
        {canScrollLeft && (
          <button className={styles.tabArrow} onClick={() => scrollTabs(-1)}>‹</button>
        )}
        <div className={styles.tabsScroll} ref={tabsScrollRef} onScroll={checkScroll}>
          <div className={styles.tabs}>
            {TABS.map(t => (
              <button key={t} className={`${styles.tab} ${tab === t ? styles.active : ''}`} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
        {canScrollRight && (
          <button className={styles.tabArrow} onClick={() => scrollTabs(1)}>›</button>
        )}
      </div>

      <div className={styles.list}>
        {filtered.length === 0 && <p className={styles.empty}>No products here yet.</p>}
        {filtered.map(p => (
          <div key={p._id} className={styles.card}>
            <div className={styles.info}>
              <h4>{p.name}</h4>
              {p.brand && <span className={styles.brand}>{p.brand}</span>}
              {p.description && <p className={styles.desc}>{p.description}</p>}
              {p.requestedBy?.name && (
                <p className={styles.requestedBy}>Requested by: {p.requestedBy.name}.</p>
              )}
              {p.status === 'on_sale' ? (
                <div className={styles.priceRow}>
                  {p.price != null && <span className={styles.originalPrice}>${p.price}</span>}
                  {p.salePrice != null && <span className={styles.salePrice}>${p.salePrice}</span>}
                  {p.discountPercent != null && <span className={styles.discountBadge}>-{p.discountPercent}%</span>}
                </div>
              ) : (
                p.price != null && <p className={styles.price}>${p.price}</p>
              )}
              {p.status === 'needs_info' && (
                <span className={styles.needsInfoBadge}>Awaiting patron update</span>
              )}
            </div>

            {p.requestedBy && (
              <div className={styles.tallyCol}>
                <div className={styles.tally}>
                  <div className={styles.tallyCounts}>{p.currentTally} / {p.tallyGoal} votes</div>
                  <div className={styles.bar}>
                    <div className={styles.fill} style={{ width: `${Math.min(100, (p.currentTally / p.tallyGoal) * 100)}%` }} />
                  </div>
                  {p.status === 'ready_to_stock' && <span className={styles.readyBadge}>Ready to Stock</span>}
                </div>

                {p.votedBy?.length > 0 && (
                  <div className={styles.votersWrap}>
                    <button className={styles.votersToggle} onClick={() => toggleVoters(p._id)}>
                      Voters {expandedVoters[p._id] ? '▲' : '▼'}
                    </button>
                    {expandedVoters[p._id] && (
                      <ul className={styles.voterList}>
                        {p.votedBy.map(v => (
                          <li key={v._id} className={styles.voterName}>{v.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className={styles.actions}>
              {(p.status === 'pending' || p.status === 'ready_to_stock') && (
                <>
                  <button className={styles.approveBtn} onClick={() => handleApprove(p._id)}>Approve</button>
                  <button className={styles.rejectBtn} onClick={() => handleReject(p._id)}>Reject</button>
                </>
              )}
              {p.status === 'approved' && (
                <button className={styles.stockBtn} onClick={() => handleStock(p._id)}>Mark In Store</button>
              )}
              {p.status === 'stocked' && (
                <button className={styles.promoBtn} onClick={() => openPromoModal(p)}>Promote</button>
              )}
              {p.requestedBy && (p.status === 'pending' || p.status === 'ready_to_stock' || p.status === 'approved') && (
                <button className={styles.infoBtn} onClick={() => handleRequestInfo(p._id)}>Request Info</button>
              )}
              <button className={styles.editBtn} onClick={() => startEdit(p)}>Edit</button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(p._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Promotion modal ── */}
      {promoProduct && (
        <div className={styles.overlay} onClick={closePromoModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Promote "{promoProduct.name}"</h3>
              <button className={styles.closeBtn} onClick={closePromoModal}>✕</button>
            </div>

            {originalPrice != null && (
              <p className={styles.originalPriceNote}>Original price: <strong>${originalPrice}</strong></p>
            )}

            <div className={styles.modeToggle}>
              <button
                className={`${styles.modeBtn} ${promoMode === 'percent' ? styles.modeBtnActive : ''}`}
                onClick={() => { setPromoMode('percent'); setPromoPrice('') }}
              >% Off</button>
              <button
                className={`${styles.modeBtn} ${promoMode === 'price' ? styles.modeBtnActive : ''}`}
                onClick={() => { setPromoMode('price'); setPromoPercent('') }}
              >New Price</button>
            </div>

            <form className={styles.modalForm} onSubmit={handlePromoSubmit}>
              {promoMode === 'percent' ? (
                <label>
                  Discount percentage
                  <div className={styles.inputRow}>
                    <input
                      type="number" min="1" max="99" step="0.1"
                      placeholder="e.g. 20"
                      value={promoPercent}
                      onChange={e => setPromoPercent(e.target.value)}
                    />
                    <span className={styles.inputSuffix}>%</span>
                  </div>
                </label>
              ) : (
                <label>
                  Sale price
                  <div className={styles.inputRow}>
                    <span className={styles.inputPrefix}>$</span>
                    <input
                      type="number" min="0.01" step="0.01"
                      placeholder="e.g. 7.99"
                      value={promoPrice}
                      onChange={e => setPromoPrice(e.target.value)}
                    />
                  </div>
                </label>
              )}

              {/* Live preview */}
              {previewSalePrice != null && previewDiscount != null && (
                <div className={styles.promoPreview}>
                  <span className={styles.previewSale}>${previewSalePrice}</span>
                  <span className={styles.previewOff}>({previewDiscount}% off)</span>
                </div>
              )}
              {previewSalePrice != null && previewDiscount == null && (
                <div className={styles.promoPreview}>
                  <span className={styles.previewSale}>${previewSalePrice}</span>
                </div>
              )}

              {promoError && <p className={styles.promoError}>{promoError}</p>}

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={closePromoModal}>Cancel</button>
                <button type="submit" className={styles.submitBtn}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
