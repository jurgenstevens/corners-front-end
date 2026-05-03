import { useState, useEffect } from 'react'
import styles from './BusinessProducts.module.css'
import * as productService from '../../../services/productService'
import * as requestService from '../../../services/requestService'

const EMPTY_FORM = { name: '', brand: '', description: '', price: '', image: '' }

const BusinessProducts = () => {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [requests, setRequests] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [prods, reqs] = await Promise.all([
        productService.getMyProducts(),
        requestService.getBusinessRequests(),
      ])
      setProducts(prods)
      setRequests(reqs)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (editingId) {
        const updated = await productService.updateProduct(editingId, formData)
        setProducts(products.map(p => p._id === editingId ? updated : p))
      } else {
        const created = await productService.createProduct(formData)
        setProducts([created, ...products])
      }
      setFormData(EMPTY_FORM)
      setEditingId(null)
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    }
  }

  function startEdit(product) {
    setFormData({
      name: product.name,
      brand: product.brand || '',
      description: product.description || '',
      price: product.price,
      image: product.image || '',
    })
    setEditingId(product._id)
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    try {
      await productService.deleteProduct(id)
      setProducts(products.filter(p => p._id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleRequestStatus(id, status) {
    try {
      const updated = await requestService.updateRequestStatus(id, status)
      setRequests(requests.map(r => r._id === id ? updated : r))
    } catch (err) {
      setError(err.message)
    }
  }

  const openRequestCount = requests.filter(r => r.status === 'open').length

  if (loading) return <div className={styles.pageWrapper}><p className={styles.loading}>Loading...</p></div>

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.feedContainer}>
        <div className={styles.headerRow}>
          <h2 className={styles.header}>Products</h2>
          <button
            className={styles.addButton}
            onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(EMPTY_FORM) }}
          >
            {showForm ? 'Cancel' : '+ Add'}
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {showForm && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <input name="name" placeholder="Product name *" value={formData.name} onChange={handleChange} required />
            <input name="brand" placeholder="Brand" value={formData.brand} onChange={handleChange} />
            <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
            <input name="price" type="number" step="0.01" placeholder="Price *" value={formData.price} onChange={handleChange} required />
            <input name="image" placeholder="Image URL" value={formData.image} onChange={handleChange} />
            <button type="submit" className={styles.submitButton}>{editingId ? 'Save Changes' : 'Add Product'}</button>
          </form>
        )}

        <div className={styles.filterRow}>
          {[
            { key: 'products', label: 'Products' },
            { key: 'requests', label: `Requests${openRequestCount ? ` (${openRequestCount})` : ''}` },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`${styles.filterButton} ${activeTab === key ? styles.activeFilter : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'products' && (
          <div className={styles.feedList}>
            {products.length === 0 && <p className={styles.empty}>No products yet. Add your first one!</p>}
            {products.map(product => (
              <div key={product._id} className={styles.productItem}>
                {product.image
                  ? <img src={product.image} alt={product.name} className={styles.productImage} />
                  : <div className={styles.imagePlaceholder} />
                }
                <div className={styles.productInfo}>
                  <h4>{product.name}</h4>
                  {product.brand && <p className={styles.brand}>{product.brand}</p>}
                  <p className={styles.price}>${Number(product.price).toFixed(2)}</p>
                  <span className={`${styles.statusBadge} ${product.isActive ? styles.active : styles.inactive}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className={styles.actions}>
                  <button className={styles.editBtn} onClick={() => startEdit(product)}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(product._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className={styles.feedList}>
            {requests.length === 0 && <p className={styles.empty}>No patron requests yet.</p>}
            {requests.map(req => (
              <div key={req._id} className={styles.activityItem}>
                <div
                  className={styles.leftIndicator}
                  style={{ background: req.status === 'open' ? '#ef4444' : req.status === 'fulfilled' ? '#10b981' : '#9ca3af' }}
                />
                <div className={styles.activityContent}>
                  <h4>{req.productName}</h4>
                  {req.brand && <p>{req.brand}</p>}
                  <p>By {req.patron?.name || 'Patron'}</p>
                  <span className={styles.time}>{req.status}</span>
                </div>
                {req.status === 'open' && (
                  <div className={styles.actions}>
                    <button className={styles.approve} onClick={() => handleRequestStatus(req._id, 'fulfilled')}>✓</button>
                    <button className={styles.reject} onClick={() => handleRequestStatus(req._id, 'cancelled')}>✕</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BusinessProducts