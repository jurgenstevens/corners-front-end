import { useState, useEffect } from 'react'
import * as productService from '../../../services/productService'
import styles from './BusinessProducts.module.css'

const TABS = ['Requests', 'Approved', 'In Store']
const STATUS_MAP = { 'Requests': ['pending','ready_to_stock'], 'Approved': ['approved'], 'In Store': ['stocked'] }

export default function BusinessProducts() {
  const [products, setProducts] = useState([])
  const [tab, setTab] = useState('Requests')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name:'', brand:'', description:'', price:'', tallyGoal: 10 })

  async function load() {
    const data = await productService.getBusinessProducts()
    if (Array.isArray(data)) setProducts(data)
  }

  useEffect(() => { load() }, [])

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

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.active : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.length === 0 && <p className={styles.empty}>No products here yet.</p>}
        {filtered.map(p => (
          <div key={p._id} className={styles.card}>
            <div className={styles.info}>
              <h4>{p.name}</h4>
              {p.brand && <span className={styles.brand}>{p.brand}</span>}
              {p.description && <p className={styles.desc}>{p.description}</p>}
              {/* show the patron who submitted this request, if any */}
              {p.requestedBy?.name && (
                <p className={styles.requestedBy}>Requested by: {p.requestedBy.name}.</p>
              )}
              {p.price != null && <p className={styles.price}>${p.price}</p>}
            </div>
            <div className={styles.tally}>
              <div className={styles.tallyCounts}>{p.currentTally} / {p.tallyGoal} votes</div>
              <div className={styles.bar}>
                <div className={styles.fill} style={{ width: `${Math.min(100, (p.currentTally / p.tallyGoal) * 100)}%` }} />
              </div>
              {p.status === 'ready_to_stock' && <span className={styles.readyBadge}>🎯 Ready to Stock</span>}
            </div>
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
              <button className={styles.editBtn} onClick={() => startEdit(p)}>Edit</button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(p._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
