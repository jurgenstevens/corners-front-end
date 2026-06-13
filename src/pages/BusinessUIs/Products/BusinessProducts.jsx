import { useState, useEffect, useRef } from 'react'
import * as productService from '../../../services/productService'
import styles from './BusinessProducts.module.css'

const TABS = ['All', 'Requests', 'Approved', 'In Store', 'Requires Update']
const STATUS_MAP = {
  'All': ['pending', 'ready_to_stock', 'approved', 'stocked', 'needs_info'],
  'Requests': ['pending', 'ready_to_stock'],
  'Approved': ['approved'],
  'In Store': ['stocked'],
  'Requires Update': ['needs_info'],
}

export default function BusinessProducts() {
  const [products, setProducts] = useState([])
  const [tab, setTab] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name:'', brand:'', description:'', price:'', tallyGoal: 10 })
  const [expandedVoters, setExpandedVoters] = useState({})
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
    setForm({ name:'', brand:'', description:'', price:'', tallyGoal: 10 })
    setEditId(null)
    setShowForm(false)
    load()
  }

  function startEdit(p) {
    setForm({ name: p.name, brand: p.brand||'', description: p.description||'', price: p.price||'', tallyGoal: p.tallyGoal||10 })
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
              {p.price != null && <p className={styles.price}>${p.price}</p>}
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
                    <button
                      className={styles.votersToggle}
                      onClick={() => toggleVoters(p._id)}
                    >
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
              {p.requestedBy && (p.status === 'pending' || p.status === 'ready_to_stock' || p.status === 'approved') && (
                <button className={styles.infoBtn} onClick={() => handleRequestInfo(p._id)}>Request Info</button>
              )}
              <button className={styles.editBtn} onClick={() => startEdit(p)}>Edit</button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(p._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
